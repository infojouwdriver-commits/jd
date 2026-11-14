-- Additive settings and test email delivery. Existing mail events and document data are retained.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='45s';
ALTER TABLE :"schema".mail_deliveries DROP CONSTRAINT IF EXISTS mail_deliveries_purpose_check;
ALTER TABLE :"schema".mail_deliveries ADD CONSTRAINT mail_deliveries_purpose_check CHECK(purpose IN('verification','contract_invitation','contract_confirmation','subscription_invoice','subscription_credit','subscription_reminder','driver_receipt','template_test')) NOT VALID;
CREATE OR REPLACE FUNCTION :"schema".security_reserve_mail(p_event_key text,p_recipient_key text,p_purpose text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE m mail_deliveries; now_utc timestamptz:=clock_timestamp();
BEGIN
 IF p_event_key IS NULL OR p_recipient_key IS NULL OR p_event_key !~ '^jd-[a-f0-9]{64}$' OR p_recipient_key !~ '^jd-[a-f0-9]{64}$' OR p_purpose IS NULL OR p_purpose NOT IN ('verification','contract_invitation','contract_confirmation','subscription_invoice','subscription_credit','subscription_reminder','driver_receipt','template_test') THEN RAISE EXCEPTION 'Invalid delivery event' USING ERRCODE='22023';END IF;
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
CREATE TABLE IF NOT EXISTS :"schema".email_template_settings (
 language text PRIMARY KEY CHECK(language IN ('ar','fr','nl','en')),
 version integer NOT NULL DEFAULT 1 CHECK(version>0),
 settings jsonb NOT NULL DEFAULT '{"signature":"","templates":{}}',
 updated_at timestamptz
);
INSERT INTO :"schema".email_template_settings(language)
 VALUES ('ar'),('fr'),('nl'),('en') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS :"schema".email_template_audit (
 language text NOT NULL REFERENCES :"schema".email_template_settings(language),
 version integer NOT NULL,
 actor_id bigint NOT NULL,
 before_settings jsonb NOT NULL,
 after_settings jsonb NOT NULL,
 changed_at timestamptz NOT NULL,
 PRIMARY KEY(language,version)
);
ALTER TABLE :"schema".email_template_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE :"schema".email_template_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".email_template_settings;
CREATE POLICY server_service_access ON :"schema".email_template_settings TO :"admin_role" USING(true) WITH CHECK(true);
DROP POLICY IF EXISTS server_service_access ON :"schema".email_template_audit;
CREATE POLICY server_service_access ON :"schema".email_template_audit TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".email_template_settings,:"schema".email_template_audit FROM PUBLIC,:"user_role",:"admin_role";
GRANT SELECT,UPDATE ON :"schema".email_template_settings TO :"admin_role";
GRANT SELECT,INSERT ON :"schema".email_template_audit TO :"admin_role";

CREATE OR REPLACE FUNCTION :"schema".security_save_email_templates(p_actor bigint,p_language text,p_expected integer,p_settings jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE prior email_template_settings; saved email_template_settings; entry record;
BEGIN
 IF NOT EXISTS(SELECT FROM users WHERE id=p_actor AND is_active) THEN
  RAISE EXCEPTION 'Actor required' USING ERRCODE='42501';
 END IF;
 IF jsonb_typeof(p_settings) IS DISTINCT FROM 'object' OR octet_length(p_settings::text)>12000
 OR jsonb_typeof(p_settings->'signature') IS DISTINCT FROM 'string' OR length(p_settings->>'signature')>500
 OR jsonb_typeof(p_settings->'templates') IS DISTINCT FROM 'object' THEN
  RAISE EXCEPTION 'Invalid settings' USING ERRCODE='22023';
 END IF;
 IF (SELECT count(*) FROM jsonb_object_keys(p_settings))<>2 THEN RAISE EXCEPTION 'Invalid settings' USING ERRCODE='22023'; END IF;
 FOR entry IN SELECT * FROM jsonb_each(p_settings->'templates') LOOP
  IF entry.key NOT IN ('invoice','credit-note','invoice-reminder')
  OR jsonb_typeof(entry.value) IS DISTINCT FROM 'object'
  OR jsonb_typeof(entry.value->'subject') IS DISTINCT FROM 'string'
  OR jsonb_typeof(entry.value->'intro') IS DISTINCT FROM 'string'
  OR length(entry.value->>'subject')>80 OR length(entry.value->>'intro')>500
  OR (entry.value->>'subject') ~ '[[:cntrl:]]' THEN
   RAISE EXCEPTION 'Invalid template' USING ERRCODE='22023';
  END IF;
  IF (SELECT count(*) FROM jsonb_object_keys(entry.value))<>2 THEN RAISE EXCEPTION 'Invalid template' USING ERRCODE='22023'; END IF;
 END LOOP;
 SELECT * INTO STRICT prior FROM email_template_settings WHERE language=p_language FOR UPDATE;
 IF prior.version IS DISTINCT FROM p_expected THEN RAISE EXCEPTION 'Template changed' USING ERRCODE='PT409'; END IF;
 IF prior.settings=p_settings THEN RETURN to_jsonb(prior)-'language'; END IF;
 UPDATE email_template_settings SET version=version+1,settings=p_settings,updated_at=clock_timestamp()
 WHERE language=p_language RETURNING * INTO saved;
 INSERT INTO email_template_audit VALUES(p_language,saved.version,p_actor,prior.settings,saved.settings,saved.updated_at);
 RETURN to_jsonb(saved)-'language';
END $$;

REVOKE ALL ON FUNCTION :"schema".security_save_email_templates(bigint,text,integer,jsonb) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_save_email_templates(bigint,text,integer,jsonb) TO :"admin_role";
COMMIT;
