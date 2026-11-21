BEGIN;

CREATE TABLE IF NOT EXISTS :"schema".admin_company_onboarding (
  actor_id bigint NOT NULL,
  request_id uuid NOT NULL,
  company_id bigint NOT NULL,
  driver_id bigint,
  vehicle_id bigint,
  PRIMARY KEY (actor_id, request_id)
);
ALTER TABLE :"schema".admin_company_onboarding ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".admin_company_onboarding;
CREATE POLICY server_service_access ON :"schema".admin_company_onboarding TO :"admin_role"
  USING (true) WITH CHECK (true);
REVOKE ALL ON :"schema".admin_company_onboarding FROM PUBLIC, :"user_role";
GRANT SELECT, INSERT ON :"schema".admin_company_onboarding TO :"admin_role";

CREATE OR REPLACE FUNCTION :"schema".security_onboard_admin_company(
  p_actor bigint, p_request uuid, p_company jsonb, p_company_account jsonb,
  p_driver jsonb, p_driver_account jsonb, p_vehicle jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema", pg_catalog AS $$
DECLARE
  receipt admin_company_onboarding;
  plate text;
  vat text;
  kbo text;
BEGIN
  IF NOT EXISTS (SELECT FROM users WHERE id = p_actor AND is_active) THEN
    RAISE EXCEPTION 'Active actor required' USING ERRCODE = '42501';
  END IF;
  IF p_request IS NULL OR (p_driver IS NULL) <> (p_vehicle IS NULL)
     OR (p_driver IS NULL) <> (p_driver_account IS NULL) THEN
    RAISE EXCEPTION 'Invalid onboarding data' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('admin-onboarding:' || p_actor || ':' || p_request, 0));
  SELECT * INTO receipt FROM admin_company_onboarding WHERE actor_id = p_actor AND request_id = p_request;
  IF NOT FOUND THEN
    vat := upper(regexp_replace(p_company->>'vat_number', '[ .-]', '', 'g'));
    kbo := regexp_replace(p_company->>'kbo_number', '[ .-]', '', 'g');
    PERFORM pg_advisory_xact_lock(hashtextextended('admin-onboarding-vat:' || vat, 0));
    PERFORM pg_advisory_xact_lock(hashtextextended('admin-onboarding-kbo:' || kbo, 0));
    IF EXISTS (SELECT FROM companies
      WHERE upper(regexp_replace(vat_number, '[ .-]', '', 'g')) = vat
         OR regexp_replace(kbo_number, '[ .-]', '', 'g') = kbo) THEN
      RAISE EXCEPTION 'Company already registered' USING ERRCODE = '23505';
    END IF;

    IF p_vehicle IS NOT NULL THEN
      plate := upper(regexp_replace(p_vehicle->>'plate_number', '[[:space:]-]', '', 'g'));
      IF coalesce(plate, '') !~ '^[A-Z0-9]{1,50}$'
         OR coalesce(btrim(p_vehicle->>'brand'), '') = ''
         OR coalesce(btrim(p_vehicle->>'model'), '') = '' THEN
        RAISE EXCEPTION 'Invalid vehicle' USING ERRCODE = '22023';
      END IF;
      PERFORM pg_advisory_xact_lock(hashtextextended('admin-onboarding-plate:' || plate, 0));
      IF EXISTS (SELECT FROM vehicles WHERE upper(regexp_replace(plate_number, '[[:space:]-]', '', 'g')) = plate) THEN
        RAISE EXCEPTION 'Vehicle already registered' USING ERRCODE = '23505';
      END IF;
    END IF;

    receipt.company_id := (security_save_admin_company(p_actor, p_company, p_company_account)->>'id')::bigint;
    IF p_vehicle IS NOT NULL THEN
      INSERT INTO vehicles (company_id, brand, model, plate_number, vin, chiron_vehicle_id, status, documents)
      VALUES (receipt.company_id, p_vehicle->>'brand', p_vehicle->>'model', plate,
        p_vehicle->>'vin', p_vehicle->>'chiron_vehicle_id', 'active', '[]'::jsonb)
      RETURNING id INTO receipt.vehicle_id;

      receipt.driver_id := (security_create_driver_account(p_driver_account, p_driver ||
        jsonb_build_object('assigned_vehicle_id', receipt.vehicle_id, 'current_vehicle_id', receipt.vehicle_id),
        receipt.company_id)->'driver'->>'id')::bigint;
    END IF;

    INSERT INTO admin_company_onboarding (actor_id, request_id, company_id, driver_id, vehicle_id)
    VALUES (p_actor, p_request, receipt.company_id, receipt.driver_id, receipt.vehicle_id);
  END IF;
  RETURN jsonb_build_object('company_id', receipt.company_id, 'driver_id', receipt.driver_id, 'vehicle_id', receipt.vehicle_id);
END;
$$;
REVOKE ALL ON FUNCTION :"schema".security_onboard_admin_company(bigint, uuid, jsonb, jsonb, jsonb, jsonb, jsonb)
  FROM PUBLIC, :"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_onboard_admin_company(bigint, uuid, jsonb, jsonb, jsonb, jsonb, jsonb)
  TO :"admin_role";
COMMIT;
