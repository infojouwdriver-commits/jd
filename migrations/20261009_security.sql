-- Run on staging first: psql "$DATABASE_URL" -v schema=your_schema -v admin_role=your_server_role -f migrations/20261009_security.sql
-- No sample credentials. This is additive and does not delete business records.
BEGIN;
ALTER TABLE :"schema".companies ALTER COLUMN chiron_test_client_secret TYPE text, ALTER COLUMN chiron_prod_client_secret TYPE text;
ALTER TABLE :"schema".chiron_settings ALTER COLUMN client_secret TYPE text;
ALTER TABLE :"schema".user_passcode ADD COLUMN IF NOT EXISTS security_purpose text;
ALTER TABLE :"schema".users ADD COLUMN IF NOT EXISTS security_revoked_before timestamptz;
CREATE TABLE IF NOT EXISTS :"schema".security_rate_limits (
  bucket_key text PRIMARY KEY, window_start timestamptz NOT NULL, attempts integer NOT NULL
);
ALTER TABLE :"schema".security_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON :"schema".security_rate_limits FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON :"schema".security_rate_limits TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_rate_limit(p_key text, p_limit integer)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema", pg_catalog AS $$
DECLARE count_now integer;
BEGIN
  IF p_key !~ '^[a-f0-9]{64}$' OR p_limit NOT BETWEEN 1 AND 1000 THEN RETURN false; END IF;
  INSERT INTO security_rate_limits(bucket_key, window_start, attempts)
  VALUES(p_key, date_trunc('minute', clock_timestamp()), 1)
  ON CONFLICT(bucket_key) DO UPDATE SET
    attempts = CASE WHEN security_rate_limits.window_start = excluded.window_start THEN security_rate_limits.attempts + 1 ELSE 1 END,
    window_start = excluded.window_start
  RETURNING attempts INTO count_now;
  RETURN count_now <= p_limit;
END $$;
REVOKE ALL ON FUNCTION :"schema".security_rate_limit(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_rate_limit(text, integer) TO :"admin_role";
-- Compare-and-swap avoids simultaneous replay of refresh tokens and verification codes.
CREATE OR REPLACE FUNCTION :"schema".security_claim_refresh(p_id bigint)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema", pg_catalog AS $$
DECLARE claimed_id bigint;
BEGIN
 UPDATE refresh_tokens SET revoked = true WHERE id = p_id AND revoked = false AND expires_at > clock_timestamp() RETURNING id INTO claimed_id;
 RETURN claimed_id IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION :"schema".security_claim_refresh(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_claim_refresh(bigint) TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_claim_passcode(p_id bigint)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema", pg_catalog AS $$
DECLARE claimed_id bigint;
BEGIN
 UPDATE user_passcode SET revoked = true WHERE id = p_id AND revoked = false AND valid_until > clock_timestamp() RETURNING id INTO claimed_id;
 RETURN claimed_id IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION :"schema".security_claim_passcode(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_claim_passcode(bigint) TO :"admin_role";
COMMIT;
-- Scheduled maintenance: DELETE FROM your_schema.security_rate_limits WHERE window_start < now() - interval '1 day';
-- Configure PostgREST JWT audience 'jouw-driver'; block direct public access to PostgREST.
