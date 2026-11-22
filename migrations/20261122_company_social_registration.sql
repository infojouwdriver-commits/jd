BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE :"schema".user_oauth_providers ADD COLUMN IF NOT EXISTS
  company_registration_request_id uuid REFERENCES :"schema".company_registrations(request_id);
CREATE UNIQUE INDEX IF NOT EXISTS company_social_identity_unique
  ON :"schema".user_oauth_providers(provider,provider_user_id) WHERE company_registration_request_id IS NOT NULL;

-- Reuse the existing OAuth table, with the identity linked only to the owner
-- provisioned in this same transaction. An existing account is never linked by email.
CREATE OR REPLACE FUNCTION :"schema".security_submit_social_company_subscription(
  p_request uuid, p_fingerprint text, p_data jsonb, p_provider text, p_subject text
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE
  registration company_registrations;
  result jsonb;
BEGIN
  IF p_provider IS NULL OR p_provider NOT IN ('google','apple') OR
     p_subject IS NULL OR length(p_subject) NOT BETWEEN 1 AND 255 THEN
    RAISE EXCEPTION 'Invalid company sign-in identity' USING ERRCODE='22023';
  END IF;
  PERFORM pg_advisory_xact_lock(728031701);
  SELECT * INTO registration FROM company_registrations WHERE request_id=p_request;
  IF FOUND THEN
    IF registration.fingerprint IS DISTINCT FROM p_fingerprint OR NOT EXISTS (
      SELECT FROM user_oauth_providers WHERE provider=p_provider AND provider_user_id=p_subject
       AND user_id=registration.manager_user_id AND company_registration_request_id=p_request AND is_active
    ) THEN RAISE EXCEPTION 'Conflicting registration' USING ERRCODE='23505'; END IF;
    RETURN jsonb_build_object('request_id',registration.request_id,'status',registration.status);
  END IF;
  IF EXISTS (SELECT FROM user_oauth_providers WHERE provider=p_provider AND provider_user_id=p_subject) THEN
    RAISE EXCEPTION 'Identity already linked' USING ERRCODE='23505';
  END IF;
  result := security_submit_company_subscription(p_request,p_fingerprint,p_data);
  UPDATE company_registrations SET email_verified_at=clock_timestamp() WHERE request_id=p_request
    RETURNING * INTO registration;
  INSERT INTO user_oauth_providers(user_id,provider,provider_user_id,provider_email,is_active,company_registration_request_id)
    VALUES(registration.manager_user_id,p_provider,p_subject,registration.company_email,true,p_request);
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION :"schema".security_submit_social_company_subscription(uuid,text,jsonb,text,text) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_submit_social_company_subscription(uuid,text,jsonb,text,text) TO :"admin_role";
COMMIT;
