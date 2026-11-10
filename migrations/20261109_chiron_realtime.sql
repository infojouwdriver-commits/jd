BEGIN;
ALTER TABLE :"schema".trips ADD COLUMN IF NOT EXISTS chiron_realtime boolean NOT NULL DEFAULT false;
ALTER TABLE :"schema".trips ADD COLUMN IF NOT EXISTS chiron_departure_payload jsonb;
ALTER TABLE :"schema".trips ADD COLUMN IF NOT EXISTS chiron_agreed_price numeric(12,2);
CREATE UNIQUE INDEX IF NOT EXISTS trips_driver_realtime_active_idx ON :"schema".trips(driver_id)
 WHERE chiron_realtime AND status='in_progress';
CREATE UNIQUE INDEX IF NOT EXISTS trips_company_realtime_platform_ref_idx
 ON :"schema".trips(company_id,external_source,external_ride_number)
 WHERE chiron_realtime AND external_ride_number IS NOT NULL;

CREATE OR REPLACE FUNCTION :"schema".security_save_trip_departure(p_payload jsonb,p_user_id bigint,p_key uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE input trips; existing trips; keys_sql text; payload jsonb;
BEGIN
 input := jsonb_populate_record(NULL::trips,p_payload);
 PERFORM 1 FROM companies WHERE id=input.company_id AND archived_at IS NULL
   AND lower(chiron_mode)=input.chiron_environment FOR SHARE;
 IF NOT FOUND THEN RETURN jsonb_build_object('conflict',true); END IF;
 PERFORM 1 FROM drivers WHERE id=input.driver_id AND user_id=p_user_id AND company_id=input.company_id
   AND status='active' AND coalesce(current_vehicle_id,assigned_vehicle_id)=input.vehicle_id FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('conflict',true); END IF;
 PERFORM 1 FROM vehicles WHERE id=input.vehicle_id AND company_id=input.company_id AND status='active' FOR SHARE;
 IF NOT FOUND THEN RETURN jsonb_build_object('conflict',true); END IF;
 SELECT * INTO existing FROM trips WHERE user_id=p_user_id AND completion_request_key=p_key;
 IF FOUND THEN
   IF NOT existing.chiron_realtime OR existing.driver_id<>input.driver_id OR existing.company_id<>input.company_id
      OR existing.vehicle_id<>input.vehicle_id OR existing.start_time<>input.start_time
      OR existing.start_lat<>input.start_lat OR existing.start_lon<>input.start_lon
      OR existing.ride_type IS DISTINCT FROM input.ride_type OR existing.external_source IS DISTINCT FROM input.external_source THEN
     RETURN jsonb_build_object('conflict',true);
   END IF;
   RETURN jsonb_build_object('created',false,'trip',to_jsonb(existing));
 END IF;
 IF EXISTS (SELECT FROM trips WHERE driver_id=input.driver_id AND chiron_realtime AND status='in_progress')
    OR (input.external_ride_number IS NOT NULL AND EXISTS(SELECT FROM trips WHERE company_id=input.company_id
      AND external_source=input.external_source AND external_ride_number=input.external_ride_number)) THEN
   RETURN jsonb_build_object('conflict',true);
 END IF;
 payload := (p_payload-'id'-'is_test'-'shift_id'-'chiron_departure_payload') ||
   jsonb_build_object('user_id',p_user_id,'completion_request_key',p_key,'chiron_realtime',true,'status','in_progress');
 SELECT string_agg(format('%I',key),',' ORDER BY key) INTO keys_sql FROM jsonb_object_keys(payload) AS key;
 EXECUTE format('INSERT INTO trips(%s) SELECT %s FROM jsonb_populate_record(NULL::trips,$1) RETURNING *',keys_sql,keys_sql)
   INTO existing USING payload;
 RETURN jsonb_build_object('created',true,'trip',to_jsonb(existing));
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_finish_realtime_trip(p_payload jsonb,p_user_id bigint,p_key uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=:"schema",pg_catalog AS $$
DECLARE incoming trips; saved trips; keys_sql text;
BEGIN
 incoming := jsonb_populate_record(NULL::trips,p_payload);
 PERFORM 1 FROM drivers WHERE id=incoming.driver_id AND user_id=p_user_id AND company_id=incoming.company_id
   AND status='active' FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('conflict',true); END IF;
 SELECT * INTO saved FROM trips WHERE user_id=p_user_id AND completion_request_key=p_key AND chiron_realtime FOR UPDATE;
 IF NOT FOUND OR saved.driver_id<>incoming.driver_id OR saved.company_id<>incoming.company_id THEN
   RETURN jsonb_build_object('conflict',true);
 END IF;
 IF saved.status='completed' THEN RETURN jsonb_build_object('created',false,'trip',to_jsonb(saved)); END IF;
 IF saved.status<>'in_progress' OR incoming.end_time<=saved.start_time THEN RETURN jsonb_build_object('conflict',true); END IF;
 SELECT string_agg(format('%I=i.%I',key,key),',' ORDER BY key) INTO keys_sql FROM jsonb_object_keys(p_payload) AS key
 WHERE key IN ('end_time','end_lat','end_lon','end_address','distance_km','duration_minutes','price',
   'passenger_name','payment_method','currency','estimated_distance_km','estimated_duration_min','initial_proposed_price',
   'driver_adjusted_price','actual_distance_km','actual_duration_minutes','tariff_code','tariff_settings_snapshot','trip_hash');
 EXECUTE format('UPDATE trips t SET %s,status=''completed'',locked_after_completion=true,locked_at=clock_timestamp()
   FROM jsonb_populate_record(NULL::trips,$1) i WHERE t.id=$2 RETURNING t.*',keys_sql) INTO saved USING p_payload,saved.id;
 RETURN jsonb_build_object('created',true,'trip',to_jsonb(saved));
END $$;

-- Delivery acknowledgements do not change shift activity. Avoid taking the driver lock
-- while holding a trip row that an end request may already be waiting to update.
DROP TRIGGER IF EXISTS record_trip_shift ON :"schema".trips;
CREATE TRIGGER record_trip_shift AFTER INSERT OR UPDATE OF status ON :"schema".trips
 FOR EACH ROW EXECUTE FUNCTION :"schema".security_record_trip_shift();

REVOKE ALL ON FUNCTION :"schema".security_save_trip_departure(jsonb,bigint,uuid),
 :"schema".security_finish_realtime_trip(jsonb,bigint,uuid) FROM PUBLIC,:"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_save_trip_departure(jsonb,bigint,uuid),
 :"schema".security_finish_realtime_trip(jsonb,bigint,uuid) TO :"admin_role";
COMMIT;
