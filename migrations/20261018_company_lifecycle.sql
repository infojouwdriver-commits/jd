-- Operational archive. History and credentials remain intact; no retention purge.
BEGIN;
SET LOCAL lock_timeout='5s';
ALTER TABLE :"schema".companies ADD COLUMN IF NOT EXISTS archived_at timestamptz, ADD COLUMN IF NOT EXISTS archive_event_id uuid, ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE :"schema".drivers ADD COLUMN IF NOT EXISTS archived_at timestamptz, ADD COLUMN IF NOT EXISTS archive_event_id uuid;
ALTER TABLE :"schema".vehicles ADD COLUMN IF NOT EXISTS archived_at timestamptz, ADD COLUMN IF NOT EXISTS archive_event_id uuid;
ALTER TABLE :"schema".company_users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE :"schema".trips ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS :"schema".company_lifecycle_events(
 id uuid PRIMARY KEY,company_id bigint NOT NULL REFERENCES :"schema".companies(id),actor_id bigint NOT NULL REFERENCES :"schema".users(id),
 action text NOT NULL CHECK(action IN('archive','restore','classification')),reason text NOT NULL CHECK(length(reason) BETWEEN 1 AND 1000),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),prior_state jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS company_lifecycle_events_company ON :"schema".company_lifecycle_events(company_id,created_at DESC);
