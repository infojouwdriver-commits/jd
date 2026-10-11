#!/bin/bash
# Promote the already verified private app without replacing its data volumes.
set -euo pipefail
umask 077
image=${1:?Immutable image required}
revision=${2:?Revision required}
[[ "$image" =~ ^ghcr.io/infojouwdriver-commits/jd@sha256:[a-f0-9]{64}$ ]]
[[ "$revision" =~ ^[a-f0-9]{40}$ ]]
cd /srv/jouw-driver/foundation
test ! -e /srv/jouw-driver/.env
test ! -e /srv/jouw-driver/release.json
sudo test -f .enroll-state/owner-enrolled.json
test -s /srv/jouw-driver/backups/foundation-38144586719-1.tar.age
test "$(curl --proto '=https' --tlsv1.2 --silent --show-error --max-time 15 -o /dev/null -w '%{http_code}' https://jouw-driver.duckdns.org/login)" = 503
test "$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$image")" = "$revision"
db=$(docker compose --env-file .database.env --project-name jouw-driver --file compose.yaml ps -q db)
test "$(docker exec "$db" psql -U postgres -d jouw_driver -Atq -c 'SELECT public.independent_schema_ready()')" = t
test "$(docker exec "$db" psql -U postgres -d jouw_driver -Atq -c "SELECT count(*) FROM unnest(ARRAY['jouw_app_user','jouw_service','jouw_gateway']) r(role) WHERE has_schema_privilege(role,'jouw_driver_archive_20261009','USAGE')")" = 0
if test ! -f .app-before-production.env; then cp .app-staging.env .app-before-production.env; fi
if test ! -f private-app-before-production.yaml; then cp private-app.yaml private-app-before-production.yaml; fi
if test ! -f Caddyfile-before-production; then cp Caddyfile Caddyfile-before-production; fi
export CUSTOMER_IMAGE="$image" CUSTOMER_REVISION="$revision"
node --input-type=module <<'CONFIG'
import fs from 'node:fs';
let config=fs.readFileSync('.app-staging.env','utf8');
for(const [key,value]of Object.entries({DEPLOYMENT_MODE:'production',SCHEMA_VALIDATED:'true',SCHEMA_SOURCE:'independent',CHIRON_TRANSMISSION_ENABLED:'false'})){
 const pattern=new RegExp('^'+key+'=.*$','m');if(!pattern.test(config))throw Error('Required existing runtime setting absent');config=config.replace(pattern,key+'='+value);
}
fs.writeFileSync('.app-staging.env',config,{mode:0o600});
let compose=fs.readFileSync('private-app.yaml','utf8');
const previous=/ghcr\.io\/infojouwdriver-commits\/jd@sha256:[a-f0-9]{64}/g;
if((compose.match(previous)||[]).length!==1)throw Error('Expected one application image');
fs.writeFileSync('private-app.yaml',compose.replace(previous,process.env.CUSTOMER_IMAGE),{mode:0o600});
fs.writeFileSync('runtime-mode.json',JSON.stringify({mode:'prepared',image:process.env.CUSTOMER_IMAGE,revision:process.env.CUSTOMER_REVISION,preparedAt:new Date().toISOString(),historicalArchive:'private; not operational'},null,2)+'\n',{mode:0o600});
CONFIG
docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml up -d --force-recreate --wait --wait-timeout 180 app
app=$(docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml ps -q app)
test "$(docker exec "$app" id -u)" = 10001
test "$(docker inspect --format '{{.HostConfig.ReadonlyRootfs}}' "$app")" = true
for id in "$app" "$db"; do
  bindings=$(docker inspect --format '{{json .HostConfig.PortBindings}}' "$id")
  test "$bindings" = null || test "$bindings" = '{}'
done
docker exec "$app" node scripts/preflight.mjs
docker exec "$app" node scripts/database-readiness.mjs
docker exec "$app" node -e 'if(process.env.DEPLOYMENT_MODE!=="production"||process.env.SCHEMA_VALIDATED!=="true")process.exit(1);console.log("Production configuration and validated operational schema confirmed")'
printf 'Production application prepared privately; original database and TLS volumes preserved.\n'
