-- Explicit driver declarations only. No GPS history or reconstructed historical shifts.
BEGIN;
CREATE TABLE IF NOT EXISTS :"schema".driver_shifts (
 id uuid PRIMARY KEY,
 driver_id bigint NOT NULL REFERENCES :"schema".drivers(id),
 user_id bigint NOT NULL,
 company_id bigint NOT NULL,
 vehicle_id bigint NOT NULL REFERENCES :"schema".vehicles(id),
 driver_name text NOT NULL,
 company_name text NOT NULL,
 plate_number text NOT NULL,
 started_at timestamptz NOT NULL,
 ended_at timestamptz,
 start_odometer numeric(12,2) NOT NULL CHECK(start_odometer BETWEEN 0 AND 9999999.99),
 odometer numeric(12,2) NOT NULL,
 passenger_km numeric(12,2) NOT NULL DEFAULT 0,
 work_status text NOT NULL CHECK(work_status IN ('available','driving_empty','with_passenger','break')),
 version integer NOT NULL DEFAULT 1 CHECK(version>0),
 CHECK(odometer>=start_odometer AND odometer<=9999999.99),
 CHECK(passenger_km>=0 AND passenger_km<=odometer-start_odometer),
 CHECK(ended_at IS NULL OR ended_at>=started_at)
);
CREATE UNIQUE INDEX IF NOT EXISTS driver_shifts_one_driver ON :"schema".driver_shifts(driver_id) WHERE ended_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS driver_shifts_one_vehicle ON :"schema".driver_shifts(vehicle_id) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS driver_shifts_history ON :"schema".driver_shifts(user_id,started_at DESC,id);
CREATE TABLE IF NOT EXISTS :"schema".driver_shift_events (
 request_id uuid PRIMARY KEY,
 shift_id uuid NOT NULL REFERENCES :"schema".driver_shifts(id),
 user_id bigint NOT NULL,
 action text NOT NULL CHECK(action IN ('start','record','end')),
 recorded_at timestamptz NOT NULL,
 odometer numeric(12,2) NOT NULL,
 passenger_km numeric(12,2) NOT NULL,
 work_status text NOT NULL,
 expected_version integer NOT NULL,
 version integer NOT NULL,
 UNIQUE(shift_id,version)
);
REVOKE ALL ON :"schema".driver_shifts, :"schema".driver_shift_events FROM PUBLIC, :"user_role";
GRANT SELECT,INSERT,UPDATE ON :"schema".driver_shifts TO :"admin_role";
GRANT SELECT,INSERT ON :"schema".driver_shift_events TO :"admin_role";

