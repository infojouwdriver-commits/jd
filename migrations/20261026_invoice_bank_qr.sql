-- New payment instructions are snapshotted once; historical documents are not rewritten.
BEGIN;
SET LOCAL lock_timeout='5s';
ALTER TABLE :"schema".subscription_billing_settings ADD COLUMN IF NOT EXISTS collection_iban text;
ALTER TABLE :"schema".subscription_billing_settings ADD COLUMN IF NOT EXISTS collection_issuer_id bigint REFERENCES :"schema".companies(id);
ALTER TABLE :"schema".subscription_documents ADD COLUMN IF NOT EXISTS bank_payment jsonb;
ALTER TABLE :"schema".manual_invoices ADD COLUMN IF NOT EXISTS bank_payment jsonb;
CREATE OR REPLACE FUNCTION :"schema".security_snapshot_invoice_bank()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE settings subscription_billing_settings;account text;holder text;
BEGIN
 NEW.bank_payment=NULL;
 IF NEW.is_test OR NEW.kind IS DISTINCT FROM 'invoice' OR NEW.currency IS DISTINCT FROM 'EUR' THEN RETURN NEW;END IF;
 SELECT * INTO settings FROM subscription_billing_settings WHERE id=1 FOR SHARE;
 IF settings.collection_issuer_id=settings.issuer_company_id AND NEW.issuer->>'id'=settings.collection_issuer_id::text THEN
  account=settings.collection_iban;
 ELSE account=NEW.issuer->>'bank_account_iban';END IF;
 holder=coalesce(nullif(trim(NEW.issuer->>'bank_account_holder'),''),trim(NEW.issuer->>'name'));
 account=upper(regexp_replace(coalesce(account,''),'\s','','g'));
 IF account<>'' AND coalesce(length(holder),0) BETWEEN 1 AND 70 AND holder!~'[\r\n]' THEN
  NEW.bank_payment=jsonb_build_object('version',1,'iban',account,'holder',holder,'reference',NEW.document_number);
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS invoice_bank_snapshot ON :"schema".subscription_documents;
CREATE TRIGGER invoice_bank_snapshot BEFORE INSERT ON :"schema".subscription_documents FOR EACH ROW EXECUTE FUNCTION :"schema".security_snapshot_invoice_bank();
DROP TRIGGER IF EXISTS invoice_bank_snapshot ON :"schema".manual_invoices;
CREATE TRIGGER invoice_bank_snapshot BEFORE INSERT ON :"schema".manual_invoices FOR EACH ROW EXECUTE FUNCTION :"schema".security_snapshot_invoice_bank();
REVOKE ALL ON FUNCTION :"schema".security_snapshot_invoice_bank() FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_snapshot_invoice_bank() TO :"admin_role";
COMMIT;
