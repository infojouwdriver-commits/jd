-- Opt-in recurring collection. No historic contracts, invoices or receipts are rewritten.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE TABLE IF NOT EXISTS :"schema".stripe_enrollments(
 id uuid PRIMARY KEY, company_id bigint NOT NULL REFERENCES :"schema".companies(id),
 contract_id bigint NOT NULL UNIQUE REFERENCES :"schema".company_contracts(id),
 actor_id bigint NOT NULL REFERENCES :"schema".users(id), livemode boolean NOT NULL,
 price_id text NOT NULL, tax_rate_id text NOT NULL,
 customer_id text UNIQUE, session_id text UNIQUE, schedule_id text UNIQUE, subscription_id text UNIQUE,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN('pending','authorizing','active','past_due','canceled','review')),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 last_event_at bigint NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS :"schema".stripe_payment_receipts(
 invoice_id text PRIMARY KEY, enrollment_id uuid NOT NULL REFERENCES :"schema".stripe_enrollments(id),
 installment integer NOT NULL CHECK(installment BETWEEN 1 AND 12), payment_intent_id text NOT NULL UNIQUE,
 amount_cents bigint NOT NULL CHECK(amount_cents=5000), paid_at timestamptz NOT NULL,
 request_id uuid NOT NULL UNIQUE, document_id bigint REFERENCES :"schema".subscription_documents(id),
 allocation text NOT NULL DEFAULT 'pending' CHECK(allocation IN('pending','allocated','review')),
 UNIQUE(enrollment_id,installment)
);
CREATE TABLE IF NOT EXISTS :"schema".stripe_billing_events(
 event_id text PRIMARY KEY, enrollment_id uuid NOT NULL REFERENCES :"schema".stripe_enrollments(id),
 kind text NOT NULL, event_created bigint NOT NULL, received_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE :"schema".stripe_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE :"schema".stripe_payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE :"schema".stripe_billing_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".stripe_enrollments;
CREATE POLICY server_service_access ON :"schema".stripe_enrollments TO :"admin_role" USING(true) WITH CHECK(true);
DROP POLICY IF EXISTS server_service_access ON :"schema".stripe_payment_receipts;
CREATE POLICY server_service_access ON :"schema".stripe_payment_receipts TO :"admin_role" USING(true) WITH CHECK(true);
DROP POLICY IF EXISTS server_service_access ON :"schema".stripe_billing_events;
CREATE POLICY server_service_access ON :"schema".stripe_billing_events TO :"admin_role" USING(true) WITH CHECK(true);
CREATE OR REPLACE FUNCTION :"schema".security_stripe_receipt_preserved()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF OLD.allocation='pending' AND NEW.allocation IN('allocated','review') AND (to_jsonb(OLD)-ARRAY['allocation','document_id'])=(to_jsonb(NEW)-ARRAY['allocation','document_id']) THEN RETURN NEW;END IF;
 END IF;
 RAISE EXCEPTION 'Stripe receipt evidence is immutable' USING ERRCODE='23514';
END $$;
DROP TRIGGER IF EXISTS stripe_receipt_preserved ON :"schema".stripe_payment_receipts;
CREATE TRIGGER stripe_receipt_preserved BEFORE UPDATE OR DELETE ON :"schema".stripe_payment_receipts FOR EACH ROW EXECUTE FUNCTION :"schema".security_stripe_receipt_preserved();
REVOKE ALL ON FUNCTION :"schema".security_stripe_receipt_preserved() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_stripe_receipt_preserved() TO :"admin_role";
REVOKE ALL ON :"schema".stripe_enrollments,:"schema".stripe_payment_receipts,:"schema".stripe_billing_events FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".stripe_enrollments,:"schema".stripe_payment_receipts TO :"admin_role";
GRANT SELECT,INSERT ON :"schema".stripe_billing_events TO :"admin_role";
ALTER TABLE :"schema".subscription_payments DROP CONSTRAINT IF EXISTS subscription_payments_payment_method_check;
ALTER TABLE :"schema".subscription_payments ADD CONSTRAINT subscription_payments_payment_method_check CHECK(payment_method IN('manual','cash','bank_transfer','stripe'));

CREATE OR REPLACE FUNCTION :"schema".security_stripe_begin(p_company bigint,p_contract bigint,p_actor bigint,p_request uuid,p_live boolean,p_price text,p_tax text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE c companies;k company_contracts;e stripe_enrollments;today date:=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date;
BEGIN
 SELECT * INTO c FROM companies WHERE id=p_company FOR UPDATE;
 IF NOT FOUND OR c.archived_at IS NOT NULL OR c.subscription_status IS DISTINCT FROM 'active' OR c.is_test IS DISTINCT FROM NOT p_live THEN RAISE EXCEPTION 'Approved company in matching payment environment required' USING ERRCODE='23514';END IF;
 IF NOT EXISTS(SELECT FROM company_users m JOIN users u ON u.id=m.user_id WHERE m.company_id=p_company AND m.user_id=p_actor AND m.role IN('owner','portal_owner') AND m.is_active AND u.is_active) THEN RAISE EXCEPTION 'Active company owner required' USING ERRCODE='42501';END IF;
 SELECT * INTO k FROM company_contracts WHERE id=p_contract AND company_id=p_company FOR UPDATE;
 IF NOT FOUND OR k.signed_at IS NULL OR k.contract_status IS DISTINCT FROM 'active' OR k.auto_renew IS DISTINCT FROM false OR k.contract_duration_months IS DISTINCT FROM 12 OR k.monthly_gross_cents IS DISTINCT FROM 5000 OR k.vat_bps IS DISTINCT FROM 2100 OR k.billing_model IS DISTINCT FROM 'gross_monthly_v1' OR k.contract_end_date IS DISTINCT FROM (k.contract_start_date+interval '12 months')::date THEN RAISE EXCEPTION 'Signed annual offer required' USING ERRCODE='23514';END IF;
 IF NOT EXISTS(SELECT FROM subscription_billing_profiles WHERE company_id=p_company AND contract_id=p_contract) THEN RAISE EXCEPTION 'Linked contract required' USING ERRCODE='23514';END IF;
 SELECT * INTO e FROM stripe_enrollments WHERE contract_id=p_contract;
 IF FOUND THEN
  IF e.livemode IS DISTINCT FROM p_live OR e.price_id IS DISTINCT FROM p_price OR e.tax_rate_id IS DISTINCT FROM p_tax THEN RAISE EXCEPTION 'Payment configuration changed' USING ERRCODE='PT409';END IF;
  RETURN to_jsonb(e)||jsonb_build_object('end_at',extract(epoch FROM k.contract_end_date::timestamp AT TIME ZONE 'Europe/Brussels')::bigint,'end_date',k.contract_end_date,'email',c.email);
 END IF;
 IF today<k.contract_start_date OR today>=(k.contract_start_date+interval '1 month')::date THEN RAISE EXCEPTION 'Automatic collection must start in the first contract period' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT FROM subscription_payments p JOIN subscription_documents d ON d.id=p.invoice_id WHERE d.contract_id=k.id) OR EXISTS(SELECT FROM subscription_documents WHERE contract_id=k.id AND kind='credit' AND state<>'void') THEN RAISE EXCEPTION 'Existing payments or credits require billing review' USING ERRCODE='23514';END IF;
 INSERT INTO stripe_enrollments(id,company_id,contract_id,actor_id,livemode,price_id,tax_rate_id) VALUES(p_request,p_company,p_contract,p_actor,p_live,p_price,p_tax) RETURNING * INTO e;
 RETURN to_jsonb(e)||jsonb_build_object('end_at',extract(epoch FROM k.contract_end_date::timestamp AT TIME ZONE 'Europe/Brussels')::bigint,'end_date',k.contract_end_date,'email',c.email);
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_stripe_bind(p_id uuid,p_customer text,p_session text,p_schedule text,p_subscription text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE e stripe_enrollments;
BEGIN
 SELECT * INTO e FROM stripe_enrollments WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Enrollment missing' USING ERRCODE='P0002';END IF;
 IF e.customer_id IS NOT NULL AND e.customer_id IS DISTINCT FROM p_customer OR e.session_id IS NOT NULL AND p_session IS NOT NULL AND e.session_id IS DISTINCT FROM p_session OR e.schedule_id IS NOT NULL AND p_schedule IS NOT NULL AND e.schedule_id IS DISTINCT FROM p_schedule OR e.subscription_id IS NOT NULL AND p_subscription IS NOT NULL AND e.subscription_id IS DISTINCT FROM p_subscription THEN RAISE EXCEPTION 'Stripe identity conflict' USING ERRCODE='PT409';END IF;
 UPDATE stripe_enrollments SET customer_id=p_customer,session_id=coalesce(session_id,p_session),schedule_id=coalesce(schedule_id,p_schedule),subscription_id=coalesce(subscription_id,p_subscription),updated_at=clock_timestamp() WHERE id=p_id RETURNING * INTO e;
 RETURN to_jsonb(e);
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_stripe_authorize(p_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE e stripe_enrollments;k company_contracts;today date:=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date;
BEGIN
 -- Same company lock as manual preparation and enrollment, before the enrollment row lock.
 PERFORM c.id FROM companies c JOIN stripe_enrollments s ON s.company_id=c.id WHERE s.id=p_id FOR UPDATE OF c;
 SELECT * INTO e FROM stripe_enrollments WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR e.customer_id IS NULL OR e.session_id IS NULL THEN RAISE EXCEPTION 'Checkout binding required' USING ERRCODE='23514';END IF;
 SELECT * INTO k FROM company_contracts WHERE id=e.contract_id;
 IF e.schedule_id IS NULL THEN
  IF NOT EXISTS(SELECT FROM company_users m JOIN users u ON u.id=m.user_id WHERE m.company_id=e.company_id AND m.user_id=e.actor_id AND m.role IN('owner','portal_owner') AND m.is_active AND u.is_active) THEN RAISE EXCEPTION 'Company owner authorization revoked' USING ERRCODE='42501';END IF;
  IF clock_timestamp()>e.created_at+interval '23 hours' OR today<k.contract_start_date OR today>=(k.contract_start_date+interval '1 month')::date OR k.contract_status IS DISTINCT FROM 'active' OR k.signed_at IS NULL OR NOT EXISTS(SELECT FROM companies WHERE id=e.company_id AND archived_at IS NULL AND subscription_status='active') THEN RAISE EXCEPTION 'Collection authorization expired or company unavailable' USING ERRCODE='23514';END IF;
  IF EXISTS(SELECT FROM subscription_payments p JOIN subscription_documents d ON d.id=p.invoice_id WHERE d.contract_id=k.id) OR EXISTS(SELECT FROM subscription_documents WHERE contract_id=k.id AND kind='credit' AND state<>'void') THEN RAISE EXCEPTION 'Existing settlements require review' USING ERRCODE='23514';END IF;
  UPDATE stripe_enrollments SET status='authorizing',updated_at=clock_timestamp() WHERE id=p_id;
 END IF;
 RETURN to_jsonb(e)||jsonb_build_object('end_at',extract(epoch FROM k.contract_end_date::timestamp AT TIME ZONE 'Europe/Brussels')::bigint);
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_stripe_allocate(p_invoice text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE r stripe_payment_receipts;e stripe_enrollments;d subscription_documents;
BEGIN
 SELECT * INTO r FROM stripe_payment_receipts WHERE invoice_id=p_invoice FOR UPDATE SKIP LOCKED;
 IF NOT FOUND OR r.allocation<>'pending' THEN RETURN;END IF;
 SELECT * INTO e FROM stripe_enrollments WHERE id=r.enrollment_id;
 SELECT * INTO d FROM subscription_documents WHERE contract_id=e.contract_id AND installment_number=r.installment AND kind='invoice' AND state='issued' FOR UPDATE;
 IF NOT FOUND THEN RETURN;END IF;
 IF d.company_id<>e.company_id OR d.is_test IS DISTINCT FROM NOT e.livemode OR d.gross_cents<>r.amount_cents OR security_subscription_document_balance(d.id)<>r.amount_cents THEN UPDATE stripe_payment_receipts SET allocation='review',document_id=d.id WHERE invoice_id=p_invoice;RETURN;END IF;
 INSERT INTO subscription_payments(request_id,company_id,invoice_id,amount_cents,payment_date,reference,recorded_by,payment_method) VALUES(r.request_id,e.company_id,d.id,r.amount_cents,(r.paid_at AT TIME ZONE 'Europe/Brussels')::date,r.invoice_id,e.actor_id,'stripe');
 UPDATE stripe_payment_receipts SET allocation='allocated',document_id=d.id WHERE invoice_id=p_invoice;
 UPDATE subscription_mail_queue SET status='cancelled',completed_at=clock_timestamp(),last_result='settled' WHERE document_id=d.id AND purpose='subscription_reminder' AND status IN('pending','not_configured','failed');
 INSERT INTO subscription_billing_events(company_id,document_id,actor_id,action,metadata) VALUES(e.company_id,d.id,e.actor_id,'stripe_payment_recorded',jsonb_build_object('invoice_id',r.invoice_id,'amount_cents',r.amount_cents));
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_stripe_event(p_id uuid,p_event text,p_created bigint,p_kind text,p_status text,p_receipt jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE e stripe_enrollments;k company_contracts;r stripe_payment_receipts;n integer;period date;
BEGIN
 PERFORM c.id FROM companies c JOIN stripe_enrollments s ON s.company_id=c.id WHERE s.id=p_id FOR UPDATE OF c;
 SELECT * INTO e FROM stripe_enrollments WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR e.subscription_id IS NULL THEN RAISE EXCEPTION 'Subscription binding required' USING ERRCODE='23514';END IF;
 IF EXISTS(SELECT FROM stripe_billing_events WHERE event_id=p_event) THEN RETURN jsonb_build_object('duplicate',true);END IF;
 IF p_event !~ '^evt_[A-Za-z0-9]+$' OR p_created IS NULL OR p_created<1 OR p_status IS NULL OR p_status NOT IN('active','past_due','canceled','review') THEN RAISE EXCEPTION 'Invalid event' USING ERRCODE='22023';END IF;
 IF p_receipt IS NOT NULL THEN
  SELECT * INTO k FROM company_contracts WHERE id=e.contract_id;
  period=(to_timestamp((p_receipt->>'period_start')::bigint) AT TIME ZONE 'Europe/Brussels')::date;
  SELECT i+1 INTO n FROM generate_series(0,11) i WHERE period>=(k.contract_start_date+make_interval(months=>i))::date AND period<(k.contract_start_date+make_interval(months=>i+1))::date;
  IF n IS NULL OR (p_receipt->>'amount')::bigint IS DISTINCT FROM 5000 OR p_receipt->>'currency' IS DISTINCT FROM 'eur' OR (p_receipt->>'paid_at')::bigint<=0 OR (p_receipt->>'paid_at')::bigint>extract(epoch FROM clock_timestamp())+300 THEN RAISE EXCEPTION 'Payment outside contract or invalid amount' USING ERRCODE='23514';END IF;
  SELECT * INTO r FROM stripe_payment_receipts WHERE invoice_id=p_receipt->>'invoice';
  IF FOUND THEN
   IF r.enrollment_id<>p_id OR r.installment<>n OR r.payment_intent_id IS DISTINCT FROM p_receipt->>'payment_intent' THEN RAISE EXCEPTION 'Payment identity conflict' USING ERRCODE='PT409';END IF;
  ELSE
   INSERT INTO stripe_payment_receipts(invoice_id,enrollment_id,installment,payment_intent_id,amount_cents,paid_at,request_id) VALUES(p_receipt->>'invoice',p_id,n,p_receipt->>'payment_intent',5000,to_timestamp((p_receipt->>'paid_at')::bigint),(p_receipt->>'request')::uuid);
  END IF;
  PERFORM security_stripe_allocate(p_receipt->>'invoice');
 END IF;
 INSERT INTO stripe_billing_events(event_id,enrollment_id,kind,event_created) VALUES(p_event,p_id,p_kind,p_created);
 UPDATE stripe_enrollments SET status=CASE WHEN status='review' OR p_status='review' THEN 'review' WHEN p_created>=last_event_at THEN p_status ELSE status END,last_event_at=greatest(last_event_at,p_created),updated_at=clock_timestamp() WHERE id=p_id;
 RETURN jsonb_build_object('recorded',true);
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_stripe_document_issued()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE r text;
BEGIN
 IF NEW.kind='invoice' AND NEW.state='issued' THEN
  FOR r IN SELECT s.invoice_id FROM stripe_payment_receipts s JOIN stripe_enrollments e ON e.id=s.enrollment_id WHERE e.contract_id=NEW.contract_id AND s.installment=NEW.installment_number AND s.allocation='pending' LOOP PERFORM security_stripe_allocate(r);END LOOP;
 END IF;RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS stripe_document_issued ON :"schema".subscription_documents;
CREATE TRIGGER stripe_document_issued AFTER INSERT OR UPDATE OF state ON :"schema".subscription_documents FOR EACH ROW EXECUTE FUNCTION :"schema".security_stripe_document_issued();

CREATE OR REPLACE FUNCTION :"schema".security_stripe_manual_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE k bigint;c bigint;s text;
BEGIN
 IF TG_TABLE_NAME='subscription_payments' THEN
  IF NEW.payment_method='stripe' THEN RETURN NEW;END IF;
  SELECT contract_id,company_id INTO k,c FROM subscription_documents WHERE id=NEW.invoice_id;
 ELSE
  IF NEW.kind<>'credit' THEN RETURN NEW;END IF;
  SELECT contract_id,company_id INTO k,c FROM subscription_documents WHERE id=NEW.original_id;
 END IF;
 -- Fail rather than wait while holding a document lock needed by a webhook.
 SELECT status INTO s FROM stripe_enrollments WHERE contract_id=k FOR UPDATE NOWAIT;
 IF s IN('authorizing','active','past_due','review','canceled') THEN RAISE EXCEPTION 'Resolve automatic collection before recording manual settlement or credit' USING ERRCODE='23514';END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS stripe_manual_payment_guard ON :"schema".subscription_payments;
CREATE TRIGGER stripe_manual_payment_guard BEFORE INSERT ON :"schema".subscription_payments FOR EACH ROW EXECUTE FUNCTION :"schema".security_stripe_manual_guard();
DROP TRIGGER IF EXISTS stripe_manual_credit_guard ON :"schema".subscription_documents;
CREATE TRIGGER stripe_manual_credit_guard BEFORE INSERT ON :"schema".subscription_documents FOR EACH ROW EXECUTE FUNCTION :"schema".security_stripe_manual_guard();
CREATE OR REPLACE FUNCTION :"schema".security_stripe_lifecycle_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE blocked boolean:=false;k bigint;
BEGIN
 IF TG_TABLE_NAME='companies' THEN
  IF NEW.archived_at IS DISTINCT FROM OLD.archived_at OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
   FOR k IN SELECT contract_id FROM stripe_enrollments WHERE company_id=NEW.id AND status IN('authorizing','active','past_due','review') FOR UPDATE NOWAIT LOOP blocked=true;END LOOP;
  END IF;
 ELSE
  IF NEW.contract_status IS DISTINCT FROM OLD.contract_status THEN
   FOR k IN SELECT contract_id FROM stripe_enrollments WHERE contract_id=NEW.id AND status IN('authorizing','active','past_due','review') FOR UPDATE NOWAIT LOOP blocked=true;END LOOP;
  END IF;
 END IF;
 IF blocked THEN RAISE EXCEPTION 'Reconcile automatic collection before changing contract or company lifecycle' USING ERRCODE='23514';END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS stripe_company_lifecycle_guard ON :"schema".companies;
CREATE TRIGGER stripe_company_lifecycle_guard BEFORE UPDATE OF archived_at,subscription_status ON :"schema".companies FOR EACH ROW EXECUTE FUNCTION :"schema".security_stripe_lifecycle_guard();
DROP TRIGGER IF EXISTS stripe_contract_lifecycle_guard ON :"schema".company_contracts;
CREATE TRIGGER stripe_contract_lifecycle_guard BEFORE UPDATE OF contract_status ON :"schema".company_contracts FOR EACH ROW EXECUTE FUNCTION :"schema".security_stripe_lifecycle_guard();
REVOKE ALL ON FUNCTION :"schema".security_stripe_lifecycle_guard() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_stripe_lifecycle_guard() TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_stripe_begin(bigint,bigint,bigint,uuid,boolean,text,text),:"schema".security_stripe_bind(uuid,text,text,text,text),:"schema".security_stripe_authorize(uuid),:"schema".security_stripe_allocate(text),:"schema".security_stripe_event(uuid,text,bigint,text,text,jsonb),:"schema".security_stripe_document_issued(),:"schema".security_stripe_manual_guard() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_stripe_begin(bigint,bigint,bigint,uuid,boolean,text,text),:"schema".security_stripe_bind(uuid,text,text,text,text),:"schema".security_stripe_authorize(uuid),:"schema".security_stripe_allocate(text),:"schema".security_stripe_event(uuid,text,bigint,text,text,jsonb),:"schema".security_stripe_document_issued(),:"schema".security_stripe_manual_guard() TO :"admin_role";
COMMIT;
