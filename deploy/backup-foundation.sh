#!/bin/bash
# Foundation backups: never expose plaintext dumps, settings or role hashes.
set -euo pipefail
umask 077
tag=${1:?Run identifier required}
[[ "$tag" =~ ^[0-9]+-[0-9]+$ ]]
root=/srv/jouw-driver
foundation="$root/foundation"
backup_root="$root/backups"
cd "$foundation"
# This acceptance drill covers the private foundation. Before public rollout,
# update backup coverage for its final live runtime and consistent hot snapshots.
test ! -e "$root/.env"
test ! -e "$root/release.json"
sudo test -f .enroll-state/owner-enrolled.json
test "$(curl --proto '=https' --tlsv1.2 --silent --show-error --max-time 15 -o /dev/null -w '%{http_code}' https://jouw-driver.duckdns.org/)" = 503
test -s "$backup_root/recipients-$tag.txt"
command -v age >/dev/null
work=$(mktemp -d "$backup_root/.snapshot.XXXXXX")
trap 'rm -rf "$work"' EXIT
mkdir "$work/runtime"
db=$(docker compose --env-file .database.env --project-name jouw-driver --file compose.yaml ps -q db)
test -n "$db"
docker exec -i "$db" psql -U postgres -d jouw_driver -Atq < "$backup_root/backup-table-counts.sql" > "$work/table-counts.json"
docker exec "$db" pg_dump -U postgres -d jouw_driver --format=custom > "$work/database.dump"
docker exec "$db" pg_dumpall -U postgres --globals-only > "$work/roles.sql"
docker exec -i "$db" psql -U postgres -d jouw_driver -Atq < "$backup_root/backup-table-counts.sql" > "$work/table-counts-after.json"
cmp --silent "$work/table-counts.json" "$work/table-counts-after.json"
test -s "$work/database.dump"
test -s "$work/roles.sql"
for file in .app-staging.env .database.env compose.yaml private-app.yaml Caddyfile owner-identity.json schema-initialized.json schema-audit.json; do
  cp -- "$file" "$work/runtime/$file"
done
sudo cat .enroll-state/owner-enrolled.json > "$work/runtime/owner-enrolled.json"
cp "$backup_root/backup-table-counts.sql" "$work/backup-table-counts.sql"
# A private summary is included inside encryption, with counts and all hashes.
SNAPSHOT_DIR="$work" node --input-type=module <<'MANIFEST'
import fs from 'node:fs';import {createHash} from 'node:crypto';
const root=process.env.SNAPSHOT_DIR;
const sha=file=>createHash('sha256').update(fs.readFileSync(root+'/'+file)).digest('hex');
const manifest={createdAt:new Date().toISOString(),scope:'private foundation; database, role definitions and runtime encryption keys',format:'age-encrypted tar with PostgreSQL custom dump',databaseDumpSha256:sha('database.dump'),rolesSha256:sha('roles.sql'),tableCounts:JSON.parse(fs.readFileSync(root+'/table-counts.json','utf8'))};
fs.writeFileSync(root+'/manifest.json',JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
MANIFEST
tar -C "$work" -cf - database.dump roles.sql table-counts.json backup-table-counts.sql manifest.json runtime | age -R "$backup_root/recipients-$tag.txt" -o "$work/snapshot.tar.age"
test -s "$work/snapshot.tar.age"
ln "$work/snapshot.tar.age" "$backup_root/foundation-$tag.tar.age"
sha256sum "$backup_root/foundation-$tag.tar.age" | awk '{print $1}' > "$backup_root/foundation-$tag.sha256"
rm -f "$backup_root/recipients-$tag.txt"
printf 'Encrypted database, roles and private runtime snapshot created; plaintext staging files removed on exit.\n'
