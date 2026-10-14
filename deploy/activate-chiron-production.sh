#!/bin/bash
# Explicit production activation after authenticated OAuth and recent TEST acceptance.
set -euo pipefail
umask 077
company=${1:?Company required}
revision=${2:?Accepted live revision required}
backup_tag=${3:?Verified backup required}
[[ "$company" =~ ^[1-9][0-9]{0,8}$ ]] || { printf 'Company id required\n' >&2; exit 1; }
[[ "$revision" =~ ^[a-f0-9]{40}$ ]] || { printf 'Full revision required\n' >&2; exit 1; }
[[ "$backup_tag" =~ ^[0-9]+-[0-9]+$ ]] || { printf 'Verified backup tag required\n' >&2; exit 1; }
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
root=/srv/jouw-driver
cd "$root/foundation"
export CHIRON_ACTIVATION_REVISION="$revision" VERIFIED_BACKUP_TAG="$backup_tag"
test -s "$root/backups/foundation-$backup_tag.tar.age"
test "$(sha256sum "$root/backups/foundation-$backup_tag.tar.age" | awk '{print $1}')" = "$(cat "$root/backups/foundation-$backup_tag.sha256")"
node --env-file=.app-staging.env --input-type=module <<'CHECK'
import fs from 'node:fs';
const state=JSON.parse(fs.readFileSync('runtime-mode.json')),release=JSON.parse(fs.readFileSync('/srv/jouw-driver/release.json'));
if(state.mode!=='public'||state.revision!==process.env.CHIRON_ACTIVATION_REVISION||state.image!==release.image||state.revision!==release.revision||process.env.DEPLOYMENT_MODE!=='production'||process.env.SCHEMA_VALIDATED!=='true'||process.env.CHIRON_TRANSMISSION_ENABLED!=='true')throw Error('Accepted runtime required');
if(fs.statSync('/srv/jouw-driver/backups/foundation-'+process.env.VERIFIED_BACKUP_TAG+'.tar.age').mtimeMs<Date.parse(state.deployedAt))throw Error('Backup must cover current runtime');
CHECK
mkdir "$root/.deployment-lock"
work=$(mktemp -d .chiron-activation.XXXXXX)
changed=false
completed=false
cleanup(){
  if test "$completed" != true && test "$changed" = true; then
    cp "$work/env" .app-staging.env
    cp "$work/runtime" runtime-mode.json
    cp "$work/release" "$root/release.json"
    docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml up -d --force-recreate --wait --wait-timeout 180 app </dev/null >/dev/null 2>&1 || printf 'Previous app requires operator recovery\n' >&2
  fi
  rm -rf "$work"
  rmdir "$root/.deployment-lock"
}
trap cleanup EXIT
cp .app-staging.env "$work/env"
cp runtime-mode.json "$work/runtime"
cp "$root/release.json" "$work/release"
app=$(docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml ps -q app)
image=$(docker inspect --format '{{.Config.Image}}' "$app")
test "$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$app")" = "$revision"
# Tokens and decrypted credentials stay in the existing app container.
docker exec -i -e CHIRON_PROBE_COMPANY_ID="$company" "$app" node --input-type=module < "$source_dir/chiron-production-probe.mjs" > "$work/probe.json"
changed=true
node --input-type=module <<'ENABLE'
import fs from 'node:fs';
let env=fs.readFileSync('.app-staging.env','utf8');
const rows=env.match(/^CHIRON_PRODUCTION_ENABLED=.*$/gm)||[];
if(rows.length!==1||!/^CHIRON_PRODUCTION_ENABLED=(true|false)$/.test(rows[0]))throw Error('Expected explicit production gate');
env=env.replace(/^CHIRON_PRODUCTION_ENABLED=.*$/m,'CHIRON_PRODUCTION_ENABLED=true');
fs.writeFileSync('.app-staging.env.next',env,{mode:0o600});fs.renameSync('.app-staging.env.next','.app-staging.env');
ENABLE
docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml up -d --force-recreate --wait --wait-timeout 180 app </dev/null
app=$(docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml ps -q app)
test "$(docker inspect --format '{{.Config.Image}}' "$app")" = "$image"
docker exec "$app" node -e "if(process.env.CHIRON_PRODUCTION_ENABLED!=='true')process.exit(1)"
docker exec "$app" node scripts/preflight.mjs
docker exec "$app" node scripts/database-readiness.mjs
export CHIRON_ACTIVATION_PROOF="$work/probe.json"
node --input-type=module <<'RECORD'
import fs from 'node:fs';
const proof=JSON.parse(fs.readFileSync(process.env.CHIRON_ACTIVATION_PROOF)),state=JSON.parse(fs.readFileSync('runtime-mode.json'));
const record={...proof,revision:process.env.CHIRON_ACTIVATION_REVISION,backup:process.env.VERIFIED_BACKUP_TAG,activatedAt:new Date().toISOString()};
fs.writeFileSync('/srv/jouw-driver/chiron-production-activation.json',JSON.stringify(record)+'\n',{mode:0o600});
const next={...state,deployedAt:record.activatedAt,chironProductionActivatedAt:record.activatedAt};
for(const file of ['runtime-mode.json','/srv/jouw-driver/release.json'])fs.writeFileSync(file,JSON.stringify(next,null,2)+'\n',{mode:0o600});
RECORD
completed=true
printf 'Chiron production OAuth verified and server sending enabled. Actual ride acceptance remains unverified.\n'
