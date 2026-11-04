-- Roll back application code first. Keep additive columns and issued documents
-- so rollback never discards historical quotes or invalidates issued QR links.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE :"schema".companies ADD COLUMN IF NOT EXISTS tariff_profiles jsonb,
  ADD COLUMN IF NOT EXISTS tariff_revision integer NOT NULL DEFAULT 0;
ALTER TABLE :"schema".trips ADD COLUMN IF NOT EXISTS tariff_code text,
  ADD COLUMN IF NOT EXISTS tariff_settings_snapshot jsonb;
CREATE TABLE IF NOT EXISTS :"schema".company_tariff_documents (
  id uuid PRIMARY KEY,
  company_id bigint NOT NULL,
  issued_at timestamptz NOT NULL,
  snapshot jsonb NOT NULL,
  pdf_base64 text NOT NULL
);
CREATE INDEX IF NOT EXISTS company_tariff_documents_history_idx
  ON :"schema".company_tariff_documents (company_id, issued_at DESC);
ALTER TABLE :"schema".company_tariff_documents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON :"schema".company_tariff_documents FROM PUBLIC;
GRANT SELECT, INSERT ON :"schema".company_tariff_documents TO :"admin_role";
DROP POLICY IF EXISTS tariff_documents_read ON :"schema".company_tariff_documents;
CREATE POLICY tariff_documents_read ON :"schema".company_tariff_documents FOR SELECT TO :"admin_role" USING (true);
DROP POLICY IF EXISTS tariff_documents_issue ON :"schema".company_tariff_documents;
CREATE POLICY tariff_documents_issue ON :"schema".company_tariff_documents FOR INSERT TO :"admin_role" WITH CHECK (true);
CREATE OR REPLACE FUNCTION :"schema".reject_tariff_document_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  RAISE EXCEPTION 'Issued tariff documents are immutable';
END $$;
DROP TRIGGER IF EXISTS issued_tariff_document_immutable ON :"schema".company_tariff_documents;
CREATE TRIGGER issued_tariff_document_immutable BEFORE UPDATE OR DELETE ON :"schema".company_tariff_documents
FOR EACH ROW EXECUTE FUNCTION :"schema".reject_tariff_document_mutation();
NOTIFY pgrst, 'reload schema';
COMMIT;
