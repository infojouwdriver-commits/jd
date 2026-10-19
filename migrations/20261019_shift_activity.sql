-- Additive shift activity. Readings remain explicit; trip distances never change counters.
BEGIN;
ALTER TABLE :"schema".driver_shifts ADD COLUMN IF NOT EXISTS document_summary jsonb;
ALTER TABLE :"schema".driver_shifts ADD COLUMN IF NOT EXISTS document_profile jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE OR REPLACE FUNCTION :"schema".security_shift_document_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = :"schema",pg_catalog AS $$
DECLARE c jsonb; d jsonb; v jsonb;
BEGIN
 SELECT to_jsonb(x) INTO c FROM companies x WHERE id=NEW.company_id;
 SELECT to_jsonb(x) INTO d FROM drivers x WHERE id=NEW.driver_id AND user_id=NEW.user_id;
 SELECT to_jsonb(x) INTO v FROM vehicles x WHERE id=NEW.vehicle_id AND company_id=NEW.company_id;
 NEW.document_profile=jsonb_build_object('company_address',c->>'address','company_phone',c->>'phone','company_email',c->>'email','company_vat',c->>'vat_number','company_kbo',c->>'kbo_number','driver_card',coalesce(nullif(d->>'bestuurderspas_number',''),d->>'capacity_certificate_number'),'vehicle_code',v->>'chiron_vehicle_id');
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS shift_document_profile ON :"schema".driver_shifts;
CREATE TRIGGER shift_document_profile BEFORE INSERT ON :"schema".driver_shifts FOR EACH ROW EXECUTE FUNCTION :"schema".security_shift_document_profile();
REVOKE ALL ON FUNCTION :"schema".security_shift_document_profile() FROM PUBLIC, :"user_role";
ALTER TABLE :"schema".trips ADD COLUMN IF NOT EXISTS shift_id uuid REFERENCES :"schema".driver_shifts(id);
CREATE INDEX IF NOT EXISTS trips_shift_idx ON :"schema".trips(shift_id);
CREATE TABLE IF NOT EXISTS :"schema".driver_shift_activity (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shift_id uuid NOT NULL REFERENCES :"schema".driver_shifts(id),
 user_id bigint NOT NULL,
 kind text NOT NULL CHECK(kind IN ('declaration','status','trip_start','trip_end','trip_cancel')),
 recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 occurred_at timestamptz NOT NULL,
 work_status text CHECK(work_status IN ('available','driving_empty','with_passenger','break')),
 trip_id bigint,
 source text,
 expected_version integer,
 UNIQUE(trip_id,kind)
);
REVOKE ALL ON :"schema".driver_shift_activity FROM PUBLIC, :"user_role";
GRANT SELECT,INSERT ON :"schema".driver_shift_activity TO :"admin_role";
DROP TRIGGER IF EXISTS immutable_shift_activity ON :"schema".driver_shift_activity;
CREATE TRIGGER immutable_shift_activity BEFORE UPDATE OR DELETE ON :"schema".driver_shift_activity
 FOR EACH ROW EXECUTE FUNCTION :"schema".security_immutable_shift_event();

CREATE OR REPLACE FUNCTION :"schema".security_shift_declaration_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = :"schema",pg_catalog AS $$
BEGIN
 INSERT INTO driver_shift_activity(id,shift_id,user_id,kind,recorded_at,occurred_at,work_status)
 VALUES(NEW.request_id,NEW.shift_id,NEW.user_id,'declaration',NEW.recorded_at,NEW.recorded_at,NEW.work_status);
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS shift_declaration_activity ON :"schema".driver_shift_events;
CREATE TRIGGER shift_declaration_activity AFTER INSERT ON :"schema".driver_shift_events
 FOR EACH ROW EXECUTE FUNCTION :"schema".security_shift_declaration_activity();

