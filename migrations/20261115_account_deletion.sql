BEGIN;
CREATE TABLE IF NOT EXISTS :"schema".account_deletion_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id bigint NOT NULL UNIQUE,
 receipt_digest text NOT NULL UNIQUE CHECK(receipt_digest ~ '^[a-f0-9]{64}$'),
 language text NOT NULL CHECK(language IN ('ar','fr','nl','en')),
 requested_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 due_at timestamptz NOT NULL,
 completed_at timestamptz,
 completed_by bigint,
 retention_reason text,
 notice_email text
);
ALTER TABLE :"schema".account_deletion_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deletion_service ON :"schema".account_deletion_requests;
CREATE POLICY deletion_service ON :"schema".account_deletion_requests TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".account_deletion_requests FROM PUBLIC, :"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".account_deletion_requests TO :"admin_role";
ALTER TABLE :"schema".approval_mail_outbox DROP CONSTRAINT IF EXISTS approval_mail_outbox_source_check;
ALTER TABLE :"schema".approval_mail_outbox ADD CONSTRAINT approval_mail_outbox_source_check
 CHECK(source IN ('company-registration','driver-registration','company-changes','general','account-deletion','account-deletion-complete'));

-- Fleet tracking can already be installed on an upgraded database.
DO $$
BEGIN
 GRANT DELETE ON TABLE :"schema".driver_fleet_locations TO :"admin_role";
