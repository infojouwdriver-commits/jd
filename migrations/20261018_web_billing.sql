-- Local demo issuance, explicit cash receipts, and a configurable VAT default.
BEGIN;
SET LOCAL lock_timeout='5s';
ALTER TABLE :"schema".subscription_billing_settings ADD COLUMN IF NOT EXISTS default_vat_bps integer NOT NULL DEFAULT 2100 CHECK(default_vat_bps BETWEEN 0 AND 10000);
ALTER TABLE :"schema".subscription_billing_events ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE :"schema".subscription_payments ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'manual' CHECK(payment_method IN('manual','cash','bank_transfer'));
CREATE OR REPLACE FUNCTION :"schema".security_save_subscription_settings(p_actor bigint,p_expected timestamptz,p_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE settings subscription_billing_settings;issuer companies;
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor) OR jsonb_typeof(p_data) IS DISTINCT FROM 'object' OR EXISTS(SELECT FROM jsonb_object_keys(p_data) k WHERE k NOT IN('issuer_company_id','invoice_prefix','exchange_mode','exchange_provider','default_vat_bps')) THEN RAISE EXCEPTION 'Invalid issuer configuration' USING ERRCODE='22023';END IF;
 SELECT * INTO settings FROM subscription_billing_settings WHERE id=1 FOR UPDATE;
 IF settings.updated_at IS DISTINCT FROM p_expected THEN RAISE EXCEPTION 'Issuer configuration changed; refresh' USING ERRCODE='40001';END IF;
 IF (p_data->>'default_vat_bps')::integer NOT BETWEEN 0 AND 10000 OR (p_data ? 'default_vat_bps' AND p_data->>'default_vat_bps' IS NULL) THEN RAISE EXCEPTION 'Invalid VAT default' USING ERRCODE='22023';END IF;
 SELECT * INTO issuer FROM companies WHERE id=(p_data->>'issuer_company_id')::bigint AND archived_at IS NULL AND is_test=false;
 IF (p_data->>'issuer_company_id') IS NOT NULL AND (NOT FOUND OR coalesce(trim(issuer.name),'')='' OR coalesce(trim(issuer.address),'')='' OR regexp_replace(coalesce(issuer.vat_number,''),'[ .-]','','g') !~ '^BE[0-9]{10}$' OR regexp_replace(coalesce(issuer.kbo_number,''),'[^0-9]','','g') !~ '^[0-9]{10}$' ) THEN RAISE EXCEPTION 'Complete real issuer legal identity' USING ERRCODE='23514';END IF;
 IF p_data->>'exchange_mode'='external_structured' AND (issuer.id IS NULL OR coalesce(length(trim(p_data->>'exchange_provider')),0) NOT BETWEEN 1 AND 120) THEN RAISE EXCEPTION 'Name the structured exchange provider' USING ERRCODE='22023';END IF;
 UPDATE subscription_billing_settings SET default_vat_bps=coalesce((p_data->>'default_vat_bps')::integer,settings.default_vat_bps),issuer_company_id=issuer.id,invoice_prefix=p_data->>'invoice_prefix',exchange_mode=p_data->>'exchange_mode',exchange_provider=nullif(trim(p_data->>'exchange_provider'),''),updated_by=p_actor,updated_at=clock_timestamp() WHERE id=1 RETURNING * INTO settings;
 INSERT INTO subscription_billing_events(company_id,actor_id,action,metadata) VALUES(issuer.id,p_actor,'issuer_saved',jsonb_build_object('invoice_prefix',settings.invoice_prefix,'exchange_mode',settings.exchange_mode,'default_vat_bps',settings.default_vat_bps));
 RETURN to_jsonb(settings);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_issue_subscription_demo(p_document bigint,p_actor bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE d subscription_documents;today date:=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date;
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor AND is_active) THEN RAISE EXCEPTION 'Actor required' USING ERRCODE='42501';END IF;
 SELECT * INTO d FROM subscription_documents WHERE id=p_document FOR UPDATE;
 IF NOT FOUND OR NOT d.is_test THEN RAISE EXCEPTION 'Demo document required' USING ERRCODE='23514';END IF;
 IF d.state='issued' AND d.exchange_reference='DEMO-LOCAL-'||d.id THEN RETURN to_jsonb(d);END IF;
 IF d.state<>'prepared' THEN RAISE EXCEPTION 'Document already processed' USING ERRCODE='40001';END IF;
 IF d.kind='credit' THEN
  PERFORM id FROM subscription_documents WHERE id=d.original_id AND company_id=d.company_id AND state='issued' AND is_test FOR UPDATE;
  IF NOT FOUND OR d.gross_cents+coalesce((SELECT sum(gross_cents) FROM subscription_documents WHERE original_id=d.original_id AND state='issued'),0)>(SELECT gross_cents FROM subscription_documents WHERE id=d.original_id) THEN RAISE EXCEPTION 'Credit exceeds original invoice' USING ERRCODE='23514';END IF;
 END IF;
 UPDATE subscription_documents SET state='issued',issued_date=today,due_date=today+d.due_days,exchange_reference='DEMO-LOCAL-'||d.id WHERE id=d.id RETURNING * INTO d;
 INSERT INTO subscription_billing_events(company_id,document_id,actor_id,action) VALUES(d.company_id,d.id,p_actor,'demo_issued_locally');
 RETURN to_jsonb(d);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_record_subscription_payment_v2(p_request uuid,p_invoice bigint,p_actor bigint,p_amount bigint,p_date date,p_reference text,p_method text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE doc subscription_documents;payment subscription_payments;today date:=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date;
BEGIN
 IF p_method IS NULL OR p_method NOT IN('cash','bank_transfer') THEN RAISE EXCEPTION 'Payment method required' USING ERRCODE='22023';END IF;
 IF p_request IS NULL OR p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor) OR p_amount IS NULL OR p_amount NOT BETWEEN 1 AND 100000000 OR p_date IS NULL OR p_date>today OR coalesce(length(trim(p_reference)),0) NOT BETWEEN 1 AND 140 THEN RAISE EXCEPTION 'Invalid payment details' USING ERRCODE='22023';END IF;
 SELECT * INTO doc FROM subscription_documents WHERE id=p_invoice AND kind='invoice' AND state='issued' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Issued invoice missing' USING ERRCODE='P0002';END IF;
 SELECT * INTO payment FROM subscription_payments WHERE request_id=p_request;
 IF FOUND THEN
  IF payment.invoice_id<>p_invoice OR payment.amount_cents<>p_amount OR payment.payment_date<>p_date OR payment.reference<>trim(p_reference) OR payment.recorded_by<>p_actor OR payment.payment_method<>p_method THEN RAISE EXCEPTION 'Payment request conflict' USING ERRCODE='40001';END IF;
  RETURN to_jsonb(payment);
 END IF;
 IF p_amount>greatest(security_subscription_document_balance(doc.id),0) THEN RAISE EXCEPTION 'Payment exceeds balance' USING ERRCODE='23514';END IF;
 INSERT INTO subscription_payments(request_id,company_id,invoice_id,amount_cents,payment_date,reference,recorded_by,payment_method) VALUES(p_request,doc.company_id,doc.id,p_amount,p_date,trim(p_reference),p_actor,p_method) RETURNING * INTO payment;
 INSERT INTO subscription_billing_events(company_id,document_id,actor_id,action,metadata) VALUES(doc.company_id,doc.id,p_actor,'payment_recorded',jsonb_build_object('request_id',p_request,'amount_cents',p_amount));
 UPDATE subscription_mail_queue SET status='cancelled',completed_at=clock_timestamp(),last_result='settled' WHERE document_id=doc.id AND purpose='subscription_reminder' AND status IN('pending','not_configured','failed') AND security_subscription_document_balance(doc.id)<=0;
 RETURN to_jsonb(payment);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_record_subscription_payment(p_request uuid,p_invoice bigint,p_actor bigint,p_amount bigint,p_date date,p_reference text)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
 SELECT security_record_subscription_payment_v2(p_request,p_invoice,p_actor,p_amount,p_date,p_reference,'bank_transfer')
$$;
REVOKE ALL ON FUNCTION :"schema".security_issue_subscription_demo(bigint,bigint), :"schema".security_record_subscription_payment_v2(uuid,bigint,bigint,bigint,date,text,text) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_issue_subscription_demo(bigint,bigint), :"schema".security_record_subscription_payment_v2(uuid,bigint,bigint,bigint,date,text,text) TO :"admin_role";
COMMIT;
