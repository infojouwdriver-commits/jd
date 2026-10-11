\set ON_ERROR_STOP on
CREATE FUNCTION pg_temp.backup_table_counts() RETURNS jsonb
LANGUAGE plpgsql AS $$
DECLARE item record; rows bigint; result jsonb := '{}'::jsonb;
BEGIN
  FOR item IN SELECT schemaname,tablename FROM pg_catalog.pg_tables
    WHERE schemaname NOT LIKE 'pg_%' AND schemaname <> 'information_schema'
    ORDER BY schemaname,tablename LOOP
    EXECUTE format('SELECT count(*) FROM %I.%I',item.schemaname,item.tablename) INTO rows;
    result := result || jsonb_build_object(item.schemaname||'.'||item.tablename,rows);
  END LOOP;
  RETURN result;
END;
$$;
SELECT pg_temp.backup_table_counts();
