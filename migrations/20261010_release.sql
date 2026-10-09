-- Apply after 20261009_security.sql with psql -v schema=... -v admin_role=...
BEGIN;
ALTER TABLE :"schema".trips ADD COLUMN IF NOT EXISTS completion_request_key uuid;
CREATE UNIQUE INDEX IF NOT EXISTS trips_user_completion_request_idx ON :"schema".trips(user_id,completion_request_key);
CREATE OR REPLACE FUNCTION :"schema".security_save_completed_trip(p_payload jsonb,p_user_id bigint,p_key uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE keys_sql text; result_row jsonb; clean_payload jsonb;
BEGIN
 IF p_user_id IS NULL OR p_key IS NULL OR jsonb_typeof(p_payload)<>'object' THEN RAISE EXCEPTION 'Invalid trip payload'; END IF;
 clean_payload=(p_payload-'id'-'completion_request_key') || jsonb_build_object('user_id',p_user_id,'completion_request_key',p_key,'locked_after_completion',true);
 IF clean_payload->>'status'<>'completed' THEN RAISE EXCEPTION 'Completed trip required'; END IF;
 SELECT string_agg(format('%I',key),',' ORDER BY key) INTO keys_sql FROM jsonb_object_keys(clean_payload) AS key;
 EXECUTE format('INSERT INTO trips(%s) SELECT %s FROM jsonb_populate_record(NULL::trips,$1) ON CONFLICT(user_id,completion_request_key) DO NOTHING RETURNING to_jsonb(trips.*)',keys_sql,keys_sql) INTO result_row USING clean_payload;
 IF result_row IS NOT NULL THEN RETURN jsonb_build_object('created',true,'trip',result_row); END IF;
 SELECT to_jsonb(t) INTO result_row FROM trips t WHERE t.user_id=p_user_id AND t.completion_request_key=p_key;
 IF result_row IS NULL THEN RAISE EXCEPTION 'Trip storage unavailable'; END IF;
 RETURN jsonb_build_object('created',false,'trip',result_row);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_save_completed_trip(jsonb,bigint,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_save_completed_trip(jsonb,bigint,uuid) TO :"admin_role";
COMMIT;
