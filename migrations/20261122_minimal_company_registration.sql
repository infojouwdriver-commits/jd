-- Permit registrations before official vehicle or licence details are available.
BEGIN;
ALTER TABLE :"schema".vehicles ALTER COLUMN plate_number DROP NOT NULL, ALTER COLUMN vin DROP NOT NULL;
ALTER TABLE :"schema".drivers ALTER COLUMN driver_license DROP NOT NULL;
ALTER TABLE :"schema".drivers ADD COLUMN IF NOT EXISTS bestuurderspas_unverified boolean
 GENERATED ALWAYS AS (coalesce(regexp_replace(bestuurderspas_number, '[[:space:]-]+', '', 'g') = '12345', false)) STORED;
ALTER TABLE :"schema".company_registrations ADD COLUMN IF NOT EXISTS bestuurderspas_unverified boolean
 GENERATED ALWAYS AS (coalesce(regexp_replace(bestuurderspas, '[[:space:]-]+', '', 'g') = '12345', false)) STORED;
CREATE OR REPLACE FUNCTION :"schema".security_shift_document_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = :"schema",pg_catalog AS $$
DECLARE c jsonb; d jsonb; v jsonb; driver_card text;
BEGIN
 IF nullif(btrim(NEW.plate_number),'') IS NULL THEN
  RAISE EXCEPTION 'Select an active company vehicle' USING ERRCODE='22023';
 END IF;
 SELECT to_jsonb(x) INTO c FROM companies x WHERE id=NEW.company_id;
 SELECT to_jsonb(x) INTO d FROM drivers x WHERE id=NEW.driver_id AND user_id=NEW.user_id;
 SELECT to_jsonb(x) INTO v FROM vehicles x WHERE id=NEW.vehicle_id AND company_id=NEW.company_id;
 driver_card=coalesce(nullif(d->>'bestuurderspas_number',''),d->>'capacity_certificate_number');
 IF regexp_replace(driver_card,'[[:space:]-]+','','g')='12345' THEN driver_card=NULL; END IF;
 NEW.document_profile=jsonb_build_object('company_address',c->>'address','company_phone',c->>'phone','company_email',c->>'email',
  'company_vat',c->>'vat_number','company_kbo',c->>'kbo_number','driver_card',driver_card,'vehicle_code',v->>'chiron_vehicle_id');
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION :"schema".security_shift_document_profile() FROM PUBLIC, :"user_role";
COMMIT;
