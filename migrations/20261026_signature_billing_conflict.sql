-- Save explicit owner consent without replacing an existing financial schedule.
-- No stored document, signature, profile, payment or Stripe authorization is migrated.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE OR REPLACE FUNCTION :"schema".security_email_contract(p_action text,p_company bigint,p_contract bigint,p_actor bigint,p_request uuid,p_email text,p_expected timestamptz,p_digest text,p_expires timestamptz,p_name text,p_position text,p_ip text,p_agent text,p_consent text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE c companies;k company_contracts;u users;prior contract_signatures;profile subscription_billing_profiles;first_invoice jsonb;result jsonb;
BEGIN
 IF p_action IS NULL OR p_action NOT IN('review','sign') OR p_request IS NULL OR p_expires IS NULL OR p_expires<=clock_timestamp() OR p_expires>clock_timestamp()+interval '73 hours' THEN RAISE EXCEPTION 'Invitation unavailable' USING ERRCODE='23514';END IF;
 SELECT * INTO c FROM companies WHERE id=p_company FOR UPDATE;
 SELECT * INTO k FROM company_contracts WHERE id=p_contract AND company_id=p_company FOR UPDATE;
 IF c.id IS NULL OR k.id IS NULL OR c.archived_at IS NOT NULL OR c.subscription_status IS DISTINCT FROM 'active' THEN RAISE EXCEPTION 'Invitation unavailable' USING ERRCODE='23514';END IF;
 SELECT * INTO u FROM users WHERE id=p_actor AND is_active AND lower(trim(email))=p_email FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invitation unavailable' USING ERRCODE='23514';END IF;
 PERFORM 1 FROM company_users WHERE company_id=p_company AND user_id=p_actor AND is_active AND role IN('owner','portal_owner') FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invitation unavailable' USING ERRCODE='23514';END IF;
 IF p_digest IS NULL OR p_digest IS DISTINCT FROM encode(sha256(convert_to(k.contract_html_template,'UTF8')),'hex') THEN RAISE EXCEPTION 'Contract changed; request a new invitation' USING ERRCODE='23514';END IF;
 SELECT * INTO prior FROM contract_signatures WHERE request_id=p_request;
 IF FOUND THEN
  IF prior.contract_id<>k.id OR prior.company_id<>c.id OR prior.signature_method IS DISTINCT FROM 'email_link' OR prior.signer_email IS DISTINCT FROM p_email OR (p_action='sign' AND (prior.signer_name IS DISTINCT FROM trim(p_name) OR prior.signer_position IS DISTINCT FROM nullif(trim(p_position),''))) THEN RAISE EXCEPTION 'Invitation conflict' USING ERRCODE='23514';END IF;
 ELSE
  IF k.updated_at IS DISTINCT FROM p_expected OR k.contract_status IS DISTINCT FROM 'pending_signature' OR k.signed_at IS NOT NULL OR k.contract_end_date IS NULL OR k.contract_end_date<=(clock_timestamp() AT TIME ZONE 'Europe/Brussels')::date THEN RAISE EXCEPTION 'Contract unavailable; request a new invitation' USING ERRCODE='23514';END IF;
  IF p_action='sign' THEN
   IF coalesce(length(trim(p_name)),0) NOT BETWEEN 2 AND 160 OR coalesce(length(trim(p_position)),0) NOT BETWEEN 2 AND 120 OR coalesce(length(p_consent),0) NOT BETWEEN 20 AND 2000 OR coalesce(length(p_ip),0)>128 OR coalesce(length(p_agent),0)>1000 THEN RAISE EXCEPTION 'Signature details required' USING ERRCODE='22023';END IF;
   SELECT * INTO profile FROM subscription_billing_profiles WHERE company_id=p_company FOR UPDATE;
   INSERT INTO contract_signatures(request_id,contract_id,company_id,signer_name,signer_email,signer_position,signature_ip,signature_user_agent,signed_at,signature_method,is_verified,email_link_evidence)
   VALUES(p_request,k.id,c.id,trim(p_name),p_email,trim(p_position),p_ip,p_agent,clock_timestamp(),'email_link',false,jsonb_build_object('version',1,'contract_sha256',p_digest,'reviewed_revision',p_expected,'invitation_expires',p_expires,'recipient_user_id',p_actor,'consent',p_consent,'assurance','simple_email_link')) RETURNING * INTO prior;
   UPDATE company_contracts SET contract_status='active',signed_at=prior.signed_at,signer_ip=p_ip,signer_user_agent=p_agent,updated_at=clock_timestamp() WHERE id=k.id;
   IF profile.company_id IS NULL THEN PERFORM security_activate_contract_billing(c.id,k.id,p_actor);
   ELSIF profile.contract_id=k.id THEN UPDATE subscription_billing_profiles SET enabled=true,updated_at=clock_timestamp() WHERE company_id=c.id;
   ELSE INSERT INTO subscription_billing_events(company_id,actor_id,action,metadata) VALUES(c.id,p_actor,'contract_billing_review_required',jsonb_build_object('contract_id',k.id,'existing_contract_id',profile.contract_id));END IF;
   UPDATE companies SET current_contract_id=k.id,updated_at=clock_timestamp() WHERE id=c.id;
   IF profile.company_id IS NULL OR profile.contract_id=k.id THEN
    BEGIN first_invoice=security_prepare_subscription_invoice(c.id,p_actor,gen_random_uuid());EXCEPTION WHEN check_violation THEN first_invoice=NULL;END;
   END IF;
   INSERT INTO subscription_billing_events(company_id,actor_id,action,metadata) VALUES(c.id,p_actor,'contract_signed',jsonb_build_object('contract_id',k.id,'method','email_link'));
  END IF;
 END IF;
 SELECT * INTO profile FROM subscription_billing_profiles WHERE company_id=p_company;
 result=jsonb_build_object('contract',jsonb_build_object('id',k.id,'contract_number',k.contract_number,'contract_html_template',k.contract_html_template,'contract_language',k.contract_language,'monthly_fee',k.monthly_fee,'annual_fee',k.annual_fee,'contract_start_date',k.contract_start_date,'contract_end_date',k.contract_end_date),'company',jsonb_build_object('name',c.name,'email',p_email),'signed',prior.id IS NOT NULL,'billing_status',CASE WHEN prior.id IS NULL THEN 'awaiting_signature' WHEN profile.contract_id=k.id THEN 'linked' ELSE 'review_required' END,'digest',p_digest);
 IF prior.id IS NOT NULL THEN result=result||jsonb_build_object('evidence',jsonb_build_object('signer_name',prior.signer_name,'signer_email',prior.signer_email,'signer_position',prior.signer_position,'signed_at',prior.signed_at,'signature_ip',prior.signature_ip,'consent',prior.email_link_evidence->>'consent'));END IF;
 RETURN result;
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
 INSERT INTO contract_signatures(request_id,contract_id,company_id,signer_name,signer_email,signer_position,signature_ip,signature_user_agent,signed_at,signature_method,is_verified)
 VALUES(p_request,k.id,p_company,trim(p_name),u.email,nullif(trim(p_position),''),p_ip,p_agent,clock_timestamp(),'authenticated_owner',true);
 UPDATE company_contracts SET contract_status='active',signed_at=clock_timestamp(),signer_ip=p_ip,signer_user_agent=p_agent,updated_at=clock_timestamp() WHERE id=k.id;
 IF profile.company_id IS NULL THEN
  PERFORM security_activate_contract_billing(p_company,k.id,p_actor);
 ELSIF profile.contract_id=k.id THEN
  UPDATE subscription_billing_profiles SET enabled=true,updated_at=clock_timestamp() WHERE company_id=p_company;
 ELSE
  INSERT INTO subscription_billing_events(company_id,actor_id,action,metadata) VALUES(p_company,p_actor,'contract_billing_review_required',jsonb_build_object('contract_id',k.id,'existing_contract_id',profile.contract_id));
 END IF;
 UPDATE companies SET current_contract_id=k.id,updated_at=clock_timestamp() WHERE id=p_company;
 -- Preparation has no delivery/payment side effect. Missing legal issuer never fabricates an invoice.
 IF profile.company_id IS NULL OR profile.contract_id=k.id THEN
  BEGIN first_invoice=security_prepare_subscription_invoice(p_company,p_actor,gen_random_uuid());
  EXCEPTION WHEN check_violation THEN first_invoice=NULL;END;
 END IF;
 INSERT INTO subscription_billing_events(company_id,actor_id,action,metadata) VALUES(p_company,p_actor,'contract_signed',jsonb_build_object('contract_id',k.id));
 RETURN jsonb_build_object('contract_id',k.id,'signed',true,'first_document_id',first_invoice->'id');
END $$;

REVOKE ALL ON FUNCTION :"schema".security_email_contract(text,bigint,bigint,bigint,uuid,text,timestamptz,text,timestamptz,text,text,text,text,text), :"schema".security_sign_company_contract(bigint,bigint,bigint,uuid,text,text,text,text,timestamptz) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_email_contract(text,bigint,bigint,bigint,uuid,text,timestamptz,text,timestamptz,text,text,text,text,text), :"schema".security_sign_company_contract(bigint,bigint,bigint,uuid,text,text,text,text,timestamptz) TO :"admin_role";
COMMIT;
