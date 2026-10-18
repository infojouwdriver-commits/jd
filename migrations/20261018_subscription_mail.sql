BEGIN;
ALTER TABLE :"schema".mail_deliveries DROP CONSTRAINT IF EXISTS mail_deliveries_purpose_check;
ALTER TABLE :"schema".mail_deliveries ADD CONSTRAINT mail_deliveries_purpose_check CHECK(purpose IN('verification','contract_invitation','contract_confirmation','subscription_invoice','subscription_credit','subscription_reminder'));
CREATE OR REPLACE FUNCTION :"schema".security_reserve_mail(p_event_key text,p_recipient_key text,p_purpose text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE m mail_deliveries; now_utc timestamptz:=clock_timestamp();
BEGIN
 IF p_event_key IS NULL OR p_recipient_key IS NULL OR p_event_key !~ '^jd-[a-f0-9]{64}$' OR p_recipient_key !~ '^jd-[a-f0-9]{64}$' OR p_purpose IS NULL OR p_purpose NOT IN ('verification','contract_invitation','contract_confirmation','subscription_invoice','subscription_credit','subscription_reminder') THEN RAISE EXCEPTION 'Invalid delivery event' USING ERRCODE='22023';END IF;
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
COMMIT;
