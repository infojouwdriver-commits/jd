-- Android FCM registrations and transactional delivery queue. No message bodies in push payloads.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE TABLE IF NOT EXISTS :"schema".native_push_devices(
 installation_id uuid PRIMARY KEY, user_id bigint NOT NULL REFERENCES :"schema".users(id) ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE, encrypted_token text NOT NULL, language text NOT NULL DEFAULT 'ar' CHECK(language IN ('ar','fr','nl','en')),
 registered_at timestamptz NOT NULL DEFAULT clock_timestamp(), last_seen_at timestamptz NOT NULL DEFAULT clock_timestamp(), enabled boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS :"schema".native_push_jobs(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), installation_id uuid NOT NULL REFERENCES :"schema".native_push_devices(installation_id) ON DELETE CASCADE,
 user_id bigint NOT NULL, registration_at timestamptz NOT NULL, source_kind text NOT NULL CHECK(source_kind IN ('message','notification','test')),
 source_id bigint NOT NULL, state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','accepted','failed','cancelled')),
 attempts integer NOT NULL DEFAULT 0, available_at timestamptz NOT NULL DEFAULT clock_timestamp(), expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '24 hours',
 lease_id uuid, lease_until timestamptz, provider_message_id text, accepted_at timestamptz, received_at timestamptz,
 UNIQUE(installation_id,registration_at,source_kind,source_id)
);
CREATE INDEX IF NOT EXISTS native_push_pending ON :"schema".native_push_jobs(state,available_at);
ALTER TABLE :"schema".native_push_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE :"schema".native_push_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON :"schema".native_push_devices,:"schema".native_push_jobs FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE,DELETE ON :"schema".native_push_devices,:"schema".native_push_jobs TO :"admin_role";
DROP POLICY IF EXISTS native_push_service ON :"schema".native_push_devices;
CREATE POLICY native_push_service ON :"schema".native_push_devices TO :"admin_role" USING(true) WITH CHECK(true);
DROP POLICY IF EXISTS native_push_service ON :"schema".native_push_jobs;
CREATE POLICY native_push_service ON :"schema".native_push_jobs TO :"admin_role" USING(true) WITH CHECK(true);
CREATE OR REPLACE FUNCTION :"schema".security_push_device(p_user_id bigint,p_installation uuid,p_hash text,p_encrypted text,p_language text,p_enabled boolean,p_issued_at bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE saved native_push_devices; actor users;
BEGIN
 SELECT * INTO actor FROM users WHERE id=p_user_id FOR UPDATE;
 IF NOT FOUND OR to_timestamp(p_issued_at)<=coalesce(actor.security_revoked_before,'-infinity'::timestamptz) THEN RAISE EXCEPTION 'Session revoked' USING ERRCODE='42501'; END IF;
 IF NOT EXISTS(SELECT FROM drivers WHERE user_id=p_user_id AND status='active') OR (to_jsonb(actor)->>'is_active')='false' OR (to_jsonb(actor)->>'status')='disabled' THEN RAISE EXCEPTION 'Driver unavailable' USING ERRCODE='42501'; END IF;
 IF NOT p_enabled THEN
  UPDATE native_push_devices SET enabled=false WHERE installation_id=p_installation AND user_id=p_user_id;
  UPDATE native_push_jobs SET state='cancelled' WHERE installation_id=p_installation AND user_id=p_user_id AND state IN ('pending','sending');
  RETURN jsonb_build_object('enabled',false);
 END IF;
 IF p_hash !~ '^[a-f0-9]{64}$' OR p_encrypted NOT LIKE 'enc:v1:%' OR p_language NOT IN ('ar','fr','nl','en') THEN RAISE EXCEPTION 'Invalid registration' USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_hash,0));
 DELETE FROM native_push_devices WHERE token_hash=p_hash AND installation_id<>p_installation;
 INSERT INTO native_push_devices(installation_id,user_id,token_hash,encrypted_token,language)
 VALUES(p_installation,p_user_id,p_hash,p_encrypted,p_language)
 ON CONFLICT(installation_id) DO UPDATE SET user_id=excluded.user_id,token_hash=excluded.token_hash,encrypted_token=excluded.encrypted_token,
 language=excluded.language,last_seen_at=clock_timestamp(),enabled=true,
 registered_at=CASE WHEN native_push_devices.user_id=excluded.user_id AND native_push_devices.enabled AND native_push_devices.token_hash=excluded.token_hash
 AND native_push_devices.registered_at>coalesce((SELECT security_revoked_before FROM users WHERE id=p_user_id),'-infinity'::timestamptz) THEN native_push_devices.registered_at ELSE clock_timestamp() END
 RETURNING * INTO saved;
 RETURN jsonb_build_object('enabled',saved.enabled,'installation_id',saved.installation_id);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_enqueue_native_push() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
