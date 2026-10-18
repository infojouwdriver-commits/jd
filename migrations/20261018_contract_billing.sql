-- Additive contract-backed monthly billing. No historical contracts or invoices are rewritten.
BEGIN;
SET LOCAL lock_timeout='5s';
ALTER TABLE :"schema".company_registrations ADD COLUMN IF NOT EXISTS subscription_offer text,ADD COLUMN IF NOT EXISTS offer_acknowledged_at timestamptz;
ALTER TABLE :"schema".company_contracts ADD COLUMN IF NOT EXISTS registration_request_id uuid REFERENCES :"schema".company_registrations(request_id),ADD COLUMN IF NOT EXISTS billing_model text,ADD COLUMN IF NOT EXISTS monthly_gross_cents bigint,ADD COLUMN IF NOT EXISTS vat_bps integer;
CREATE UNIQUE INDEX IF NOT EXISTS contract_registration_request ON :"schema".company_contracts(registration_request_id) WHERE registration_request_id IS NOT NULL;
ALTER TABLE :"schema".subscription_billing_profiles ADD COLUMN IF NOT EXISTS contract_id bigint REFERENCES :"schema".company_contracts(id),ADD COLUMN IF NOT EXISTS monthly_gross_cents bigint,ADD COLUMN IF NOT EXISTS installment_index integer NOT NULL DEFAULT 0;
ALTER TABLE :"schema".subscription_documents ADD COLUMN IF NOT EXISTS contract_id bigint REFERENCES :"schema".company_contracts(id),ADD COLUMN IF NOT EXISTS contract_number text,ADD COLUMN IF NOT EXISTS installment_number integer,ADD COLUMN IF NOT EXISTS contract_snapshot jsonb;
ALTER TABLE :"schema".contract_signatures ADD COLUMN IF NOT EXISTS request_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS contract_signature_request ON :"schema".contract_signatures(request_id) WHERE request_id IS NOT NULL;

