BEGIN;
ALTER TABLE :"schema".refresh_tokens ADD COLUMN IF NOT EXISTS mfa_verified boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS :"schema".security_mfa_claims(user_id bigint NOT NULL,step bigint NOT NULL,PRIMARY KEY(user_id,step));
ALTER TABLE :"schema".security_mfa_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON :"schema".security_mfa_claims FROM PUBLIC;
GRANT SELECT,INSERT,DELETE ON :"schema".security_mfa_claims TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_claim_mfa(p_user_id bigint,p_step bigint)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE claimed bigint;
BEGIN
 IF abs(p_step-floor(extract(epoch FROM clock_timestamp())/30)::bigint)>1 THEN RETURN false; END IF;
 INSERT INTO security_mfa_claims(user_id,step) VALUES(p_user_id,p_step) ON CONFLICT DO NOTHING RETURNING step INTO claimed;
 DELETE FROM security_mfa_claims WHERE step<floor(extract(epoch FROM clock_timestamp())/30)::bigint-3;
 RETURN claimed IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION :"schema".security_claim_mfa(bigint,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_claim_mfa(bigint,bigint) TO :"admin_role";
COMMIT;
