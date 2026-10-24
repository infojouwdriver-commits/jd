-- One bounded public welcome configuration, writable only through the authenticated admin API.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE TABLE IF NOT EXISTS :"schema".app_experience_settings (
 id smallint PRIMARY KEY DEFAULT 1 CHECK(id=1),
 version integer NOT NULL DEFAULT 0 CHECK(version>=0),
 enabled boolean NOT NULL DEFAULT true,
 motion boolean NOT NULL DEFAULT true,
 title jsonb NOT NULL,
 subtitle jsonb NOT NULL,
 poster_data text CHECK(poster_data IS NULL OR octet_length(poster_data)<=218496),
 updated_by bigint REFERENCES :"schema".users(id),
 updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
INSERT INTO :"schema".app_experience_settings(id,title,subtitle) VALUES(1,
 '{"ar":"كل يوم يبدأ معك.","fr":"Chaque journée commence avec vous.","nl":"Elke werkdag begint bij u.","en":"Every day starts with you."}',
 '{"ar":"أهلاً بك في مساحة السائق.","fr":"Bienvenue dans votre espace chauffeur.","nl":"Welkom in uw chauffeursruimte.","en":"Welcome to your driver workspace."}') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS :"schema".app_experience_events (
 version integer PRIMARY KEY, actor_id bigint NOT NULL REFERENCES :"schema".users(id),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), enabled boolean NOT NULL, motion boolean NOT NULL
);
ALTER TABLE :"schema".app_experience_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE :"schema".app_experience_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS server_service_access ON :"schema".app_experience_settings;
CREATE POLICY server_service_access ON :"schema".app_experience_settings TO :"admin_role" USING(true) WITH CHECK(true);
DROP POLICY IF EXISTS server_service_access ON :"schema".app_experience_events;
CREATE POLICY server_service_access ON :"schema".app_experience_events TO :"admin_role" USING(true) WITH CHECK(true);
REVOKE ALL ON :"schema".app_experience_settings,:"schema".app_experience_events FROM PUBLIC,:"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".app_experience_settings TO :"admin_role";
GRANT SELECT,INSERT ON :"schema".app_experience_events TO :"admin_role";
CREATE OR REPLACE FUNCTION :"schema".security_save_app_experience(p_actor bigint,p_expected integer,p_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE s app_experience_settings;k text;
BEGIN
 IF NOT EXISTS(SELECT FROM users WHERE id=p_actor AND is_active=true) OR p_actor IS NULL THEN RAISE EXCEPTION 'Actor required' USING ERRCODE='42501';END IF;
 IF jsonb_typeof(p_data) IS DISTINCT FROM 'object' OR (SELECT count(*) FROM jsonb_object_keys(p_data))<>5 OR EXISTS(SELECT FROM jsonb_object_keys(p_data) key WHERE key NOT IN('enabled','motion','title','subtitle','poster_data')) OR jsonb_typeof(p_data->'enabled') IS DISTINCT FROM 'boolean' OR jsonb_typeof(p_data->'motion') IS DISTINCT FROM 'boolean' THEN RAISE EXCEPTION 'Invalid welcome configuration' USING ERRCODE='22023';END IF;
 FOREACH k IN ARRAY ARRAY['title','subtitle'] LOOP
  IF jsonb_typeof(p_data->k) IS DISTINCT FROM 'object' OR (SELECT count(*) FROM jsonb_object_keys(p_data->k))<>4 OR EXISTS(SELECT FROM jsonb_each(p_data->k) t WHERE t.key NOT IN('ar','fr','nl','en') OR jsonb_typeof(t.value)<>'string' OR length(t.value#>>'{}')>CASE WHEN k='title' THEN 120 ELSE 220 END) THEN RAISE EXCEPTION 'Invalid localized text' USING ERRCODE='22023';END IF;
 END LOOP;
 IF p_data->>'poster_data' IS NOT NULL AND (jsonb_typeof(p_data->'poster_data')<>'string' OR octet_length(p_data->>'poster_data')>218496 OR p_data->>'poster_data' !~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$') THEN RAISE EXCEPTION 'Invalid poster' USING ERRCODE='22023';END IF;
 SELECT * INTO STRICT s FROM app_experience_settings WHERE id=1 FOR UPDATE;
 IF s.version IS DISTINCT FROM p_expected THEN RAISE EXCEPTION 'Configuration changed; refresh' USING ERRCODE='PT409';END IF;
 UPDATE app_experience_settings SET version=version+1,enabled=(p_data->>'enabled')::boolean,motion=(p_data->>'motion')::boolean,title=p_data->'title',subtitle=p_data->'subtitle',poster_data=p_data->>'poster_data',updated_by=p_actor,updated_at=clock_timestamp() WHERE id=1 RETURNING * INTO s;
 INSERT INTO app_experience_events(version,actor_id,enabled,motion) VALUES(s.version,p_actor,s.enabled,s.motion);
 RETURN to_jsonb(s)-'id'-'updated_by'-'updated_at';
END $$;
REVOKE ALL ON FUNCTION :"schema".security_save_app_experience(bigint,integer,jsonb) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_save_app_experience(bigint,integer,jsonb) TO :"admin_role";
COMMIT;
