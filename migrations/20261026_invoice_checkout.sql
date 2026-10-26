-- Invoice payment only: no new automatic debits and no historical rewrites.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE TABLE IF NOT EXISTS :"schema".invoice_checkouts(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source text NOT NULL CHECK(source IN('manual','subscription')), document_id bigint NOT NULL,
 company_id bigint NOT NULL REFERENCES :"schema".companies(id), actor_id bigint NOT NULL REFERENCES :"schema".users(id),
 amount_cents bigint NOT NULL CHECK(amount_cents BETWEEN 1 AND 100000000),livemode boolean NOT NULL,
 session_id text UNIQUE,state text NOT NULL DEFAULT 'creating' CHECK(state IN('creating','open','processing','expired','paid','review')),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
DROP INDEX IF EXISTS :"schema".invoice_checkout_active;
CREATE UNIQUE INDEX IF NOT EXISTS invoice_checkout_active ON :"schema".invoice_checkouts(source,document_id) WHERE state IN('creating','open','processing');
CREATE TABLE IF NOT EXISTS :"schema".invoice_checkout_receipts(
 session_id text PRIMARY KEY,checkout_id uuid NOT NULL UNIQUE REFERENCES :"schema".invoice_checkouts(id),payment_intent_id text NOT NULL UNIQUE,charge_id text NOT NULL UNIQUE,
 amount_cents bigint NOT NULL,paid_at timestamptz NOT NULL,allocation text NOT NULL CHECK(allocation IN('allocated','review')),created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE IF NOT EXISTS :"schema".invoice_service_activation(
 company_id bigint PRIMARY KEY REFERENCES :"schema".companies(id),contract_id bigint UNIQUE REFERENCES :"schema".company_contracts(id),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),paid_at timestamptz
);
CREATE TABLE IF NOT EXISTS :"schema".invoice_email_rollout(id integer PRIMARY KEY CHECK(id=1),started_at timestamptz NOT NULL DEFAULT clock_timestamp());
INSERT INTO :"schema".invoice_email_rollout(id) VALUES(1) ON CONFLICT DO NOTHING;
REVOKE ALL ON :"schema".invoice_email_rollout FROM PUBLIC,:"user_role";
GRANT SELECT ON :"schema".invoice_email_rollout TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_invoice_company_begin() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
BEGIN
 IF NOT NEW.is_test THEN INSERT INTO invoice_service_activation(company_id) VALUES(NEW.id) ON CONFLICT DO NOTHING;END IF;RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS invoice_company_begin ON :"schema".companies;
CREATE TRIGGER invoice_company_begin AFTER INSERT ON :"schema".companies FOR EACH ROW EXECUTE FUNCTION :"schema".security_invoice_company_begin();
REVOKE ALL ON FUNCTION :"schema".security_invoice_company_begin() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_company_begin() TO :"admin_role";
-- This marker applies only to contracts signed after rollout. Existing service stays available.
CREATE OR REPLACE FUNCTION :"schema".security_invoice_activation_begin() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
BEGIN
 IF OLD.signed_at IS NULL AND NEW.signed_at IS NOT NULL AND NEW.billing_model='gross_monthly_v1' AND NOT EXISTS(SELECT FROM stripe_enrollments WHERE company_id=NEW.company_id) AND NOT EXISTS(SELECT FROM subscription_payments WHERE company_id=NEW.company_id) AND NOT EXISTS(SELECT FROM subscription_billing_profiles WHERE company_id=NEW.company_id AND contract_id IS DISTINCT FROM NEW.id) AND NOT EXISTS(SELECT FROM trips WHERE company_id=NEW.company_id) THEN
  INSERT INTO invoice_service_activation(contract_id,company_id) VALUES(NEW.id,NEW.company_id) ON CONFLICT(company_id) DO UPDATE SET contract_id=EXCLUDED.contract_id WHERE invoice_service_activation.contract_id IS NULL;
 END IF;RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS invoice_activation_begin ON :"schema".company_contracts;
CREATE TRIGGER invoice_activation_begin AFTER UPDATE OF signed_at ON :"schema".company_contracts FOR EACH ROW EXECUTE FUNCTION :"schema".security_invoice_activation_begin();
CREATE OR REPLACE FUNCTION :"schema".security_invoice_document(p_source text,p_document bigint) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE d jsonb;balance bigint;
BEGIN
 IF p_source='manual' THEN SELECT to_jsonb(x) INTO d FROM manual_invoices x WHERE id=p_document FOR UPDATE;SELECT balance_cents INTO balance FROM manual_invoice_summary WHERE id=p_document;
 ELSIF p_source='subscription' THEN SELECT to_jsonb(x) INTO d FROM subscription_documents x WHERE id=p_document FOR UPDATE;balance=security_subscription_document_balance(p_document);
 ELSE RAISE EXCEPTION 'Invalid invoice source' USING ERRCODE='22023';END IF;
 IF d IS NULL THEN RAISE EXCEPTION 'Invoice missing' USING ERRCODE='P0002';END IF;
 RETURN d||jsonb_build_object('balance_cents',balance);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_invoice_checkout_begin(p_source text,p_document bigint,p_actor bigint,p_live boolean) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE d jsonb;q invoice_checkouts;s subscription_billing_settings;c companies;
BEGIN
 d=security_invoice_document(p_source,p_document);
 SELECT * INTO c FROM companies WHERE id=(d->>'company_id')::bigint AND archived_at IS NULL;
 SELECT * INTO s FROM subscription_billing_settings WHERE id=1;
 IF c.id IS NULL OR d->>'state'<>'issued' OR (d->>'is_test')::boolean OR d->>'kind'<>'invoice' OR d->>'currency'<>'EUR' OR (d->>'balance_cents')::bigint<=0 OR d->'issuer'->>'id' IS DISTINCT FROM s.issuer_company_id::text OR s.collection_issuer_id IS DISTINCT FROM s.issuer_company_id THEN RAISE EXCEPTION 'Invoice unavailable for online collection' USING ERRCODE='23514';END IF;
 IF p_source='subscription' AND EXISTS(SELECT FROM stripe_enrollments WHERE contract_id=(d->>'contract_id')::bigint) THEN RAISE EXCEPTION 'Resolve previous automatic collection first' USING ERRCODE='23514';END IF;
 SELECT * INTO q FROM invoice_checkouts WHERE source=p_source AND document_id=p_document AND state IN('creating','open','processing','review');
 IF FOUND THEN
  IF q.amount_cents<>(d->>'balance_cents')::bigint OR q.livemode IS DISTINCT FROM p_live THEN RAISE EXCEPTION 'Collection requires review' USING ERRCODE='23514';END IF;
  RETURN to_jsonb(q);
 END IF;
 IF NOT EXISTS(SELECT FROM users WHERE id=p_actor AND is_active) THEN RAISE EXCEPTION 'Active invoice actor required' USING ERRCODE='42501';END IF;
 INSERT INTO invoice_checkouts(source,document_id,company_id,actor_id,amount_cents,livemode) VALUES(p_source,p_document,c.id,p_actor,(d->>'balance_cents')::bigint,p_live) RETURNING * INTO q;
 RETURN to_jsonb(q);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_invoice_checkout_state(p_id uuid,p_session text,p_state text) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE q invoice_checkouts;
BEGIN
 SELECT * INTO q FROM invoice_checkouts WHERE id=p_id FOR UPDATE;
 IF q.id IS NULL OR p_session !~ '^cs_[A-Za-z0-9_]+' OR p_state NOT IN('open','processing','expired','review') OR q.session_id IS NOT NULL AND q.session_id<>p_session THEN RAISE EXCEPTION 'Checkout identity conflict' USING ERRCODE='23514';END IF;
 IF q.state IN('paid','review') THEN RETURN to_jsonb(q);END IF;
 IF q.state='expired' AND p_state<>'review' THEN RETURN to_jsonb(q);END IF;
 UPDATE invoice_checkouts SET session_id=p_session,state=p_state,updated_at=clock_timestamp() WHERE id=q.id RETURNING * INTO q;RETURN to_jsonb(q);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_invoice_checkout_paid(p_id uuid,p_session text,p_intent text,p_charge text,p_amount bigint,p_paid timestamptz) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE q invoice_checkouts;d jsonb;r invoice_checkout_receipts;allocation text;request uuid;
BEGIN
 SELECT * INTO q FROM invoice_checkouts WHERE id=p_id;
 IF q.id IS NULL THEN RAISE EXCEPTION 'Checkout missing' USING ERRCODE='23514';END IF;
 -- Always lock invoice before checkout, as do manual settlement and checkout creation.
 d=security_invoice_document(q.source,q.document_id);
 SELECT * INTO q FROM invoice_checkouts WHERE id=p_id FOR UPDATE;
 IF q.session_id IS DISTINCT FROM p_session OR p_intent !~ '^pi_[A-Za-z0-9]+' OR p_charge !~ '^ch_[A-Za-z0-9]+' OR p_amount IS DISTINCT FROM q.amount_cents OR p_paid IS NULL THEN RAISE EXCEPTION 'Payment identity mismatch' USING ERRCODE='23514';END IF;
 SELECT * INTO r FROM invoice_checkout_receipts WHERE checkout_id=q.id;
 IF FOUND THEN
  IF r.session_id<>p_session OR r.payment_intent_id<>p_intent OR r.charge_id<>p_charge OR r.amount_cents<>p_amount THEN RAISE EXCEPTION 'Receipt conflict' USING ERRCODE='23514';END IF;
  RETURN to_jsonb(r);
 END IF;
 allocation=CASE WHEN d->>'state'='issued' AND (d->>'balance_cents')::bigint=p_amount AND q.state<>'review' AND NOT EXISTS(SELECT FROM invoice_checkouts other WHERE other.source=q.source AND other.document_id=q.document_id AND other.id<>q.id AND other.state='review') THEN 'allocated' ELSE 'review' END;
 UPDATE invoice_checkouts SET state=CASE WHEN allocation='allocated' THEN 'paid' ELSE 'review' END,updated_at=clock_timestamp() WHERE id=q.id;
 IF allocation='review' THEN UPDATE invoice_checkouts SET state='review',updated_at=clock_timestamp() WHERE source=q.source AND document_id=q.document_id AND id<>q.id AND state IN('creating','open','processing');END IF;
 INSERT INTO invoice_checkout_receipts(session_id,checkout_id,payment_intent_id,charge_id,amount_cents,paid_at,allocation) VALUES(p_session,q.id,p_intent,p_charge,p_amount,p_paid,allocation) RETURNING * INTO r;
 IF allocation='allocated' THEN
  request=q.id;
  IF q.source='manual' THEN INSERT INTO manual_invoice_payments(request_id,invoice_id,amount_cents,payment_method,reference,recorded_by) VALUES(request,q.document_id,p_amount,'stripe',p_intent,q.actor_id);
  ELSE
   INSERT INTO subscription_payments(request_id,company_id,invoice_id,amount_cents,payment_date,reference,recorded_by,payment_method) VALUES(request,q.company_id,q.document_id,p_amount,(p_paid AT TIME ZONE 'Europe/Brussels')::date,p_intent,q.actor_id,'stripe');
  END IF;
 END IF;
 RETURN to_jsonb(r);
END $$;
ALTER TABLE :"schema".manual_invoice_payments DROP CONSTRAINT IF EXISTS manual_invoice_payments_payment_method_check;
ALTER TABLE :"schema".manual_invoice_payments ADD CONSTRAINT manual_invoice_payments_payment_method_check CHECK(payment_method IN('cash','bank_transfer','stripe'));
CREATE OR REPLACE FUNCTION :"schema".security_invoice_payment_guard() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE invoice_source text;d jsonb;
BEGIN
 invoice_source=CASE WHEN TG_TABLE_NAME='manual_invoice_payments' THEN 'manual' ELSE 'subscription' END;
 d=security_invoice_document(invoice_source,NEW.invoice_id);
 IF EXISTS(SELECT FROM invoice_checkouts WHERE invoice_checkouts.source=invoice_source AND document_id=NEW.invoice_id AND state IN('creating','open','processing','review')) THEN RAISE EXCEPTION 'Close or reconcile online collection before recording a bank payment' USING ERRCODE='23514';END IF;
 IF NEW.amount_cents>(d->>'balance_cents')::bigint THEN RAISE EXCEPTION 'Payment exceeds balance' USING ERRCODE='23514';END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS invoice_payment_guard ON :"schema".manual_invoice_payments;
CREATE TRIGGER invoice_payment_guard BEFORE INSERT ON :"schema".manual_invoice_payments FOR EACH ROW EXECUTE FUNCTION :"schema".security_invoice_payment_guard();
DROP TRIGGER IF EXISTS invoice_payment_guard ON :"schema".subscription_payments;
CREATE TRIGGER invoice_payment_guard BEFORE INSERT ON :"schema".subscription_payments FOR EACH ROW EXECUTE FUNCTION :"schema".security_invoice_payment_guard();
CREATE OR REPLACE FUNCTION :"schema".security_invoice_activation_paid() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
BEGIN
 UPDATE invoice_service_activation a SET paid_at=clock_timestamp() FROM subscription_documents d WHERE d.id=NEW.invoice_id AND d.contract_id=a.contract_id AND d.installment_number=1 AND d.state='issued' AND security_subscription_document_balance(d.id)<=0 AND a.paid_at IS NULL;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS invoice_activation_paid ON :"schema".subscription_payments;
CREATE TRIGGER invoice_activation_paid AFTER INSERT ON :"schema".subscription_payments FOR EACH ROW EXECUTE FUNCTION :"schema".security_invoice_activation_paid();
-- Immutable provider evidence; discrepancies append a review state, never a second allocation.
CREATE OR REPLACE FUNCTION :"schema".security_invoice_receipt_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Payment evidence is immutable' USING ERRCODE='23514';END $$;
DROP TRIGGER IF EXISTS invoice_receipt_immutable ON :"schema".invoice_checkout_receipts;
CREATE TRIGGER invoice_receipt_immutable BEFORE UPDATE OR DELETE ON :"schema".invoice_checkout_receipts FOR EACH ROW EXECUTE FUNCTION :"schema".security_invoice_receipt_immutable();
-- Email issuance is explicit; exchange_reference stays empty unless actual structured evidence exists.
ALTER TABLE :"schema".subscription_documents ADD COLUMN IF NOT EXISTS delivery_channel text NOT NULL DEFAULT 'structured' CHECK(delivery_channel IN('structured','email_pdf'));
ALTER TABLE :"schema".manual_invoices ADD COLUMN IF NOT EXISTS delivery_channel text NOT NULL DEFAULT 'structured' CHECK(delivery_channel IN('structured','email_pdf'));
DO $$ DECLARE item record;BEGIN
 FOR item IN SELECT conname FROM pg_constraint WHERE conrelid='subscription_documents'::regclass AND contype='c' AND pg_get_constraintdef(oid) LIKE '%exchange_reference%' LOOP EXECUTE format('ALTER TABLE subscription_documents DROP CONSTRAINT %I',item.conname);END LOOP;
END $$;
ALTER TABLE :"schema".subscription_documents DROP CONSTRAINT IF EXISTS subscription_issue_evidence;
ALTER TABLE :"schema".subscription_documents ADD CONSTRAINT subscription_issue_evidence CHECK(state<>'issued' OR issued_date IS NOT NULL AND due_date IS NOT NULL AND (delivery_channel='email_pdf' OR coalesce(length(trim(exchange_reference)),0)>0));
CREATE OR REPLACE FUNCTION :"schema".security_subscription_immutable() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
 IF TG_OP='UPDATE' AND TG_TABLE_NAME='subscription_documents' AND OLD.state='prepared' AND NEW.state IN('issued','void') AND (to_jsonb(OLD)-ARRAY['state','issued_date','due_date','exchange_reference','delivery_channel'])=(to_jsonb(NEW)-ARRAY['state','issued_date','due_date','exchange_reference','delivery_channel']) THEN RETURN NEW;END IF;
 RAISE EXCEPTION 'Financial history is immutable; append a correction' USING ERRCODE='23514';
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_manual_invoice_immutable() RETURNS trigger LANGUAGE plpgsql SET search_path=:"schema",pg_catalog AS $$
BEGIN
 IF TG_TABLE_NAME='manual_invoice_payments' OR TG_OP='DELETE' THEN RAISE EXCEPTION 'Financial records are immutable' USING ERRCODE='23514';END IF;
 IF (to_jsonb(NEW)-ARRAY['state','issued_date','exchange_reference','delivery_channel']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['state','issued_date','exchange_reference','delivery_channel']) OR OLD.state IN('issued','void') THEN RAISE EXCEPTION 'Financial snapshot is immutable' USING ERRCODE='23514';END IF;RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_invoice_email_issue(p_source text,p_document bigint,p_actor bigint) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE d jsonb;today date:=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date;
BEGIN
 d=security_invoice_document(p_source,p_document);
 IF NOT EXISTS(SELECT FROM users WHERE id=p_actor AND is_active) OR (d->>'is_test')::boolean OR d->>'kind'<>'invoice' OR d->>'state'='void' OR NOT EXISTS(SELECT FROM companies WHERE id=(d->>'company_id')::bigint AND archived_at IS NULL) THEN RAISE EXCEPTION 'Real invoice and active actor required' USING ERRCODE='23514';END IF;
 IF d->>'state'='prepared' THEN
  IF p_source='manual' THEN UPDATE manual_invoices SET state='issued',issued_date=today,delivery_channel='email_pdf' WHERE id=p_document;
  ELSE UPDATE subscription_documents SET state='issued',issued_date=today,due_date=today+(d->>'due_days')::integer,delivery_channel='email_pdf' WHERE id=p_document;END IF;
 END IF;
 RETURN security_invoice_document(p_source,p_document);
END $$;
-- Only newly signed contracts enroll in automatic monthly invoice email. Never opt old contracts in.
CREATE OR REPLACE FUNCTION :"schema".security_invoice_email_tick() RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE d subscription_documents;actor bigint;
BEGIN
 FOR d IN SELECT doc.* FROM subscription_documents doc JOIN company_contracts k ON k.id=doc.contract_id AND k.signed_at IS NOT NULL AND k.contract_status='active' JOIN subscription_billing_profiles p ON p.company_id=doc.company_id AND p.contract_id=doc.contract_id JOIN companies c ON c.id=doc.company_id WHERE doc.created_at>=(SELECT started_at FROM invoice_email_rollout WHERE id=1) AND doc.kind='invoice' AND doc.state='prepared' AND NOT doc.is_test AND c.archived_at IS NULL AND c.subscription_status='active' AND NOT EXISTS(SELECT FROM stripe_enrollments WHERE contract_id=doc.contract_id) ORDER BY doc.id LIMIT 25 FOR UPDATE OF doc SKIP LOCKED LOOP
  SELECT updated_by INTO actor FROM subscription_billing_profiles WHERE company_id=d.company_id;
  PERFORM security_invoice_email_issue('subscription',d.id,actor);
  INSERT INTO subscription_mail_queue(document_id,event_key,purpose,scheduled_date) VALUES(d.id,'document:'||d.id,'subscription_invoice',(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date) ON CONFLICT DO NOTHING;
 END LOOP;
END $$;
ALTER TABLE :"schema".invoice_checkouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".invoice_checkouts;
CREATE POLICY server_service_access ON :"schema".invoice_checkouts TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".invoice_checkouts FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".invoice_checkouts TO :"admin_role";
ALTER TABLE :"schema".invoice_checkout_receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".invoice_checkout_receipts;
CREATE POLICY server_service_access ON :"schema".invoice_checkout_receipts TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".invoice_checkout_receipts FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".invoice_checkout_receipts TO :"admin_role";
ALTER TABLE :"schema".invoice_service_activation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".invoice_service_activation;
CREATE POLICY server_service_access ON :"schema".invoice_service_activation TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".invoice_service_activation FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".invoice_service_activation TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_activation_begin() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_activation_begin() TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_activation_begin() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_activation_begin() TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_document(text,bigint) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_document(text,bigint) TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_checkout_begin(text,bigint,bigint,boolean) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_checkout_begin(text,bigint,bigint,boolean) TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_checkout_state(uuid,text,text) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_checkout_state(uuid,text,text) TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_checkout_paid(uuid,text,text,text,bigint,timestamptz) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_checkout_paid(uuid,text,text,text,bigint,timestamptz) TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_payment_guard() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_payment_guard() TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_payment_guard() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_payment_guard() TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_payment_guard() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_payment_guard() TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_activation_paid() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_activation_paid() TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_activation_paid() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_activation_paid() TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_receipt_immutable() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_receipt_immutable() TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_receipt_immutable() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_receipt_immutable() TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_email_issue(text,bigint,bigint) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_email_issue(text,bigint,bigint) TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_invoice_email_tick() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_email_tick() TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_invoice_service_guard() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
BEGIN
 -- Completed/cancelled uploads are history, not a new work start. Never discard a driver's saved completion.
 IF TG_TABLE_NAME='trips' THEN IF NEW.status IN('completed','cancelled') THEN RETURN NEW;END IF;END IF;
 IF EXISTS(SELECT FROM invoice_service_activation WHERE company_id=NEW.company_id AND paid_at IS NULL) THEN RAISE EXCEPTION 'First subscription invoice payment required before service activation' USING ERRCODE='23514';END IF;RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS invoice_service_guard ON :"schema".trips;
CREATE TRIGGER invoice_service_guard BEFORE INSERT ON :"schema".trips FOR EACH ROW EXECUTE FUNCTION :"schema".security_invoice_service_guard();
DROP TRIGGER IF EXISTS invoice_service_guard ON :"schema".driver_shifts;
CREATE TRIGGER invoice_service_guard BEFORE INSERT ON :"schema".driver_shifts FOR EACH ROW EXECUTE FUNCTION :"schema".security_invoice_service_guard();
REVOKE ALL ON FUNCTION :"schema".security_invoice_service_guard() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_invoice_service_guard() TO :"admin_role";
COMMIT;