CREATE OR REPLACE FUNCTION :"schema".security_shift_status(p_user_id bigint,p_request_id uuid,p_shift_id uuid,p_expected_version integer,p_status text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
DECLARE s driver_shifts; a driver_shift_activity;
BEGIN
 IF p_request_id IS NULL OR p_expected_version IS NULL OR p_status IS NULL OR p_status NOT IN ('break','available','with_passenger') THEN RAISE EXCEPTION 'Invalid status' USING ERRCODE='22023'; END IF;
 PERFORM 1 FROM drivers WHERE user_id=p_user_id AND status='active' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Driver unavailable' USING ERRCODE='42501'; END IF;
 SELECT * INTO s FROM driver_shifts WHERE id=p_shift_id AND user_id=p_user_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Shift unavailable' USING ERRCODE='42501'; END IF;
 SELECT * INTO a FROM driver_shift_activity WHERE id=p_request_id;
 IF FOUND THEN
  IF a.shift_id<>s.id OR a.user_id<>p_user_id OR a.kind<>'status' OR a.work_status<>p_status OR (p_status<>'with_passenger' AND a.expected_version<>p_expected_version) THEN RAISE EXCEPTION 'Request conflict' USING ERRCODE='40001'; END IF;
  RETURN to_jsonb(s);
 END IF;
 IF s.ended_at IS NOT NULL OR s.version<>p_expected_version OR (p_status='break' AND s.work_status='with_passenger') OR EXISTS(SELECT FROM trips WHERE driver_id=s.driver_id AND status='in_progress') THEN RAISE EXCEPTION 'Shift changed or trip in progress' USING ERRCODE='40001'; END IF;
 UPDATE driver_shifts SET work_status=p_status,version=version+1 WHERE id=s.id RETURNING * INTO s;
 INSERT INTO driver_shift_activity(id,shift_id,user_id,kind,occurred_at,work_status,expected_version,source)
 VALUES(p_request_id,s.id,p_user_id,'status',clock_timestamp(),p_status,p_expected_version,CASE WHEN p_status='with_passenger' THEN 'portal_trip' END);
 RETURN to_jsonb(s);
END $$;

-- The database owns the link, including external/meter trips submitted through any server path.
CREATE OR REPLACE FUNCTION :"schema".security_link_trip_shift()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = :"schema",pg_catalog AS $$
DECLARE s driver_shifts;
BEGIN
 IF TG_OP='UPDATE' THEN NEW.shift_id=OLD.shift_id; RETURN NEW; END IF;
 NEW.shift_id=NULL;
 IF coalesce(to_jsonb(NEW)->>'is_test','false')='true' OR NEW.status NOT IN ('in_progress','completed') THEN RETURN NEW; END IF;
 PERFORM 1 FROM drivers WHERE id=NEW.driver_id AND user_id=NEW.user_id AND company_id=NEW.company_id AND status='active' FOR UPDATE;
 IF NOT FOUND THEN RETURN NEW; END IF;
 SELECT * INTO s FROM driver_shifts WHERE driver_id=NEW.driver_id AND user_id=NEW.user_id AND company_id=NEW.company_id AND vehicle_id=NEW.vehicle_id AND ended_at IS NULL FOR UPDATE;
 IF FOUND AND NEW.start_time>=s.started_at THEN NEW.shift_id=s.id; END IF;
 RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION :"schema".security_record_trip_shift()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = :"schema",pg_catalog AS $$
DECLARE s driver_shifts; old_status text; next_status text; inserted_count integer;
BEGIN
 IF NEW.shift_id IS NULL THEN RETURN NEW; END IF;
 IF TG_OP='UPDATE' THEN
  NEW.shift_id=OLD.shift_id;
  old_status=OLD.status;
 ELSE
  NEW.shift_id=NULL;
 END IF;
 IF coalesce(to_jsonb(NEW)->>'is_test','false')='true' THEN RETURN NEW; END IF;
 IF NEW.status NOT IN ('in_progress','completed','cancelled') THEN RETURN NEW; END IF;
 PERFORM 1 FROM drivers WHERE id=NEW.driver_id AND user_id=NEW.user_id AND company_id=NEW.company_id AND status='active' FOR UPDATE;
 IF NOT FOUND THEN RETURN NEW; END IF;
 SELECT * INTO s FROM driver_shifts WHERE driver_id=NEW.driver_id AND user_id=NEW.user_id AND company_id=NEW.company_id AND vehicle_id=NEW.vehicle_id AND ended_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RETURN NEW; END IF;
 -- Do not invent links for earlier offline/history records or move an existing link.
 IF NEW.start_time IS NULL OR NEW.start_time<s.started_at OR (NEW.shift_id IS NOT NULL AND NEW.shift_id<>s.id) THEN RETURN NEW; END IF;
 IF TG_OP='UPDATE' AND OLD.shift_id IS NULL THEN RETURN NEW; END IF;
 NEW.shift_id=s.id;
 IF TG_OP='INSERT' OR (old_status IS DISTINCT FROM NEW.status) THEN
  IF TG_OP='INSERT' AND NEW.status IN ('in_progress','completed') THEN
   IF NEW.status='in_progress' THEN next_status='with_passenger'; END IF;
   INSERT INTO driver_shift_activity(shift_id,user_id,kind,occurred_at,work_status,trip_id,source)
   VALUES(s.id,s.user_id,'trip_start',NEW.start_time,next_status,NEW.id,coalesce(NEW.external_source,NEW.ride_type,'meter')) ON CONFLICT(trip_id,kind) DO NOTHING;
  END IF;
  IF NEW.status IN ('completed','cancelled') THEN
   IF old_status='in_progress' OR (s.work_status='with_passenger' AND EXISTS(SELECT FROM driver_shift_activity WHERE id=NEW.completion_request_key AND shift_id=s.id AND work_status='with_passenger' AND source='portal_trip')) THEN next_status='available'; ELSE next_status=NULL; END IF;
   INSERT INTO driver_shift_activity(shift_id,user_id,kind,occurred_at,work_status,trip_id,source)
   VALUES(s.id,s.user_id,CASE WHEN NEW.status='completed' THEN 'trip_end' ELSE 'trip_cancel' END,coalesce(NEW.end_time,clock_timestamp()),next_status,NEW.id,coalesce(NEW.external_source,NEW.ride_type,'meter')) ON CONFLICT(trip_id,kind) DO NOTHING;
  END IF;
  IF next_status IS NOT NULL THEN UPDATE driver_shifts SET work_status=next_status,version=version+1 WHERE id=s.id; END IF;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS link_trip_shift ON :"schema".trips;
CREATE TRIGGER link_trip_shift BEFORE INSERT OR UPDATE ON :"schema".trips
 FOR EACH ROW EXECUTE FUNCTION :"schema".security_link_trip_shift();
DROP TRIGGER IF EXISTS record_trip_shift ON :"schema".trips;
CREATE TRIGGER record_trip_shift AFTER INSERT OR UPDATE ON :"schema".trips
 FOR EACH ROW EXECUTE FUNCTION :"schema".security_record_trip_shift();
REVOKE ALL ON FUNCTION :"schema".security_record_trip_shift(), :"schema".security_shift_declaration_activity(), :"schema".security_link_trip_shift(), :"schema".security_shift_status(bigint,uuid,uuid,integer,text) FROM PUBLIC, :"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_shift_status(bigint,uuid,uuid,integer,text) TO :"admin_role";

CREATE OR REPLACE FUNCTION :"schema".security_shift_summary(p_shift_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = :"schema",pg_catalog AS $$
 SELECT jsonb_build_object(
    'trip_count',(SELECT count(*) FROM trips t WHERE t.shift_id=p_shift_id AND t.status='completed'),
    'activity_count',(SELECT count(*) FROM driver_shift_events e WHERE e.shift_id=p_shift_id)+(SELECT count(*) FROM driver_shift_activity a WHERE a.shift_id=p_shift_id AND a.kind<>'declaration'),
    'payments',coalesce((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.currency) FROM (
     SELECT coalesce(nullif(upper(t.currency),''),'Onbekend') currency,
      sum(CASE WHEN lower(t.payment_method) IN ('cash','contant') THEN coalesce(t.price,0) ELSE 0 END) cash,
      sum(CASE WHEN lower(t.payment_method) IN ('card','bancontact') THEN coalesce(t.price,0) ELSE 0 END) card,
      sum(CASE WHEN lower(t.payment_method) NOT IN ('cash','contant','card','bancontact') AND nullif(t.payment_method,'') IS NOT NULL THEN coalesce(t.price,0) ELSE 0 END) other,
      sum(CASE WHEN nullif(t.payment_method,'') IS NULL THEN coalesce(t.price,0) ELSE 0 END) unknown,
      sum(coalesce(t.price,0)) total, count(*) FILTER(WHERE t.price IS NULL) missing_amounts
     FROM trips t WHERE t.shift_id=p_shift_id AND t.status='completed' GROUP BY coalesce(nullif(upper(t.currency),''),'Onbekend')
    ) p),'[]'::jsonb));
$$;
REVOKE ALL ON FUNCTION :"schema".security_shift_summary(uuid) FROM PUBLIC, :"user_role";
GRANT EXECUTE ON FUNCTION :"schema".security_shift_summary(uuid) TO :"admin_role";

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
  RETURN jsonb_build_object( 'shift',to_jsonb(s),'summary',coalesce(s.document_summary,security_shift_summary(s.id)), 'activity' ,coalesce((SELECT jsonb_agg(to_jsonb(a) ORDER BY a.recorded_at,a.id) FROM driver_shift_activity a WHERE a.shift_id=s.id),'[]'::jsonb),'events',coalesce((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.version) FROM driver_shift_events e WHERE e.shift_id=s.id),'[]'::jsonb));
 END IF;
 RETURN jsonb_build_object('active',(SELECT to_jsonb(a) FROM driver_shifts a WHERE a.user_id=p_user_id AND a.ended_at IS NULL),
 'shifts',coalesce((SELECT jsonb_agg(to_jsonb(h) ORDER BY h.started_at DESC,h.id) FROM (SELECT * FROM driver_shifts WHERE user_id=p_user_id ORDER BY started_at DESC,id LIMIT 25 OFFSET p_offset) h),'[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION :"schema".security_guard_shift_work()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = :"schema",pg_catalog AS $$
BEGIN
 IF (TG_OP='UPDATE' AND OLD.work_status='with_passenger' AND (NEW.work_status='break' OR NEW.ended_at IS NOT NULL)) OR ((TG_OP='INSERT' OR NEW.work_status='break') AND EXISTS(SELECT FROM trips WHERE driver_id=NEW.driver_id AND status='in_progress')) THEN
  RAISE EXCEPTION 'Complete active trip before shift start or break' USING ERRCODE='40001';
 END IF;
 IF TG_OP='UPDATE' AND NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
  NEW.document_summary=security_shift_summary(NEW.id);
  -- The closing declaration is inserted immediately after this shift update.
  NEW.document_summary=jsonb_set(NEW.document_summary,'{activity_count}',to_jsonb((NEW.document_summary->>'activity_count')::bigint+1));
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_shift_work ON :"schema".driver_shifts;
CREATE TRIGGER guard_shift_work BEFORE INSERT OR UPDATE ON :"schema".driver_shifts
 FOR EACH ROW EXECUTE FUNCTION :"schema".security_guard_shift_work();
REVOKE ALL ON FUNCTION :"schema".security_guard_shift_work() FROM PUBLIC, :"user_role";
COMMIT;