CREATE INDEX IF NOT EXISTS companies_archive_name ON :"schema".companies(archived_at,name,id);
CREATE INDEX IF NOT EXISTS drivers_company_archive ON :"schema".drivers(company_id,archived_at,id);
CREATE INDEX IF NOT EXISTS vehicles_company_archive ON :"schema".vehicles(company_id,archived_at,id);
ALTER TABLE :"schema".company_lifecycle_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".company_lifecycle_events;
CREATE POLICY server_service_access ON :"schema".company_lifecycle_events TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".company_lifecycle_events FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT ON :"schema".company_lifecycle_events TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_archive_company(p_company bigint,p_actor bigint,p_reason text,p_request uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE c companies;prior jsonb;e company_lifecycle_events;stamp timestamptz:=clock_timestamp();
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor) OR p_request IS NULL OR coalesce(length(trim(p_reason)),0) NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Invalid archive request' USING ERRCODE='22023';END IF;
 SELECT * INTO c FROM companies WHERE id=p_company FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Company missing' USING ERRCODE='P0002';END IF;
 SELECT * INTO e FROM company_lifecycle_events WHERE id=p_request;
 IF FOUND THEN
  IF e.company_id<>p_company OR e.action<>'archive' OR e.actor_id<>p_actor OR e.reason<>trim(p_reason) THEN RAISE EXCEPTION 'Conflicting archive request' USING ERRCODE='40001';END IF;
  RETURN jsonb_build_object('company_id',p_company,'archived_at',c.archived_at,'event_id',e.id,'replayed',true);
 END IF;
 IF c.archived_at IS NOT NULL THEN RETURN jsonb_build_object('company_id',p_company,'archived_at',c.archived_at,'event_id',c.archive_event_id,'replayed',true);END IF;
 IF EXISTS(SELECT FROM trips WHERE company_id=c.id AND status='in_progress' AND end_time IS NULL) THEN RAISE EXCEPTION 'Finish active trips before archiving' USING ERRCODE='40001';END IF;
 IF EXISTS(SELECT FROM trips WHERE company_id=c.id AND chiron_sync_state IN('START_SENT','ARRIVAL_SENT','START_ACCEPTED')) THEN RAISE EXCEPTION 'Resolve pending Chiron deliveries before archiving' USING ERRCODE='40001';END IF;
 prior=jsonb_build_object('subscription_status',c.subscription_status,
 'drivers',coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'status',status)) FROM drivers WHERE company_id=c.id AND archived_at IS NULL),'[]'),
 'vehicles',coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'status',status)) FROM vehicles WHERE company_id=c.id AND archived_at IS NULL),'[]'),
 'memberships',coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'is_active',is_active)) FROM company_users WHERE company_id=c.id),'[]'),
 'credentials',coalesce((SELECT jsonb_agg(jsonb_build_object('driver_id',dc.driver_id,'is_active',dc.is_active)) FROM driver_credentials dc JOIN drivers d ON d.id=dc.driver_id WHERE d.company_id=c.id AND d.archived_at IS NULL),'[]'));
 INSERT INTO company_lifecycle_events(id,company_id,actor_id,action,reason,prior_state) VALUES(p_request,c.id,p_actor,'archive',trim(p_reason),prior);
 UPDATE companies SET archived_at=stamp,archive_event_id=p_request,subscription_status='cancelled',updated_at=stamp WHERE id=c.id;
 UPDATE driver_credentials SET is_active=false,updated_at=stamp WHERE driver_id IN(SELECT id FROM drivers WHERE company_id=c.id AND archived_at IS NULL);
 UPDATE drivers SET archived_at=stamp,archive_event_id=p_request,status='inactive',current_vehicle_id=NULL,updated_at=stamp WHERE company_id=c.id AND archived_at IS NULL;
 UPDATE vehicles SET archived_at=stamp,archive_event_id=p_request,status='inactive',updated_at=stamp WHERE company_id=c.id AND archived_at IS NULL;
 UPDATE company_users SET is_active=false,updated_at=stamp WHERE company_id=c.id;
 -- Do not disable identities shared with other active companies.
 UPDATE users u SET security_revoked_before=stamp,updated_at=stamp WHERE u.id IN(SELECT user_id FROM company_users WHERE company_id=c.id UNION SELECT user_id FROM drivers WHERE company_id=c.id)
 AND NOT EXISTS(SELECT FROM company_users cu JOIN companies other ON other.id=cu.company_id WHERE cu.user_id=u.id AND cu.is_active AND other.archived_at IS NULL)
 AND NOT EXISTS(SELECT FROM drivers d JOIN companies other ON other.id=d.company_id WHERE d.user_id=u.id AND d.archived_at IS NULL AND d.status='active' AND other.archived_at IS NULL);
 UPDATE refresh_tokens rt SET revoked=true FROM users u WHERE rt.user_id=u.id AND u.security_revoked_before=stamp;
 RETURN jsonb_build_object('company_id',c.id,'archived_at',stamp,'event_id',p_request,'drivers',jsonb_array_length(prior->'drivers'),'vehicles',jsonb_array_length(prior->'vehicles'));
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_restore_company(p_company bigint,p_actor bigint,p_reason text,p_request uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE c companies;e company_lifecycle_events;v jsonb;old_event uuid;
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor) OR p_request IS NULL OR coalesce(length(trim(p_reason)),0) NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Invalid restore request' USING ERRCODE='22023';END IF;
 SELECT * INTO c FROM companies WHERE id=p_company FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Company missing' USING ERRCODE='P0002';END IF;
 SELECT * INTO e FROM company_lifecycle_events WHERE id=p_request;
 IF FOUND THEN
  IF e.company_id<>p_company OR e.action<>'restore' OR e.actor_id<>p_actor OR e.reason<>trim(p_reason) THEN RAISE EXCEPTION 'Conflicting restore request' USING ERRCODE='40001';END IF;
  RETURN jsonb_build_object('company_id',c.id,'restored',c.archived_at IS NULL,'replayed',true);
 END IF;
 IF c.archived_at IS NULL THEN RAISE EXCEPTION 'Company is not archived' USING ERRCODE='40001';END IF;
 old_event=c.archive_event_id;
 SELECT * INTO e FROM company_lifecycle_events WHERE id=old_event AND company_id=c.id AND action='archive';
 IF NOT FOUND THEN RAISE EXCEPTION 'Archive snapshot missing' USING ERRCODE='40001';END IF;
 UPDATE companies SET archived_at=NULL,archive_event_id=NULL,subscription_status=e.prior_state->>'subscription_status',updated_at=clock_timestamp() WHERE id=c.id;
 FOR v IN SELECT * FROM jsonb_array_elements(e.prior_state->'drivers') LOOP
  UPDATE drivers SET archived_at=NULL,archive_event_id=NULL,status=v->>'status',current_vehicle_id=NULL,updated_at=clock_timestamp() WHERE id=(v->>'id')::bigint AND company_id=c.id AND archive_event_id=old_event;
 END LOOP;
 FOR v IN SELECT * FROM jsonb_array_elements(e.prior_state->'vehicles') LOOP
  UPDATE vehicles SET archived_at=NULL,archive_event_id=NULL,status=v->>'status',updated_at=clock_timestamp() WHERE id=(v->>'id')::bigint AND company_id=c.id AND archive_event_id=old_event;
 END LOOP;
 FOR v IN SELECT * FROM jsonb_array_elements(e.prior_state->'memberships') LOOP
  UPDATE company_users SET is_active=(v->>'is_active')::boolean,updated_at=clock_timestamp() WHERE id=(v->>'id')::bigint AND company_id=c.id;
 END LOOP;
 FOR v IN SELECT * FROM jsonb_array_elements(e.prior_state->'credentials') LOOP
  UPDATE driver_credentials dc SET is_active=(v->>'is_active')::boolean,updated_at=clock_timestamp() FROM drivers d WHERE dc.driver_id=d.id AND d.id=(v->>'driver_id')::bigint AND d.company_id=c.id AND d.archived_at IS NULL AND (NOT (v->>'is_active')::boolean OR d.status='active');
 END LOOP;
 INSERT INTO company_lifecycle_events(id,company_id,actor_id,action,reason,prior_state) VALUES(p_request,c.id,p_actor,'restore',trim(p_reason),jsonb_build_object('archive_event_id',old_event));
 RETURN jsonb_build_object('company_id',c.id,'restored',true);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_company_operation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE c companies;
