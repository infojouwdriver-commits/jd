-- Pending onboarding is atomic; it never attaches to or changes an existing tenant.
BEGIN;
ALTER TABLE :"schema".users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
CREATE TABLE IF NOT EXISTS :"schema".company_registrations (
 request_id uuid PRIMARY KEY,fingerprint text NOT NULL,company_id bigint NOT NULL REFERENCES :"schema".companies(id),driver_id bigint NOT NULL REFERENCES :"schema".drivers(id),vehicle_id bigint NOT NULL REFERENCES :"schema".vehicles(id),manager_user_id bigint NOT NULL REFERENCES :"schema".users(id),driver_user_id bigint NOT NULL REFERENCES :"schema".users(id),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN('pending','approved','rejected')),submitted_at timestamptz NOT NULL DEFAULT clock_timestamp(),reviewed_at timestamptz,reviewed_by bigint REFERENCES :"schema".users(id),review_notes text,
 company_name text,company_email text,company_phone text,vat_number text,kbo_number text,company_address text,driver_name text,driver_phone text,driver_license text,bestuurderspas text,plate_number text,vehicle_brand text,vehicle_model text,vin text,language text,test_configured boolean NOT NULL,production_configured boolean NOT NULL
);
CREATE INDEX IF NOT EXISTS company_registrations_status_time ON :"schema".company_registrations(status,submitted_at DESC);
ALTER TABLE :"schema".company_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".company_registrations;
CREATE POLICY server_service_access ON :"schema".company_registrations TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".company_registrations FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".company_registrations TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_submit_company_registration(p_request uuid,p_fingerprint text,p_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE prior company_registrations;c companies;v vehicles;d drivers;manager_id bigint;driver_uid bigint;
 co jsonb:=p_data->'company';ve jsonb:=p_data->'vehicle';dr jsonb:=p_data->'driver';contact_email text:=co->>'email';phone text:=dr->>'phone';digits text:=regexp_replace(phone,'[^0-9]','','g');
BEGIN
 -- Serialize all registrations so different request IDs cannot race to claim one identity.
 PERFORM pg_advisory_xact_lock(728031701);
 SELECT * INTO prior FROM company_registrations WHERE request_id=p_request;
 IF FOUND THEN
  IF prior.fingerprint IS DISTINCT FROM p_fingerprint THEN RAISE EXCEPTION 'Conflicting request' USING ERRCODE='23505';END IF;
  RETURN jsonb_build_object('request_id',prior.request_id,'status',prior.status);
 END IF;
 IF p_fingerprint !~ '^[a-f0-9]{64}$' OR co->>'chiron_test_client_secret' NOT LIKE 'enc:v1:%'
 OR (co->>'chiron_prod_client_secret'<>'' AND co->>'chiron_prod_client_secret' NOT LIKE 'enc:v1:%')
 OR p_data->>'manager_hash' NOT LIKE '$2%' OR p_data->>'driver_hash' NOT LIKE '$2%' OR nullif(p_data->>'user_role','') IS NULL
 THEN RAISE EXCEPTION 'Invalid protected registration' USING ERRCODE='22023';END IF;
 IF contact_email=digits||'@driver.local' OR EXISTS(SELECT FROM companies WHERE upper(regexp_replace(vat_number,'[ .-]','','g'))=co->>'vat_number' OR regexp_replace(kbo_number,'[ .-]','','g')=co->>'kbo_number')
 OR EXISTS(SELECT FROM users WHERE lower(users.email)=contact_email OR users.email=digits||'@driver.local')
 OR EXISTS(SELECT FROM vehicles WHERE upper(regexp_replace(plate_number,'\s','','g'))=ve->>'plate_number' OR upper(vin)=ve->>'vin')
 OR EXISTS(SELECT FROM drivers WHERE regexp_replace(drivers.phone,'[^0-9]','','g') IN(digits,'00'||digits,CASE WHEN left(digits,2)='32' THEN '0'||substring(digits FROM 3) ELSE digits END))
 THEN RAISE EXCEPTION 'Registration identity already exists' USING ERRCODE='23505';END IF;
 INSERT INTO companies(name,email,phone,address,vat_number,kbo_number,subscription_status,chiron_mode,chiron_test_client_id,chiron_test_client_secret,chiron_prod_client_id,chiron_prod_client_secret)
 VALUES(co->>'name',contact_email,co->>'phone',co->>'address',co->>'vat_number',co->>'kbo_number','pending_approval','TEST',co->>'chiron_test_client_id',co->>'chiron_test_client_secret',nullif(co->>'chiron_prod_client_id',''),nullif(co->>'chiron_prod_client_secret','')) RETURNING * INTO c;
 INSERT INTO users(email,password,role,user_type,display_name,is_active) VALUES(contact_email,p_data->>'manager_hash',p_data->>'user_role','manager',c.name,false) RETURNING id INTO manager_id;
 INSERT INTO company_users(company_id,user_id,role) VALUES(c.id,manager_id,'portal_owner');
 INSERT INTO users(email,password,role,user_type,display_name,is_active) VALUES(digits||'@driver.local',p_data->>'driver_hash',p_data->>'user_role','driver',dr->>'full_name',false) RETURNING id INTO driver_uid;
 INSERT INTO vehicles(company_id,brand,model,plate_number,vin,chiron_vehicle_id,status,documents) VALUES(c.id,ve->>'brand',ve->>'model',ve->>'plate_number',ve->>'vin',nullif(ve->>'chiron_vehicle_id',''),'inactive','[]'::jsonb) RETURNING * INTO v;
 INSERT INTO drivers(user_id,company_id,full_name,phone,driver_license,bestuurderspas_number,preferred_language,registration_status,registration_submitted_at,status,assigned_vehicle_id)
 VALUES(driver_uid,c.id,dr->>'full_name',phone,dr->>'driver_license',dr->>'bestuurderspas_number',dr->>'preferred_language','pending',clock_timestamp(),'inactive',v.id) RETURNING * INTO d;
 INSERT INTO driver_credentials(driver_id,phone,password_hash,is_active,vehicle_id,company_id,preferred_language) VALUES(d.id,phone,p_data->>'driver_hash',false,v.id,c.id,dr->>'preferred_language');
 INSERT INTO company_registrations(request_id,fingerprint,company_id,driver_id,vehicle_id,manager_user_id,driver_user_id,company_name,company_email,company_phone,vat_number,kbo_number,company_address,driver_name,driver_phone,driver_license,bestuurderspas,plate_number,vehicle_brand,vehicle_model,vin,language,test_configured,production_configured)
 VALUES(p_request,p_fingerprint,c.id,d.id,v.id,manager_id,driver_uid,c.name,contact_email,c.phone,c.vat_number,c.kbo_number,c.address,d.full_name,phone,d.driver_license,d.bestuurderspas_number,v.plate_number,v.brand,v.model,v.vin,dr->>'preferred_language',true,nullif(co->>'chiron_prod_client_secret','') IS NOT NULL);
 RETURN jsonb_build_object('request_id',p_request,'status','pending');
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_review_company_registration(p_request uuid,p_action text,p_notes text,p_reviewer bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE r company_registrations;approved boolean:=p_action='approve';state text:=CASE WHEN approved THEN 'approved' ELSE 'rejected' END;
BEGIN
 IF p_action NOT IN('approve','reject') OR p_reviewer IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_reviewer) OR length(p_notes)>1000 OR (NOT approved AND coalesce(length(trim(p_notes)),0)=0) THEN RAISE EXCEPTION 'Invalid review' USING ERRCODE='22023'; END IF;
 SELECT * INTO r FROM company_registrations WHERE request_id=p_request FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Request missing' USING ERRCODE='P0002';END IF;
 IF r.status=state THEN RETURN jsonb_build_object('request_id',r.request_id,'status',r.status);END IF;
 IF r.status<>'pending' THEN RAISE EXCEPTION 'Request already reviewed' USING ERRCODE='40001';END IF;
 -- Lock dependent records before validating ownership and activation state.
 PERFORM 1 FROM companies WHERE id=r.company_id FOR UPDATE;
 PERFORM 1 FROM drivers WHERE id=r.driver_id FOR UPDATE;
 PERFORM 1 FROM vehicles WHERE id=r.vehicle_id FOR UPDATE;
 PERFORM 1 FROM users WHERE id IN(r.manager_user_id,r.driver_user_id) ORDER BY id FOR UPDATE;
 PERFORM 1 FROM company_users WHERE company_id=r.company_id AND user_id=r.manager_user_id FOR UPDATE;
 PERFORM 1 FROM driver_credentials WHERE driver_id=r.driver_id FOR UPDATE;
 -- A changed assignment is a conflict, never authority to activate unrelated records.
 IF NOT EXISTS(SELECT FROM drivers WHERE id=r.driver_id AND company_id=r.company_id AND user_id=r.driver_user_id AND assigned_vehicle_id=r.vehicle_id AND status='inactive')
 OR NOT EXISTS(SELECT FROM vehicles WHERE id=r.vehicle_id AND company_id=r.company_id AND status='inactive')
 OR NOT EXISTS(SELECT FROM company_users WHERE company_id=r.company_id AND user_id=r.manager_user_id AND role='portal_owner')
 OR NOT EXISTS(SELECT FROM companies WHERE id=r.company_id AND subscription_status='pending_approval')
 OR (SELECT count(*) FROM users WHERE id IN(r.manager_user_id,r.driver_user_id) AND is_active=false)<>2
 OR NOT EXISTS(SELECT FROM driver_credentials WHERE driver_id=r.driver_id AND company_id=r.company_id AND vehicle_id=r.vehicle_id AND is_active=false)
 THEN RAISE EXCEPTION 'Onboarding records changed' USING ERRCODE='40001';END IF;
 UPDATE companies SET subscription_status=CASE WHEN approved THEN 'active' ELSE 'rejected' END,updated_at=clock_timestamp() WHERE id=r.company_id;
 UPDATE vehicles SET status=CASE WHEN approved THEN 'active' ELSE 'inactive' END,updated_at=clock_timestamp() WHERE id=r.vehicle_id;
 UPDATE drivers SET status=CASE WHEN approved THEN 'active' ELSE 'inactive' END,registration_status=state,registration_reviewed_at=clock_timestamp(),registration_reviewed_by=p_reviewer,registration_rejection_reason=CASE WHEN approved THEN NULL ELSE p_notes END,current_vehicle_id=CASE WHEN approved THEN r.vehicle_id ELSE NULL END,updated_at=clock_timestamp() WHERE id=r.driver_id;
 UPDATE driver_credentials SET is_active=approved,updated_at=clock_timestamp() WHERE driver_id=r.driver_id AND company_id=r.company_id AND vehicle_id=r.vehicle_id;
 UPDATE users SET is_active=approved,updated_at=clock_timestamp() WHERE id IN(r.manager_user_id,r.driver_user_id);
 UPDATE company_registrations SET status=state,reviewed_at=clock_timestamp(),reviewed_by=p_reviewer,review_notes=nullif(p_notes,'') WHERE request_id=p_request;
 -- Subscription approval never switches Chiron to production or fabricates payment.
 RETURN jsonb_build_object('request_id',p_request,'status',state);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_submit_company_registration(uuid,text,jsonb), :"schema".security_review_company_registration(uuid,text,text,bigint) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_submit_company_registration(uuid,text,jsonb), :"schema".security_review_company_registration(uuid,text,text,bigint) TO :"admin_role";
COMMIT;
