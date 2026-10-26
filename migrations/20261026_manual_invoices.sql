-- Independent one-off invoices: no subscription, contract, scheduler or Stripe writes.
BEGIN;
CREATE TABLE IF NOT EXISTS :"schema".manual_invoices(
 id bigserial PRIMARY KEY,request_id uuid NOT NULL UNIQUE,company_id bigint NOT NULL REFERENCES :"schema".companies(id),
 document_number text NOT NULL UNIQUE,state text NOT NULL DEFAULT 'prepared' CHECK(state IN('prepared','issued','void')),
 is_test boolean NOT NULL,currency text NOT NULL DEFAULT 'EUR',kind text NOT NULL DEFAULT 'invoice',
 description text NOT NULL,net_cents bigint NOT NULL CHECK(net_cents>0),vat_cents bigint NOT NULL CHECK(vat_cents>=0),gross_cents bigint NOT NULL CHECK(gross_cents=net_cents+vat_cents),vat_bps integer NOT NULL CHECK(vat_bps BETWEEN 0 AND 10000),tax_reason text,
 issuer jsonb NOT NULL,recipient jsonb NOT NULL,prepared_date date NOT NULL,due_date date NOT NULL,issued_date date,exchange_reference text,
 created_by bigint NOT NULL REFERENCES :"schema".users(id),created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE IF NOT EXISTS :"schema".manual_invoice_payments(request_id uuid PRIMARY KEY,invoice_id bigint NOT NULL REFERENCES :"schema".manual_invoices(id),amount_cents bigint NOT NULL CHECK(amount_cents>0),payment_method text NOT NULL CHECK(payment_method IN('cash','bank_transfer')),reference text NOT NULL,recorded_by bigint NOT NULL REFERENCES :"schema".users(id),created_at timestamptz NOT NULL DEFAULT clock_timestamp());
ALTER TABLE :"schema".manual_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE :"schema".manual_invoice_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".manual_invoices;
CREATE POLICY server_service_access ON :"schema".manual_invoices TO :"admin_role" USING(true) WITH CHECK(true);
DROP POLICY IF EXISTS server_service_access ON :"schema".manual_invoice_payments;
CREATE POLICY server_service_access ON :"schema".manual_invoice_payments TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".manual_invoices,:"schema".manual_invoice_payments FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".manual_invoices TO :"admin_role";
GRANT SELECT,INSERT ON :"schema".manual_invoice_payments TO :"admin_role";
GRANT USAGE,SELECT ON SEQUENCE :"schema".manual_invoices_id_seq TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_manual_invoice(p_action text,p_actor bigint,p_request uuid,p_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE d manual_invoices;c companies;i companies;s subscription_billing_settings;prior manual_invoice_payments;n bigint;gross bigint;rate integer;net bigint;stamp date:=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date;
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor AND is_active) OR p_request IS NULL OR p_action IS NULL OR p_action NOT IN('create','issue','void','payment') THEN RAISE EXCEPTION 'Invalid invoice command' USING ERRCODE='22023';END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_request::text,0));
 IF p_action='create' THEN
  SELECT * INTO d FROM manual_invoices WHERE request_id=p_request;
  IF FOUND THEN
   IF d.created_by<>p_actor OR d.company_id<>(p_data->>'company_id')::bigint OR d.gross_cents<>(p_data->>'gross_cents')::bigint OR d.vat_bps<>(p_data->>'vat_bps')::integer OR d.description IS DISTINCT FROM trim(p_data->>'description') OR d.due_date IS DISTINCT FROM (p_data->>'due_date')::date OR d.issuer->>'id' IS DISTINCT FROM p_data->>'issuer_company_id' OR d.tax_reason IS DISTINCT FROM nullif(trim(p_data->>'tax_reason'),'') THEN RAISE EXCEPTION 'Request conflict' USING ERRCODE='23505';END IF;
   RETURN to_jsonb(d);
  END IF;
  SELECT * INTO c FROM companies WHERE id=(p_data->>'company_id')::bigint AND archived_at IS NULL FOR SHARE;
  SELECT * INTO i FROM companies WHERE id=(p_data->>'issuer_company_id')::bigint AND archived_at IS NULL FOR SHARE;
  IF c.id IS NULL OR i.id IS NULL OR c.id=i.id OR c.is_test IS DISTINCT FROM i.is_test OR coalesce(trim(i.name),'')='' OR coalesce(trim(i.address),'')='' OR coalesce(trim(i.vat_number),'')='' OR coalesce(trim(c.address),'')='' OR coalesce(trim(c.vat_number),'')='' THEN RAISE EXCEPTION 'Complete issuer and client legal identities' USING ERRCODE='23514';END IF;
  gross=(p_data->>'gross_cents')::bigint;rate=(p_data->>'vat_bps')::integer;
  IF gross IS NULL OR gross NOT BETWEEN 1 AND 100000000 OR rate IS NULL OR rate NOT BETWEEN 0 AND 10000 OR coalesce(length(trim(p_data->>'description')),0) NOT BETWEEN 1 AND 2000 OR (p_data->>'due_date')::date IS NULL OR (p_data->>'due_date')::date<stamp OR (rate=0 AND coalesce(length(trim(p_data->>'tax_reason')),0)=0) THEN RAISE EXCEPTION 'Invalid invoice values' USING ERRCODE='22023';END IF;
  net=round(gross::numeric*10000/(10000+rate))::bigint;n=nextval('manual_invoices_id_seq');
  INSERT INTO manual_invoices(id,request_id,company_id,document_number,is_test,description,net_cents,vat_cents,gross_cents,vat_bps,tax_reason,issuer,recipient,prepared_date,due_date,created_by)
  VALUES(n,p_request,c.id,CASE WHEN c.is_test THEN 'DEMO-' ELSE '' END||'JDI-'||extract(year FROM stamp)::text||'-'||lpad(n::text,greatest(8,length(n::text)),'0'),c.is_test,trim(p_data->>'description'),net,gross-net,gross,rate,nullif(trim(p_data->>'tax_reason'),''),
  jsonb_build_object('id',i.id,'name',i.name,'address',i.address,'vat_number',i.vat_number,'kbo_number',i.kbo_number,'email',i.email,'bank_account_iban',i.bank_account_iban,'bank_account_bic',i.bank_account_bic),jsonb_build_object('name',c.name,'address',c.address,'vat_number',c.vat_number,'email',c.email),stamp,(p_data->>'due_date')::date,p_actor) RETURNING * INTO d;
 ELSE
  SELECT * INTO d FROM manual_invoices WHERE id=(p_data->>'document_id')::bigint FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invoice missing' USING ERRCODE='P0002';END IF;
  IF p_action='issue' THEN
   IF d.state='issued' AND d.exchange_reference=p_data->>'reference' THEN RETURN to_jsonb(d);END IF;
   SELECT * INTO s FROM subscription_billing_settings WHERE id=1;
   IF d.state<>'prepared' OR coalesce(length(trim(p_data->>'reference')),0) NOT BETWEEN 1 AND 256 OR (NOT d.is_test AND (s.exchange_mode<>'external_structured' OR coalesce(trim(s.exchange_provider),'')='')) THEN RAISE EXCEPTION 'Structured exchange evidence required before issuance' USING ERRCODE='23514';END IF;
   UPDATE manual_invoices SET state='issued',issued_date=stamp,exchange_reference=trim(p_data->>'reference') WHERE id=d.id RETURNING * INTO d;
  ELSIF p_action='void' THEN
   IF d.state='void' THEN RETURN to_jsonb(d);END IF;
   IF d.state<>'prepared' THEN RAISE EXCEPTION 'Issued invoice cannot be cancelled here' USING ERRCODE='23514';END IF;
   UPDATE manual_invoices SET state='void' WHERE id=d.id RETURNING * INTO d;
  ELSE
   SELECT * INTO prior FROM manual_invoice_payments WHERE request_id=p_request;
   IF FOUND THEN
    IF prior.invoice_id<>d.id OR prior.amount_cents<>(p_data->>'amount_cents')::bigint OR prior.payment_method IS DISTINCT FROM p_data->>'payment_method' OR prior.reference IS DISTINCT FROM trim(p_data->>'reference') OR prior.recorded_by<>p_actor THEN RAISE EXCEPTION 'Payment request conflict' USING ERRCODE='23505';END IF;
    RETURN to_jsonb(prior);
   END IF;
   IF d.state<>'issued' OR (p_data->>'amount_cents')::bigint IS NULL OR (p_data->>'amount_cents')::bigint NOT BETWEEN 1 AND d.gross_cents-coalesce((SELECT sum(amount_cents) FROM manual_invoice_payments WHERE invoice_id=d.id),0) OR p_data->>'payment_method' NOT IN('cash','bank_transfer') OR coalesce(length(trim(p_data->>'reference')),0) NOT BETWEEN 1 AND 140 THEN RAISE EXCEPTION 'Invalid payment or balance' USING ERRCODE='23514';END IF;
   INSERT INTO manual_invoice_payments VALUES(p_request,d.id,(p_data->>'amount_cents')::bigint,p_data->>'payment_method',trim(p_data->>'reference'),p_actor,clock_timestamp()) RETURNING * INTO prior;
   RETURN to_jsonb(prior);
  END IF;
 END IF;
 RETURN to_jsonb(d);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_manual_invoice(text,bigint,uuid,jsonb) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_manual_invoice(text,bigint,uuid,jsonb) TO :"admin_role";
