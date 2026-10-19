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
pricing_migration="$source_dir/20261013_company_pricing.sql"
mail_migration="$source_dir/20261013_mail_delivery.sql"
fleet_migration="$source_dir/20261013_fleet_tracking.sql"
test -s "$migration"
test -s "$pricing_migration"
test -s "$mail_migration"
test -s "$fleet_migration"
push_migration="$source_dir/20261016_native_push.sql"
test -s "$push_migration"
registration_migration="$source_dir/20261017_company_registration.sql"
test -s "$registration_migration"
lifecycle_migration="$source_dir/20261018_company_lifecycle.sql"
test -s "$lifecycle_migration"
billing_migration="$source_dir/20261018_subscription_billing.sql"
test -s "$billing_migration"
billing_mail_migration="$source_dir/20261018_subscription_mail.sql"
test -s "$billing_mail_migration"
company_staff_migration="$source_dir/20261018_company_staff.sql"
test -s "$company_staff_migration"
operations_migration="$source_dir/20261018_operations_centre.sql"
test -s "$operations_migration"
web_approvals_migration="$source_dir/20261018_web_change_approvals.sql"
test -s "$web_approvals_migration"
web_billing_migration="$source_dir/20261018_web_billing.sql"
test -s "$web_billing_migration"
contract_billing_migration="$source_dir/20261018_contract_billing.sql"
test -s "$contract_billing_migration"
email_identity_migration="$source_dir/20261019_email_identity.sql"
test -s "$email_identity_migration"
root=/srv/jouw-driver
cd "$root/foundation"
test ! -e "$root/.env"
test -s "$root/release.json"
test -s "$root/backups/foundation-$backup_tag.tar.age"
test -s "$root/backups/foundation-$backup_tag.sha256"
test "$(sha256sum "$root/backups/foundation-$backup_tag.tar.age" | awk '{print $1}')" = "$(cat "$root/backups/foundation-$backup_tag.sha256")"
test "$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$image")" = "$revision"
export CUSTOMER_IMAGE="$image" CUSTOMER_REVISION="$revision" VERIFIED_BACKUP_TAG="$backup_tag" PORTAL_MIGRATION="$migration" PRICING_MIGRATION="$pricing_migration" MAIL_MIGRATION="$mail_migration" FLEET_MIGRATION="$fleet_migration" PUSH_MIGRATION="$push_migration" REGISTRATION_MIGRATION="$registration_migration" LIFECYCLE_MIGRATION="$lifecycle_migration" BILLING_MIGRATION="$billing_migration" BILLING_MAIL_MIGRATION="$billing_mail_migration" COMPANY_STAFF_MIGRATION="$company_staff_migration" OPERATIONS_MIGRATION="$operations_migration" WEB_APPROVALS_MIGRATION="$web_approvals_migration" WEB_BILLING_MIGRATION="$web_billing_migration" CONTRACT_BILLING_MIGRATION="$contract_billing_migration" EMAIL_IDENTITY_MIGRATION="$email_identity_migration"
node --env-file=.app-staging.env --input-type=module <<'CHECK'
import fs from 'node:fs';
const state=JSON.parse(fs.readFileSync('runtime-mode.json'));
const release=JSON.parse(fs.readFileSync('/srv/jouw-driver/release.json'));
if(state.mode!=='public'||state.image!==release.image||state.revision!==release.revision)throw Error('Live runtime state mismatch');
if(process.env.APP_ORIGIN!=='https://jouw-driver.duckdns.org'||process.env.DEPLOYMENT_MODE!=='production'||process.env.SCHEMA_SOURCE!=='independent'||process.env.SCHEMA_VALIDATED!=='true'||!['true','false'].includes(process.env.CHIRON_PRODUCTION_ENABLED))throw Error('Expected accepted foundation runtime');
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
    cat "$work/app.env" > .app-staging.env
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
cp .app-staging.env "$work/app.env"
cp runtime-mode.json "$work/runtime-mode.json"
cp "$root/release.json" "$work/release.json"
# All SQL and environment values stay on the server; diagnostics contain no rows.
node --env-file=.database.env --input-type=module <<'MIGRATE'
import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const e=process.env;
if(e.POSTGREST_SCHEMA!=='public'||e.SCHEMA_ADMIN_USER!=='jouw_service'||e.POSTGRES_DB!=='jouw_driver')throw Error('Unexpected database scope');
let sql=[e.PORTAL_MIGRATION,e.PRICING_MIGRATION,e.MAIL_MIGRATION,e.FLEET_MIGRATION,e.PUSH_MIGRATION,e.REGISTRATION_MIGRATION,e.LIFECYCLE_MIGRATION,e.BILLING_MIGRATION,e.BILLING_MAIL_MIGRATION,e.COMPANY_STAFF_MIGRATION,e.OPERATIONS_MIGRATION,e.WEB_APPROVALS_MIGRATION,e.WEB_BILLING_MIGRATION,e.CONTRACT_BILLING_MIGRATION,e.EMAIL_IDENTITY_MIGRATION].map(file=>fs.readFileSync(file,'utf8').replaceAll(':"schema"','"public"').replaceAll(':"admin_role"','"jouw_service"').replaceAll(':"user_role"','"jouw_app_user"')).join('\n');
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
let updated=config.replace(pattern,process.env.CUSTOMER_IMAGE);
// The accepted foundation uses app.env_file; newer installations use a mapping.
// Scope inspection to app so another service cannot authorize an env injection.
const lines=updated.split('\n'), start=lines.findIndex(line=>/^  app:\s*$/.test(line));
if(start<0)throw Error('App service unavailable');
let end=start+1;while(end<lines.length&&(!lines[end].trim()||/^ {4}/.test(lines[end])))end++;
let app=lines.slice(start,end).join('\n');
const inherited=/^    env_file:\s*\[\s*\.app-staging\.env\s*\]\s*$/m.test(app);
if(!inherited){
 const mapping=/^( {6})DEPLOYMENT_MODE:.*$/m;
 if(!mapping.test(app))throw Error('App environment mapping unavailable');
 if(!/^      SUBSCRIPTION_SCHEDULER_ENABLED:/m.test(app))app=app.replace(mapping,line=>line+'\n      SUBSCRIPTION_SCHEDULER_ENABLED: ${SUBSCRIPTION_SCHEDULER_ENABLED:-false}');
}
lines.splice(start,end-start,...app.split('\n'));updated=lines.join('\n');
fs.writeFileSync('private-app.yaml',updated,{mode:0o600});
const appEnv=fs.readFileSync('.app-staging.env','utf8').replace(/^SUBSCRIPTION_SCHEDULER_ENABLED=.*\n?/gm,'');
fs.writeFileSync('.app-staging.env',appEnv.trimEnd()+'\nSUBSCRIPTION_SCHEDULER_ENABLED=true\n',{mode:0o600});
IMAGE
docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml up -d --wait --wait-timeout 180 app </dev/null
app=$(docker compose --env-file .app-staging.env --project-name jouw-driver --file private-app.yaml ps -q app)
test "$(docker inspect --format '{{.Config.Image}}' "$app")" = "$image"
test "$(docker inspect --format '{{.HostConfig.ReadonlyRootfs}}' "$app")" = true
docker exec "$app" node scripts/preflight.mjs
docker exec "$app" node scripts/database-readiness.mjs
node --input-type=module <<'ACCEPT'
const base='https://jouw-driver.duckdns.org';
for(const path of ['/','/login','/driver-login','/register-company','/privacy-policy']){
 const r=await fetch(base+path,{redirect:'error',signal:AbortSignal.timeout(20000)});
 if(r.status!==200)throw Error('HTTPS page failed');
 if(path==='/login'&&!r.headers.get('content-security-policy')?.includes("default-src 'self'"))throw Error('Login CSP absent');
}
for(const [path,status,headers] of [['/next_api/company-registrations',401,{}],['/next_api/auth/user',401,{}],['/next_api/auth/account',401,{}],['/next_api/drivers/activity?from=2026-10-01&to=2026-10-17',401,{}],['/next_api/messages/replies?message_id=1',401,{}],['/next_api/trips',401,{}],['/next_api/fleet',401,{}],['/next_api/fleet/location',401,{}],['/next_api/auth/user',403,{Origin:'https://untrusted.example'}],['/admin-setup',404,{}]]){
 if((await fetch(base+path,{headers,redirect:'error',signal:AbortSignal.timeout(15000)})).status!==status)throw Error('Public access guard failed');
}
for(const path of ['/next_api/push/devices','/next_api/push/test','/next_api/push/receipt']){
 const response=await fetch(base+path,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}',redirect:'error',signal:AbortSignal.timeout(15000)});
 if(response.status!==401)throw Error('Native push authentication guard failed');
}
const invalid=await fetch(base+'/next_api/company-registrations',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)});
if(invalid.status!==400)throw Error('Registration validation guard failed');
console.log('HTTPS pages and protected portal endpoints passed.');
ACCEPT
node --input-type=module <<'STATE'
import fs from 'node:fs';
const old=JSON.parse(fs.readFileSync('runtime-mode.json'));
const state={...old,image:process.env.CUSTOMER_IMAGE,revision:process.env.CUSTOMER_REVISION,deployedAt:new Date().toISOString(),previousImage:old.image,verifiedPrelaunchBackup:process.env.VERIFIED_BACKUP_TAG,portalMigration:'20261012_accounts_messages',pricingMigration:'20261013_company_pricing',mailMigration:'20261013_mail_delivery',fleetMigration:'20261013_fleet_tracking',pushMigration:'20261016_native_push',registrationMigration:'20261017_company_registration',companyPlatformMigration:'20261018_operations_centre',webApprovalsMigration:'20261018_web_change_approvals',webBillingMigration:'20261018_web_billing'};
for(const file of ['runtime-mode.json','/srv/jouw-driver/release.json'])fs.writeFileSync(file,JSON.stringify(state,null,2)+'\n',{mode:0o600});
STATE
updated=true
printf 'Portal account and messaging release deployed with the existing database, credentials and HTTPS configuration.\n'
