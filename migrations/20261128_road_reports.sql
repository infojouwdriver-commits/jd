BEGIN;
SET LOCAL search_path TO :"schema", pg_catalog;
CREATE TABLE IF NOT EXISTS :"schema".road_reports (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 kind text NOT NULL CHECK (kind IN ('collision','hazard','closure','congestion')),
 lat double precision NOT NULL CHECK (lat BETWEEN -90 AND 90),
 lon double precision NOT NULL CHECK (lon BETWEEN -180 AND 180),
 reporter bigint NOT NULL REFERENCES :"schema".users(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT statement_timestamp(),
 expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS road_reports_expiry_idx ON :"schema".road_reports(expires_at);
CREATE INDEX IF NOT EXISTS road_reports_reporter_idx ON :"schema".road_reports(reporter,created_at);
CREATE TABLE IF NOT EXISTS :"schema".road_report_votes (
 report_id bigint NOT NULL REFERENCES :"schema".road_reports(id) ON DELETE CASCADE,
 voter bigint NOT NULL REFERENCES :"schema".users(id) ON DELETE CASCADE,
 present boolean NOT NULL,
 PRIMARY KEY (report_id,voter)
);
REVOKE ALL ON :"schema".road_reports, :"schema".road_report_votes FROM PUBLIC, :"user_role";
GRANT SELECT, INSERT, UPDATE, DELETE ON :"schema".road_reports, :"schema".road_report_votes TO :"admin_role";
GRANT USAGE, SELECT ON SEQUENCE :"schema".road_reports_id_seq TO :"admin_role";

CREATE OR REPLACE FUNCTION :"schema".road_report_command(p_actor bigint,p_kind text,p_lat double precision,p_lon double precision,p_report bigint,p_present boolean)
RETURNS bigint LANGUAGE plpgsql SET search_path FROM CURRENT AS $$
DECLARE target bigint;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM drivers d JOIN users u ON u.id=d.user_id WHERE d.user_id=p_actor AND u.is_active AND d.archived_at IS NULL) THEN
  RAISE EXCEPTION 'Active driver required' USING ERRCODE='42501';
 END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('road-reports',0));
 IF p_report IS NOT NULL THEN
  SELECT id INTO target FROM road_reports WHERE id=p_report AND expires_at>statement_timestamp()
   AND abs(lat-p_lat)<=0.02 AND abs(lon-p_lon)<=0.03 FOR UPDATE;
  IF target IS NULL OR p_present IS NULL THEN RETURN NULL; END IF;
  INSERT INTO road_report_votes VALUES(target,p_actor,p_present)
   ON CONFLICT (report_id,voter) DO UPDATE SET present=EXCLUDED.present;
  IF (SELECT COUNT(*) FILTER (WHERE NOT present)-COUNT(*) FILTER (WHERE present) FROM road_report_votes WHERE report_id=target)>=2 THEN
   UPDATE road_reports SET expires_at=statement_timestamp() WHERE id=target;
  END IF;
  RETURN target;
 END IF;
 IF p_kind IS NULL OR p_kind NOT IN ('collision','hazard','closure','congestion') OR p_lat IS NULL OR p_lon IS NULL
  OR p_lat NOT BETWEEN -90 AND 90 OR p_lon NOT BETWEEN -180 AND 180 THEN
  RAISE EXCEPTION 'Invalid report' USING ERRCODE='22023';
 END IF;
 DELETE FROM road_reports WHERE id IN (SELECT id FROM road_reports WHERE expires_at < statement_timestamp() - interval '1 day' LIMIT 500);
 SELECT id INTO target FROM road_reports
  WHERE kind=p_kind AND expires_at>statement_timestamp() AND abs(lat-p_lat)<=0.00055 AND abs(lon-p_lon)<=0.00085
  ORDER BY id LIMIT 1;
 IF target IS NOT NULL THEN RETURN target; END IF;
 IF (SELECT COUNT(*) FROM road_reports WHERE reporter=p_actor AND created_at>statement_timestamp()-interval '15 minutes')>=4 THEN RETURN NULL; END IF;
 INSERT INTO road_reports(kind,lat,lon,reporter,expires_at)
 VALUES(p_kind,round(p_lat::numeric,5),round(p_lon::numeric,5),p_actor,statement_timestamp()+CASE p_kind
  WHEN 'closure' THEN interval '90 minutes' WHEN 'collision' THEN interval '45 minutes' ELSE interval '30 minutes' END)
 RETURNING id INTO target;
 RETURN target;
END $$;
REVOKE ALL ON FUNCTION :"schema".road_report_command(bigint,text,double precision,double precision,bigint,boolean) FROM PUBLIC, :"user_role";
GRANT EXECUTE ON FUNCTION :"schema".road_report_command(bigint,text,double precision,double precision,bigint,boolean) TO :"admin_role";
CREATE TABLE IF NOT EXISTS :"schema".airport_road_notices (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 kind text NOT NULL CHECK (kind IN ('meeting_changed','taxi_entrance_closed')),
 detail text NOT NULL CHECK (char_length(detail) BETWEEN 3 AND 240),
 created_at timestamptz NOT NULL DEFAULT statement_timestamp(),
 expires_at timestamptz NOT NULL
);
REVOKE ALL ON :"schema".airport_road_notices FROM PUBLIC, :"user_role";
GRANT SELECT, INSERT, UPDATE ON :"schema".airport_road_notices TO :"admin_role";
GRANT USAGE, SELECT ON SEQUENCE :"schema".airport_road_notices_id_seq TO :"admin_role";
NOTIFY pgrst, 'reload schema';
COMMIT;
