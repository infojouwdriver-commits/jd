-- All authorization happens before a server-only database token is created.
-- PostgREST MUST remain on a private network. Do not expose it as a public API.
BEGIN;
-- PostgreSQL grants function EXECUTE to PUBLIC by default. Revoking only the
-- browser role does not remove permissions inherited through PUBLIC.
REVOKE ALL ON SCHEMA :"schema" FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA :"schema" FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA :"schema" TO :"admin_role";
ALTER DEFAULT PRIVILEGES IN SCHEMA :"schema" REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA :"schema" FROM :"user_role";
REVOKE ALL ON ALL SEQUENCES IN SCHEMA :"schema" FROM :"user_role";
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA :"schema" FROM :"user_role";
ALTER DEFAULT PRIVILEGES IN SCHEMA :"schema" REVOKE ALL ON TABLES FROM :"user_role";
ALTER DEFAULT PRIVILEGES IN SCHEMA :"schema" REVOKE ALL ON SEQUENCES FROM :"user_role";
-- Do not alter existing service-role policies here: confirm RLS and grants against
-- the restored schema before applying this file to the existing database.
COMMIT;
