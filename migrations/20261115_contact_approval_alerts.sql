-- Reserve independent capacity for public form messages and queue new approval notices transactionally.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='45s';
ALTER TABLE :"schema".mail_deliveries DROP CONSTRAINT IF EXISTS mail_deliveries_purpose_check;
ALTER TABLE :"schema".mail_deliveries ADD CONSTRAINT mail_deliveries_purpose_check CHECK(purpose IN('verification','contract_invitation','contract_confirmation','subscription_invoice','subscription_credit','subscription_reminder','driver_receipt','template_test','public_contact','approval_alert')) NOT VALID;
CREATE OR REPLACE FUNCTION :"schema".security_reserve_mail(p_event_key text,p_recipient_key text,p_purpose text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE m mail_deliveries; now_utc timestamptz:=clock_timestamp();
BEGIN
 IF p_event_key IS NULL OR p_recipient_key IS NULL OR p_event_key !~ '^jd-[a-f0-9]{64}$' OR p_recipient_key !~ '^jd-[a-f0-9]{64}$' OR p_purpose IS NULL OR p_purpose NOT IN ('verification','contract_invitation','contract_confirmation','subscription_invoice','subscription_credit','subscription_reminder','driver_receipt','template_test','public_contact','approval_alert') THEN RAISE EXCEPTION 'Invalid delivery event' USING ERRCODE='22023';END IF;
 PERFORM id FROM mail_delivery_mutex WHERE id=1 FOR UPDATE;
 SELECT * INTO m FROM mail_deliveries WHERE event_key=p_event_key;
 IF FOUND THEN
  IF m.recipient_key<>p_recipient_key OR m.purpose<>p_purpose THEN RAISE EXCEPTION 'Delivery event mismatch' USING ERRCODE='22023';END IF;
  RETURN jsonb_build_object('reserved',false,'status',m.status,'id',m.id,'provider_id',m.provider_id);
 END IF;
 IF EXISTS(SELECT FROM mail_deliveries WHERE recipient_key=p_recipient_key AND status IN ('bounced','complained')) THEN RETURN jsonb_build_object('reserved',false,'status','suppressed');END IF;
 IF (SELECT count(*) FROM mail_deliveries WHERE created_at>=date_trunc('day',now_utc AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')>=90
 OR (SELECT count(*) FROM mail_deliveries WHERE created_at>=date_trunc('month',now_utc AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')>=2700
 THEN RETURN jsonb_build_object('reserved',false,'status','quota_exceeded');END IF;
 IF p_purpose='public_contact' AND (
   (SELECT count(*) FROM mail_deliveries WHERE purpose='public_contact' AND created_at>=date_trunc('day',now_utc AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')>=25 OR
   (SELECT count(*) FROM mail_deliveries WHERE purpose='public_contact' AND created_at>=date_trunc('month',now_utc AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')>=600
 ) THEN RETURN jsonb_build_object('reserved',false,'status','quota_exceeded');END IF;
 INSERT INTO mail_deliveries(event_key,recipient_key,purpose) VALUES(p_event_key,p_recipient_key,p_purpose) RETURNING * INTO m;
 RETURN jsonb_build_object('reserved',true,'status',m.status,'id',m.id);
END $$;

CREATE TABLE IF NOT EXISTS :"schema".approval_mail_outbox (
 id bigserial PRIMARY KEY,
 source text NOT NULL CHECK(source IN ('company-registration','driver-registration','company-changes','general')),
 request_key text NOT NULL,
 entity text NOT NULL CHECK(entity IN ('company','driver','vehicle','staff')),
 operation text NOT NULL CHECK(operation IN ('create','update','deactivate','delete')),
 company_id bigint,
 submitted_at timestamptz NOT NULL,
 next_attempt_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 lease uuid,
 finished_at timestamptz,
 delivery_status text,
 UNIQUE(source,request_key)
);
CREATE INDEX IF NOT EXISTS approval_mail_ready ON :"schema".approval_mail_outbox(next_attempt_at,id) WHERE finished_at IS NULL;
ALTER TABLE :"schema".approval_mail_outbox ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".approval_mail_outbox;
CREATE POLICY server_service_access ON :"schema".approval_mail_outbox TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".approval_mail_outbox FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".approval_mail_outbox TO :"admin_role";
GRANT USAGE,SELECT ON SEQUENCE :"schema".approval_mail_outbox_id_seq TO :"admin_role";

CREATE OR REPLACE FUNCTION :"schema".security_enqueue_approval_mail()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE src text; request_id text; kind text; action text; company bigint; submitted timestamptz;
BEGIN
 IF NEW.status IS DISTINCT FROM 'pending' THEN RETURN NEW; END IF;
 IF TG_OP='UPDATE' AND OLD.status='pending' THEN RETURN NEW; END IF;
 IF TG_TABLE_NAME='company_registrations' THEN
   src='company-registration'; request_id=NEW.request_id; kind='company'; action='create'; company=NEW.company_id; submitted=NEW.submitted_at;
 ELSIF TG_TABLE_NAME='driver_registration_requests' THEN
   src='driver-registration'; request_id=NEW.id; kind='driver'; action='create'; company=NEW.company_id; submitted=NEW.submitted_at;
 ELSIF TG_TABLE_NAME='company_change_requests' THEN
   src='company-changes'; request_id=NEW.id; kind=NEW.entity_type; action=NEW.action; company=NEW.company_id; submitted=NEW.created_at;
 ELSE
   src='general'; request_id=NEW.id; kind=NEW.entity_type; action=NEW.request_type; submitted=NEW.created_at;
   IF kind IS NULL OR action IS NULL OR kind NOT IN ('company','driver','vehicle') OR action NOT IN ('create','update','deactivate','delete') THEN RETURN NEW; END IF;
   IF kind='company' OR (kind='vehicle' AND action='create') THEN company=NEW.entity_id;
   ELSIF kind='driver' THEN SELECT company_id INTO company FROM drivers WHERE id=NEW.entity_id;
   ELSIF kind='vehicle' THEN SELECT company_id INTO company FROM vehicles WHERE id=NEW.entity_id;
   END IF;
 END IF;
 INSERT INTO approval_mail_outbox(source,request_key,entity,operation,company_id,submitted_at)
 VALUES(src,request_id,kind,action,company,coalesce(submitted,clock_timestamp()))
 ON CONFLICT(source,request_key) DO NOTHING;
 RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS approval_mail ON :"schema".company_registrations;
CREATE TRIGGER approval_mail AFTER INSERT OR UPDATE OF status ON :"schema".company_registrations FOR EACH ROW EXECUTE FUNCTION :"schema".security_enqueue_approval_mail();
DROP TRIGGER IF EXISTS approval_mail ON :"schema".driver_registration_requests;
CREATE TRIGGER approval_mail AFTER INSERT OR UPDATE OF status ON :"schema".driver_registration_requests FOR EACH ROW EXECUTE FUNCTION :"schema".security_enqueue_approval_mail();
DROP TRIGGER IF EXISTS approval_mail ON :"schema".company_change_requests;
CREATE TRIGGER approval_mail AFTER INSERT OR UPDATE OF status ON :"schema".company_change_requests FOR EACH ROW EXECUTE FUNCTION :"schema".security_enqueue_approval_mail();
DROP TRIGGER IF EXISTS approval_mail ON :"schema".approval_requests;
CREATE TRIGGER approval_mail AFTER INSERT OR UPDATE OF status ON :"schema".approval_requests FOR EACH ROW EXECUTE FUNCTION :"schema".security_enqueue_approval_mail();

CREATE OR REPLACE FUNCTION :"schema".security_claim_approval_mail(p_lease uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE claimed approval_mail_outbox; name text;
BEGIN
 UPDATE approval_mail_outbox SET lease=p_lease,next_attempt_at=clock_timestamp()+interval '2 minutes'
 WHERE id=(SELECT id FROM approval_mail_outbox WHERE finished_at IS NULL AND next_attempt_at<=clock_timestamp()
 ORDER BY next_attempt_at,id LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING * INTO claimed;
 IF NOT FOUND THEN RETURN NULL; END IF;
 SELECT left(companies.name,160) INTO name FROM companies WHERE id=claimed.company_id;
 RETURN jsonb_build_object('id',claimed.id::text,'source',claimed.source,'request_key',claimed.request_key,
 'entity',claimed.entity,'operation',claimed.operation,'company_name',name,'submitted_at',claimed.submitted_at);
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_finish_approval_mail(p_id bigint,p_lease uuid,p_status text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
BEGIN
 UPDATE approval_mail_outbox SET lease=NULL,delivery_status=left(p_status,40),
 finished_at=CASE WHEN p_status IN ('not_configured','record_unavailable','quota_exceeded','sending') THEN NULL ELSE clock_timestamp() END,
 next_attempt_at=clock_timestamp()+CASE WHEN p_status='quota_exceeded' THEN interval '1 hour' ELSE interval '2 minutes' END
 WHERE id=p_id AND lease=p_lease AND finished_at IS NULL;
 RETURN FOUND;
END $$;

REVOKE ALL ON FUNCTION :"schema".security_enqueue_approval_mail(), :"schema".security_claim_approval_mail(uuid), :"schema".security_finish_approval_mail(bigint,uuid,text) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_enqueue_approval_mail(), :"schema".security_claim_approval_mail(uuid), :"schema".security_finish_approval_mail(bigint,uuid,text) TO :"admin_role";
COMMIT;
