-- Additive, server-only review queue. No pending request changes operational records.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE TABLE IF NOT EXISTS :"schema".company_change_requests(
 id bigserial PRIMARY KEY,company_id bigint NOT NULL REFERENCES :"schema".companies(id),
 requested_by bigint NOT NULL REFERENCES :"schema".users(id),entity_type text NOT NULL CHECK(entity_type IN('driver','vehicle','staff')),
 entity_id bigint,action text NOT NULL CHECK(action IN('create','update','deactivate')),
 payload jsonb NOT NULL,summary jsonb NOT NULL,before_data jsonb,
 fingerprint text NOT NULL UNIQUE CHECK(fingerprint ~ '^[0-9a-f]{64}$'),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN('pending','approved','rejected')),
 reviewed_by bigint REFERENCES :"schema".users(id),review_notes text,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),reviewed_at timestamptz,
 CHECK((action='create' AND entity_id IS NULL) OR (action<>'create' AND entity_id>0))
);
CREATE INDEX IF NOT EXISTS company_changes_company_created ON :"schema".company_change_requests(company_id,created_at DESC);
ALTER TABLE :"schema".company_change_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".company_change_requests;
CREATE POLICY server_service_access ON :"schema".company_change_requests TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".company_change_requests FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".company_change_requests TO :"admin_role";
GRANT USAGE,SELECT ON SEQUENCE :"schema".company_change_requests_id_seq TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_submit_company_change(p_company bigint,p_actor bigint,p_entity text,p_action text,p_entity_id bigint,p_payload jsonb,p_summary jsonb,p_fingerprint text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE r company_change_requests;old_data jsonb;
BEGIN
 PERFORM id FROM companies WHERE id=p_company AND archived_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Company unavailable' USING ERRCODE='P0002';END IF;
 IF NOT EXISTS(SELECT FROM company_users WHERE company_id=p_company AND user_id=p_actor AND is_active AND
 (role IN('owner','portal_owner') OR (p_entity IN('driver','vehicle') AND role IN('manager','fleet_manager'))))
 THEN RAISE EXCEPTION 'Permission denied' USING ERRCODE='42501';END IF;
 IF p_entity NOT IN('driver','vehicle','staff') OR p_action NOT IN('create','update','deactivate') OR jsonb_typeof(p_payload) IS DISTINCT FROM 'object' OR jsonb_typeof(p_summary) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023';END IF;
 SELECT * INTO r FROM company_change_requests WHERE fingerprint=p_fingerprint;
 IF FOUND THEN
  IF r.company_id<>p_company OR r.requested_by<>p_actor OR r.entity_type<>p_entity OR r.action<>p_action OR r.entity_id IS DISTINCT FROM p_entity_id OR r.summary IS DISTINCT FROM p_summary OR r.payload->>'command_hash' IS DISTINCT FROM p_payload->>'command_hash' THEN RAISE EXCEPTION 'Request conflict' USING ERRCODE='40001';END IF;
  RETURN jsonb_build_object('id',r.id,'status',r.status);
 END IF;
 IF p_action<>'create' THEN
  IF p_entity='driver' THEN SELECT to_jsonb(d) INTO old_data FROM drivers d WHERE id=p_entity_id AND company_id=p_company AND archived_at IS NULL FOR UPDATE;
  ELSIF p_entity='vehicle' THEN SELECT to_jsonb(v) INTO old_data FROM vehicles v WHERE id=p_entity_id AND company_id=p_company AND archived_at IS NULL FOR UPDATE;
  ELSE SELECT to_jsonb(u) INTO old_data FROM company_users u WHERE id=p_entity_id AND company_id=p_company FOR UPDATE;
  END IF;
  IF old_data IS NULL THEN RAISE EXCEPTION 'Record missing in company' USING ERRCODE='P0002';END IF;
 END IF;
 INSERT INTO company_change_requests(company_id,requested_by,entity_type,entity_id,action,payload,summary,before_data,fingerprint)
 VALUES(p_company,p_actor,p_entity,p_entity_id,p_action,p_payload,p_summary,old_data,p_fingerprint) RETURNING * INTO r;
 RETURN jsonb_build_object('id',r.id,'status',r.status);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_review_company_change(p_id bigint,p_actor bigint,p_decision text,p_notes text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE r company_change_requests;current_data jsonb;v vehicles;result jsonb;
BEGIN
 -- This RPC is service-only. The HTTP route additionally requires platform admin + MFA.
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor AND is_active) OR p_decision NOT IN('approved','rejected') OR length(coalesce(p_notes,''))>1000 OR (p_decision='rejected' AND coalesce(length(trim(p_notes)),0)=0) THEN RAISE EXCEPTION 'Invalid review' USING ERRCODE='22023';END IF;
 -- Match submission/lifecycle lock order (company before request/operational rows).
 SELECT * INTO r FROM company_change_requests WHERE id=p_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Request missing' USING ERRCODE='P0002';END IF;
 PERFORM id FROM companies WHERE id=r.company_id AND archived_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Company unavailable' USING ERRCODE='P0002';END IF;
 SELECT * INTO r FROM company_change_requests WHERE id=p_id FOR UPDATE;
 IF r.status<>'pending' THEN
  IF r.status<>p_decision THEN RAISE EXCEPTION 'Already reviewed' USING ERRCODE='40001';END IF;
  RETURN jsonb_build_object('id',r.id,'status',r.status);
 END IF;
 IF p_decision='approved' THEN
  IF NOT EXISTS(SELECT FROM company_users WHERE company_id=r.company_id AND user_id=r.requested_by AND is_active AND
   (role IN('owner','portal_owner') OR (r.entity_type IN('driver','vehicle') AND role IN('manager','fleet_manager'))))
  THEN RAISE EXCEPTION 'Requester no longer authorized' USING ERRCODE='42501';END IF;
  IF r.action<>'create' THEN
   IF r.entity_type='driver' THEN SELECT to_jsonb(d) INTO current_data FROM drivers d WHERE id=r.entity_id AND company_id=r.company_id AND archived_at IS NULL FOR UPDATE;
   ELSIF r.entity_type='vehicle' THEN SELECT to_jsonb(t) INTO current_data FROM vehicles t WHERE id=r.entity_id AND company_id=r.company_id AND archived_at IS NULL FOR UPDATE;
   ELSE SELECT to_jsonb(u) INTO current_data FROM company_users u WHERE id=r.entity_id AND company_id=r.company_id FOR UPDATE;
   END IF;
   IF current_data IS DISTINCT FROM r.before_data THEN RAISE EXCEPTION 'Record changed since request; reject and resubmit' USING ERRCODE='40001';END IF;
  END IF;
  IF r.entity_type IN('driver','vehicle') AND r.action<>'create' AND EXISTS(SELECT FROM trips WHERE company_id=r.company_id AND status='in_progress' AND end_time IS NULL AND ((r.entity_type='driver' AND driver_id=r.entity_id) OR (r.entity_type='vehicle' AND vehicle_id=r.entity_id))) THEN RAISE EXCEPTION 'Finish active trip before review' USING ERRCODE='40001';END IF;
  IF r.entity_type='driver' THEN
   IF r.action='create' THEN result=security_create_driver_account(r.payload->'account',r.payload->'driver',r.company_id);
   ELSIF r.action='update' THEN result=security_update_driver_account(r.entity_id,r.payload->'account',r.payload->'driver');
   ELSE result=security_deactivate_driver_account(r.entity_id);END IF;
  ELSIF r.entity_type='vehicle' THEN
   IF EXISTS(SELECT FROM jsonb_object_keys(r.payload-'command_hash') k WHERE k NOT IN('brand','model','plate_number','vin','status')) THEN RAISE EXCEPTION 'Invalid vehicle fields' USING ERRCODE='22023';END IF;
   IF r.action='create' THEN
    INSERT INTO vehicles(company_id,brand,model,plate_number,vin,status,documents) VALUES(r.company_id,r.payload->>'brand',r.payload->>'model',r.payload->>'plate_number',r.payload->>'vin','active','[]');
   ELSIF r.action='update' THEN
    v=jsonb_populate_record(NULL::vehicles,current_data||r.payload);
    UPDATE vehicles SET brand=v.brand,model=v.model,plate_number=v.plate_number,vin=v.vin,status=v.status,updated_at=clock_timestamp() WHERE id=r.entity_id AND company_id=r.company_id;
   ELSE UPDATE vehicles SET status='inactive',updated_at=clock_timestamp() WHERE id=r.entity_id AND company_id=r.company_id;END IF;
  ELSE
   result=security_change_company_staff(r.company_id,p_actor,true,r.entity_id,r.payload->>'role',(r.payload->>'is_active')::boolean,r.payload->>'reason',r.payload->>'email',r.payload->>'hash',r.payload->>'user_role');
  END IF;
 END IF;
 UPDATE company_change_requests SET status=p_decision,reviewed_by=p_actor,review_notes=trim(p_notes),reviewed_at=clock_timestamp() WHERE id=r.id;
 RETURN jsonb_build_object('id',r.id,'status',p_decision);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_submit_company_change(bigint,bigint,text,text,bigint,jsonb,jsonb,text), :"schema".security_review_company_change(bigint,bigint,text,text) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_submit_company_change(bigint,bigint,text,text,bigint,jsonb,jsonb,text), :"schema".security_review_company_change(bigint,bigint,text,text) TO :"admin_role";
COMMIT;
