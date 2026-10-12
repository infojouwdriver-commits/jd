-- Preserve existing values while allowing euro cents and fractional surcharge percentages.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE :"schema".companies
  ALTER COLUMN minimum_fare TYPE NUMERIC USING minimum_fare::numeric,
  ALTER COLUMN airport_surcharge TYPE NUMERIC USING airport_surcharge::numeric,
  ALTER COLUMN night_surcharge_percentage TYPE NUMERIC USING night_surcharge_percentage::numeric,
  ALTER COLUMN peak_hour_surcharge_percentage TYPE NUMERIC USING peak_hour_surcharge_percentage::numeric;
COMMIT;