BEGIN
 IF TG_TABLE_NAME='message_recipients' THEN
  INSERT INTO native_push_jobs(installation_id,user_id,registration_at,source_kind,source_id)
  SELECT d.installation_id,d.user_id,d.registered_at,'message',NEW.message_id FROM native_push_devices d WHERE d.user_id=NEW.recipient_user_id AND d.enabled ON CONFLICT DO NOTHING;
 ELSE
  IF NEW.is_active IS TRUE THEN
   INSERT INTO native_push_jobs(installation_id,user_id,registration_at,source_kind,source_id,available_at,expires_at)
   SELECT d.installation_id,d.user_id,d.registered_at,'notification',NEW.id, greatest(clock_timestamp(),coalesce(NEW.scheduled_at,clock_timestamp())),
   least(coalesce(NEW.expires_at,'infinity'::timestamptz),greatest(clock_timestamp(),coalesce(NEW.scheduled_at,clock_timestamp()))+interval '24 hours')
   FROM native_push_devices d JOIN drivers dr ON dr.user_id=d.user_id WHERE d.enabled AND dr.status='active'
   AND (NEW.target_company_id IS NULL OR dr.company_id=NEW.target_company_id)
   AND (NEW.target_audience IN ('all_drivers','active_drivers') OR NEW.target_audience='specific_company' AND dr.company_id=NEW.target_company_id) ON CONFLICT DO NOTHING;
  END IF;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS native_message_push ON :"schema".message_recipients;
