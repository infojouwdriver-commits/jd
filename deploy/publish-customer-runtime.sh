#!/bin/bash
set -euo pipefail
umask 077
image=${1:?Image required}
revision=${2:?Revision required}
backup_tag=${3:?Verified backup run required}
[[ "$image" =~ ^ghcr.io/infojouwdriver-commits/jd@sha256:[a-f0-9]{64}$ ]]
[[ "$revision" =~ ^[a-f0-9]{40}$ ]]
[[ "$backup_tag" =~ ^[0-9]+-1$ ]]
cd /srv/jouw-driver/foundation
mkdir .customer-publication-lock
published=false
cleanup(){
  if test "$published" != true; then
    cat Caddyfile-before-production > Caddyfile
    docker compose --env-file .database.env --project-name jouw-driver --file compose.yaml exec -T edge caddy reload --config /etc/caddy/Caddyfile </dev/null >/dev/null 2>&1 || true
  fi
  rmdir .customer-publication-lock
}
trap cleanup EXIT
test ! -e /srv/jouw-driver/.env
test ! -e /srv/jouw-driver/release.json
sudo test -f .enroll-state/owner-enrolled.json
test -s "/srv/jouw-driver/backups/foundation-$backup_tag.tar.age"
export CUSTOMER_IMAGE="$image" CUSTOMER_REVISION="$revision" VERIFIED_BACKUP_TAG="$backup_tag"
node --input-type=module <<'PREPARED'
import fs from 'node:fs';
const state=JSON.parse(fs.readFileSync('runtime-mode.json'));
if(state.mode!=='prepared'||state.image!==process.env.CUSTOMER_IMAGE||state.revision!==process.env.CUSTOMER_REVISION)throw Error('Prepared runtime mismatch');
const owner=JSON.parse(fs.readFileSync('owner-runtime-verification.json'));
if(owner.image!==state.image||owner.checks!==11||Date.parse(owner.verifiedAt)<Date.parse(state.preparedAt))throw Error('Owner acceptance predates the prepared image');
const backup=fs.statSync('/srv/jouw-driver/backups/foundation-'+process.env.VERIFIED_BACKUP_TAG+'.tar.age');
if(backup.mtimeMs<Date.parse(state.preparedAt))throw Error('Backup predates production preparation');
PREPARED
app=$(docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml ps -q app)
test "$(docker inspect --format '{{.State.Health.Status}}' "$app")" = healthy
test "$(docker inspect --format '{{.Config.Image}}' "$app")" = "$image"
docker exec "$app" node scripts/preflight.mjs
docker exec "$app" node scripts/database-readiness.mjs
cat /srv/jouw-driver/customer-release/Caddyfile.customers > Caddyfile
docker compose --env-file .database.env --project-name jouw-driver --file compose.yaml exec -T edge caddy validate --config /etc/caddy/Caddyfile </dev/null >/dev/null 2>&1
docker compose --env-file .database.env --project-name jouw-driver --file compose.yaml exec -T edge caddy reload --config /etc/caddy/Caddyfile </dev/null >/dev/null 2>&1
node --input-type=module <<'PUBLIC'
const base='https://jouw-driver.duckdns.org';
for(const path of ['/login','/driver-login','/privacy-policy','/healthz']){
 const r=await fetch(base+path,{redirect:'error',signal:AbortSignal.timeout(20000)});
 if(r.status!==200)throw Error('Public page failed: '+path);
 if(path==='/login'&&!r.headers.get('content-security-policy')?.includes("default-src 'self'"))throw Error('Security header absent');
 console.log('Public HTTPS page verified: '+path);
}
for(const [path,status,headers]of [['/next_api/auth/user',401,{}],['/next_api/companies',401,{}],['/next_api/auth/user',403,{Origin:'https://untrusted.example'}],['/admin-setup',404,{}]]){
 const r=await fetch(base+path,{headers,redirect:'error',signal:AbortSignal.timeout(15000)});
 if(r.status!==status)throw Error('Public access guard failed');
}
console.log('Anonymous access, foreign origin and closed enrollment verified.');
PUBLIC
node --input-type=module <<'RELEASE'
import fs from 'node:fs';
const state={mode:'public',image:process.env.CUSTOMER_IMAGE,revision:process.env.CUSTOMER_REVISION,deployedAt:new Date().toISOString(),verifiedPrelaunchBackup:process.env.VERIFIED_BACKUP_TAG,historicalArchive:'private; not operational',chironTransmission:false,emailSelfRegistration:false};
fs.writeFileSync('runtime-mode.json',JSON.stringify(state,null,2)+'\n',{mode:0o600});
fs.writeFileSync('/srv/jouw-driver/release.json',JSON.stringify(state,null,2)+'\n',{mode:0o600,flag:'wx'});
RELEASE
published=true
printf 'Customer portal published over verified HTTPS; database, MFA and archived history remain protected.\n'
