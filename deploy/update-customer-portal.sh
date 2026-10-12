#!/bin/bash
# Apply the additive portal migration to the existing foundation runtime only.
set -euo pipefail
umask 077
image=${1:?Immutable image required}
revision=${2:?Full revision required}
backup_tag=${3:?Verified backup tag required}
[[ "$image" =~ ^ghcr.io/infojouwdriver-commits/jd@sha256:[a-f0-9]{64}$ ]] || { printf 'Immutable image required\n' >&2; exit 1; }
[[ "$revision" =~ ^[a-f0-9]{40}$ ]] || { printf 'Full revision required\n' >&2; exit 1; }
[[ "$backup_tag" =~ ^[0-9]+-[0-9]+$ ]] || { printf 'Verified backup tag required\n' >&2; exit 1; }
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
migration="$source_dir/20261012_accounts_messages.sql"
test -s "$migration"
root=/srv/jouw-driver
cd "$root/foundation"
test ! -e "$root/.env"
test -s "$root/release.json"
test -s "$root/backups/foundation-$backup_tag.tar.age"
test -s "$root/backups/foundation-$backup_tag.sha256"
test "$(sha256sum "$root/backups/foundation-$backup_tag.tar.age" | awk '{print $1}')" = "$(cat "$root/backups/foundation-$backup_tag.sha256")"
test "$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$image")" = "$revision"
export CUSTOMER_IMAGE="$image" CUSTOMER_REVISION="$revision" VERIFIED_BACKUP_TAG="$backup_tag" PORTAL_MIGRATION="$migration"
node --env-file=.app-staging.env --input-type=module <<'CHECK'
import fs from 'node:fs';
const state=JSON.parse(fs.readFileSync('runtime-mode.json'));
const release=JSON.parse(fs.readFileSync('/srv/jouw-driver/release.json'));
if(state.mode!=='public'||state.image!==release.image||state.revision!==release.revision)throw Error('Live runtime state mismatch');
if(process.env.APP_ORIGIN!=='https://jouw-driver.duckdns.org'||process.env.DEPLOYMENT_MODE!=='production'||process.env.SCHEMA_SOURCE!=='independent'||process.env.SCHEMA_VALIDATED!=='true'||process.env.CHIRON_PRODUCTION_ENABLED!=='false')throw Error('Expected accepted foundation runtime');
if(fs.statSync('/srv/jouw-driver/backups/foundation-'+process.env.VERIFIED_BACKUP_TAG+'.tar.age').mtimeMs<Date.parse(state.deployedAt))throw Error('Backup must cover the current release');
CHECK
mkdir "$root/.deployment-lock"
work=''
updated=false
rollback_needed=false
cleanup(){
  if test "$updated" != true && test "$rollback_needed" = true; then
    # Additive functions preserve compatibility with the previous application.
    # Never overwrite the database with an older dump or discard new records.
    cat "$work/private-app.yaml" > private-app.yaml
    cat "$work/runtime-mode.json" > runtime-mode.json
    cat "$work/release.json" > "$root/release.json"
    docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml up -d --wait --wait-timeout 180 app </dev/null >/dev/null 2>&1 || printf 'Previous app requires operator recovery\n' >&2
  fi
  if test -n "$work"; then rm -rf "$work"; fi
  rmdir "$root/.deployment-lock"
}
trap cleanup EXIT
work=$(mktemp -d .portal-update.XXXXXX)
cp private-app.yaml "$work/private-app.yaml"
cp runtime-mode.json "$work/runtime-mode.json"
cp "$root/release.json" "$work/release.json"
# All SQL and environment values stay on the server; diagnostics contain no rows.
node --env-file=.database.env --input-type=module <<'MIGRATE'
import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const e=process.env;
if(e.POSTGREST_SCHEMA!=='public'||e.SCHEMA_ADMIN_USER!=='jouw_service'||e.POSTGRES_DB!=='jouw_driver')throw Error('Unexpected database scope');
let sql=fs.readFileSync(e.PORTAL_MIGRATION,'utf8').replaceAll(':"schema"','"public"').replaceAll(':"admin_role"','"jouw_service"');
const check="SELECT public.independent_schema_ready() AND NOT EXISTS(SELECT FROM unnest(ARRAY['jouw_app_user','jouw_service','jouw_gateway']) r(role) WHERE has_schema_privilege(role,'jouw_driver_archive_20261009','USAGE'));";
const args=['compose','--env-file','.database.env','--project-name','jouw-driver','--file','compose.yaml','exec','-T','db','psql','-U','postgres','-d','jouw_driver','-v','ON_ERROR_STOP=1','-Atq'];
const before=spawnSync('docker',args,{input:check,encoding:'utf8'});
if(before.status!==0||before.stdout.trim()!=='t')throw Error('Operational schema or archive isolation is not accepted');
const migrated=spawnSync('docker',args,{input:sql+"\nNOTIFY pgrst, 'reload schema';\n",encoding:'utf8'});
if(migrated.status!==0)throw Error('Portal migration rejected; inspect diagnostics privately on the server');
console.log('Additive portal migration applied; private archive access remains closed.');
MIGRATE
# Restart the existing gateway to remove any ambiguity about schema-cache refresh.
docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml restart postgrest </dev/null
rollback_needed=true
node --input-type=module <<'IMAGE'
import fs from 'node:fs';
const config=fs.readFileSync('private-app.yaml','utf8'),pattern=/ghcr\.io\/infojouwdriver-commits\/jd@sha256:[a-f0-9]{64}/g;
if((config.match(pattern)||[]).length!==1)throw Error('Expected one application image');
fs.writeFileSync('private-app.yaml',config.replace(pattern,process.env.CUSTOMER_IMAGE),{mode:0o600});
IMAGE
docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml up -d --wait --wait-timeout 180 app </dev/null
app=$(docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml ps -q app)
test "$(docker inspect --format '{{.Config.Image}}' "$app")" = "$image"
test "$(docker inspect --format '{{.HostConfig.ReadonlyRootfs}}' "$app")" = true
docker exec "$app" node scripts/preflight.mjs
docker exec "$app" node scripts/database-readiness.mjs
node --input-type=module <<'ACCEPT'
const base='https://jouw-driver.duckdns.org';
for(const path of ['/','/login','/driver-login','/privacy-policy']){
 const r=await fetch(base+path,{redirect:'error',signal:AbortSignal.timeout(20000)});
 if(r.status!==200)throw Error('HTTPS page failed');
 if(path==='/login'&&!r.headers.get('content-security-policy')?.includes("default-src 'self'"))throw Error('Login CSP absent');
}
for(const [path,status,headers] of [['/next_api/auth/user',401,{}],['/next_api/auth/account',401,{}],['/next_api/messages/replies?message_id=1',401,{}],['/next_api/trips',401,{}],['/next_api/auth/user',403,{Origin:'https://untrusted.example'}],['/admin-setup',404,{}]]){
 if((await fetch(base+path,{headers,redirect:'error',signal:AbortSignal.timeout(15000)})).status!==status)throw Error('Public access guard failed');
}
console.log('HTTPS pages and protected portal endpoints passed.');
ACCEPT
node --input-type=module <<'STATE'
import fs from 'node:fs';
const old=JSON.parse(fs.readFileSync('runtime-mode.json'));
const state={...old,image:process.env.CUSTOMER_IMAGE,revision:process.env.CUSTOMER_REVISION,deployedAt:new Date().toISOString(),previousImage:old.image,verifiedPrelaunchBackup:process.env.VERIFIED_BACKUP_TAG,portalMigration:'20261012_accounts_messages'};
for(const file of ['runtime-mode.json','/srv/jouw-driver/release.json'])fs.writeFileSync(file,JSON.stringify(state,null,2)+'\n',{mode:0o600});
STATE
updated=true
printf 'Portal account and messaging release deployed with the existing database, credentials and HTTPS configuration.\n'
