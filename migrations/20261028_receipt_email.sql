-- Optional receipt delivery; never updates invoices or trips. No recipient addresses or message bodies are stored.
BEGIN;
SET LOCAL lock_timeout='5s';
ALTER TABLE :"schema".mail_deliveries DROP CONSTRAINT IF EXISTS mail_deliveries_purpose_check;
ALTER TABLE :"schema".mail_deliveries ADD CONSTRAINT mail_deliveries_purpose_check CHECK(purpose IN('verification','contract_invitation','contract_confirmation','subscription_invoice','subscription_credit','subscription_reminder','driver_receipt'));
CREATE OR REPLACE FUNCTION :"schema".security_reserve_mail(p_event_key text,p_recipient_key text,p_purpose text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE m mail_deliveries; now_utc timestamptz:=clock_timestamp();
BEGIN
 IF p_event_key IS NULL OR p_recipient_key IS NULL OR p_event_key !~ '^jd-[a-f0-9]{64}$' OR p_recipient_key !~ '^jd-[a-f0-9]{64}$' OR p_purpose IS NULL OR p_purpose NOT IN ('verification','contract_invitation','contract_confirmation','subscription_invoice','subscription_credit','subscription_reminder','driver_receipt') THEN RAISE EXCEPTION 'Invalid delivery event' USING ERRCODE='22023';END IF;
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
 INSERT INTO mail_deliveries(event_key,recipient_key,purpose) VALUES(p_event_key,p_recipient_key,p_purpose) RETURNING * INTO m;
 RETURN jsonb_build_object('reserved',true,'status',m.status,'id',m.id);
END $$;
CREATE TABLE IF NOT EXISTS :"schema".receipt_email_settings (
 id integer PRIMARY KEY CHECK(id=1), version integer NOT NULL DEFAULT 1,
 enabled boolean NOT NULL DEFAULT true, text jsonb NOT NULL, url text NOT NULL,
 updated_by bigint REFERENCES :"schema".users(id), updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
INSERT INTO :"schema".receipt_email_settings(id,text,url) VALUES(1,
 '{"ar":"JOUW DRIVER — بوابة إدارة رحلات وشركات التاكسي.","fr":"JOUW DRIVER — gestion des trajets et des entreprises de taxi.","nl":"JOUW DRIVER — beheer van ritten en taxibedrijven."}'::jsonb,'https://jouww.com') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS :"schema".receipt_mail_requests (
 request_id uuid PRIMARY KEY, actor_id bigint NOT NULL REFERENCES :"schema".users(id),
 invoice_id bigint NOT NULL REFERENCES :"schema".invoices(id), payload_digest text NOT NULL CHECK(payload_digest ~ '^jd-[a-f0-9]{64}$'),
 settings_version integer NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE :"schema".receipt_email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE :"schema".receipt_mail_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".receipt_email_settings;
CREATE POLICY server_service_access ON :"schema".receipt_email_settings TO :"admin_role" USING(true) WITH CHECK(true);
DROP POLICY IF EXISTS server_service_access ON :"schema".receipt_mail_requests;
CREATE POLICY server_service_access ON :"schema".receipt_mail_requests TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".receipt_email_settings,:"schema".receipt_mail_requests FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".receipt_email_settings TO :"admin_role";
GRANT SELECT,INSERT ON :"schema".receipt_mail_requests TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_save_receipt_email_settings(p_actor bigint,p_expected integer,p_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE s receipt_email_settings;
BEGIN
 IF NOT EXISTS(SELECT FROM users WHERE id=p_actor AND is_active) THEN RAISE EXCEPTION 'Actor required' USING ERRCODE='42501';END IF;
 IF jsonb_typeof(p_data) IS DISTINCT FROM 'object' OR (SELECT count(*) FROM jsonb_object_keys(p_data))<>3
 OR EXISTS(SELECT FROM jsonb_object_keys(p_data) k WHERE k NOT IN('enabled','text','url'))
 OR jsonb_typeof(p_data->'enabled') IS DISTINCT FROM 'boolean' OR jsonb_typeof(p_data->'text') IS DISTINCT FROM 'object'
 OR (SELECT count(*) FROM jsonb_object_keys(p_data->'text'))<>3
 OR EXISTS(SELECT FROM jsonb_each(p_data->'text') t WHERE t.key NOT IN('ar','fr','nl') OR jsonb_typeof(t.value)<>'string' OR length(trim(t.value#>>'{}')) NOT BETWEEN 1 AND 500)
 OR p_data->>'url' IS NULL OR length(p_data->>'url')>500 OR p_data->>'url' !~ '^https://[A-Za-z0-9.-]+(:[0-9]+)?(/[^[:space:]]*)?$' THEN RAISE EXCEPTION 'Invalid advertisement' USING ERRCODE='22023';END IF;
 SELECT * INTO STRICT s FROM receipt_email_settings WHERE id=1 FOR UPDATE;
 IF s.version IS DISTINCT FROM p_expected THEN RAISE EXCEPTION 'Configuration changed' USING ERRCODE='PT409';END IF;
 UPDATE receipt_email_settings SET version=version+1,enabled=(p_data->>'enabled')::boolean,text=p_data->'text',url=p_data->>'url',updated_by=p_actor,updated_at=clock_timestamp() WHERE id=1 RETURNING * INTO s;
 RETURN to_jsonb(s)-'id'-'updated_by'-'updated_at';
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_claim_receipt_mail(p_actor bigint,p_invoice bigint,p_request uuid,p_digest text,p_version integer)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE prior receipt_mail_requests; v integer;
BEGIN
 IF p_request IS NULL OR p_digest IS NULL OR p_digest !~ '^jd-[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Request required' USING ERRCODE='22023';END IF;
 IF NOT EXISTS(SELECT FROM invoices i JOIN trips t ON t.id=i.trip_id WHERE i.id=p_invoice AND i.user_id=p_actor AND t.user_id=p_actor AND t.status='completed' AND i.receipt_snapshot IS NOT NULL AND i.invoice_category='trip' AND i.status='issued' AND NOT coalesce(t.is_test,false)) THEN RAISE EXCEPTION 'Receipt ownership required' USING ERRCODE='42501';END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_request::text,0));
 SELECT * INTO prior FROM receipt_mail_requests WHERE request_id=p_request;
 IF FOUND THEN
  IF prior.actor_id<>p_actor OR prior.invoice_id<>p_invoice OR prior.payload_digest<>p_digest OR prior.settings_version<>p_version THEN RAISE EXCEPTION 'Request conflict' USING ERRCODE='PT409';END IF;
  RETURN false;
 END IF;
 SELECT version INTO v FROM receipt_email_settings WHERE id=1 FOR SHARE;
 IF v IS DISTINCT FROM p_version THEN RAISE EXCEPTION 'Advertisement changed; review draft' USING ERRCODE='PT409';END IF;
 INSERT INTO receipt_mail_requests(request_id,actor_id,invoice_id,payload_digest,settings_version) VALUES(p_request,p_actor,p_invoice,p_digest,p_version);
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION :"schema".security_save_receipt_email_settings(bigint,integer,jsonb),:"schema".security_claim_receipt_mail(bigint,bigint,uuid,text,integer) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_save_receipt_email_settings(bigint,integer,jsonb),:"schema".security_claim_receipt_mail(bigint,bigint,uuid,text,integer) TO :"admin_role";
COMMIT;
