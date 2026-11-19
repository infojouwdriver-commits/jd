-- Driver work follows account activation. Invoice settlement stays in the billing ledger.
BEGIN;
SET LOCAL lock_timeout='5s';
DROP TRIGGER IF EXISTS invoice_service_guard ON :"schema".driver_shifts;
DROP TRIGGER IF EXISTS invoice_service_guard ON :"schema".trips;
COMMIT;