EXCEPTION WHEN undefined_table THEN
 NULL;
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_request_account_deletion(
 p_user bigint,p_password_hash text,p_receipt_digest text,p_language text,p_due_at timestamptz
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE account users; deletion account_deletion_requests;
BEGIN
 SELECT * INTO account FROM users WHERE id=p_user FOR UPDATE;
 IF NOT FOUND OR account.is_active IS DISTINCT FROM true OR account.user_type='admin'
 OR account.password IS NULL OR account.password IS DISTINCT FROM p_password_hash
 THEN RAISE EXCEPTION 'Account confirmation required' USING ERRCODE='42501'; END IF;

 INSERT INTO account_deletion_requests(user_id,receipt_digest,language,due_at)
 VALUES (p_user,p_receipt_digest,p_language,p_due_at)
 ON CONFLICT(user_id) DO UPDATE SET receipt_digest=excluded.receipt_digest
 WHERE account_deletion_requests.completed_at IS NULL
 RETURNING * INTO deletion;
 IF NOT FOUND THEN RAISE EXCEPTION 'Account unavailable' USING ERRCODE='42501'; END IF;

 INSERT INTO approval_mail_outbox(source,request_key,entity,operation,submitted_at)
 VALUES('account-deletion',deletion.id::text,'staff','delete',deletion.requested_at)
 ON CONFLICT(source,request_key) DO NOTHING;
 RETURN jsonb_build_object('requested_at',deletion.requested_at,'due_at',deletion.due_at,'completed_at',deletion.completed_at);
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_complete_account_deletion(
 p_id uuid,p_actor bigint,p_retention_reason text,p_keep_driver_identity boolean
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE deletion account_deletion_requests; account users; notify_email text; affected_drivers bigint[];
BEGIN
 SELECT u.* INTO account FROM users u JOIN account_deletion_requests r ON r.user_id=u.id WHERE r.id=p_id FOR UPDATE OF u;
 SELECT * INTO deletion FROM account_deletion_requests WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Request unavailable' USING ERRCODE='P0002'; END IF;
 IF deletion.completed_at IS NOT NULL THEN RETURN jsonb_build_object('completed_at',deletion.completed_at); END IF;
 IF p_actor=deletion.user_id OR p_keep_driver_identity IS NULL
 OR (p_keep_driver_identity AND length(coalesce(trim(p_retention_reason),''))<10)
 OR length(coalesce(p_retention_reason,''))>1000
 THEN RAISE EXCEPTION 'Invalid deletion review' USING ERRCODE='22023'; END IF;

 IF account.id IS NULL OR account.user_type='admin' THEN RAISE EXCEPTION 'Account unavailable' USING ERRCODE='42501'; END IF;

 PERFORM id FROM drivers WHERE user_id=account.id ORDER BY id FOR UPDATE;
 SELECT coalesce(array_agg(id),'{}'::bigint[]) INTO affected_drivers FROM drivers WHERE user_id=account.id;
 IF EXISTS (SELECT FROM trips WHERE (user_id=account.id OR driver_id=ANY(affected_drivers)) AND status='in_progress')
 OR EXISTS (SELECT FROM driver_shifts WHERE (user_id=account.id OR driver_id=ANY(affected_drivers)) AND ended_at IS NULL)
 THEN RAISE EXCEPTION 'Active trip or shift' USING ERRCODE='55000'; END IF;

 IF account.email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
 AND account.email NOT ILIKE '%@driver.local'
 AND (account.auth_provider='google' OR EXISTS (
  SELECT FROM company_registrations c WHERE c.manager_user_id=account.id AND c.email_verified_at IS NOT NULL
  AND lower(c.company_email)=lower(account.email)
 )) THEN notify_email:=account.email; END IF;

 DELETE FROM refresh_tokens WHERE user_id=account.id OR session_id IN (SELECT id FROM sessions WHERE user_id=account.id);
 DELETE FROM sessions WHERE user_id=account.id;
 DELETE FROM user_oauth_providers WHERE user_id=account.id;
 DELETE FROM user_passcode WHERE security_purpose='account-email:'||account.id
  OR (account.email IS NOT NULL AND lower(pass_object)=lower(account.email));
 DELETE FROM native_push_devices WHERE user_id=account.id;
 DELETE FROM message_attachments WHERE uploaded_by_user_id=account.id;
 UPDATE message_replies SET reply_body='—' WHERE sender_user_id=account.id;
 UPDATE internal_messages SET sender_name=NULL,subject='—',message_body='—' WHERE sender_user_id=account.id;
 DELETE FROM message_recipients WHERE recipient_user_id=account.id OR recipient_driver_id=ANY(affected_drivers);
 DELETE FROM message_statistics WHERE user_id=account.id;
 DELETE FROM user_notifications WHERE user_id=account.id;
 DELETE FROM driver_credentials WHERE driver_id=ANY(affected_drivers);
 IF to_regclass('driver_fleet_locations') IS NOT NULL THEN
  DELETE FROM driver_fleet_locations WHERE user_id=account.id OR driver_id=ANY(affected_drivers);
 END IF;
 DELETE FROM driver_documents WHERE driver_id=ANY(affected_drivers);
 UPDATE driver_registration_requests SET full_name=NULL,email=NULL,phone=NULL,driver_license_number=NULL,
  bestuurderspas_number=NULL,driver_license_doc_url=NULL,bestuurderspas_doc_url=NULL,vehicle_registration_doc_url=NULL,
  additional_docs=NULL,rejection_reason=NULL,review_notes=NULL WHERE driver_id=ANY(affected_drivers);
 UPDATE company_registrations SET driver_name=NULL,driver_phone=NULL,driver_license=NULL,bestuurderspas=NULL
  WHERE driver_user_id=account.id;
 UPDATE company_users SET is_active=false,updated_at=clock_timestamp() WHERE user_id=account.id;
 UPDATE drivers SET user_id=NULL,status='inactive',phone=NULL,national_id=NULL,driver_license=NULL,capacity_certificate_number=NULL,
  full_name=CASE WHEN p_keep_driver_identity THEN full_name ELSE '—' END,
  bestuurderspas_number=CASE WHEN p_keep_driver_identity THEN bestuurderspas_number ELSE NULL END,
  registration_rejection_reason=NULL,preferred_language=NULL,updated_at=clock_timestamp()
 WHERE id=ANY(affected_drivers);

 -- Historical business records can reference users. Leave only an inert internal key.
 UPDATE users SET email=NULL,password=NULL,display_name=NULL,avatar_url=NULL,google_id=NULL,auth_provider=NULL,
  role=NULL,user_type=NULL,is_active=false,security_revoked_before=clock_timestamp(),updated_at=clock_timestamp() WHERE id=account.id;

 UPDATE account_deletion_requests SET completed_at=clock_timestamp(),completed_by=p_actor,
  retention_reason=nullif(trim(p_retention_reason),''),notice_email=notify_email
 WHERE id=p_id RETURNING * INTO deletion;
 IF notify_email IS NOT NULL THEN
  INSERT INTO approval_mail_outbox(source,request_key,entity,operation,submitted_at)
  VALUES('account-deletion-complete',p_id::text,'staff','delete',deletion.completed_at)
  ON CONFLICT(source,request_key) DO NOTHING;
 END IF;
 RETURN jsonb_build_object('completed_at',deletion.completed_at);
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_clear_account_deletion_notice()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
BEGIN
 UPDATE account_deletion_requests SET notice_email=NULL WHERE id=NEW.request_key::uuid;
 RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS clear_account_deletion_notice ON :"schema".approval_mail_outbox;
CREATE TRIGGER clear_account_deletion_notice AFTER UPDATE OF finished_at ON :"schema".approval_mail_outbox
 FOR EACH ROW WHEN (NEW.source='account-deletion-complete' AND NEW.finished_at IS NOT NULL)
 EXECUTE FUNCTION :"schema".security_clear_account_deletion_notice();

REVOKE ALL ON FUNCTION :"schema".security_clear_account_deletion_notice() FROM PUBLIC, :"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_clear_account_deletion_notice() TO :"admin_role";
REVOKE ALL ON FUNCTION :"schema".security_request_account_deletion(bigint,text,text,text,timestamptz),
 :"schema".security_complete_account_deletion(uuid,bigint,text,boolean) FROM PUBLIC, :"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_request_account_deletion(bigint,text,text,text,timestamptz),
 :"schema".security_complete_account_deletion(uuid,bigint,text,boolean) TO :"admin_role";
COMMIT;