CREATE OR REPLACE VIEW :"schema".manual_invoice_summary WITH(security_invoker=true) AS
 SELECT d.*,d.gross_cents-coalesce((SELECT sum(p.amount_cents) FROM :"schema".manual_invoice_payments p WHERE p.invoice_id=d.id),0)::bigint AS balance_cents FROM :"schema".manual_invoices d;
REVOKE ALL ON :"schema".manual_invoice_summary FROM PUBLIC,:"user_role";
GRANT SELECT ON :"schema".manual_invoice_summary TO :"admin_role";
-- Stored financial identities and paid receipts cannot be rewritten.
CREATE OR REPLACE FUNCTION :"schema".security_manual_invoice_immutable()
RETURNS trigger LANGUAGE plpgsql SET search_path=:"schema",pg_catalog AS $$
BEGIN
 IF TG_TABLE_NAME='manual_invoice_payments' OR TG_OP='DELETE' THEN RAISE EXCEPTION 'Financial records are immutable' USING ERRCODE='23514';END IF;
 IF (to_jsonb(NEW)-ARRAY['state','issued_date','exchange_reference']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['state','issued_date','exchange_reference']) OR OLD.state IN('issued','void') THEN RAISE EXCEPTION 'Financial snapshot is immutable' USING ERRCODE='23514';END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS manual_invoice_immutable ON :"schema".manual_invoices;
