-- Private delivery metadata only. No message bodies, OTP codes or recipient addresses are stored.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE TABLE IF NOT EXISTS :"schema".mail_delivery_mutex(id integer PRIMARY KEY CHECK(id=1));
INSERT INTO :"schema".mail_delivery_mutex(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS :"schema".mail_deliveries(
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 event_key text UNIQUE NOT NULL CHECK(event_key ~ '^jd-[a-f0-9]{64}$'),
 recipient_key text NOT NULL CHECK(recipient_key ~ '^jd-[a-f0-9]{64}$'),
 purpose text NOT NULL CHECK(purpose IN ('verification','contract_invitation','contract_confirmation')),
 status text NOT NULL DEFAULT 'sending' CHECK(status IN ('sending','accepted','uncertain','delivered','delayed','failed','bounced','complained')),
 provider_id uuid UNIQUE,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 last_event_at timestamptz,
 delivered_at timestamptz
);
CREATE INDEX IF NOT EXISTS mail_deliveries_quota ON :"schema".mail_deliveries(created_at);
CREATE INDEX IF NOT EXISTS mail_deliveries_recipient ON :"schema".mail_deliveries(recipient_key,status);
CREATE TABLE IF NOT EXISTS :"schema".mail_delivery_events(
 event_id text PRIMARY KEY CHECK(length(event_id) BETWEEN 1 AND 256),
 provider_id uuid NOT NULL,
 status text NOT NULL CHECK(status IN ('accepted','delivered','delayed','failed','bounced','complained')),
 event_time timestamptz NOT NULL,
 received_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE OR REPLACE FUNCTION :"schema".security_reserve_mail(p_event_key text,p_recipient_key text,p_purpose text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE m mail_deliveries; now_utc timestamptz:=clock_timestamp();
BEGIN
 IF p_event_key IS NULL OR p_recipient_key IS NULL OR p_event_key !~ '^jd-[a-f0-9]{64}$' OR p_recipient_key !~ '^jd-[a-f0-9]{64}$' OR p_purpose IS NULL OR p_purpose NOT IN ('verification','contract_invitation','contract_confirmation') THEN RAISE EXCEPTION 'Invalid delivery event' USING ERRCODE='22023';END IF;
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
CREATE OR REPLACE FUNCTION :"schema".security_record_mail_event(p_event_id text,p_provider_id uuid,p_status text,p_event_time timestamptz)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE m mail_deliveries; next_status text;
BEGIN
 IF p_event_id IS NULL OR length(p_event_id) NOT BETWEEN 1 AND 256 OR p_provider_id IS NULL OR p_status IS NULL OR p_status NOT IN ('accepted','delivered','delayed','failed','bounced','complained') OR p_event_time IS NULL OR p_event_time>clock_timestamp()+interval '5 minutes' THEN RAISE EXCEPTION 'Invalid delivery event' USING ERRCODE='22023';END IF;
 PERFORM id FROM mail_delivery_mutex WHERE id=1 FOR UPDATE;
 INSERT INTO mail_delivery_events(event_id,provider_id,status,event_time) VALUES(p_event_id,p_provider_id,p_status,p_event_time) ON CONFLICT DO NOTHING;
 IF NOT FOUND THEN RETURN false;END IF;
 SELECT * INTO m FROM mail_deliveries WHERE provider_id=p_provider_id FOR UPDATE;
 IF NOT FOUND THEN RETURN true;END IF;
 next_status=p_status;
 IF m.status='complained' THEN next_status='complained';
 ELSIF p_status='complained' THEN next_status='complained';
 ELSIF m.last_event_at IS NOT NULL AND p_event_time<m.last_event_at THEN next_status=m.status;
 ELSIF m.status='bounced' THEN next_status='bounced';
 ELSIF m.status='delivered' AND p_status IN ('accepted','delayed') THEN next_status='delivered';END IF;
 UPDATE mail_deliveries SET status=next_status,last_event_at=greatest(coalesce(last_event_at,p_event_time),p_event_time),
 delivered_at=CASE WHEN p_status='delivered' THEN coalesce(delivered_at,p_event_time) ELSE delivered_at END,updated_at=clock_timestamp() WHERE id=m.id;
 RETURN true;
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_complete_mail(p_id bigint,p_status text,p_provider_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE m mail_deliveries; e mail_delivery_events; next_status text;
BEGIN
 IF p_status IS NULL OR p_status NOT IN ('accepted','uncertain','failed') OR (p_status='accepted' AND p_provider_id IS NULL) THEN RAISE EXCEPTION 'Invalid delivery completion' USING ERRCODE='22023';END IF;
 PERFORM id FROM mail_delivery_mutex WHERE id=1 FOR UPDATE;
 SELECT * INTO m FROM mail_deliveries WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Delivery missing' USING ERRCODE='P0002';END IF;
 IF m.provider_id IS NOT NULL AND m.provider_id IS DISTINCT FROM p_provider_id THEN RAISE EXCEPTION 'Delivery provider mismatch' USING ERRCODE='22023';END IF;
 IF m.status IN ('sending','uncertain','failed') THEN UPDATE mail_deliveries SET status=p_status,provider_id=coalesce(p_provider_id,provider_id),updated_at=clock_timestamp() WHERE id=m.id RETURNING * INTO m;END IF;
 IF m.provider_id IS NOT NULL THEN
  FOR e IN SELECT * FROM mail_delivery_events WHERE provider_id=m.provider_id ORDER BY event_time,received_at LOOP
   next_status=e.status;
   IF m.status='complained' OR e.status='complained' THEN next_status='complained';
   ELSIF m.last_event_at IS NOT NULL AND e.event_time<m.last_event_at THEN next_status=m.status;
   ELSIF m.status='bounced' THEN next_status='bounced';
   ELSIF m.status='delivered' AND e.status IN ('accepted','delayed') THEN next_status='delivered';END IF;
   UPDATE mail_deliveries SET status=next_status,last_event_at=greatest(coalesce(last_event_at,e.event_time),e.event_time),delivered_at=CASE WHEN e.status='delivered' THEN coalesce(delivered_at,e.event_time) ELSE delivered_at END,updated_at=clock_timestamp() WHERE id=m.id RETURNING * INTO m;
  END LOOP;
 END IF;
 RETURN jsonb_build_object('status',m.status,'provider_id',m.provider_id);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_complete_mail(bigint,text,uuid) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_complete_mail(bigint,text,uuid) TO :"admin_role";
REVOKE ALL ON TABLE :"schema".mail_delivery_mutex,:"schema".mail_deliveries,:"schema".mail_delivery_events FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON TABLE :"schema".mail_delivery_mutex,:"schema".mail_deliveries,:"schema".mail_delivery_events TO :"admin_role";
GRANT USAGE,SELECT ON SEQUENCE :"schema".mail_deliveries_id_seq TO :"admin_role";
REVOKE ALL ON SEQUENCE :"schema".mail_deliveries_id_seq FROM PUBLIC,:"user_role";
REVOKE ALL ON FUNCTION :"schema".security_reserve_mail(text,text,text),:"schema".security_record_mail_event(text,uuid,text,timestamptz) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_reserve_mail(text,text,text),:"schema".security_record_mail_event(text,uuid,text,timestamptz) TO :"admin_role";
COMMIT;
