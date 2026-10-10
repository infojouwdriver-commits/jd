import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('../rollout.mjs',import.meta.url));
const image='ghcr.io/example/jouw-driver@sha256:'+'a'.repeat(64);
const revision='b'.repeat(40);
function refuses(args,env,message) {
  const result=spawnSync(process.execPath,[script,...args],{encoding:'utf8',env:{PATH:process.env.PATH,...env}});
  assert.equal(result.status,1);
  assert.match(result.stderr,message);
}
test('mutable image tags are rejected before host actions',()=>refuses(['ghcr.io/example/jouw-driver:latest',revision,'staging'],{},/Immutable GHCR image digest required/));
test('untrusted revision text is rejected before host actions',()=>refuses([image,'main;echo unsafe','staging'],{},/Full release revision required/));
test('production selection cannot deploy a staging environment',()=>refuses([image,revision,'production'],{DEPLOYMENT_MODE:'staging'},/Deployment environment must match/));
test('missing backup recipient fails before database startup',()=>refuses([image,revision,'staging'],{DEPLOYMENT_MODE:'staging'},/Encrypted backup recipient required/));
test('production rejects unvalidated schema before host actions',()=>refuses([image,revision,'production'],{DEPLOYMENT_MODE:'production',BACKUP_RECIPIENT:'public-test-recipient',SCHEMA_VALIDATED:'false'},/Production requires validated database/));