CREATE TRIGGER manual_invoice_immutable BEFORE UPDATE OR DELETE ON :"schema".manual_invoices FOR EACH ROW EXECUTE FUNCTION :"schema".security_manual_invoice_immutable();
DROP TRIGGER IF EXISTS manual_payment_immutable ON :"schema".manual_invoice_payments;
CREATE TRIGGER manual_payment_immutable BEFORE UPDATE OR DELETE ON :"schema".manual_invoice_payments FOR EACH ROW EXECUTE FUNCTION :"schema".security_manual_invoice_immutable();
-- Admin-created companies have no self-registration application to approve.
CREATE OR REPLACE FUNCTION :"schema".security_confirm_admin_company(p_company bigint,p_actor bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE c companies;
BEGIN
 IF NOT EXISTS(SELECT FROM users WHERE id=p_actor AND is_active) THEN RAISE EXCEPTION 'Active actor required' USING ERRCODE='42501';END IF;
 SELECT * INTO c FROM companies WHERE id=p_company FOR UPDATE;
 IF NOT FOUND OR c.archived_at IS NOT NULL THEN RAISE EXCEPTION 'Company unavailable' USING ERRCODE='23514';END IF;
 IF c.subscription_status='active' THEN RETURN to_jsonb(c);END IF;
 IF (c.subscription_status IS NOT NULL AND c.subscription_status<>'pending_contract') OR c.subscription_suspended_at IS NOT NULL OR nullif(trim(c.suspension_reason),'') IS NOT NULL OR c.created_by_distributor_id IS NOT NULL OR EXISTS(SELECT FROM company_registrations WHERE company_id=c.id) THEN RAISE EXCEPTION 'Company requires explicit review' USING ERRCODE='23514';END IF;
 UPDATE companies SET subscription_status='active',updated_at=clock_timestamp() WHERE id=c.id RETURNING * INTO c;
 INSERT INTO subscription_billing_events(company_id,actor_id,action) VALUES(c.id,p_actor,'admin_company_approved');
 RETURN to_jsonb(c);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_confirm_admin_company(bigint,bigint) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_confirm_admin_company(bigint,bigint) TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_save_admin_company(p_actor bigint,p_company jsonb,p_account jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE c jsonb;
BEGIN
 c=security_save_company_account(NULL,p_company,p_account);
 RETURN security_confirm_admin_company((c->>'id')::bigint,p_actor)||jsonb_build_object('portal_login_enabled',c->'portal_login_enabled');
END $$;
REVOKE ALL ON FUNCTION :"schema".security_save_admin_company(bigint,jsonb,jsonb) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_save_admin_company(bigint,jsonb,jsonb) TO :"admin_role";
COMMIT;