BEGIN
 SELECT * INTO c FROM companies WHERE id=NEW.company_id FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Company missing' USING ERRCODE='23503';END IF;
 IF TG_TABLE_NAME='trips' THEN
  IF TG_OP='UPDATE' THEN
   IF NEW.is_test IS DISTINCT FROM OLD.is_test THEN RAISE EXCEPTION 'Trip classification is immutable' USING ERRCODE='23514';END IF;
   RETURN NEW;
  END IF;
  IF c.archived_at IS NOT NULL THEN RAISE EXCEPTION 'Company archived' USING ERRCODE='23514';END IF;
  NEW.is_test=c.is_test;
 ELSE
  IF c.archived_at IS NOT NULL AND NEW.archived_at IS NULL THEN RAISE EXCEPTION 'Company archived' USING ERRCODE='23514';END IF;
  IF NEW.archived_at IS NOT NULL AND NEW.status<>'inactive' THEN RAISE EXCEPTION 'Archived record cannot be active' USING ERRCODE='23514';END IF;
  IF TG_OP='UPDATE' AND OLD.archived_at IS NOT NULL AND NEW.company_id<>OLD.company_id THEN RAISE EXCEPTION 'Restore before reassignment' USING ERRCODE='23514';END IF;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS jd_company_trip_start_guard ON :"schema".trips;