CREATE TRIGGER native_message_push AFTER INSERT ON :"schema".message_recipients FOR EACH ROW EXECUTE FUNCTION :"schema".security_enqueue_native_push();
DROP TRIGGER IF EXISTS native_notification_push ON :"schema".notifications;
CREATE TRIGGER native_notification_push AFTER INSERT ON :"schema".notifications FOR EACH ROW EXECUTE FUNCTION :"schema".security_enqueue_native_push();
CREATE OR REPLACE FUNCTION :"schema".security_claim_native_push() RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE result jsonb;
BEGIN
 UPDATE native_push_jobs SET state='cancelled' WHERE state IN ('pending','sending') AND expires_at<=clock_timestamp();
 WITH selected AS (
 SELECT j.id FROM native_push_jobs j WHERE j.expires_at>clock_timestamp() AND j.attempts<5 AND j.available_at<=clock_timestamp()
 AND (j.state='pending' OR j.state='sending' AND j.lease_until<clock_timestamp())
 ORDER BY j.available_at,j.id FOR UPDATE SKIP LOCKED LIMIT 10
 ), claimed AS (
 UPDATE native_push_jobs j SET state='sending',attempts=j.attempts+1,lease_id=gen_random_uuid(),lease_until=clock_timestamp()+interval '2 minutes'
 FROM selected s WHERE j.id=s.id RETURNING j.*
 ) SELECT coalesce(jsonb_agg(to_jsonb(c)||jsonb_build_object('encrypted_token',d.encrypted_token,'language',d.language,
 'authorized',d.enabled AND d.user_id=c.user_id AND d.registered_at=c.registration_at
 AND d.last_seen_at>clock_timestamp()-interval '30 days'
 AND (to_jsonb(u)->>'is_active') IS DISTINCT FROM 'false' AND (to_jsonb(u)->>'status') IS DISTINCT FROM 'disabled'
 AND d.registered_at>coalesce(u.security_revoked_before,'-infinity'::timestamptz)
 AND EXISTS(SELECT FROM drivers dr WHERE dr.user_id=c.user_id AND dr.status='active')
 AND CASE c.source_kind WHEN 'message' THEN EXISTS(SELECT FROM message_recipients r JOIN internal_messages m ON m.id=r.message_id WHERE r.message_id=c.source_id AND r.recipient_user_id=c.user_id AND r.is_deleted IS DISTINCT FROM true AND r.is_read IS DISTINCT FROM true)
 WHEN 'notification' THEN EXISTS(SELECT FROM notifications n JOIN drivers dr ON dr.user_id=c.user_id WHERE n.id=c.source_id AND n.is_active AND (n.scheduled_at IS NULL OR n.scheduled_at<=clock_timestamp()) AND (n.expires_at IS NULL OR n.expires_at>clock_timestamp()) AND (n.target_company_id IS NULL OR n.target_company_id=dr.company_id) AND (n.target_audience IN ('all_drivers','active_drivers') OR n.target_audience='specific_company' AND n.target_company_id=dr.company_id))
 ELSE true END)),'[]'::jsonb) INTO result FROM claimed c JOIN native_push_devices d ON d.installation_id=c.installation_id JOIN users u ON u.id=c.user_id;
 RETURN result;
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_finish_native_push(p_id uuid,p_lease uuid,p_state text,p_provider text DEFAULT NULL,p_invalid boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE j native_push_jobs;
BEGIN
 IF p_state NOT IN ('accepted','failed','pending','cancelled') OR p_provider IS NOT NULL AND length(p_provider)>300 THEN RAISE EXCEPTION 'Invalid receipt'; END IF;
 UPDATE native_push_jobs SET state=CASE WHEN p_state='pending' AND attempts>=5 THEN 'failed' ELSE p_state END,
 available_at=clock_timestamp()+make_interval(secs=>least(3600,30*power(2,attempts)::integer)),provider_message_id=p_provider,
 accepted_at=CASE WHEN p_state='accepted' THEN clock_timestamp() END,lease_until=NULL
 WHERE id=p_id AND lease_id=p_lease AND state='sending' RETURNING * INTO j;
 IF p_invalid AND j.id IS NOT NULL THEN UPDATE native_push_devices SET enabled=false WHERE installation_id=j.installation_id AND user_id=j.user_id AND registered_at=j.registration_at; END IF;
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_test_native_push(p_user_id bigint,p_installation uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE job native_push_jobs;
BEGIN
 PERFORM pg_advisory_xact_lock(p_user_id);
 IF EXISTS(SELECT FROM native_push_jobs WHERE user_id=p_user_id AND source_kind='test' AND available_at>clock_timestamp()-interval '1 minute') THEN RAISE EXCEPTION 'Test rate limited' USING ERRCODE='22023'; END IF;
 INSERT INTO native_push_jobs(installation_id,user_id,registration_at,source_kind,source_id,expires_at,available_at)
 SELECT d.installation_id,d.user_id,d.registered_at,'test',floor(extract(epoch from clock_timestamp())*1000)::bigint,clock_timestamp()+interval '5 minutes',clock_timestamp()+interval '15 seconds'
 FROM native_push_devices d JOIN users u ON u.id=d.user_id WHERE d.installation_id=p_installation AND d.user_id=p_user_id AND d.enabled AND d.registered_at>coalesce(u.security_revoked_before,'-infinity'::timestamptz) RETURNING * INTO job;
 IF job.id IS NULL THEN RAISE EXCEPTION 'Registration required' USING ERRCODE='42501'; END IF;
 RETURN jsonb_build_object('job_id',job.id,'state',job.state);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_push_device(bigint,uuid,text,text,text,boolean,bigint),:"schema".security_claim_native_push(),:"schema".security_finish_native_push(uuid,uuid,text,text,boolean),:"schema".security_test_native_push(bigint,uuid),:"schema".security_enqueue_native_push() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_push_device(bigint,uuid,text,text,text,boolean,bigint),:"schema".security_claim_native_push(),:"schema".security_finish_native_push(uuid,uuid,text,text,boolean),:"schema".security_test_native_push(bigint,uuid) TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_native_push_ready() RETURNS boolean LANGUAGE sql SECURITY INVOKER AS $$ SELECT true $$;
REVOKE ALL ON FUNCTION :"schema".security_native_push_ready() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_native_push_ready() TO :"admin_role";
COMMIT;
