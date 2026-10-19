-- New email proofs only; historical onboarding and signed/financial records are untouched.
BEGIN;
SET LOCAL lock_timeout='5s';
ALTER TABLE :"schema".company_registrations ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;
CREATE OR REPLACE FUNCTION :"schema".security_attempt_email_code(p_object text,p_purpose text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE c user_passcode;
BEGIN
 IF p_purpose<>'reset-password' AND p_purpose !~ '^company-registration:[a-f0-9-]{36}$' THEN RAISE EXCEPTION 'Invalid purpose' USING ERRCODE='22023';END IF;
 SELECT * INTO c FROM user_passcode WHERE pass_object=p_object AND security_purpose=p_purpose ORDER BY id DESC LIMIT 1 FOR UPDATE;
 IF c.id IS NULL OR c.revoked IS DISTINCT FROM false OR c.valid_until IS NULL OR c.valid_until<=clock_timestamp() OR coalesce(c.retry_count,0)>=5 THEN RETURN NULL;END IF;
 UPDATE user_passcode SET retry_count=coalesce(retry_count,0)+1 WHERE id=c.id;
 RETURN jsonb_build_object('id',c.id,'passcode',c.passcode);
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_submit_verified_company_subscription(p_request uuid,p_fingerprint text,p_data jsonb,p_code_id bigint,p_code_hash text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE c user_passcode;r company_registrations;result jsonb;
BEGIN
 PERFORM pg_advisory_xact_lock(728031701);
 SELECT * INTO r FROM company_registrations WHERE request_id=p_request;
 IF FOUND THEN
  IF r.fingerprint IS DISTINCT FROM p_fingerprint THEN RAISE EXCEPTION 'Conflicting request' USING ERRCODE='23505';END IF;
  RETURN jsonb_build_object('request_id',r.request_id,'status',r.status);
 END IF;
 SELECT * INTO c FROM user_passcode WHERE id=p_code_id FOR UPDATE;
 IF c.id IS NULL OR c.pass_object IS DISTINCT FROM p_data->'company'->>'email' OR c.security_purpose IS DISTINCT FROM 'company-registration:'||p_request::text
 OR c.passcode IS DISTINCT FROM p_code_hash OR p_code_hash IS NULL OR c.revoked IS DISTINCT FROM false OR c.valid_until IS NULL OR c.valid_until<=clock_timestamp() OR coalesce(c.retry_count,0)>5
 OR EXISTS(SELECT FROM user_passcode WHERE pass_object=c.pass_object AND security_purpose=c.security_purpose AND id>c.id)
 THEN RAISE EXCEPTION 'Email confirmation required' USING ERRCODE='42501';END IF;
 UPDATE user_passcode SET revoked=true WHERE id=c.id;
 result=security_submit_company_subscription(p_request,p_fingerprint,p_data);
 UPDATE company_registrations SET email_verified_at=clock_timestamp() WHERE request_id=p_request;
 RETURN result;
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_reset_email_password(p_email text,p_code_id bigint,p_code_hash text,p_password text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE c user_passcode;u users;
BEGIN
 SELECT * INTO c FROM user_passcode WHERE id=p_code_id FOR UPDATE;
 SELECT * INTO u FROM users WHERE email=p_email FOR UPDATE;
 IF c.id IS NULL OR u.id IS NULL OR u.is_active IS DISTINCT FROM true OR u.auth_provider='google'
 OR c.pass_object IS DISTINCT FROM p_email OR c.security_purpose IS DISTINCT FROM 'reset-password' OR c.passcode IS DISTINCT FROM p_code_hash OR p_code_hash IS NULL
 OR c.revoked IS DISTINCT FROM false OR c.valid_until IS NULL OR c.valid_until<=clock_timestamp() OR coalesce(c.retry_count,0)>5
 OR EXISTS(SELECT FROM user_passcode WHERE pass_object=c.pass_object AND security_purpose=c.security_purpose AND id>c.id)
 OR p_password IS NULL OR p_password !~ '^\$2[aby]\$12\$' THEN RETURN false;END IF;
 UPDATE user_passcode SET revoked=true WHERE id=c.id;
 UPDATE users SET password=p_password,security_revoked_before=clock_timestamp(),updated_at=clock_timestamp() WHERE id=u.id;
 UPDATE refresh_tokens SET revoked=true WHERE user_id=u.id;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION :"schema".security_attempt_email_code(text,text),:"schema".security_submit_verified_company_subscription(uuid,text,jsonb,bigint,text),:"schema".security_reset_email_password(text,bigint,text,text) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_attempt_email_code(text,text),:"schema".security_submit_verified_company_subscription(uuid,text,jsonb,bigint,text),:"schema".security_reset_email_password(text,bigint,text,text) TO :"admin_role";
COMMIT;