CREATE TRIGGER jd_company_trip_start_guard BEFORE INSERT OR UPDATE OF is_test ON :"schema".trips FOR EACH ROW EXECUTE FUNCTION :"schema".security_company_operation_guard();
DROP TRIGGER IF EXISTS jd_company_driver_guard ON :"schema".drivers;
CREATE TRIGGER jd_company_driver_guard BEFORE INSERT OR UPDATE ON :"schema".drivers FOR EACH ROW EXECUTE FUNCTION :"schema".security_company_operation_guard();
DROP TRIGGER IF EXISTS jd_company_vehicle_guard ON :"schema".vehicles;
CREATE TRIGGER jd_company_vehicle_guard BEFORE INSERT OR UPDATE ON :"schema".vehicles FOR EACH ROW EXECUTE FUNCTION :"schema".security_company_operation_guard();
CREATE OR REPLACE FUNCTION :"schema".security_company_preserve_history()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$ BEGIN RAISE EXCEPTION 'Archive companies; historical records must be retained' USING ERRCODE='23514';END $$;
DROP TRIGGER IF EXISTS jd_company_preserve_history ON :"schema".companies;
CREATE TRIGGER jd_company_preserve_history BEFORE DELETE ON :"schema".companies FOR EACH ROW EXECUTE FUNCTION :"schema".security_company_preserve_history();
REVOKE ALL ON FUNCTION :"schema".security_archive_company(bigint,bigint,text,uuid), :"schema".security_restore_company(bigint,bigint,text,uuid), :"schema".security_company_operation_guard(), :"schema".security_company_preserve_history() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_archive_company(bigint,bigint,text,uuid), :"schema".security_restore_company(bigint,bigint,text,uuid), :"schema".security_company_operation_guard(), :"schema".security_company_preserve_history() TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_review_company_archive(p_approval bigint,p_actor bigint,p_decision text,p_notes text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE r approval_requests;result jsonb;request_key uuid;
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor) OR p_decision NOT IN('approved','rejected') OR length(coalesce(p_notes,''))>1000 THEN RAISE EXCEPTION 'Invalid archive review' USING ERRCODE='22023';END IF;
 SELECT * INTO r FROM approval_requests WHERE id=p_approval FOR UPDATE;
 IF NOT FOUND OR r.entity_type<>'company' OR r.request_type<>'delete' THEN RAISE EXCEPTION 'Archive request missing' USING ERRCODE='P0002';END IF;
 IF r.status=p_decision THEN RETURN to_jsonb(r);END IF;
 IF r.status<>'pending' THEN RAISE EXCEPTION 'Archive request already reviewed' USING ERRCODE='40001';END IF;
 IF p_decision='approved' THEN
  request_key=(substr(md5('archive-approval:'||r.id::text),1,8)||'-'||substr(md5('archive-approval:'||r.id::text),9,4)||'-'||substr(md5('archive-approval:'||r.id::text),13,4)||'-'||substr(md5('archive-approval:'||r.id::text),17,4)||'-'||substr(md5('archive-approval:'||r.id::text),21,12))::uuid;
  result=security_archive_company(r.entity_id,p_actor,coalesce(nullif(trim(p_notes),''),'Approved company archive request'),request_key);
 END IF;
 UPDATE approval_requests SET status=p_decision,reviewed_by_user_id=p_actor,reviewed_at=clock_timestamp(),review_notes=nullif(p_notes,''),updated_at=clock_timestamp() WHERE id=r.id RETURNING * INTO r;
 INSERT INTO approval_history(approval_request_id,action,performed_by_user_id,action_notes) VALUES(r.id,p_decision,p_actor,nullif(p_notes,''));
 RETURN to_jsonb(r);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_classify_company(p_company bigint,p_actor bigint,p_test boolean,p_reason text,p_request uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE c companies;e company_lifecycle_events;
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor) OR p_request IS NULL OR p_test IS NULL OR coalesce(length(trim(p_reason)),0) NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Invalid classification request' USING ERRCODE='22023';END IF;
 SELECT * INTO c FROM companies WHERE id=p_company FOR UPDATE;
 IF NOT FOUND OR c.archived_at IS NOT NULL THEN RAISE EXCEPTION 'Company unavailable' USING ERRCODE='P0002';END IF;
 SELECT * INTO e FROM company_lifecycle_events WHERE id=p_request;
 IF FOUND THEN
  IF e.company_id<>p_company OR e.action<>'classification' OR e.actor_id<>p_actor OR (e.prior_state->>'new_is_test')::boolean IS DISTINCT FROM p_test THEN RAISE EXCEPTION 'Conflicting classification request' USING ERRCODE='40001';END IF;
  RETURN jsonb_build_object('company_id',c.id,'is_test',c.is_test,'replayed',true);
 END IF;
 IF EXISTS(SELECT FROM trips WHERE company_id=c.id AND status='in_progress' AND end_time IS NULL) THEN RAISE EXCEPTION 'Finish active trips before classification' USING ERRCODE='40001';END IF;
 INSERT INTO company_lifecycle_events(id,company_id,actor_id,action,reason,prior_state) VALUES(p_request,c.id,p_actor,'classification',trim(p_reason),jsonb_build_object('is_test',c.is_test,'new_is_test',p_test));
 UPDATE companies SET is_test=p_test,updated_at=clock_timestamp() WHERE id=c.id;
 RETURN jsonb_build_object('company_id',c.id,'is_test',p_test);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_review_company_archive(bigint,bigint,text,text), :"schema".security_classify_company(bigint,bigint,boolean,text,uuid) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_review_company_archive(bigint,bigint,text,text), :"schema".security_classify_company(bigint,bigint,boolean,text,uuid) TO :"admin_role";

