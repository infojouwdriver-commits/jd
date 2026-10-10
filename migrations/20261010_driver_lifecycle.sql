-- Atomic server-only driver lifecycle. Business history is never deleted.
BEGIN;
CREATE OR REPLACE FUNCTION :"schema".security_create_driver_account(p_account jsonb,p_driver jsonb,p_company_id bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE u users; d drivers; address text;
BEGIN
 IF jsonb_typeof(p_account) IS DISTINCT FROM 'object' OR jsonb_typeof(p_driver) IS DISTINCT FROM 'object' OR p_company_id IS NULL
 OR EXISTS(SELECT FROM jsonb_object_keys(p_account) k WHERE k NOT IN ('email','password','role','user_type','display_name'))
 OR EXISTS(SELECT FROM jsonb_object_keys(p_driver) k WHERE k NOT IN ('full_name','phone','national_id','driver_license','capacity_certificate_number','bestuurderspas_number','preferred_language','current_vehicle_id','assigned_vehicle_id','created_by_distributor_id','status'))
 THEN RAISE EXCEPTION 'Invalid account payload' USING ERRCODE='22023'; END IF;
 address=lower(btrim(p_account->>'email'));
 IF address IS NULL OR address='' OR coalesce(p_account->>'password','') !~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$' OR coalesce(p_account->>'role','')='' OR coalesce(p_driver->>'full_name','')='' OR coalesce(p_driver->>'phone','')=''
 THEN RAISE EXCEPTION 'Account fields required' USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(address,0));
 IF EXISTS(SELECT FROM users WHERE lower(btrim(email))=address) THEN RAISE EXCEPTION 'Account already exists' USING ERRCODE='23505'; END IF;
 PERFORM 1 FROM companies WHERE id=p_company_id FOR KEY SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Company does not exist' USING ERRCODE='23503'; END IF;
 INSERT INTO users(email,password,role,user_type,display_name) VALUES(address,p_account->>'password',p_account->>'role','driver',p_account->>'display_name') RETURNING * INTO u;
 d=jsonb_populate_record(NULL::drivers,p_driver);
 INSERT INTO drivers(user_id,company_id,full_name,phone,national_id,driver_license,capacity_certificate_number,bestuurderspas_number,preferred_language,current_vehicle_id,assigned_vehicle_id,created_by_distributor_id,status)
 VALUES(u.id,p_company_id,d.full_name,d.phone,d.national_id,d.driver_license,d.capacity_certificate_number,d.bestuurderspas_number,coalesce(d.preferred_language,'ar'),d.current_vehicle_id,d.assigned_vehicle_id,d.created_by_distributor_id,'active') RETURNING * INTO d;
 RETURN jsonb_build_object('user',to_jsonb(u)-'password','driver',to_jsonb(d));
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_update_driver_account(p_driver_id bigint,p_account jsonb,p_driver jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE u users; d drivers; revised drivers; address text; revoke boolean;
BEGIN
 IF jsonb_typeof(p_account) IS DISTINCT FROM 'object' OR jsonb_typeof(p_driver) IS DISTINCT FROM 'object'
 OR EXISTS(SELECT FROM jsonb_object_keys(p_account) k WHERE k NOT IN ('email','password','display_name'))
 OR EXISTS(SELECT FROM jsonb_object_keys(p_driver) k WHERE k NOT IN ('full_name','phone','national_id','driver_license','capacity_certificate_number','bestuurderspas_number','preferred_language','current_vehicle_id','assigned_vehicle_id','status'))
 THEN RAISE EXCEPTION 'Invalid update payload' USING ERRCODE='22023'; END IF;
 SELECT * INTO d FROM drivers WHERE id=p_driver_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Driver not found' USING ERRCODE='P0002'; END IF;
 SELECT * INTO u FROM users WHERE id=d.user_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Driver account missing' USING ERRCODE='P0002'; END IF;
 address=CASE WHEN p_account ? 'email' THEN lower(btrim(p_account->>'email')) ELSE u.email END;
 IF address IS NULL OR address='' OR (p_account ? 'password' AND coalesce(p_account->>'password','') !~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$') THEN RAISE EXCEPTION 'Invalid credentials' USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(address,0));
 IF EXISTS(SELECT FROM users WHERE lower(btrim(email))=address AND id<>u.id) THEN RAISE EXCEPTION 'Account already exists' USING ERRCODE='23505'; END IF;
 revised=jsonb_populate_record(d,p_driver);
 IF coalesce(revised.full_name,'')='' OR coalesce(revised.phone,'')='' OR revised.status IS NULL OR revised.status NOT IN ('active','inactive','suspended','disabled') THEN RAISE EXCEPTION 'Invalid driver fields' USING ERRCODE='22023'; END IF;
 revoke=(address IS DISTINCT FROM u.email) OR p_account ? 'password' OR revised.status IS DISTINCT FROM 'active';
 UPDATE users SET email=address,password=CASE WHEN p_account ? 'password' THEN p_account->>'password' ELSE password END,display_name=CASE WHEN p_account ? 'display_name' THEN p_account->>'display_name' ELSE display_name END,security_revoked_before=CASE WHEN revoke THEN clock_timestamp() ELSE security_revoked_before END,updated_at=clock_timestamp() WHERE id=u.id RETURNING * INTO u;
 UPDATE drivers SET full_name=revised.full_name,phone=revised.phone,national_id=revised.national_id,driver_license=revised.driver_license,capacity_certificate_number=revised.capacity_certificate_number,bestuurderspas_number=revised.bestuurderspas_number,preferred_language=revised.preferred_language,current_vehicle_id=revised.current_vehicle_id,assigned_vehicle_id=revised.assigned_vehicle_id,status=revised.status,updated_at=clock_timestamp() WHERE id=d.id RETURNING * INTO d;
 UPDATE driver_credentials SET phone=d.phone,password_hash=CASE WHEN p_account ? 'password' THEN p_account->>'password' ELSE password_hash END,is_active=(d.status='active'),updated_at=clock_timestamp() WHERE driver_id=d.id;
 IF revoke THEN UPDATE refresh_tokens SET revoked=true WHERE user_id=u.id; END IF;
 RETURN jsonb_build_object('user',to_jsonb(u)-'password','driver',to_jsonb(d));
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_deactivate_driver_account(p_driver_id bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE d drivers;
BEGIN
 SELECT * INTO d FROM drivers WHERE id=p_driver_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Driver not found' USING ERRCODE='P0002'; END IF;
 UPDATE users SET security_revoked_before=clock_timestamp(),updated_at=clock_timestamp() WHERE id=d.user_id;
 UPDATE drivers SET status='inactive',updated_at=clock_timestamp() WHERE id=d.id;
 UPDATE driver_credentials SET is_active=false,password_hash=NULL,updated_at=clock_timestamp() WHERE driver_id=d.id;
 UPDATE refresh_tokens SET revoked=true WHERE user_id=d.user_id;
 RETURN jsonb_build_object('driver_id',d.id,'user_id',d.user_id);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_create_driver_account(jsonb,jsonb,bigint), :"schema".security_update_driver_account(bigint,jsonb,jsonb), :"schema".security_deactivate_driver_account(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_create_driver_account(jsonb,jsonb,bigint), :"schema".security_update_driver_account(bigint,jsonb,jsonb), :"schema".security_deactivate_driver_account(bigint) TO :"admin_role";
COMMIT;
