#!/bin/bash
# Update only an accepted UI image; preserve runtime settings, data and HTTPS.
set -euo pipefail
umask 077
image=${1:?Image required}
revision=${2:?Revision required}
backup_tag=${3:?Backup required}
[[ "$image" =~ ^ghcr.io/infojouwdriver-commits/jd@sha256:[a-f0-9]{64}$ ]]
[[ "$revision" =~ ^[a-f0-9]{40}$ ]]
[[ "$backup_tag" =~ ^[0-9]+-1$ ]]
cd /srv/jouw-driver/foundation
test ! -e /srv/jouw-driver/.env
test -s /srv/jouw-driver/release.json
test -s "/srv/jouw-driver/backups/foundation-$backup_tag.tar.age"
test "$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$image")" = "$revision"
export CUSTOMER_IMAGE="$image" CUSTOMER_REVISION="$revision" VERIFIED_BACKUP_TAG="$backup_tag"
node --input-type=module <<'BEFORE'
import fs from 'node:fs';
const s=JSON.parse(fs.readFileSync('runtime-mode.json'));
const r=JSON.parse(fs.readFileSync('/srv/jouw-driver/release.json'));
if(s.mode!=='public'||s.image!==r.image||s.revision!==r.revision)throw Error('Live state mismatch');
if(fs.statSync('/srv/jouw-driver/backups/foundation-'+process.env.VERIFIED_BACKUP_TAG+'.tar.age').mtimeMs<Date.parse(s.deployedAt))throw Error('Backup must cover the current live release');
BEFORE
work=$(mktemp -d .ui-update.XXXXXX)
cp private-app.yaml "$work/private-app.yaml"
cp runtime-mode.json "$work/runtime-mode.json"
cp /srv/jouw-driver/release.json "$work/release.json"
updated=false
cleanup(){
  if test "$updated" != true; then
    cat "$work/private-app.yaml" > private-app.yaml
    cat "$work/runtime-mode.json" > runtime-mode.json
    cat "$work/release.json" > /srv/jouw-driver/release.json
    docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml up -d --wait --wait-timeout 180 app </dev/null >/dev/null 2>&1 || true
  fi
  rm -rf "$work"
}
trap cleanup EXIT
node --input-type=module <<'IMAGE'
import fs from 'node:fs';
const c=fs.readFileSync('private-app.yaml','utf8'),p=/ghcr\.io\/infojouwdriver-commits\/jd@sha256:[a-f0-9]{64}/g;
if((c.match(p)||[]).length!==1)throw Error('Expected one app image');
fs.writeFileSync('private-app.yaml',c.replace(p,process.env.CUSTOMER_IMAGE),{mode:0o600});
IMAGE
docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml up -d --wait --wait-timeout 180 app </dev/null
app=$(docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml ps -q app)
test "$(docker inspect --format '{{.State.Health.Status}}' "$app")" = healthy
test "$(docker inspect --format '{{.Config.Image}}' "$app")" = "$image"
test "$(docker inspect --format '{{.HostConfig.ReadonlyRootfs}}' "$app")" = true
docker exec "$app" node scripts/preflight.mjs
docker exec "$app" node scripts/database-readiness.mjs
node --input-type=module <<'ACCEPT'
const base='https://jouw-driver.duckdns.org';
for(const p of ['/login','/driver-login','/privacy-policy']){
const r=await fetch(base+p,{redirect:'error',signal:AbortSignal.timeout(20000)});
if(r.status!==200)throw Error('Live page failed');
if(p==='/login'&&!r.headers.get('content-security-policy')?.includes("default-src 'self'"))throw Error('Login security policy missing');
}
for(const [p,n,headers]of [['/next_api/auth/user',401,{}],['/next_api/companies',401,{}],['/next_api/auth/user',403,{Origin:'https://untrusted.example'}],['/admin-setup',404,{}]]){
if((await fetch(base+p,{headers,redirect:'error',signal:AbortSignal.timeout(15000)})).status!==n)throw Error('Live access guard failed');
}
console.log('Updated HTTPS UI and unchanged account access protection verified.');
ACCEPT
node --input-type=module <<'STATE'
import fs from 'node:fs';
const old=JSON.parse(fs.readFileSync('runtime-mode.json'));
const state={...old,image:process.env.CUSTOMER_IMAGE,revision:process.env.CUSTOMER_REVISION,deployedAt:new Date().toISOString(),previousImage:old.image,verifiedPrelaunchBackup:process.env.VERIFIED_BACKUP_TAG};
for(const p of ['runtime-mode.json','/srv/jouw-driver/release.json'])fs.writeFileSync(p,JSON.stringify(state,null,2)+'\n',{mode:0o600});
STATE
updated=true
printf 'Customer login contrast update deployed; database, runtime credentials and HTTPS preserved.\n'
