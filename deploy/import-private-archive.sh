#!/bin/bash
set -euo pipefail
umask 077
base=/srv/jouw-driver/archive-transfer/archive-20261009-v1
cd /srv/jouw-driver/foundation
test ! -e /srv/jouw-driver/.env
test ! -e /srv/jouw-driver/release.json
sudo test -f .enroll-state/owner-enrolled.json
test "$(curl --proto '=https' --tlsv1.2 --silent --show-error --max-time 15 -o /dev/null -w '%{http_code}' https://jouw-driver.duckdns.org/)" = 503
# The verified encrypted pre-import snapshot is retained on the same host.
test -s /srv/jouw-driver/backups/foundation-38143550924-1.tar.age
db=$(docker compose --env-file .database.env --project-name jouw-driver --file compose.yaml ps -q db)
test -n "$db"
test "$(docker exec "$db" psql -U postgres -d jouw_driver -Atq -c "SELECT count(*) FROM pg_namespace WHERE nspname='jouw_driver_archive_20261009'")" = 0
work=$(mktemp -d "$base/.verify.XXXXXX")
trap 'rm -rf "$work"' EXIT
docker exec -i "$db" psql -U postgres -d jouw_driver -Atq < "$base/backup-table-counts.sql" > "$work/before.json"
# stdin is the exact trusted, hashed converter output; errors stay private.
if ! docker exec -i "$db" psql --no-psqlrc -U postgres -d jouw_driver -v ON_ERROR_STOP=1 -q > "$work/import-output" 2> "$work/import-errors"; then
  printf 'PostgreSQL rejected the private archive transaction.\n' >&2
  exit 1
fi
docker exec -i "$db" psql -U postgres -d jouw_driver -Atq < "$base/backup-table-counts.sql" > "$work/after.json"
docker exec -i "$db" psql -U postgres -d jouw_driver -Atq < "$base/private-archive-audit.sql" > "$work/audit.json"
VERIFY_DIR="$work" node --input-type=module <<'VERIFY'
import fs from 'node:fs';
const root=process.env.VERIFY_DIR,before=JSON.parse(fs.readFileSync(root+'/before.json')),after=JSON.parse(fs.readFileSync(root+'/after.json')),audit=JSON.parse(fs.readFileSync(root+'/audit.json'));
for(const [key,count]of Object.entries(before))if(after[key]!==count)throw Error('Operational table count changed');
const archived=Object.entries(after).filter(([key])=>key.startsWith('jouw_driver_archive_20261009.'));
if(archived.length!==77||archived.reduce((n,[,count])=>n+count,0)!==12832||after['jouw_driver_archive_20261009.invoices']!==110||after['jouw_driver_archive_20261009.trips']!==1181)throw Error('Historical preservation counts failed');
const failed=audit.findings.filter(f=>f.invalidRows>0);
if(failed.length!==19)throw Error('Historical contract findings changed');
fs.writeFileSync(root+'/verification.json',JSON.stringify({nativePostgreSQLImport:'passed',operationalTableCounts:'preserved',archiveTables:77,archiveRows:12832,invoices:110,trips:1181,failedContractChecks:failed.length,operationalAcceptance:false,verifiedAt:new Date().toISOString()},null,2)+'\n',{mode:0o600});
VERIFY
access=$(docker exec "$db" psql -U postgres -d jouw_driver -Atq -c "SELECT count(*) FROM unnest(ARRAY['jouw_app_user','jouw_service','jouw_gateway']) AS r(role) WHERE has_schema_privilege(role,'jouw_driver_archive_20261009','USAGE')")
test "$access" = 0
cp "$work/verification.json" "$base/verification.json"
cp "$work/audit.json" "$base/contract-audit.json"
cat "$base/verification.json"
printf 'Native historical archive preserved; application roles cannot access its schema. Public maintenance remains enabled.\n'