CREATE OR REPLACE FUNCTION :"schema".security_submit_company_subscription(p_request uuid,p_fingerprint text,p_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE result jsonb;
BEGIN
 IF p_data->>'subscription_offer' IS DISTINCT FROM 'annual-50-v1' OR p_data->>'subscription_acknowledged' IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Subscription offer acknowledgement required' USING ERRCODE='22023';END IF;
 result=security_submit_company_registration(p_request,p_fingerprint,p_data);
 UPDATE company_registrations SET subscription_offer='annual-50-v1',offer_acknowledged_at=coalesce(offer_acknowledged_at,clock_timestamp()) WHERE request_id=p_request;
 RETURN result;
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_review_company_subscription(p_request uuid,p_action text,p_notes text,p_reviewer bigint,p_html text,p_start date,p_end date)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE r company_registrations;result jsonb;contract company_contracts;
BEGIN
 SELECT * INTO r FROM company_registrations WHERE request_id=p_request FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Request missing' USING ERRCODE='P0002';END IF;
 IF r.subscription_offer='annual-50-v1' AND p_action='approve' AND r.status='pending' THEN
  IF NOT EXISTS(SELECT FROM companies c WHERE c.id=r.company_id AND c.name IS NOT DISTINCT FROM r.company_name AND c.vat_number IS NOT DISTINCT FROM r.vat_number AND c.kbo_number IS NOT DISTINCT FROM r.kbo_number AND c.address IS NOT DISTINCT FROM r.company_address) THEN RAISE EXCEPTION 'Registration legal identity changed; review again' USING ERRCODE='40001';END IF;
  IF p_start IS DISTINCT FROM (clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date OR p_end IS DISTINCT FROM (p_start+interval '12 months')::date OR coalesce(length(p_html),0)<100 OR r.offer_acknowledged_at IS NULL THEN RAISE EXCEPTION 'Contract terms required' USING ERRCODE='22023';END IF;
 END IF;
 result=security_review_company_registration(p_request,p_action,p_notes,p_reviewer);
 IF r.subscription_offer='annual-50-v1' AND p_action='approve' THEN
  SELECT * INTO contract FROM company_contracts WHERE registration_request_id=p_request;
  IF NOT FOUND THEN
   INSERT INTO company_contracts(company_id,registration_request_id,contract_number,contract_type,contract_start_date,contract_end_date,contract_duration_months,monthly_fee,annual_fee,contract_status,contract_html_template,contract_language,auto_renew,renewal_notice_days,billing_model,monthly_gross_cents,vat_bps)
   VALUES(r.company_id,p_request,'JD-'||p_request::text,'annual_subscription',p_start,p_end,12,50,600,'pending_signature',p_html,CASE WHEN r.language='nl' THEN 'nl' ELSE 'fr' END,false,0,'gross_monthly_v1',5000,2100) RETURNING * INTO contract;
   INSERT INTO subscription_billing_profiles(company_id,enabled,contract_id,monthly_gross_cents,net_cents,vat_bps,tax_category,billing_day,next_invoice_date,due_days,reminder_days,billing_email,language,updated_by)
   VALUES(r.company_id,false,contract.id,5000,4132,2100,'S',extract(day FROM p_start)::integer,p_start,14,7,r.company_email,CASE WHEN r.language IN('ar','nl') THEN r.language ELSE 'fr' END,p_reviewer);
   INSERT INTO subscription_billing_events(company_id,actor_id,action,metadata) VALUES(r.company_id,p_reviewer,'contract_awaiting_signature',jsonb_build_object('contract_id',contract.id,'monthly_gross_cents',5000,'vat_bps',2100,'installments',12));
  END IF;
  result=result||jsonb_build_object('contract_id',contract.id);
 END IF;
 RETURN result;
END $$;

-- Shared activation for newly signed contracts and explicitly linked historical signed contracts.
CREATE OR REPLACE FUNCTION :"schema".security_activate_contract_billing(p_company bigint,p_contract bigint,p_actor bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE c companies;k company_contracts;p subscription_billing_profiles;gross bigint;rate integer;first_invoice jsonb;
BEGIN
 SELECT * INTO c FROM companies WHERE id=p_company FOR UPDATE;
 SELECT * INTO k FROM company_contracts WHERE id=p_contract AND company_id=p_company FOR UPDATE;
 IF k.id IS NULL OR c.archived_at IS NOT NULL OR c.subscription_status IS DISTINCT FROM 'active' OR k.contract_status IS DISTINCT FROM 'active' OR k.signed_at IS NULL THEN RAISE EXCEPTION 'Approved company and signed active contract required' USING ERRCODE='23514';END IF;
 IF k.contract_duration_months IS DISTINCT FROM 12 OR k.contract_start_date IS NULL OR k.contract_end_date IS DISTINCT FROM (k.contract_start_date+interval '12 months')::date THEN RAISE EXCEPTION 'Annual contract dates required' USING ERRCODE='23514';END IF;
 IF k.contract_end_date<=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date THEN RAISE EXCEPTION 'Contract expired' USING ERRCODE='23514';END IF;
 IF NOT EXISTS(SELECT FROM users WHERE id=p_actor AND is_active) THEN RAISE EXCEPTION 'Active actor required' USING ERRCODE='42501';END IF;
 SELECT * INTO p FROM subscription_billing_profiles WHERE company_id=p_company FOR UPDATE;
 IF p.contract_id=p_contract THEN RETURN to_jsonb(p);END IF;
 -- Never silently replace manual billing or another contract's financial schedule.
 IF p.company_id IS NOT NULL THEN RAISE EXCEPTION 'Existing billing schedule requires review' USING ERRCODE='40001';END IF;
 gross=coalesce(k.monthly_gross_cents,round(k.monthly_fee*100)::bigint);
 SELECT coalesce(k.vat_bps,default_vat_bps) INTO rate FROM subscription_billing_settings WHERE id=1;
 IF gross IS NULL OR gross NOT BETWEEN 1 AND 100000000 OR rate IS NULL OR rate NOT BETWEEN 1 AND 10000 THEN RAISE EXCEPTION 'Contract price or VAT invalid' USING ERRCODE='23514';END IF;
 INSERT INTO subscription_billing_profiles(company_id,enabled,contract_id,monthly_gross_cents,net_cents,vat_bps,tax_category,billing_day,next_invoice_date,due_days,reminder_days,billing_email,language,updated_by)
 VALUES(p_company,true,p_contract,gross,round(gross::numeric*10000/(10000+rate))::bigint,rate,'S',extract(day FROM k.contract_start_date)::integer,k.contract_start_date,14,7,c.email,CASE WHEN k.contract_language='nl' THEN 'nl' ELSE 'fr' END,p_actor) RETURNING * INTO p;
 UPDATE companies SET current_contract_id=k.id,updated_at=clock_timestamp() WHERE id=p_company;
 INSERT INTO subscription_billing_events(company_id,actor_id,action,metadata) VALUES(p_company,p_actor,'contract_billing_linked',jsonb_build_object('contract_id',p_contract,'monthly_gross_cents',gross,'vat_bps',rate));
 RETURN to_jsonb(p);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_sign_company_contract(p_company bigint,p_contract bigint,p_actor bigint,p_request uuid,p_name text,p_position text,p_ip text,p_agent text,p_expected timestamptz)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE c companies;k company_contracts;prior contract_signatures;u users;profile subscription_billing_profiles;first_invoice jsonb;
BEGIN
 SELECT * INTO c FROM companies WHERE id=p_company FOR UPDATE;
 IF NOT EXISTS(SELECT FROM company_users m JOIN users member_user ON member_user.id=m.user_id WHERE m.company_id=p_company AND m.user_id=p_actor AND m.is_active AND member_user.is_active AND m.role IN('owner','portal_owner')) THEN RAISE EXCEPTION 'Company owner required' USING ERRCODE='42501';END IF;
 SELECT * INTO k FROM company_contracts WHERE id=p_contract AND company_id=p_company FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Contract missing' USING ERRCODE='P0002';END IF;
 SELECT * INTO prior FROM contract_signatures WHERE request_id=p_request;
 IF FOUND THEN
  IF prior.contract_id<>p_contract OR prior.company_id<>p_company OR prior.signer_name IS DISTINCT FROM trim(p_name) OR prior.signer_position IS DISTINCT FROM nullif(trim(p_position),'') THEN RAISE EXCEPTION 'Signature request conflict' USING ERRCODE='40001';END IF;
  RETURN jsonb_build_object('contract_id',k.id,'signed',true);
 END IF;
 IF k.updated_at IS DISTINCT FROM p_expected THEN RAISE EXCEPTION 'Contract changed; review again' USING ERRCODE='40001';END IF;
 IF p_request IS NULL OR coalesce(length(trim(p_name)),0) NOT BETWEEN 2 AND 160 OR length(p_position)>120 OR coalesce(length(p_ip),0)>128 OR coalesce(length(p_agent),0)>1000 THEN RAISE EXCEPTION 'Signature details required' USING ERRCODE='22023';END IF;
 IF c.archived_at IS NOT NULL OR c.subscription_status IS DISTINCT FROM 'active' OR k.contract_status IS DISTINCT FROM 'pending_signature' OR k.signed_at IS NOT NULL OR k.contract_end_date<=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date THEN RAISE EXCEPTION 'Contract is not available for signing' USING ERRCODE='23514';END IF;
 SELECT * INTO u FROM users WHERE id=p_actor;
 SELECT * INTO profile FROM subscription_billing_profiles WHERE company_id=p_company FOR UPDATE;
 IF profile.company_id IS NOT NULL AND profile.contract_id IS DISTINCT FROM k.id THEN RAISE EXCEPTION 'Existing billing schedule requires review' USING ERRCODE='40001';END IF;
 INSERT INTO contract_signatures(request_id,contract_id,company_id,signer_name,signer_email,signer_position,signature_ip,signature_user_agent,signed_at,signature_method,is_verified)
 VALUES(p_request,k.id,p_company,trim(p_name),u.email,nullif(trim(p_position),''),p_ip,p_agent,clock_timestamp(),'authenticated_owner',true);
 UPDATE company_contracts SET contract_status='active',signed_at=clock_timestamp(),signer_ip=p_ip,signer_user_agent=p_agent,updated_at=clock_timestamp() WHERE id=k.id;
 IF profile.company_id IS NULL THEN
  PERFORM security_activate_contract_billing(p_company,k.id,p_actor);
 ELSE
  UPDATE subscription_billing_profiles SET enabled=true,updated_at=clock_timestamp() WHERE company_id=p_company;
 END IF;
 UPDATE companies SET current_contract_id=k.id,updated_at=clock_timestamp() WHERE id=p_company;
 -- Preparation has no delivery/payment side effect. Missing legal issuer never fabricates an invoice.
 BEGIN first_invoice=security_prepare_subscription_invoice(p_company,p_actor,gen_random_uuid());
 EXCEPTION WHEN check_violation THEN first_invoice=NULL;END;
 INSERT INTO subscription_billing_events(company_id,actor_id,action,metadata) VALUES(p_company,p_actor,'contract_signed',jsonb_build_object('contract_id',k.id));
 RETURN jsonb_build_object('contract_id',k.id,'signed',true,'first_document_id',first_invoice->'id');
END $$;

-- Signed terms and signature evidence cannot be rewritten or removed, including through generic APIs.
CREATE OR REPLACE FUNCTION :"schema".security_preserve_signed_contract()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
 IF TG_TABLE_NAME='contract_signatures' THEN RAISE EXCEPTION 'Signature evidence is immutable' USING ERRCODE='23514';END IF;
 IF OLD.registration_request_id IS NOT NULL AND TG_OP='UPDATE' AND (NEW.monthly_fee IS DISTINCT FROM OLD.monthly_fee OR NEW.annual_fee IS DISTINCT FROM OLD.annual_fee OR NEW.monthly_gross_cents IS DISTINCT FROM OLD.monthly_gross_cents OR NEW.vat_bps IS DISTINCT FROM OLD.vat_bps OR NEW.contract_html_template IS DISTINCT FROM OLD.contract_html_template OR NEW.contract_start_date IS DISTINCT FROM OLD.contract_start_date OR NEW.contract_end_date IS DISTINCT FROM OLD.contract_end_date OR NEW.contract_duration_months IS DISTINCT FROM OLD.contract_duration_months OR NEW.auto_renew IS DISTINCT FROM OLD.auto_renew) THEN RAISE EXCEPTION 'Acknowledged registration offer is immutable' USING ERRCODE='23514';END IF;
 IF OLD.signed_at IS NOT NULL THEN
  IF TG_OP='DELETE' OR (to_jsonb(OLD)-ARRAY['contract_status','updated_at','suspended_at','suspended_by_user_id','suspension_reason','last_invoice_generated_at','next_invoice_generation_date']) IS DISTINCT FROM (to_jsonb(NEW)-ARRAY['contract_status','updated_at','suspended_at','suspended_by_user_id','suspension_reason','last_invoice_generated_at','next_invoice_generation_date']) THEN RAISE EXCEPTION 'Signed contract terms are immutable' USING ERRCODE='23514';END IF;
 END IF;
 RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
END $$;
DROP TRIGGER IF EXISTS signed_contract_preserved ON :"schema".company_contracts;
CREATE TRIGGER signed_contract_preserved BEFORE UPDATE OR DELETE ON :"schema".company_contracts FOR EACH ROW EXECUTE FUNCTION :"schema".security_preserve_signed_contract();
DROP TRIGGER IF EXISTS signature_evidence_preserved ON :"schema".contract_signatures;
CREATE TRIGGER signature_evidence_preserved BEFORE UPDATE OR DELETE ON :"schema".contract_signatures FOR EACH ROW EXECUTE FUNCTION :"schema".security_preserve_signed_contract();
CREATE OR REPLACE FUNCTION :"schema".security_contract_credit_snapshot()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE original subscription_documents;
BEGIN
 IF NEW.kind='credit' THEN
  SELECT * INTO original FROM subscription_documents WHERE id=NEW.original_id;
  NEW.contract_id=original.contract_id;NEW.contract_number=original.contract_number;NEW.installment_number=original.installment_number;NEW.contract_snapshot=original.contract_snapshot;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS subscription_contract_credit ON :"schema".subscription_documents;
CREATE TRIGGER subscription_contract_credit BEFORE INSERT ON :"schema".subscription_documents FOR EACH ROW EXECUTE FUNCTION :"schema".security_contract_credit_snapshot();
-- Manual profile editor cannot detach a contract or change its financial terms/schedule.
CREATE OR REPLACE FUNCTION :"schema".security_guard_contract_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
 IF OLD.contract_id IS NOT NULL AND (NEW.contract_id IS DISTINCT FROM OLD.contract_id OR NEW.monthly_gross_cents IS DISTINCT FROM OLD.monthly_gross_cents OR NEW.net_cents IS DISTINCT FROM OLD.net_cents OR NEW.vat_bps IS DISTINCT FROM OLD.vat_bps OR NEW.billing_day IS DISTINCT FROM OLD.billing_day OR NEW.tax_category IS DISTINCT FROM OLD.tax_category OR NEW.tax_reason IS DISTINCT FROM OLD.tax_reason OR NEW.next_invoice_date IS DISTINCT FROM OLD.next_invoice_date AND NEW.installment_index<>OLD.installment_index+1) THEN RAISE EXCEPTION 'Contract controls billing terms and periods' USING ERRCODE='23514';END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS subscription_contract_profile ON :"schema".subscription_billing_profiles;
CREATE TRIGGER subscription_contract_profile BEFORE UPDATE ON :"schema".subscription_billing_profiles FOR EACH ROW EXECUTE FUNCTION :"schema".security_guard_contract_profile();

CREATE OR REPLACE FUNCTION :"schema".security_prepare_subscription_invoice(p_company bigint,p_actor bigint,p_request uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE c companies;issuer_company companies;settings subscription_billing_settings;profile subscription_billing_profiles;doc subscription_documents;next_date date;last_day integer;today date:=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date;new_id bigint;tax bigint;k company_contracts;net bigint;
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
 IF profile.contract_id IS NOT NULL THEN
  SELECT * INTO k FROM company_contracts WHERE id=profile.contract_id AND company_id=c.id FOR UPDATE;
  IF NOT FOUND OR k.signed_at IS NULL OR k.contract_status IS DISTINCT FROM 'active' OR profile.installment_index>=k.contract_duration_months OR profile.next_invoice_date IS DISTINCT FROM (k.contract_start_date+make_interval(months=>profile.installment_index))::date THEN RAISE EXCEPTION 'Signed active contract and due installment required' USING ERRCODE='23514';END IF;
 END IF;
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
 IF profile.contract_id IS NOT NULL THEN
  next_date=(k.contract_start_date+make_interval(months=>profile.installment_index+1))::date;
  IF next_date>k.contract_end_date THEN RAISE EXCEPTION 'Contract period exceeded' USING ERRCODE='23514';END IF;
  net=round(profile.monthly_gross_cents::numeric*10000/(10000+profile.vat_bps))::bigint;
  tax=profile.monthly_gross_cents-net;
 ELSE net=profile.net_cents;tax=round(net::numeric*profile.vat_bps/10000)::bigint;END IF;
 new_id=nextval('subscription_documents_id_seq');
 INSERT INTO subscription_documents(id,request_id,company_id,document_number,kind,is_test,period_start,period_end,prepared_date,net_cents,vat_cents,gross_cents,vat_bps,tax_category,tax_reason,issuer,recipient,description,due_days,reminder_days,created_by,contract_id,contract_number,installment_number,contract_snapshot)
 VALUES(new_id,p_request,c.id,CASE WHEN c.is_test THEN 'DEMO-' ELSE '' END||settings.invoice_prefix||'-'||extract(year FROM today)::text||'-'||lpad(new_id::text,greatest(8,length(new_id::text)),'0'),'invoice',c.is_test,profile.next_invoice_date,next_date-1,today,net,tax,net+tax,profile.vat_bps,profile.tax_category,profile.tax_reason,
 jsonb_build_object('id',issuer_company.id,'name',issuer_company.name,'address',issuer_company.address,'vat_number',issuer_company.vat_number,'kbo_number',issuer_company.kbo_number,'email',issuer_company.email),
 jsonb_build_object('name',c.name,'address',c.address,'vat_number',c.vat_number,'kbo_number',c.kbo_number,'email',profile.billing_email,'language',profile.language),
 'JOUW DRIVER monthly platform subscription',profile.due_days,profile.reminder_days,p_actor,k.id,k.contract_number,CASE WHEN k.id IS NOT NULL THEN profile.installment_index+1 END,CASE WHEN k.id IS NOT NULL THEN jsonb_build_object('contract_number',k.contract_number,'start_date',k.contract_start_date,'end_date',k.contract_end_date,'monthly_gross_cents',profile.monthly_gross_cents,'vat_bps',profile.vat_bps,'installments',k.contract_duration_months) END) RETURNING * INTO doc;
 UPDATE subscription_billing_profiles SET next_invoice_date=next_date,installment_index=installment_index+CASE WHEN contract_id IS NOT NULL THEN 1 ELSE 0 END,enabled=CASE WHEN contract_id IS NOT NULL AND installment_index+1>=k.contract_duration_months THEN false ELSE enabled END,updated_at=clock_timestamp() WHERE company_id=c.id;
 INSERT INTO subscription_billing_events(company_id,document_id,actor_id,action) VALUES(c.id,doc.id,p_actor,'prepared');
 RETURN to_jsonb(doc);
END $$;

REVOKE ALL ON FUNCTION :"schema".security_submit_company_subscription(uuid,text,jsonb), :"schema".security_review_company_subscription(uuid,text,text,bigint,text,date,date), :"schema".security_activate_contract_billing(bigint,bigint,bigint), :"schema".security_sign_company_contract(bigint,bigint,bigint,uuid,text,text,text,text,timestamptz), :"schema".security_preserve_signed_contract(), :"schema".security_contract_credit_snapshot(), :"schema".security_guard_contract_profile() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_submit_company_subscription(uuid,text,jsonb), :"schema".security_review_company_subscription(uuid,text,text,bigint,text,date,date), :"schema".security_activate_contract_billing(bigint,bigint,bigint), :"schema".security_sign_company_contract(bigint,bigint,bigint,uuid,text,text,text,text,timestamptz), :"schema".security_preserve_signed_contract(), :"schema".security_contract_credit_snapshot(), :"schema".security_guard_contract_profile() TO :"admin_role";
COMMIT;