CREATE OR REPLACE FUNCTION :"schema".security_record_driver_shift(
 p_user_id bigint,p_request_id uuid,p_action text,p_shift_id uuid,p_expected_version integer,
 p_odometer numeric,p_passenger_km numeric,p_work_status text
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE d drivers; v vehicles; s driver_shifts; e driver_shift_events; stamp timestamptz;
BEGIN
 IF p_user_id IS NULL OR p_request_id IS NULL OR p_shift_id IS NULL OR p_expected_version IS NULL
 OR p_action IS NULL OR p_action NOT IN ('start','record','end') OR p_work_status IS NULL
 OR p_work_status NOT IN ('available','driving_empty','with_passenger','break')
 OR p_odometer IS NULL OR p_odometer NOT BETWEEN 0 AND 9999999.99 OR round(p_odometer,2)<>p_odometer
 OR p_passenger_km IS NULL OR p_passenger_km NOT BETWEEN 0 AND 9999999.99 OR round(p_passenger_km,2)<>p_passenger_km
 THEN RAISE EXCEPTION 'Invalid declaration' USING ERRCODE='22023'; END IF;
 -- Serialize all requests by this driver, including uncertain-response retries.
 SELECT * INTO d FROM drivers WHERE user_id=p_user_id AND status='active' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Driver unavailable' USING ERRCODE='42501'; END IF;
 SELECT * INTO e FROM driver_shift_events WHERE request_id=p_request_id;
 IF FOUND THEN
  IF e.user_id<>p_user_id OR e.shift_id<>p_shift_id OR e.action<>p_action OR e.expected_version<>p_expected_version
   OR e.odometer<>p_odometer OR e.passenger_km<>p_passenger_km OR e.work_status<>p_work_status
  THEN RAISE EXCEPTION 'Request conflict' USING ERRCODE='40001'; END IF;
  SELECT * INTO s FROM driver_shifts WHERE id=e.shift_id AND user_id=p_user_id;
  RETURN to_jsonb(s);
 END IF;
 IF p_action='start' THEN
  IF p_expected_version<>0 OR p_passenger_km<>0 OR EXISTS(SELECT FROM driver_shifts WHERE driver_id=d.id AND ended_at IS NULL)
  THEN RAISE EXCEPTION 'Shift already open or invalid start' USING ERRCODE='40001'; END IF;
  SELECT * INTO v FROM vehicles WHERE id=coalesce(d.current_vehicle_id,d.assigned_vehicle_id) AND company_id=d.company_id AND status='active' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Select an active company vehicle' USING ERRCODE='22023'; END IF;
  IF EXISTS(SELECT FROM driver_shifts WHERE vehicle_id=v.id AND ended_at IS NULL)
  THEN RAISE EXCEPTION 'Vehicle has an open shift' USING ERRCODE='40001'; END IF;
  stamp=clock_timestamp();
  INSERT INTO driver_shifts(id,driver_id,user_id,company_id,vehicle_id,driver_name,company_name,plate_number,started_at,start_odometer,odometer,work_status)
  SELECT p_shift_id,d.id,p_user_id,d.company_id,v.id,d.full_name,c.name,v.plate_number,stamp,p_odometer,p_odometer,p_work_status FROM companies c WHERE c.id=d.company_id RETURNING * INTO s;
 ELSE
  SELECT * INTO s FROM driver_shifts WHERE id=p_shift_id AND user_id=p_user_id AND driver_id=d.id AND company_id=d.company_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Shift unavailable' USING ERRCODE='42501'; END IF;
  IF s.ended_at IS NOT NULL OR s.version<>p_expected_version THEN RAISE EXCEPTION 'Shift changed; refresh' USING ERRCODE='40001'; END IF;
  IF p_odometer<s.odometer OR p_passenger_km<s.passenger_km OR p_passenger_km>s.passenger_km+p_odometer-s.odometer
  THEN RAISE EXCEPTION 'Inconsistent readings' USING ERRCODE='22023'; END IF;
  IF p_action='end' AND EXISTS(SELECT FROM trips WHERE driver_id=d.id AND status='in_progress')
  THEN RAISE EXCEPTION 'Complete active trip first' USING ERRCODE='40001'; END IF;
  stamp=clock_timestamp();
  UPDATE driver_shifts SET odometer=p_odometer,passenger_km=p_passenger_km,work_status=p_work_status,version=version+1,
   ended_at=CASE WHEN p_action='end' THEN stamp END WHERE id=s.id RETURNING * INTO s;
 END IF;
 INSERT INTO driver_shift_events(request_id,shift_id,user_id,action,recorded_at,odometer,passenger_km,work_status,expected_version,version)
 VALUES(p_request_id,s.id,p_user_id,p_action,stamp,p_odometer,p_passenger_km,p_work_status,p_expected_version,s.version);
 RETURN to_jsonb(s);
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_driver_shifts(p_user_id bigint,p_shift_id uuid DEFAULT NULL,p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE s driver_shifts;
BEGIN
 IF p_user_id IS NULL OR NOT EXISTS(SELECT FROM drivers WHERE user_id=p_user_id AND status='active') THEN
 RAISE EXCEPTION 'Driver unavailable' USING ERRCODE='42501'; END IF;
 IF p_offset IS NULL OR p_offset<0 OR p_offset>100000 THEN RAISE EXCEPTION 'Invalid page' USING ERRCODE='22023'; END IF;
 IF p_shift_id IS NOT NULL THEN
  SELECT * INTO s FROM driver_shifts WHERE id=p_shift_id AND user_id=p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Shift unavailable' USING ERRCODE='42501'; END IF;
  RETURN jsonb_build_object('shift',to_jsonb(s),'events',coalesce((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.version) FROM driver_shift_events e WHERE e.shift_id=s.id),'[]'::jsonb));
 END IF;
 RETURN jsonb_build_object('active',(SELECT to_jsonb(a) FROM driver_shifts a WHERE a.user_id=p_user_id AND a.ended_at IS NULL),
 'shifts',coalesce((SELECT jsonb_agg(to_jsonb(h) ORDER BY h.started_at DESC,h.id) FROM (SELECT * FROM driver_shifts WHERE user_id=p_user_id ORDER BY started_at DESC,id LIMIT 25 OFFSET p_offset) h),'[]'::jsonb));
END $$;
REVOKE ALL ON FUNCTION :"schema".security_record_driver_shift(bigint,uuid,text,uuid,integer,numeric,numeric,text), :"schema".security_driver_shifts(bigint,uuid,integer) FROM PUBLIC, :"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_record_driver_shift(bigint,uuid,text,uuid,integer,numeric,numeric,text), :"schema".security_driver_shifts(bigint,uuid,integer) TO :"admin_role";
COMMIT;
