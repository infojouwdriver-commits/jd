\set ON_ERROR_STOP on
BEGIN;
SELECT format('CREATE ROLE %I NOLOGIN NOINHERIT', :'user_role') WHERE NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname=:'user_role') \gexec
SELECT format('CREATE ROLE %I NOLOGIN NOINHERIT', :'admin_role') WHERE NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname=:'admin_role') \gexec
SELECT format('CREATE ROLE %I LOGIN NOINHERIT PASSWORD %L', :'gateway_role', :'gateway_password') WHERE NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname=:'gateway_role') \gexec
-- Reusing deployment roles must not retain superuser, RLS bypass or login rights.
ALTER ROLE :"user_role" NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE :"admin_role" NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE :"gateway_role" LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
-- Apply rotated gateway credentials to existing installations too.
SELECT format('ALTER ROLE %I PASSWORD %L', :'gateway_role', :'gateway_password') \gexec
SELECT format('GRANT %I,%I TO %I', :'admin_role', :'user_role', :'gateway_role') \gexec
GRANT USAGE ON SCHEMA :"schema" TO :"admin_role", :"user_role";
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA :"schema" TO :"admin_role";
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA :"schema" TO :"admin_role";
REVOKE ALL ON ALL TABLES IN SCHEMA :"schema" FROM :"user_role";
REVOKE ALL ON ALL SEQUENCES IN SCHEMA :"schema" FROM :"user_role";
SELECT set_config('deployment.schema', :'schema', true), set_config('deployment.service_role', :'admin_role', true);
DO $$ DECLARE r record; target_schema text=current_setting('deployment.schema');service_role text=current_setting('deployment.service_role');
BEGIN
 FOR r IN SELECT tablename FROM pg_tables WHERE schemaname=target_schema LOOP
  EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',target_schema,r.tablename);
  EXECUTE format('DROP POLICY IF EXISTS server_service_access ON %I.%I',target_schema,r.tablename);
  EXECUTE format('CREATE POLICY server_service_access ON %I.%I TO %I USING(true) WITH CHECK(true)',target_schema,r.tablename,service_role);
 END LOOP;
END $$;
COMMIT;
