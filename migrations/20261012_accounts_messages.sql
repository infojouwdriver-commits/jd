-- Server-only account provisioning and message writes. No historical data is removed.
BEGIN;
CREATE OR REPLACE FUNCTION :"schema".security_save_company_account(p_company_id bigint,p_company jsonb,p_account jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE c companies; revised companies; u users; owner_id bigint; address text;
BEGIN
 IF jsonb_typeof(p_company) IS DISTINCT FROM 'object' OR jsonb_typeof(p_account) IS DISTINCT FROM 'object'
 OR EXISTS(SELECT FROM jsonb_object_keys(p_company) k WHERE k NOT IN ('name','vat_number','kbo_number','address','email','phone','logo_url','chiron_mode'))
 OR EXISTS(SELECT FROM jsonb_object_keys(p_account) k WHERE k NOT IN ('email','password','role'))
 THEN RAISE EXCEPTION 'Invalid company fields' USING ERRCODE='22023'; END IF;
 IF p_company_id IS NOT NULL THEN
  SELECT * INTO c FROM companies WHERE id=p_company_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Company missing' USING ERRCODE='P0002'; END IF;
 END IF;
 revised=jsonb_populate_record(c,p_company);
 IF coalesce(btrim(revised.name),'')='' OR coalesce(btrim(revised.vat_number),'')='' OR coalesce(btrim(revised.kbo_number),'')=''
 OR (revised.chiron_mode IS NOT NULL AND revised.chiron_mode NOT IN ('TEST','PRODUCTION'))
 THEN RAISE EXCEPTION 'Invalid company details' USING ERRCODE='22023'; END IF;
 IF p_company_id IS NULL THEN
  INSERT INTO companies(name,vat_number,kbo_number,address,email,phone,logo_url,chiron_mode,bank_account_holder)
  VALUES(revised.name,revised.vat_number,revised.kbo_number,revised.address,revised.email,revised.phone,revised.logo_url,'TEST',revised.name) RETURNING * INTO c;
 ELSE
  UPDATE companies SET name=revised.name,vat_number=revised.vat_number,kbo_number=revised.kbo_number,address=revised.address,email=revised.email,phone=revised.phone,logo_url=revised.logo_url,chiron_mode=revised.chiron_mode,updated_at=clock_timestamp() WHERE id=c.id RETURNING * INTO c;
 END IF;
 IF p_account <> '{}'::jsonb THEN
  address=lower(btrim(p_account->>'email'));
  IF coalesce(address,'') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  OR coalesce(p_account->>'password','') !~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$'
  OR coalesce(p_account->>'role','')='' THEN RAISE EXCEPTION 'Invalid account' USING ERRCODE='22023'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(address,0));
  IF (SELECT count(*) FROM company_users WHERE company_id=c.id AND role='portal_owner')>1 THEN RAISE EXCEPTION 'Ambiguous account' USING ERRCODE='22023'; END IF;
  SELECT user_id INTO owner_id FROM company_users WHERE company_id=c.id AND role='portal_owner';
  IF EXISTS(SELECT FROM users WHERE lower(btrim(email))=address AND (owner_id IS NULL OR id<>owner_id)) THEN RAISE EXCEPTION 'Email in use' USING ERRCODE='23505'; END IF;
  IF owner_id IS NULL THEN
   INSERT INTO users(email,password,role,user_type,display_name) VALUES(address,p_account->>'password',p_account->>'role','manager',c.name) RETURNING * INTO u;
   INSERT INTO company_users(company_id,user_id,role) VALUES(c.id,u.id,'portal_owner');
  ELSE
   SELECT * INTO u FROM users WHERE id=owner_id FOR UPDATE;
   IF NOT FOUND THEN RAISE EXCEPTION 'Account missing' USING ERRCODE='P0002'; END IF;
   IF u.user_type IS DISTINCT FROM 'manager' OR EXISTS(SELECT FROM company_users WHERE user_id=u.id AND company_id<>c.id)
   THEN RAISE EXCEPTION 'Account needs review' USING ERRCODE='22023'; END IF;
   UPDATE users SET email=address,password=p_account->>'password',security_revoked_before=clock_timestamp(),updated_at=clock_timestamp() WHERE id=u.id RETURNING * INTO u;
   UPDATE refresh_tokens SET revoked=true WHERE user_id=u.id;
  END IF;
 END IF;
 RETURN (to_jsonb(c)-'password_hash') || jsonb_build_object('portal_login_enabled',EXISTS(SELECT FROM company_users WHERE company_id=c.id AND role='portal_owner'));
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_write_message(p_actor_id bigint,p_is_admin boolean,p_message jsonb,p_parent_id bigint DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE actor users; d drivers; parent internal_messages; m internal_messages; reply message_replies;
 recipients bigint[]; subject_text text; body_text text; priority_text text; kind text; tenant bigint; uid bigint;
BEGIN
 IF p_is_admin IS NULL OR jsonb_typeof(p_message) IS DISTINCT FROM 'object'
 OR EXISTS(SELECT FROM jsonb_object_keys(p_message) k WHERE k NOT IN ('subject','message_body','message_priority','recipient_type','target_company_id','recipient_user_id'))
 THEN RAISE EXCEPTION 'Invalid message fields' USING ERRCODE='22023'; END IF;
 SELECT * INTO actor FROM users WHERE id=p_actor_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Actor missing' USING ERRCODE='P0002'; END IF;
 IF NOT p_is_admin THEN
  SELECT * INTO d FROM drivers WHERE user_id=p_actor_id AND status='active';
  IF NOT FOUND THEN RAISE EXCEPTION 'Driver unavailable' USING ERRCODE='42501'; END IF;
 END IF;
 body_text=btrim(p_message->>'message_body');
 IF coalesce(body_text,'')='' OR length(body_text)>10000 THEN RAISE EXCEPTION 'Message body required' USING ERRCODE='22023'; END IF;
 IF p_parent_id IS NOT NULL THEN
  SELECT * INTO parent FROM internal_messages WHERE id=p_parent_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Message missing' USING ERRCODE='P0002'; END IF;
  IF NOT p_is_admin AND parent.sender_user_id IS DISTINCT FROM p_actor_id AND NOT EXISTS(SELECT FROM message_recipients WHERE message_id=parent.id AND recipient_user_id=p_actor_id AND is_deleted IS DISTINCT FROM true)
  THEN RAISE EXCEPTION 'Message missing' USING ERRCODE='P0002'; END IF;
  IF parent.is_locked IS TRUE OR parent.status='resolved' THEN RAISE EXCEPTION 'Message closed' USING ERRCODE='23514'; END IF;
  subject_text='Re: '||parent.subject; priority_text='normal';kind='individual';tenant=parent.target_company_id;
  IF p_is_admin AND parent.sender_type='admin' THEN
   SELECT array_agg(DISTINCT recipient_user_id) INTO recipients FROM message_recipients WHERE message_id=parent.id AND is_deleted IS DISTINCT FROM true;
  ELSE recipients=ARRAY[parent.sender_user_id]; END IF;
 ELSE
  subject_text=btrim(p_message->>'subject'); priority_text=coalesce(p_message->>'message_priority','normal');
  IF coalesce(subject_text,'')='' OR length(subject_text)>200 OR priority_text NOT IN ('low','normal','high','urgent') THEN RAISE EXCEPTION 'Invalid subject or priority' USING ERRCODE='22023'; END IF;
  IF p_is_admin THEN
   kind=coalesce(p_message->>'recipient_type','all_drivers');tenant=(p_message->>'target_company_id')::bigint;
   IF kind IN ('all_drivers','all_active_drivers') THEN
    SELECT array_agg(DISTINCT user_id) INTO recipients FROM drivers WHERE user_id IS NOT NULL AND (tenant IS NULL OR company_id=tenant) AND (kind='all_drivers' OR status='active');
   ELSIF kind='individual' THEN
    uid=(p_message->>'recipient_user_id')::bigint;
    SELECT array_agg(user_id) INTO recipients FROM drivers WHERE user_id=uid AND (tenant IS NULL OR company_id=tenant);
   ELSE RAISE EXCEPTION 'Invalid recipient kind' USING ERRCODE='22023'; END IF;
   IF coalesce(array_length(recipients,1),0)=0 THEN RAISE EXCEPTION 'No recipients' USING ERRCODE='22023'; END IF;
  ELSE kind='management';tenant=d.company_id;recipients=ARRAY[]::bigint[]; END IF;
 END IF;
 INSERT INTO internal_messages(sender_user_id,sender_type,sender_name,subject,message_body,message_priority,recipient_type,target_company_id,is_broadcast,parent_message_id,status,last_activity_at,is_locked)
 VALUES(p_actor_id,CASE WHEN p_is_admin THEN 'admin' ELSE 'driver' END,coalesce(d.full_name,actor.display_name,actor.email),subject_text,body_text,priority_text,kind,tenant,kind IN ('all_drivers','all_active_drivers'),p_parent_id,'open',clock_timestamp(),false) RETURNING * INTO m;
 FOREACH uid IN ARRAY coalesce(recipients,ARRAY[]::bigint[]) LOOP
  IF uid IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=uid) THEN RAISE EXCEPTION 'Recipient account missing' USING ERRCODE='23503'; END IF;
  INSERT INTO message_recipients(message_id,recipient_user_id,is_read,is_deleted,is_archived) VALUES(m.id,uid,false,false,false);
 END LOOP;
 IF p_parent_id IS NOT NULL THEN
  INSERT INTO message_replies(parent_message_id,reply_message_id,sender_user_id,reply_body) VALUES(parent.id,m.id,p_actor_id,body_text) RETURNING * INTO reply;
  UPDATE internal_messages SET last_activity_at=clock_timestamp() WHERE id=parent.id;
  UPDATE message_recipients SET is_read=false,read_at=NULL WHERE message_id=parent.id AND recipient_user_id=ANY(recipients);
  RETURN to_jsonb(reply);
 END IF;
 RETURN to_jsonb(m);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_change_account(p_user_id bigint,p_expected_hash text,p_email text DEFAULT NULL,p_password text DEFAULT NULL,p_code_id bigint DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE u users; code user_passcode; address text;
BEGIN
 SELECT * INTO u FROM users WHERE id=p_user_id FOR UPDATE;
 IF NOT FOUND OR u.password IS DISTINCT FROM p_expected_hash THEN RAISE EXCEPTION 'Account changed; reauthenticate' USING ERRCODE='42501'; END IF;
 IF p_email IS NULL AND p_password IS NULL THEN RAISE EXCEPTION 'Nothing to change' USING ERRCODE='22023'; END IF;
 IF p_password IS NOT NULL AND p_password !~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$' THEN RAISE EXCEPTION 'Invalid password' USING ERRCODE='22023'; END IF;
 address=CASE WHEN p_email IS NULL THEN u.email ELSE lower(btrim(p_email)) END;
 IF p_email IS NOT NULL THEN
  IF address !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Invalid email' USING ERRCODE='22023'; END IF;
  SELECT * INTO code FROM user_passcode WHERE id=p_code_id FOR UPDATE;
  IF NOT FOUND OR code.revoked IS TRUE OR code.valid_until IS NULL OR code.valid_until<=clock_timestamp()
  OR code.pass_object IS DISTINCT FROM address OR code.security_purpose IS DISTINCT FROM ('account-email:'||p_user_id::text)
  THEN RAISE EXCEPTION 'Email verification required' USING ERRCODE='42501'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(address,0));
  IF EXISTS(SELECT FROM users WHERE lower(btrim(email))=address AND id<>u.id) THEN RAISE EXCEPTION 'Email in use' USING ERRCODE='23505'; END IF;
  UPDATE user_passcode SET revoked=true WHERE id=code.id;
 END IF;
 UPDATE users SET email=address,password=coalesce(p_password,password),security_revoked_before=clock_timestamp(),updated_at=clock_timestamp() WHERE id=u.id;
 IF p_password IS NOT NULL THEN UPDATE driver_credentials SET password_hash=p_password,updated_at=clock_timestamp() WHERE driver_id IN (SELECT id FROM drivers WHERE user_id=u.id); END IF;
 UPDATE refresh_tokens SET revoked=true WHERE user_id=u.id;
 RETURN jsonb_build_object('id',u.id,'email',address);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_change_account(bigint,text,text,text,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_change_account(bigint,text,text,text,bigint) TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_save_company_account(bigint,jsonb,jsonb), :"schema".security_write_message(bigint,boolean,jsonb,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_save_company_account(bigint,jsonb,jsonb), :"schema".security_write_message(bigint,boolean,jsonb,bigint) TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_driver_messages(p_user_id bigint,p_limit integer DEFAULT 100,p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
 SELECT coalesce(jsonb_agg(page.data ORDER BY page.activity DESC NULLS LAST,page.id DESC),'[]'::jsonb)
 FROM (
  SELECT m.id,m.last_activity_at activity,to_jsonb(m)||jsonb_build_object('is_read',CASE WHEN r.id IS NULL THEN true ELSE r.is_read IS TRUE END,'read_at',r.read_at,'recipient_id',r.id) data
  FROM internal_messages m
  LEFT JOIN LATERAL (SELECT id,is_read,read_at FROM message_recipients WHERE message_id=m.id AND recipient_user_id=p_user_id AND is_deleted IS DISTINCT FROM true ORDER BY id DESC LIMIT 1) r ON true
  WHERE m.parent_message_id IS NULL AND (m.sender_user_id=p_user_id OR r.id IS NOT NULL)
  ORDER BY m.last_activity_at DESC NULLS LAST,m.id DESC LIMIT least(greatest(p_limit,1),100) OFFSET greatest(p_offset,0)
 ) page
$$;
REVOKE ALL ON FUNCTION :"schema".security_driver_messages(bigint,integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_driver_messages(bigint,integer,integer) TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_portal_release_ready() RETURNS boolean
LANGUAGE sql SECURITY INVOKER AS $$ SELECT true $$;
REVOKE ALL ON FUNCTION :"schema".security_portal_release_ready() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_portal_release_ready() TO :"admin_role";
COMMIT;
