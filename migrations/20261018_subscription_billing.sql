-- Subscription ledger. Existing companies are NOT opted in. No access suspension or payment-provider calls.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE TABLE IF NOT EXISTS :"schema".subscription_billing_settings(
 id integer PRIMARY KEY CHECK(id=1),issuer_company_id bigint REFERENCES :"schema".companies(id),
 invoice_prefix text NOT NULL DEFAULT 'JDS' CHECK(invoice_prefix ~ '^[A-Z][A-Z0-9-]{1,9}$'),
 exchange_mode text NOT NULL DEFAULT 'unconfigured' CHECK(exchange_mode IN('unconfigured','external_structured')),
 exchange_provider text,updated_by bigint REFERENCES :"schema".users(id),updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
INSERT INTO :"schema".subscription_billing_settings(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS :"schema".subscription_billing_profiles(
 company_id bigint PRIMARY KEY REFERENCES :"schema".companies(id),enabled boolean NOT NULL DEFAULT false,
 net_cents bigint NOT NULL CHECK(net_cents BETWEEN 1 AND 100000000),vat_bps integer NOT NULL CHECK(vat_bps BETWEEN 0 AND 10000),
 tax_category text NOT NULL CHECK(tax_category IN('S','Z','E','O')),tax_reason text,
 billing_day integer NOT NULL CHECK(billing_day BETWEEN 1 AND 31),next_invoice_date date NOT NULL,
 due_days integer NOT NULL CHECK(due_days BETWEEN 0 AND 90),reminder_days integer NOT NULL CHECK(reminder_days BETWEEN 1 AND 90),
 billing_email text NOT NULL CHECK(length(billing_email)<=254),language text NOT NULL CHECK(language IN('ar','fr','nl')),
 updated_by bigint NOT NULL REFERENCES :"schema".users(id),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK((vat_bps>0 AND tax_category='S') OR (vat_bps=0 AND tax_category IN('Z','E','O') AND coalesce(length(trim(tax_reason)),0)>0))
);
CREATE TABLE IF NOT EXISTS :"schema".subscription_documents(
 id bigserial PRIMARY KEY,request_id uuid NOT NULL UNIQUE,company_id bigint NOT NULL REFERENCES :"schema".companies(id),
 document_number text NOT NULL UNIQUE,kind text NOT NULL CHECK(kind IN('invoice','credit')),original_id bigint REFERENCES :"schema".subscription_documents(id),
 state text NOT NULL DEFAULT 'prepared' CHECK(state IN('prepared','issued','void')),
 is_test boolean NOT NULL,currency text NOT NULL DEFAULT 'EUR' CHECK(currency='EUR'),
 period_start date NOT NULL,period_end date NOT NULL,prepared_date date NOT NULL,issued_date date,due_date date,
 net_cents bigint NOT NULL CHECK(net_cents>0),vat_cents bigint NOT NULL CHECK(vat_cents>=0),gross_cents bigint NOT NULL CHECK(gross_cents=net_cents+vat_cents),
 vat_bps integer NOT NULL CHECK(vat_bps BETWEEN 0 AND 10000),tax_category text NOT NULL,tax_reason text,
 issuer jsonb NOT NULL,recipient jsonb NOT NULL,description text NOT NULL,due_days integer NOT NULL,reminder_days integer NOT NULL,
 reason text,exchange_reference text,created_by bigint REFERENCES :"schema".users(id),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK(period_end>=period_start),CHECK((kind='invoice' AND original_id IS NULL) OR (kind='credit' AND original_id IS NOT NULL AND coalesce(length(trim(reason)),0)>0)),
 CHECK(state<>'issued' OR (issued_date IS NOT NULL AND due_date IS NOT NULL AND coalesce(length(trim(exchange_reference)),0)>0))
);
CREATE UNIQUE INDEX IF NOT EXISTS subscription_invoice_period ON :"schema".subscription_documents(company_id,period_start) WHERE kind='invoice' AND state<>'void';
CREATE INDEX IF NOT EXISTS subscription_documents_company ON :"schema".subscription_documents(company_id,created_at DESC,id DESC);
CREATE TABLE IF NOT EXISTS :"schema".subscription_payments(
 request_id uuid PRIMARY KEY,company_id bigint NOT NULL REFERENCES :"schema".companies(id),invoice_id bigint NOT NULL REFERENCES :"schema".subscription_documents(id),
 amount_cents bigint NOT NULL CHECK(amount_cents BETWEEN 1 AND 100000000),payment_date date NOT NULL,reference text NOT NULL CHECK(length(trim(reference)) BETWEEN 1 AND 140),
 recorded_by bigint NOT NULL REFERENCES :"schema".users(id),created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE IF NOT EXISTS :"schema".subscription_billing_events(
 id bigserial PRIMARY KEY,company_id bigint NOT NULL REFERENCES :"schema".companies(id),document_id bigint REFERENCES :"schema".subscription_documents(id),
 actor_id bigint REFERENCES :"schema".users(id),action text NOT NULL,metadata jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE IF NOT EXISTS :"schema".subscription_mail_queue(
 id bigserial PRIMARY KEY,document_id bigint NOT NULL REFERENCES :"schema".subscription_documents(id),
 event_key text NOT NULL UNIQUE,purpose text NOT NULL CHECK(purpose IN('subscription_invoice','subscription_credit','subscription_reminder')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN('pending','sending','accepted','delivered','uncertain','failed','cancelled','not_configured')),
 scheduled_date date NOT NULL,attempted_at timestamptz,completed_at timestamptz,last_result text,created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE :"schema".subscription_billing_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".subscription_billing_settings;
CREATE POLICY server_service_access ON :"schema".subscription_billing_settings TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".subscription_billing_settings FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".subscription_billing_settings TO :"admin_role";
ALTER TABLE :"schema".subscription_billing_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".subscription_billing_profiles;
CREATE POLICY server_service_access ON :"schema".subscription_billing_profiles TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".subscription_billing_profiles FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".subscription_billing_profiles TO :"admin_role";
ALTER TABLE :"schema".subscription_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".subscription_documents;
CREATE POLICY server_service_access ON :"schema".subscription_documents TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".subscription_documents FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".subscription_documents TO :"admin_role";
ALTER TABLE :"schema".subscription_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".subscription_payments;
CREATE POLICY server_service_access ON :"schema".subscription_payments TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".subscription_payments FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".subscription_payments TO :"admin_role";
ALTER TABLE :"schema".subscription_billing_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".subscription_billing_events;
CREATE POLICY server_service_access ON :"schema".subscription_billing_events TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".subscription_billing_events FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".subscription_billing_events TO :"admin_role";
ALTER TABLE :"schema".subscription_mail_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".subscription_mail_queue;
CREATE POLICY server_service_access ON :"schema".subscription_mail_queue TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".subscription_mail_queue FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".subscription_mail_queue TO :"admin_role";
GRANT USAGE,SELECT ON SEQUENCE :"schema".subscription_documents_id_seq, :"schema".subscription_billing_events_id_seq, :"schema".subscription_mail_queue_id_seq TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_subscription_document_balance(p_id bigint)
RETURNS bigint LANGUAGE sql STABLE SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
 SELECT d.gross_cents-coalesce((SELECT sum(c.gross_cents) FROM subscription_documents c WHERE c.original_id=d.id AND c.kind='credit' AND c.state='issued'),0)::bigint-coalesce((SELECT sum(p.amount_cents) FROM subscription_payments p WHERE p.invoice_id=d.id),0)::bigint
 FROM subscription_documents d WHERE d.id=p_id AND d.kind='invoice' AND d.state='issued'
$$;
CREATE OR REPLACE FUNCTION :"schema".security_subscription_immutable()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Financial history cannot be deleted' USING ERRCODE='23514';END IF;
 IF TG_TABLE_NAME='subscription_documents' THEN
 IF OLD.state='prepared' AND NEW.state IN('issued','void') AND
 (to_jsonb(OLD)-ARRAY['state','issued_date','due_date','exchange_reference'])=(to_jsonb(NEW)-ARRAY['state','issued_date','due_date','exchange_reference']) THEN RETURN NEW;END IF;
 END IF;
 RAISE EXCEPTION 'Financial history is immutable; append a correction' USING ERRCODE='23514';
END $$;
DROP TRIGGER IF EXISTS subscription_document_immutable ON :"schema".subscription_documents;
CREATE TRIGGER subscription_document_immutable BEFORE UPDATE OR DELETE ON :"schema".subscription_documents FOR EACH ROW EXECUTE FUNCTION :"schema".security_subscription_immutable();
DROP TRIGGER IF EXISTS subscription_payment_immutable ON :"schema".subscription_payments;
CREATE TRIGGER subscription_payment_immutable BEFORE UPDATE OR DELETE ON :"schema".subscription_payments FOR EACH ROW EXECUTE FUNCTION :"schema".security_subscription_immutable();
DROP TRIGGER IF EXISTS subscription_event_immutable ON :"schema".subscription_billing_events;
CREATE TRIGGER subscription_event_immutable BEFORE UPDATE OR DELETE ON :"schema".subscription_billing_events FOR EACH ROW EXECUTE FUNCTION :"schema".security_subscription_immutable();
REVOKE ALL ON FUNCTION :"schema".security_subscription_document_balance(bigint), :"schema".security_subscription_immutable() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_subscription_document_balance(bigint), :"schema".security_subscription_immutable() TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_prepare_subscription_invoice(p_company bigint,p_actor bigint,p_request uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE c companies;issuer_company companies;settings subscription_billing_settings;profile subscription_billing_profiles;doc subscription_documents;next_date date;last_day integer;today date:=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date;new_id bigint;tax bigint;
BEGIN
 IF p_request IS NULL OR (p_actor IS NOT NULL AND NOT EXISTS(SELECT FROM users WHERE id=p_actor)) THEN RAISE EXCEPTION 'Invalid invoice request' USING ERRCODE='22023';END IF;
 SELECT * INTO c FROM companies WHERE id=p_company FOR UPDATE;
 IF NOT FOUND OR c.archived_at IS NOT NULL THEN RAISE EXCEPTION 'Company unavailable' USING ERRCODE='P0002';END IF;
 SELECT * INTO doc FROM subscription_documents WHERE request_id=p_request;
 IF FOUND THEN
  IF doc.company_id<>c.id OR doc.kind<>'invoice' THEN RAISE EXCEPTION 'Invoice request conflict' USING ERRCODE='40001';END IF;
  RETURN to_jsonb(doc);
 END IF;
 IF c.subscription_status IS DISTINCT FROM 'active' THEN RAISE EXCEPTION 'Subscription not approved for billing' USING ERRCODE='23514';END IF;
 SELECT * INTO profile FROM subscription_billing_profiles WHERE company_id=c.id FOR UPDATE;
 IF NOT FOUND OR NOT profile.enabled THEN RAISE EXCEPTION 'Billing profile not enabled' USING ERRCODE='23514';END IF;
 IF profile.next_invoice_date>today THEN RAISE EXCEPTION 'Billing period is not due' USING ERRCODE='23514';END IF;
 SELECT * INTO settings FROM subscription_billing_settings WHERE id=1;
 SELECT * INTO issuer_company FROM companies WHERE id=settings.issuer_company_id AND archived_at IS NULL;
 IF NOT FOUND OR coalesce(trim(issuer_company.name),'')='' OR coalesce(trim(issuer_company.address),'')='' OR coalesce(trim(issuer_company.vat_number),'')='' OR coalesce(trim(issuer_company.kbo_number),'')=''
 OR coalesce(trim(c.name),'')='' OR coalesce(trim(c.address),'')='' OR coalesce(trim(c.vat_number),'')='' OR coalesce(trim(c.kbo_number),'')='' THEN RAISE EXCEPTION 'Complete issuer and recipient legal identity before preparing invoices' USING ERRCODE='23514';END IF;
 IF profile.billing_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Valid billing email required' USING ERRCODE='22023';END IF;
 SELECT * INTO doc FROM subscription_documents WHERE company_id=c.id AND kind='invoice' AND period_start=profile.next_invoice_date AND state<>'void';
 IF FOUND THEN RETURN to_jsonb(doc);END IF;
 next_date=(date_trunc('month',profile.next_invoice_date)+interval '1 month')::date;
 last_day=extract(day FROM next_date+interval '1 month'-interval '1 day');
 next_date=next_date+(least(profile.billing_day,last_day)-1);
 tax=round(profile.net_cents::numeric*profile.vat_bps/10000)::bigint;
 new_id=nextval('subscription_documents_id_seq');
 INSERT INTO subscription_documents(id,request_id,company_id,document_number,kind,is_test,period_start,period_end,prepared_date,net_cents,vat_cents,gross_cents,vat_bps,tax_category,tax_reason,issuer,recipient,description,due_days,reminder_days,created_by)
 VALUES(new_id,p_request,c.id,CASE WHEN c.is_test THEN 'DEMO-' ELSE '' END||settings.invoice_prefix||'-'||extract(year FROM today)::text||'-'||lpad(new_id::text,greatest(8,length(new_id::text)),'0'),'invoice',c.is_test,profile.next_invoice_date,next_date-1,today,profile.net_cents,tax,profile.net_cents+tax,profile.vat_bps,profile.tax_category,profile.tax_reason,
 jsonb_build_object('id',issuer_company.id,'name',issuer_company.name,'address',issuer_company.address,'vat_number',issuer_company.vat_number,'kbo_number',issuer_company.kbo_number,'email',issuer_company.email),
 jsonb_build_object('name',c.name,'address',c.address,'vat_number',c.vat_number,'kbo_number',c.kbo_number,'email',profile.billing_email,'language',profile.language),
 'JOUW DRIVER monthly platform subscription',profile.due_days,profile.reminder_days,p_actor) RETURNING * INTO doc;
 UPDATE subscription_billing_profiles SET next_invoice_date=next_date,updated_at=clock_timestamp() WHERE company_id=c.id;
 INSERT INTO subscription_billing_events(company_id,document_id,actor_id,action) VALUES(c.id,doc.id,p_actor,'prepared');
 RETURN to_jsonb(doc);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_issue_subscription_document(p_document bigint,p_actor bigint,p_exchange_reference text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE doc subscription_documents;original subscription_documents;settings subscription_billing_settings;today date:=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date;
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor) OR coalesce(length(trim(p_exchange_reference)),0) NOT BETWEEN 1 AND 256 THEN RAISE EXCEPTION 'Structured exchange evidence required' USING ERRCODE='22023';END IF;
 SELECT * INTO settings FROM subscription_billing_settings WHERE id=1;
 IF settings.exchange_mode<>'external_structured' OR coalesce(length(trim(settings.exchange_provider)),0)=0 THEN RAISE EXCEPTION 'Configure structured invoice exchange first' USING ERRCODE='23514';END IF;
 SELECT * INTO doc FROM subscription_documents WHERE id=p_document FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Document missing' USING ERRCODE='P0002';END IF;
 IF doc.state='issued' THEN
  IF doc.exchange_reference<>trim(p_exchange_reference) THEN RAISE EXCEPTION 'Exchange reference conflict' USING ERRCODE='40001';END IF;
  RETURN to_jsonb(doc);
 END IF;
 IF doc.state<>'prepared' THEN RAISE EXCEPTION 'Document cannot be issued' USING ERRCODE='40001';END IF;
 IF doc.kind='credit' THEN
  SELECT * INTO original FROM subscription_documents WHERE id=doc.original_id AND company_id=doc.company_id AND state='issued' FOR UPDATE;
  IF NOT FOUND OR doc.gross_cents+coalesce((SELECT sum(gross_cents) FROM subscription_documents WHERE original_id=original.id AND state='issued'),0)>original.gross_cents THEN RAISE EXCEPTION 'Credit exceeds original invoice' USING ERRCODE='23514';END IF;
 END IF;
 UPDATE subscription_documents SET state='issued',issued_date=today,due_date=today+doc.due_days,exchange_reference=trim(p_exchange_reference) WHERE id=doc.id RETURNING * INTO doc;
 INSERT INTO subscription_billing_events(company_id,document_id,actor_id,action) VALUES(doc.company_id,doc.id,p_actor,'issued');
 IF NOT doc.is_test THEN INSERT INTO subscription_mail_queue(document_id,event_key,purpose,scheduled_date) VALUES(doc.id,'document:'||doc.id,CASE WHEN doc.kind='invoice' THEN 'subscription_invoice' ELSE 'subscription_credit' END,today) ON CONFLICT DO NOTHING;END IF;
 RETURN to_jsonb(doc);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_record_subscription_payment(p_request uuid,p_invoice bigint,p_actor bigint,p_amount bigint,p_date date,p_reference text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE doc subscription_documents;payment subscription_payments;today date:=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date;
BEGIN
 IF p_request IS NULL OR p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor) OR p_amount IS NULL OR p_amount NOT BETWEEN 1 AND 100000000 OR p_date IS NULL OR p_date>today OR coalesce(length(trim(p_reference)),0) NOT BETWEEN 1 AND 140 THEN RAISE EXCEPTION 'Invalid payment details' USING ERRCODE='22023';END IF;
 SELECT * INTO doc FROM subscription_documents WHERE id=p_invoice AND kind='invoice' AND state='issued' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Issued invoice missing' USING ERRCODE='P0002';END IF;
 SELECT * INTO payment FROM subscription_payments WHERE request_id=p_request;
 IF FOUND THEN
  IF payment.invoice_id<>p_invoice OR payment.amount_cents<>p_amount OR payment.payment_date<>p_date OR payment.reference<>trim(p_reference) OR payment.recorded_by<>p_actor THEN RAISE EXCEPTION 'Payment request conflict' USING ERRCODE='40001';END IF;
  RETURN to_jsonb(payment);
 END IF;
 INSERT INTO subscription_payments(request_id,company_id,invoice_id,amount_cents,payment_date,reference,recorded_by) VALUES(p_request,doc.company_id,doc.id,p_amount,p_date,trim(p_reference),p_actor) RETURNING * INTO payment;
 INSERT INTO subscription_billing_events(company_id,document_id,actor_id,action,metadata) VALUES(doc.company_id,doc.id,p_actor,'payment_recorded',jsonb_build_object('request_id',p_request,'amount_cents',p_amount));
 UPDATE subscription_mail_queue SET status='cancelled',completed_at=clock_timestamp(),last_result='settled' WHERE document_id=doc.id AND purpose='subscription_reminder' AND status IN('pending','not_configured','failed') AND security_subscription_document_balance(doc.id)<=0;
 RETURN to_jsonb(payment);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_prepare_subscription_invoice(bigint,bigint,uuid), :"schema".security_issue_subscription_document(bigint,bigint,text), :"schema".security_record_subscription_payment(uuid,bigint,bigint,bigint,date,text) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_prepare_subscription_invoice(bigint,bigint,uuid), :"schema".security_issue_subscription_document(bigint,bigint,text), :"schema".security_record_subscription_payment(uuid,bigint,bigint,bigint,date,text) TO :"admin_role";

CREATE OR REPLACE FUNCTION :"schema".security_save_subscription_profile(p_company bigint,p_actor bigint,p_expected timestamptz,p_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE current_profile subscription_billing_profiles;profile subscription_billing_profiles;c companies;
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor) OR jsonb_typeof(p_data) IS DISTINCT FROM 'object' OR EXISTS(SELECT FROM jsonb_object_keys(p_data) k WHERE k NOT IN('enabled','net_cents','vat_bps','tax_category','tax_reason','billing_day','next_invoice_date','due_days','reminder_days','billing_email','language')) THEN RAISE EXCEPTION 'Invalid billing configuration' USING ERRCODE='22023';END IF;
 SELECT * INTO c FROM companies WHERE id=p_company FOR UPDATE;
 IF NOT FOUND OR c.archived_at IS NOT NULL THEN RAISE EXCEPTION 'Company unavailable' USING ERRCODE='P0002';END IF;
 SELECT * INTO current_profile FROM subscription_billing_profiles WHERE company_id=p_company FOR UPDATE;
 IF (FOUND AND current_profile.updated_at IS DISTINCT FROM p_expected) OR (NOT FOUND AND p_expected IS NOT NULL) THEN RAISE EXCEPTION 'Billing profile changed; refresh before saving' USING ERRCODE='40001';END IF;
 IF p_data->>'billing_email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Valid billing email required' USING ERRCODE='22023';END IF;
 INSERT INTO subscription_billing_profiles(company_id,enabled,net_cents,vat_bps,tax_category,tax_reason,billing_day,next_invoice_date,due_days,reminder_days,billing_email,language,updated_by)
 VALUES(p_company,(p_data->>'enabled')::boolean,(p_data->>'net_cents')::bigint,(p_data->>'vat_bps')::integer,p_data->>'tax_category',nullif(trim(p_data->>'tax_reason'),''),(p_data->>'billing_day')::integer,(p_data->>'next_invoice_date')::date,(p_data->>'due_days')::integer,(p_data->>'reminder_days')::integer,lower(trim(p_data->>'billing_email')),p_data->>'language',p_actor)
 ON CONFLICT(company_id) DO UPDATE SET enabled=EXCLUDED.enabled,net_cents=EXCLUDED.net_cents,vat_bps=EXCLUDED.vat_bps,tax_category=EXCLUDED.tax_category,tax_reason=EXCLUDED.tax_reason,billing_day=EXCLUDED.billing_day,next_invoice_date=EXCLUDED.next_invoice_date,due_days=EXCLUDED.due_days,reminder_days=EXCLUDED.reminder_days,billing_email=EXCLUDED.billing_email,language=EXCLUDED.language,updated_by=p_actor,updated_at=clock_timestamp() RETURNING * INTO profile;
 INSERT INTO subscription_billing_events(company_id,actor_id,action,metadata) VALUES(p_company,p_actor,'profile_saved',jsonb_build_object('enabled',profile.enabled,'net_cents',profile.net_cents,'vat_bps',profile.vat_bps,'next_invoice_date',profile.next_invoice_date));
 RETURN to_jsonb(profile);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_save_subscription_settings(p_actor bigint,p_expected timestamptz,p_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE settings subscription_billing_settings;issuer companies;
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor) OR jsonb_typeof(p_data) IS DISTINCT FROM 'object' OR EXISTS(SELECT FROM jsonb_object_keys(p_data) k WHERE k NOT IN('issuer_company_id','invoice_prefix','exchange_mode','exchange_provider')) THEN RAISE EXCEPTION 'Invalid issuer configuration' USING ERRCODE='22023';END IF;
 SELECT * INTO settings FROM subscription_billing_settings WHERE id=1 FOR UPDATE;
 IF settings.updated_at IS DISTINCT FROM p_expected THEN RAISE EXCEPTION 'Issuer configuration changed; refresh' USING ERRCODE='40001';END IF;
 SELECT * INTO issuer FROM companies WHERE id=(p_data->>'issuer_company_id')::bigint AND archived_at IS NULL AND is_test=false;
 IF NOT FOUND OR coalesce(trim(issuer.name),'')='' OR coalesce(trim(issuer.address),'')='' OR regexp_replace(coalesce(issuer.vat_number,''),'[ .-]','','g') !~ '^BE[0-9]{10}$' OR regexp_replace(coalesce(issuer.kbo_number,''),'[^0-9]','','g') !~ '^[0-9]{10}$' THEN RAISE EXCEPTION 'Complete real issuer legal identity' USING ERRCODE='23514';END IF;
 IF p_data->>'exchange_mode'='external_structured' AND coalesce(length(trim(p_data->>'exchange_provider')),0) NOT BETWEEN 1 AND 120 THEN RAISE EXCEPTION 'Name the structured exchange provider' USING ERRCODE='22023';END IF;
 UPDATE subscription_billing_settings SET issuer_company_id=issuer.id,invoice_prefix=p_data->>'invoice_prefix',exchange_mode=p_data->>'exchange_mode',exchange_provider=nullif(trim(p_data->>'exchange_provider'),''),updated_by=p_actor,updated_at=clock_timestamp() WHERE id=1 RETURNING * INTO settings;
 INSERT INTO subscription_billing_events(company_id,actor_id,action,metadata) VALUES(issuer.id,p_actor,'issuer_saved',jsonb_build_object('invoice_prefix',settings.invoice_prefix,'exchange_mode',settings.exchange_mode));
 RETURN to_jsonb(settings);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_prepare_subscription_credit(p_original bigint,p_actor bigint,p_request uuid,p_net bigint,p_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE original subscription_documents;doc subscription_documents;net_left bigint;tax_left bigint;tax bigint;new_id bigint;today date:=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date;
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor) OR p_request IS NULL OR p_net IS NULL OR p_net NOT BETWEEN 1 AND 100000000 OR coalesce(length(trim(p_reason)),0) NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Invalid credit details' USING ERRCODE='22023';END IF;
 SELECT * INTO original FROM subscription_documents WHERE id=p_original AND kind='invoice' AND state='issued' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Issued invoice missing' USING ERRCODE='P0002';END IF;
 SELECT * INTO doc FROM subscription_documents WHERE request_id=p_request;
 IF FOUND THEN
  IF doc.kind<>'credit' OR doc.original_id<>p_original OR doc.net_cents<>p_net OR doc.reason<>trim(p_reason) THEN RAISE EXCEPTION 'Credit request conflict' USING ERRCODE='40001';END IF;
  RETURN to_jsonb(doc);
 END IF;
 SELECT original.net_cents-coalesce(sum(net_cents),0),original.vat_cents-coalesce(sum(vat_cents),0) INTO net_left,tax_left FROM subscription_documents WHERE original_id=original.id AND state<>'void';
 IF p_net>net_left THEN RAISE EXCEPTION 'Credit exceeds original invoice' USING ERRCODE='23514';END IF;
 tax=CASE WHEN p_net=net_left THEN tax_left ELSE least(tax_left,round(p_net::numeric*original.vat_bps/10000)::bigint) END;
 new_id=nextval('subscription_documents_id_seq');
 INSERT INTO subscription_documents(id,request_id,company_id,document_number,kind,original_id,is_test,period_start,period_end,prepared_date,net_cents,vat_cents,gross_cents,vat_bps,tax_category,tax_reason,issuer,recipient,description,due_days,reminder_days,reason,created_by)
 VALUES(new_id,p_request,original.company_id,CASE WHEN original.is_test THEN 'DEMO-' ELSE '' END||'JDC-'||extract(year FROM today)::text||'-'||lpad(new_id::text,greatest(8,length(new_id::text)),'0'),'credit',original.id,original.is_test,original.period_start,original.period_end,today,p_net,tax,p_net+tax,original.vat_bps,original.tax_category,original.tax_reason,original.issuer,original.recipient,'Credit for '||original.document_number,0,original.reminder_days,trim(p_reason),p_actor) RETURNING * INTO doc;
 INSERT INTO subscription_billing_events(company_id,document_id,actor_id,action,metadata) VALUES(doc.company_id,doc.id,p_actor,'credit_prepared',jsonb_build_object('original_id',original.id));
 RETURN to_jsonb(doc);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_save_subscription_profile(bigint,bigint,timestamptz,jsonb), :"schema".security_save_subscription_settings(bigint,timestamptz,jsonb), :"schema".security_prepare_subscription_credit(bigint,bigint,uuid,bigint,text) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_save_subscription_profile(bigint,bigint,timestamptz,jsonb), :"schema".security_save_subscription_settings(bigint,timestamptz,jsonb), :"schema".security_prepare_subscription_credit(bigint,bigint,uuid,bigint,text) TO :"admin_role";

-- Statements keep prepared documents outside posted balances; trial scope uses document snapshots.
CREATE OR REPLACE FUNCTION :"schema".security_subscription_statement(p_company bigint,p_scope text,p_limit integer,p_offset integer)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE result jsonb;
BEGIN
 IF p_scope NOT IN('live','test','all') OR p_limit NOT BETWEEN 1 AND 100 OR p_offset NOT BETWEEN 0 AND 100000 THEN RAISE EXCEPTION 'Invalid statement filters' USING ERRCODE='22023';END IF;
 WITH docs AS(SELECT d.*,security_subscription_document_balance(d.id) balance_cents FROM subscription_documents d WHERE company_id=p_company AND (p_scope='all' OR is_test=(p_scope='test'))),
 entries AS(
 SELECT 'document:'||id::text entry_id,coalesce(issued_date,prepared_date) entry_date,created_at,document_number reference,kind,CASE WHEN kind='invoice' THEN gross_cents ELSE -gross_cents END amount_cents FROM docs WHERE state='issued'
 UNION ALL SELECT 'payment:'||p.request_id::text,p.payment_date,p.created_at,p.reference,'payment',-p.amount_cents FROM subscription_payments p JOIN docs d ON d.id=p.invoice_id),
 running AS(SELECT *,sum(amount_cents) OVER(ORDER BY entry_date,created_at,entry_id) running_balance_cents FROM entries),
 page AS(SELECT * FROM docs ORDER BY id DESC LIMIT p_limit OFFSET p_offset),
 movements AS(SELECT * FROM running ORDER BY entry_date DESC,created_at DESC,entry_id DESC LIMIT p_limit OFFSET p_offset)
 SELECT jsonb_build_object('documents',coalesce((SELECT jsonb_agg(to_jsonb(page) ORDER BY id DESC) FROM page),'[]'),
 'entries',coalesce((SELECT jsonb_agg(to_jsonb(movements) ORDER BY entry_date DESC,created_at DESC,entry_id DESC) FROM movements),'[]'),
 'total',(SELECT count(*) FROM docs),'entry_total',(SELECT count(*) FROM entries),
 'posted_balance_cents',coalesce((SELECT sum(amount_cents) FROM entries),0),
 'overdue_cents',coalesce((SELECT sum(greatest(balance_cents,0)) FROM docs WHERE state='issued' AND kind='invoice' AND due_date<(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date),0),
 'prepared_count',(SELECT count(*) FROM docs WHERE state='prepared'),'offset',p_offset,'limit',p_limit) INTO result;
 RETURN result;
END $$;
ALTER TABLE :"schema".subscription_mail_queue ADD COLUMN IF NOT EXISTS lease_id uuid,ADD COLUMN IF NOT EXISTS mail_delivery_id bigint;
CREATE TABLE IF NOT EXISTS :"schema".subscription_scheduler_state(id integer PRIMARY KEY CHECK(id=1),last_run_at timestamptz,prepared_count integer NOT NULL DEFAULT 0,failed_count integer NOT NULL DEFAULT 0);
INSERT INTO :"schema".subscription_scheduler_state(id) VALUES(1) ON CONFLICT DO NOTHING;
ALTER TABLE :"schema".subscription_scheduler_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".subscription_scheduler_state;
CREATE POLICY server_service_access ON :"schema".subscription_scheduler_state TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".subscription_scheduler_state FROM PUBLIC,:"user_role";
GRANT SELECT,UPDATE ON :"schema".subscription_scheduler_state TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_subscription_tick()
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE item record;n integer:=0;failures integer:=0;today date:=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date;
BEGIN
 PERFORM id FROM subscription_scheduler_state WHERE id=1 FOR UPDATE SKIP LOCKED;
 IF NOT FOUND THEN RETURN jsonb_build_object('busy',true);END IF;
 IF EXISTS(SELECT FROM subscription_scheduler_state WHERE id=1 AND last_run_at>clock_timestamp()-interval '55 seconds') THEN RETURN jsonb_build_object('busy',true);END IF;
 FOR item IN SELECT p.company_id FROM subscription_billing_profiles p JOIN companies c ON c.id=p.company_id WHERE p.enabled AND p.next_invoice_date<=today AND c.archived_at IS NULL AND c.subscription_status='active' ORDER BY p.next_invoice_date,p.company_id LIMIT 25 LOOP
  BEGIN PERFORM security_prepare_subscription_invoice(item.company_id,NULL,gen_random_uuid());n=n+1;
  EXCEPTION WHEN check_violation OR no_data_found OR invalid_parameter_value THEN failures=failures+1;
  END;
 END LOOP;
 -- Reminders are per invoice and configured interval; no overdue state changes operational access.
 INSERT INTO subscription_mail_queue(document_id,event_key,purpose,scheduled_date)
 SELECT d.id,'reminder:'||d.id||':'||((today-d.due_date-1)/d.reminder_days)::text,'subscription_reminder',today
 FROM subscription_documents d JOIN companies c ON c.id=d.company_id
 WHERE d.kind='invoice' AND d.state='issued' AND NOT d.is_test AND c.archived_at IS NULL AND d.due_date<today AND security_subscription_document_balance(d.id)>0
 ON CONFLICT(event_key) DO NOTHING;
 UPDATE subscription_mail_queue q SET status='cancelled',completed_at=clock_timestamp(),last_result='settled_or_archived'
 FROM subscription_documents d JOIN companies c ON c.id=d.company_id WHERE q.document_id=d.id AND q.status IN('pending','not_configured') AND (c.archived_at IS NOT NULL OR (q.purpose='subscription_reminder' AND security_subscription_document_balance(d.id)<=0));
 -- An interrupted send is uncertain, never blindly resubmitted after the provider deduplication window.
 UPDATE subscription_mail_queue SET status='uncertain',last_result='lease_expired',completed_at=clock_timestamp() WHERE status='sending' AND attempted_at<clock_timestamp()-interval '5 minutes';
 UPDATE subscription_scheduler_state SET last_run_at=clock_timestamp(),prepared_count=n,failed_count=failures WHERE id=1;
 RETURN jsonb_build_object('prepared',n,'failed',failures);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_claim_subscription_mail(p_lease uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE job subscription_mail_queue;doc subscription_documents;
BEGIN
 IF p_lease IS NULL THEN RAISE EXCEPTION 'Lease required' USING ERRCODE='22023';END IF;
 SELECT q.* INTO job FROM subscription_mail_queue q JOIN subscription_documents d ON d.id=q.document_id JOIN companies c ON c.id=d.company_id
 WHERE q.status IN('pending','not_configured') AND (q.attempted_at IS NULL OR q.attempted_at<clock_timestamp()-interval '15 minutes') AND q.scheduled_date<=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date AND d.state='issued' AND NOT d.is_test AND c.archived_at IS NULL
 AND (q.purpose<>'subscription_reminder' OR security_subscription_document_balance(d.id)>0)
 ORDER BY q.id FOR UPDATE OF q SKIP LOCKED LIMIT 1;
 IF NOT FOUND THEN RETURN NULL;END IF;
 UPDATE subscription_mail_queue SET status='sending',attempted_at=clock_timestamp(),lease_id=p_lease WHERE id=job.id;
 SELECT * INTO doc FROM subscription_documents WHERE id=job.document_id;
 RETURN jsonb_build_object('id',job.id,'event_key',job.event_key,'purpose',job.purpose,'document',to_jsonb(doc),'balance_cents',security_subscription_document_balance(doc.id));
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_finish_subscription_mail(p_id bigint,p_lease uuid,p_status text,p_delivery bigint DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE mapped text;
BEGIN
 IF p_status NOT IN('accepted','delivered','delayed','uncertain','failed','sending','suppressed','quota_exceeded','not_configured','record_unavailable','invalid_message','bounced','complained') THEN RAISE EXCEPTION 'Invalid mail result' USING ERRCODE='22023';END IF;
 mapped=CASE WHEN p_status IN('not_configured','record_unavailable','quota_exceeded') THEN 'not_configured' WHEN p_status IN('sending','uncertain') THEN 'uncertain' WHEN p_status='delayed' THEN 'accepted' WHEN p_status IN('failed','invalid_message','bounced','complained','suppressed') THEN 'failed' ELSE p_status END;
 UPDATE subscription_mail_queue SET status=mapped,last_result=p_status,mail_delivery_id=p_delivery,completed_at=clock_timestamp() WHERE id=p_id AND lease_id=p_lease AND status='sending';RETURN FOUND;
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_company_platform_ready()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
 SELECT EXISTS(SELECT FROM subscription_billing_settings WHERE id=1) AND EXISTS(SELECT FROM subscription_scheduler_state WHERE id=1)
 AND EXISTS(SELECT FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='companies' AND column_name='archived_at')
$$;
REVOKE ALL ON FUNCTION :"schema".security_subscription_statement(bigint,text,integer,integer),:"schema".security_subscription_tick(),:"schema".security_claim_subscription_mail(uuid),:"schema".security_finish_subscription_mail(bigint,uuid,text,bigint),:"schema".security_company_platform_ready() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_subscription_statement(bigint,text,integer,integer),:"schema".security_subscription_tick(),:"schema".security_claim_subscription_mail(uuid),:"schema".security_finish_subscription_mail(bigint,uuid,text,bigint),:"schema".security_company_platform_ready() TO :"admin_role";

CREATE OR REPLACE FUNCTION :"schema".security_void_subscription_preparation(p_document bigint,p_actor bigint,p_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE d subscription_documents;
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor) OR coalesce(length(trim(p_reason)),0) NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Cancellation reason required' USING ERRCODE='22023';END IF;
 SELECT * INTO d FROM subscription_documents WHERE id=p_document FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Document missing' USING ERRCODE='P0002';END IF;
 IF d.state='void' THEN RETURN to_jsonb(d);END IF;
 IF d.state<>'prepared' THEN RAISE EXCEPTION 'Issued documents require a credit note' USING ERRCODE='23514';END IF;
 UPDATE subscription_documents SET state='void' WHERE id=d.id RETURNING * INTO d;
 INSERT INTO subscription_billing_events(company_id,document_id,actor_id,action,metadata) VALUES(d.company_id,d.id,p_actor,'preparation_voided',jsonb_build_object('reason',trim(p_reason)));
 RETURN to_jsonb(d);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_void_subscription_preparation(bigint,bigint,text) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_void_subscription_preparation(bigint,bigint,text) TO :"admin_role";

COMMIT;
