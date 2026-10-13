-- Privacy-preserving fleet presence: only the latest driver position is retained.
BEGIN;
CREATE TABLE IF NOT EXISTS :"schema".driver_fleet_locations(
  driver_id bigint PRIMARY KEY REFERENCES :"schema".drivers(id) ON DELETE CASCADE,
  company_id bigint NOT NULL,
  user_id bigint NOT NULL,
  shift_active boolean NOT NULL DEFAULT false,
  sharing_enabled boolean NOT NULL DEFAULT false,
  latitude double precision,
  longitude double precision,
  accuracy_m numeric(10,2),
  recorded_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT driver_fleet_location_coordinates CHECK(
    (sharing_enabled AND shift_active AND latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180 AND accuracy_m BETWEEN 0 AND 10000 AND recorded_at IS NOT NULL)
    OR (NOT sharing_enabled AND latitude IS NULL AND longitude IS NULL AND accuracy_m IS NULL AND recorded_at IS NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_driver_fleet_locations_company ON :"schema".driver_fleet_locations(company_id);
REVOKE ALL ON :"schema".driver_fleet_locations FROM PUBLIC, :"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".driver_fleet_locations TO :"admin_role";

CREATE OR REPLACE FUNCTION :"schema".security_update_driver_fleet_location(
  p_user_id bigint,p_shift_active boolean,p_sharing_enabled boolean,
  p_latitude double precision DEFAULT NULL,p_longitude double precision DEFAULT NULL,
  p_accuracy_m numeric DEFAULT NULL,p_recorded_at timestamptz DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE d drivers; current driver_fleet_locations; saved driver_fleet_locations; sharing boolean;
BEGIN
 IF p_user_id IS NULL OR p_shift_active IS NULL OR p_sharing_enabled IS NULL THEN
  RAISE EXCEPTION 'Invalid fleet state' USING ERRCODE='22023';
 END IF;
 SELECT * INTO d FROM drivers WHERE user_id=p_user_id AND status='active';
 IF NOT FOUND THEN RAISE EXCEPTION 'Driver unavailable' USING ERRCODE='42501'; END IF;
 sharing=p_shift_active AND p_sharing_enabled;
 IF sharing AND (p_latitude IS NULL OR p_longitude IS NULL OR p_accuracy_m IS NULL OR p_recorded_at IS NULL
   OR p_latitude NOT BETWEEN -90 AND 90 OR p_longitude NOT BETWEEN -180 AND 180 OR p_accuracy_m NOT BETWEEN 0 AND 10000
   OR p_recorded_at>clock_timestamp()+interval '1 minute' OR p_recorded_at<clock_timestamp()-interval '24 hours') THEN
  RAISE EXCEPTION 'Invalid fleet position' USING ERRCODE='22023';
 END IF;
 SELECT * INTO current FROM driver_fleet_locations WHERE driver_id=d.id FOR UPDATE;
 IF sharing AND current.recorded_at IS NOT NULL AND p_recorded_at<current.recorded_at THEN
  RAISE EXCEPTION 'Stale fleet position' USING ERRCODE='22023';
 END IF;
 INSERT INTO driver_fleet_locations(driver_id,company_id,user_id,shift_active,sharing_enabled,latitude,longitude,accuracy_m,recorded_at,received_at)
 VALUES(d.id,d.company_id,d.user_id,p_shift_active,sharing,
   CASE WHEN sharing THEN p_latitude END,CASE WHEN sharing THEN p_longitude END,
   CASE WHEN sharing THEN p_accuracy_m END,CASE WHEN sharing THEN p_recorded_at END,clock_timestamp())
 ON CONFLICT(driver_id) DO UPDATE SET company_id=excluded.company_id,user_id=excluded.user_id,
   shift_active=excluded.shift_active,sharing_enabled=excluded.sharing_enabled,latitude=excluded.latitude,
   longitude=excluded.longitude,accuracy_m=excluded.accuracy_m,recorded_at=excluded.recorded_at,received_at=excluded.received_at
 RETURNING * INTO saved;
 RETURN to_jsonb(saved);
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_driver_fleet_location(p_user_id bigint)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
 SELECT coalesce((SELECT to_jsonb(f) FROM driver_fleet_locations f JOIN drivers d ON d.id=f.driver_id WHERE d.user_id=p_user_id),
  jsonb_build_object('shift_active',false,'sharing_enabled',false));
$$;

CREATE OR REPLACE FUNCTION :"schema".security_fleet_locations(p_actor_id bigint,p_is_admin boolean)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
 SELECT coalesce(jsonb_agg(jsonb_build_object(
   'driver_id',d.id,'driver_name',d.full_name,'company_id',d.company_id,'company_name',c.name,
   'vehicle_id',coalesce(d.current_vehicle_id,d.assigned_vehicle_id),'plate_number',v.plate_number,
   'shift_active',coalesce(f.shift_active,false),'sharing_enabled',coalesce(f.sharing_enabled,false),
   'latitude',CASE WHEN f.shift_active AND f.sharing_enabled THEN f.latitude END,
   'longitude',CASE WHEN f.shift_active AND f.sharing_enabled THEN f.longitude END,
   'accuracy_m',CASE WHEN f.shift_active AND f.sharing_enabled THEN f.accuracy_m END,
   'last_update',CASE WHEN f.shift_active AND f.sharing_enabled THEN f.recorded_at END,
   'work_status',CASE
     WHEN EXISTS(SELECT 1 FROM trips t WHERE t.driver_id=d.id AND t.status='in_progress') THEN 'on_trip'
     WHEN NOT coalesce(f.shift_active,false) OR NOT coalesce(f.sharing_enabled,false) THEN 'off_shift'
     WHEN f.recorded_at>=clock_timestamp()-interval '2 minutes' THEN 'available'
     ELSE 'stale' END
 ) ORDER BY c.name,d.full_name,d.id),'[]'::jsonb)
 FROM drivers d
 JOIN companies c ON c.id=d.company_id
 LEFT JOIN vehicles v ON v.id=coalesce(d.current_vehicle_id,d.assigned_vehicle_id) AND v.company_id=d.company_id
 LEFT JOIN driver_fleet_locations f ON f.driver_id=d.id
 WHERE d.status='active' AND (p_is_admin IS TRUE OR EXISTS(
   SELECT 1 FROM company_users cu WHERE cu.user_id=p_actor_id AND cu.company_id=d.company_id));
$$;
REVOKE ALL ON FUNCTION :"schema".security_update_driver_fleet_location(bigint,boolean,boolean,double precision,double precision,numeric,timestamptz),
 :"schema".security_driver_fleet_location(bigint), :"schema".security_fleet_locations(bigint,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION :"schema".security_update_driver_fleet_location(bigint,boolean,boolean,double precision,double precision,numeric,timestamptz),
 :"schema".security_driver_fleet_location(bigint), :"schema".security_fleet_locations(bigint,boolean) TO :"admin_role";
COMMIT;
