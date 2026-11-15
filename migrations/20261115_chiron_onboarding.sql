-- Municipality test documents share the standard mail delivery ledger.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='45s';
ALTER TABLE :"schema".mail_deliveries DROP CONSTRAINT IF EXISTS mail_deliveries_purpose_check;
ALTER TABLE :"schema".mail_deliveries ADD CONSTRAINT mail_deliveries_purpose_check CHECK(purpose IN('verification','contract_invitation','contract_confirmation','subscription_invoice','subscription_credit','subscription_reminder','driver_receipt','template_test','public_contact','approval_alert','municipal_test_documents')) NOT VALID;
CREATE OR REPLACE FUNCTION :"schema".security_reserve_mail(p_event_key text,p_recipient_key text,p_purpose text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE m mail_deliveries; now_utc timestamptz:=clock_timestamp();
BEGIN
 IF p_event_key IS NULL OR p_recipient_key IS NULL OR p_event_key !~ '^jd-[a-f0-9]{64}$' OR p_recipient_key !~ '^jd-[a-f0-9]{64}$' OR p_purpose IS NULL OR p_purpose NOT IN ('verification','contract_invitation','contract_confirmation','subscription_invoice','subscription_credit','subscription_reminder','driver_receipt','template_test','public_contact','approval_alert','municipal_test_documents') THEN RAISE EXCEPTION 'Invalid delivery event' USING ERRCODE='22023';END IF;
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

-- For public sign-ups already subject to the first-invoice gate, link their signed
-- registration contract even if a test ride or historical enrolment already exists.
CREATE OR REPLACE FUNCTION :"schema".security_invoice_activation_begin()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
BEGIN
 IF OLD.signed_at IS NULL AND NEW.signed_at IS NOT NULL AND NEW.billing_model='gross_monthly_v1' AND (
  EXISTS(SELECT FROM invoice_service_activation a JOIN company_registrations r ON r.company_id=a.company_id
    WHERE a.company_id=NEW.company_id AND a.contract_id IS NULL AND a.paid_at IS NULL
    AND r.request_id=NEW.registration_request_id AND r.status='approved')
  OR (
    NOT EXISTS(SELECT FROM stripe_enrollments WHERE company_id=NEW.company_id)
    AND NOT EXISTS(SELECT FROM subscription_payments WHERE company_id=NEW.company_id)
    AND NOT EXISTS(SELECT FROM subscription_billing_profiles WHERE company_id=NEW.company_id AND contract_id IS DISTINCT FROM NEW.id)
    AND NOT EXISTS(SELECT FROM trips WHERE company_id=NEW.company_id)
  )
 ) THEN
  INSERT INTO invoice_service_activation(contract_id,company_id) VALUES(NEW.id,NEW.company_id)
  ON CONFLICT(company_id) DO UPDATE SET contract_id=EXCLUDED.contract_id WHERE invoice_service_activation.contract_id IS NULL;
 END IF;
 RETURN NEW;
END $$;

-- Recovery is limited to one explicitly selected, approved public signup.
CREATE OR REPLACE FUNCTION :"schema".security_recover_registration_service(p_registration uuid,p_actor bigint,p_request uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE r company_registrations;c companies;k company_contracts;a invoice_service_activation;
 p subscription_billing_profiles;d subscription_documents;evidence_at timestamptz;prepared jsonb;
BEGIN
 IF p_request IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor AND is_active) THEN
  RAISE EXCEPTION 'Active reviewer required' USING ERRCODE='42501';
 END IF;
 SELECT * INTO r FROM company_registrations WHERE request_id=p_registration AND status='approved' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Approved registration required' USING ERRCODE='P0002';END IF;
 SELECT * INTO c FROM companies WHERE id=r.company_id FOR UPDATE;
 IF c.archived_at IS NOT NULL OR c.subscription_status IS DISTINCT FROM 'active' THEN
  RETURN jsonb_build_object('status','company_inactive');
 END IF;
 SELECT * INTO a FROM invoice_service_activation WHERE company_id=c.id FOR UPDATE;
 IF a.company_id IS NULL OR a.paid_at IS NOT NULL THEN RETURN jsonb_build_object('status','active');END IF;
 SELECT * INTO k FROM company_contracts WHERE company_id=c.id AND registration_request_id=r.request_id FOR UPDATE;
 IF k.id IS NULL THEN RETURN jsonb_build_object('status','contract_missing');END IF;
 IF k.signed_at IS NULL THEN RETURN jsonb_build_object('status','awaiting_signature','contract_id',k.id);END IF;
 IF k.contract_status IS DISTINCT FROM 'active' OR k.contract_end_date IS NULL OR k.contract_end_date<=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date
    OR (a.contract_id IS NOT NULL AND a.contract_id<>k.id) THEN
  RETURN jsonb_build_object('status','billing_conflict','contract_id',k.id);
 END IF;
 SELECT * INTO p FROM subscription_billing_profiles WHERE company_id=c.id FOR UPDATE;
 IF p.contract_id IS DISTINCT FROM k.id THEN RETURN jsonb_build_object('status','billing_conflict','contract_id',k.id);END IF;
 IF a.contract_id IS NULL THEN UPDATE invoice_service_activation SET contract_id=k.id WHERE company_id=c.id;END IF;
 SELECT * INTO d FROM subscription_documents WHERE company_id=c.id AND contract_id=k.id AND installment_number=1 AND kind='invoice' AND state<>'void' FOR UPDATE;
 IF d.id IS NOT NULL THEN
  SELECT max(created_at) INTO evidence_at FROM subscription_payments WHERE invoice_id=d.id AND company_id=c.id;
  IF d.state='issued' AND NOT d.is_test AND evidence_at IS NOT NULL AND security_subscription_document_balance(d.id)<=0 THEN
   UPDATE invoice_service_activation SET paid_at=evidence_at WHERE company_id=c.id;
   RETURN jsonb_build_object('status','active','document_id',d.id,'contract_id',k.id);
  END IF;
  RETURN jsonb_build_object('status',CASE WHEN d.state='issued' THEN 'awaiting_payment' ELSE 'invoice_prepared' END,'document_id',d.id,'contract_id',k.id);
 END IF;
 IF NOT p.enabled OR p.installment_index<>0 THEN RETURN jsonb_build_object('status','billing_conflict','contract_id',k.id);END IF;
 BEGIN
  prepared=security_prepare_subscription_invoice(c.id,p_actor,p_request);
 EXCEPTION WHEN check_violation THEN
  RETURN jsonb_build_object('status','invoice_blocked','contract_id',k.id);
 END;
 RETURN jsonb_build_object('status','invoice_prepared','document_id',prepared->'id','contract_id',k.id);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_recover_registration_service(uuid,bigint,uuid) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_recover_registration_service(uuid,bigint,uuid) TO :"admin_role";
COMMIT;
