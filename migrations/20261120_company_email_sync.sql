BEGIN;

CREATE OR REPLACE FUNCTION :"schema".security_save_company_email(
  p_company_id bigint, p_company jsonb, p_account jsonb
)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema", pg_catalog AS $$
DECLARE
  company companies;
  saved_company jsonb;
  owner_account users;
  owner_ids bigint[];
  new_email text := nullif(lower(btrim(p_company->>'email')), '');
  new_password text := p_account->>'password';
BEGIN
  SELECT * INTO company FROM companies WHERE id = p_company_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Company missing' USING ERRCODE = 'P0002'; END IF;
  IF company.archived_at IS NOT NULL THEN RAISE EXCEPTION 'Company archived' USING ERRCODE = '23514'; END IF;

  IF jsonb_typeof(p_company->'email') NOT IN ('string', 'null') OR
    (new_email IS NOT NULL AND (length(new_email) > 254 OR new_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')) THEN
    RAISE EXCEPTION 'Invalid email' USING ERRCODE = '22023';
  END IF;
  p_company := jsonb_set(p_company, '{email}', coalesce(to_jsonb(new_email), 'null'::jsonb));

  SELECT array_agg(DISTINCT user_id) INTO owner_ids
  FROM company_users WHERE company_id = p_company_id AND role IN ('owner', 'portal_owner');
  IF owner_ids IS NOT NULL AND (cardinality(owner_ids) <> 1 OR new_email IS NULL) THEN
    RAISE EXCEPTION 'Company requires one owner and a valid login address' USING ERRCODE = '22023';
  END IF;

  IF owner_ids IS NOT NULL THEN
    SELECT * INTO owner_account FROM users WHERE id = owner_ids[1] FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Owner missing' USING ERRCODE = 'P0002'; END IF;
  END IF;
  IF owner_account.id IS NOT NULL AND (owner_account.email IS DISTINCT FROM new_email OR new_password IS NOT NULL) THEN
    IF owner_account.user_type IS DISTINCT FROM 'manager' OR EXISTS (
      SELECT FROM company_users WHERE user_id = owner_account.id AND company_id <> p_company_id
    ) THEN RAISE EXCEPTION 'Owner account requires review' USING ERRCODE = '22023'; END IF;
    IF new_password IS NOT NULL AND new_password !~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$' THEN
      RAISE EXCEPTION 'Invalid password hash' USING ERRCODE = '22023';
    END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended(new_email, 0));
    IF EXISTS (SELECT FROM users WHERE lower(btrim(email)) = new_email AND id <> owner_account.id) THEN
      RAISE EXCEPTION 'Email in use' USING ERRCODE = '23505';
    END IF;

    UPDATE users SET email = new_email, password = coalesce(new_password, password),
      security_revoked_before = clock_timestamp(), updated_at = clock_timestamp()
      WHERE id = owner_account.id;
    UPDATE refresh_tokens SET revoked = true WHERE user_id = owner_account.id;
  END IF;

  saved_company := security_save_company_account(p_company_id, p_company - 'client_name',
    CASE WHEN owner_account.id IS NULL THEN p_account ELSE '{}'::jsonb END);
  IF p_company ? 'client_name' THEN
    UPDATE companies SET client_name = p_company->>'client_name' WHERE id = p_company_id;
    saved_company := saved_company || jsonb_build_object('client_name', p_company->'client_name');
  END IF;
  IF new_email IS NOT NULL THEN
    UPDATE subscription_billing_profiles SET billing_email = new_email, updated_at = clock_timestamp()
      WHERE company_id = p_company_id AND lower(btrim(billing_email)) <> new_email
      AND lower(btrim(billing_email)) IN (lower(btrim(company.email)), lower(btrim(owner_account.email)));
  END IF;
  IF owner_account.id IS NOT NULL OR (saved_company->>'portal_login_enabled')::boolean THEN
    saved_company := saved_company || jsonb_build_object('portal_login_enabled', true, 'portal_login_email', new_email);
  END IF;
  RETURN saved_company;
END $$;

REVOKE ALL ON FUNCTION :"schema".security_save_company_email(bigint, jsonb, jsonb) FROM PUBLIC, :"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_save_company_email(bigint, jsonb, jsonb) TO :"admin_role";
COMMIT;