CREATE OR REPLACE FUNCTION :"schema".security_company_directory(p_kind text,p_company bigint DEFAULT NULL,p_scope text DEFAULT 'live',p_state text DEFAULT 'current',p_query text DEFAULT '',p_sort text DEFAULT 'newest',p_limit integer DEFAULT 25,p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE table_name text;fields text;search_fields text;status_field text;ordering text;statement text;result jsonb;
BEGIN
 IF p_kind NOT IN('companies','drivers','vehicles') OR p_scope NOT IN('live','test','all') OR p_state NOT IN('current','all','archived','active','inactive','suspended','maintenance') OR p_sort NOT IN('newest','name','name_desc') OR p_limit NOT BETWEEN 1 AND 100 OR p_offset NOT BETWEEN 0 AND 100000 OR length(p_query)>100 THEN RAISE EXCEPTION 'Invalid directory filters' USING ERRCODE='22023';END IF;
 IF p_kind='companies' THEN
  table_name='companies';fields='d.id,d.name,d.vat_number,d.kbo_number,d.address,d.email,d.phone,d.chiron_mode,d.subscription_status,d.current_contract_id,d.payment_overdue_days,(SELECT bool_or(cu.is_active AND u.is_active) FROM company_users cu JOIN users u ON u.id=cu.user_id WHERE cu.company_id=d.id AND cu.role IN(''owner'',''portal_owner'')) portal_login_enabled,(SELECT u.email FROM company_users cu JOIN users u ON u.id=cu.user_id WHERE cu.company_id=d.id AND cu.role IN(''owner'',''portal_owner'') ORDER BY cu.id LIMIT 1) portal_login_email,d.created_at,d.archived_at,d.is_test';search_fields='coalesce(d.name,'''')||'' ''||coalesce(d.vat_number,'''')||'' ''||coalesce(d.kbo_number,'''')';status_field='d.subscription_status';
 ELSIF p_kind='drivers' THEN
  table_name='drivers';fields='d.id,d.company_id,d.user_id,d.full_name,d.phone,d.national_id,d.driver_license,d.capacity_certificate_number,d.bestuurderspas_number,d.preferred_language,d.assigned_vehicle_id,d.current_vehicle_id,d.status,d.created_at,d.archived_at,c.name company_name,c.is_test';search_fields='coalesce(d.full_name,'''')||'' ''||coalesce(d.phone,'''')';status_field='d.status';
 ELSE
  table_name='vehicles';fields='d.id,d.company_id,d.brand,d.model,d.plate_number,d.vin,d.chiron_vehicle_id,d.status,d.created_at,d.archived_at,c.name company_name,c.is_test';search_fields='coalesce(d.plate_number,'''')||'' ''||coalesce(d.brand,'''')||'' ''||coalesce(d.model,'''')||'' ''||coalesce(d.vin,'''')';status_field='d.status';
 END IF;
 ordering=CASE WHEN p_sort='newest' THEN 'created_at DESC NULLS LAST,id DESC' WHEN p_kind='companies' THEN 'name '||CASE WHEN p_sort='name' THEN 'ASC' ELSE 'DESC' END||',id DESC' WHEN p_kind='drivers' THEN 'full_name '||CASE WHEN p_sort='name' THEN 'ASC' ELSE 'DESC' END||',id DESC' ELSE 'plate_number '||CASE WHEN p_sort='name' THEN 'ASC' ELSE 'DESC' END||',id DESC' END;
 statement='WITH matched AS(SELECT '||fields||','||status_field||' filter_status FROM '||quote_ident(table_name)||' d '||CASE WHEN p_kind='companies' THEN 'JOIN companies c ON c.id=d.id' ELSE 'JOIN companies c ON c.id=d.company_id' END||'
 WHERE ($1::bigint IS NULL OR c.id=$1) AND ($2=''all'' OR c.is_test=($2=''test''))
 AND ($3=''all'' OR ($3=''archived'' AND d.archived_at IS NOT NULL) OR ($3=''current'' AND d.archived_at IS NULL) OR ($3 NOT IN(''all'',''archived'',''current'') AND d.archived_at IS NULL AND '||status_field||'=$3))
 AND ($4='''' OR strpos(lower('||search_fields||'),lower($4))>0)), page AS(SELECT * FROM matched ORDER BY '||ordering||' LIMIT $5 OFFSET $6)
 SELECT jsonb_build_object(''rows'',coalesce((SELECT jsonb_agg(to_jsonb(page)-''filter_status'') FROM page),''[]''::jsonb),''total'',(SELECT count(*) FROM matched),''active'',(SELECT count(*) FROM matched WHERE filter_status=''active'' AND archived_at IS NULL),''suspended'',(SELECT count(*) FROM matched WHERE filter_status=''suspended'' AND archived_at IS NULL),''limit'',$5,''offset'',$6)';
 EXECUTE statement INTO result USING p_company,p_scope,p_state,trim(p_query),p_limit,p_offset;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION :"schema".security_company_directory(text,bigint,text,text,text,text,integer,integer) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_company_directory(text,bigint,text,text,text,text,integer,integer) TO :"admin_role";

COMMIT;
