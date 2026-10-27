-- Business conflicts must not trigger PostgREST's serialization retry loop.
-- 23505 is already handled as HTTP 409 by the deployed shift endpoint.
-- Replace only the three shift functions; preserve their owners and ACLs.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='15s';
SET LOCAL search_path=:"schema",pg_catalog;
DO $$
DECLARE f record; changed text;
BEGIN
 FOR f IN SELECT p.oid,pg_get_functiondef(p.oid) definition
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname=current_schema() AND p.proname IN
 ('security_record_driver_shift','security_shift_status','security_guard_shift_work')
 LOOP
  changed=replace(f.definition,'''40001''','''23505''');
  IF changed<>f.definition THEN EXECUTE changed; END IF;
 END LOOP;
END $$;
NOTIFY pgrst,'reload schema';
COMMIT;
