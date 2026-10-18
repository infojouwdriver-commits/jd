BEGIN;
CREATE TABLE IF NOT EXISTS :"schema".company_staff_events(
 id bigserial PRIMARY KEY,company_id bigint NOT NULL REFERENCES :"schema".companies(id),membership_id bigint NOT NULL,
 actor_id bigint NOT NULL REFERENCES :"schema".users(id),action text NOT NULL,previous_role text,new_role text,previous_active boolean,new_active boolean,
 reason text NOT NULL CHECK(length(trim(reason)) BETWEEN 1 AND 1000),created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE :"schema".company_staff_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".company_staff_events;
CREATE POLICY server_service_access ON :"schema".company_staff_events TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".company_staff_events FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT ON :"schema".company_staff_events TO :"admin_role";
GRANT USAGE,SELECT ON SEQUENCE :"schema".company_staff_events_id_seq TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_change_company_staff(p_company bigint,p_actor bigint,p_admin boolean,p_membership bigint,p_role text,p_active boolean,p_reason text,p_email text DEFAULT NULL,p_hash text DEFAULT NULL,p_user_role text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE link company_users;old_link company_users;uid bigint;c companies;
BEGIN
 IF p_actor IS NULL OR NOT EXISTS(SELECT FROM users WHERE id=p_actor) OR p_role IS NULL OR p_role NOT IN('owner','fleet_manager','accountant') OR p_active IS NULL OR coalesce(length(trim(p_reason)),0) NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Invalid staff command' USING ERRCODE='22023';END IF;
 SELECT * INTO c FROM companies WHERE id=p_company FOR UPDATE;
 IF NOT FOUND OR c.archived_at IS NOT NULL THEN RAISE EXCEPTION 'Company unavailable' USING ERRCODE='P0002';END IF;
 IF p_admin IS DISTINCT FROM true AND NOT EXISTS(SELECT FROM company_users WHERE company_id=p_company AND user_id=p_actor AND is_active AND role IN('owner','portal_owner')) THEN RAISE EXCEPTION 'Company owner required' USING ERRCODE='42501';END IF;
 IF p_membership IS NULL THEN
  IF NOT p_active OR p_email IS NULL OR lower(trim(p_email)) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR length(p_email)>254 OR p_hash IS NULL OR p_hash !~ '^\$2[aby]\$' OR p_user_role IS NULL THEN RAISE EXCEPTION 'New staff credentials required' USING ERRCODE='22023';END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(lower(trim(p_email)),0));
  IF EXISTS(SELECT FROM users WHERE lower(email)=lower(trim(p_email))) THEN RAISE EXCEPTION 'Account already exists; existing identities require an administrator reviewed linking process' USING ERRCODE='40001';END IF;
  INSERT INTO users(email,password,role,user_type,display_name,is_active) VALUES(lower(trim(p_email)),p_hash,p_user_role,'manager',lower(trim(p_email)),true) RETURNING id INTO uid;
  INSERT INTO company_users(company_id,user_id,role,is_active) VALUES(p_company,uid,p_role,true) RETURNING * INTO link;
 ELSE
  SELECT * INTO old_link FROM company_users WHERE id=p_membership AND company_id=p_company FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Membership missing' USING ERRCODE='P0002';END IF;
  IF old_link.role IN('owner','portal_owner') AND old_link.is_active AND (NOT p_active OR p_role<>'owner') AND NOT EXISTS(SELECT FROM company_users WHERE company_id=p_company AND id<>old_link.id AND is_active AND role IN('owner','portal_owner')) THEN RAISE EXCEPTION 'Keep an active company owner' USING ERRCODE='23514';END IF;
  UPDATE company_users SET role=p_role,is_active=p_active,updated_at=clock_timestamp() WHERE id=old_link.id RETURNING * INTO link;
  UPDATE users SET security_revoked_before=clock_timestamp(),updated_at=clock_timestamp() WHERE id=link.user_id;
  UPDATE refresh_tokens SET revoked=true WHERE user_id=link.user_id;
 END IF;
 INSERT INTO company_staff_events(company_id,membership_id,actor_id,action,previous_role,new_role,previous_active,new_active,reason) VALUES(p_company,link.id,p_actor,CASE WHEN p_membership IS NULL THEN 'created' ELSE 'changed' END,old_link.role,link.role,old_link.is_active,link.is_active,trim(p_reason));
 RETURN jsonb_build_object('id',link.id,'company_id',link.company_id,'role',link.role,'is_active',link.is_active);
END $$;
REVOKE ALL ON FUNCTION :"schema".security_change_company_staff(bigint,bigint,boolean,bigint,text,boolean,text,text,text,text) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_change_company_staff(bigint,bigint,boolean,bigint,text,boolean,text,text,text,text) TO :"admin_role";
COMMIT;
