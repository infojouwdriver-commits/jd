import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {portalEnvironment,replaceImage,maintenanceProxy,validateInputs,oldOrigin,portalOrigin} from '../jouww-cutover.mjs';
const image=n=>'ghcr.io/infojouwdriver-commits/jd@sha256:'+n.repeat(64);
test('domain transition changes only exact origin settings and preserves secret bytes',()=>{
  const before='JWT_SECRET=synthetic-not-a-secret\nAPP_ORIGIN='+oldOrigin+'\nTRUST_PROXY=true\nCHIRON_PRODUCTION_ENABLED=true\nMAIL_PROVIDER=existing\n';
  const after=portalEnvironment(before);
  assert.match(after,new RegExp('APP_ORIGIN='+portalOrigin.replaceAll('.','\\.')));
  assert.ok(after.includes('TRUSTED_ORIGINS='+oldOrigin+'\n'));
  for(const line of before.split('\n').filter(l=>l&&!l.startsWith('APP_ORIGIN=')))assert.ok(after.split('\n').includes(line));
  assert.ok(!after.includes('https://jouww.com'));
});
for(const text of ['APP_ORIGIN=https://unreviewed.test\n','APP_ORIGIN='+oldOrigin+'\nAPP_ORIGIN='+oldOrigin,'APP_ORIGIN='+oldOrigin+'\nTRUSTED_ORIGINS=https://jouww.com'])test('ambiguous or broadened origin configuration fails closed: '+text.split('\n').length,()=>assert.throws(()=>portalEnvironment(text)));
test('compose replacement preserves everything except the single prior immutable image',()=>{
  const text='services:\n  app:\n    image: '+image('a')+'\n    env_file: [.app-staging.env]\n';
  assert.equal(replaceImage(text,image('a'),image('b')),text.replace(image('a'),image('b')));
  assert.throws(()=>replaceImage(text+text,image('a'),image('b')));
  assert.throws(()=>replaceImage(text,image('b'),image('c')));
  assert.throws(()=>replaceImage(text,image('a'),'jd:latest'));
});
test('TLS preparation retains the old vhost byte-for-byte and serves maintenance on new hosts',()=>{
  const old='jouw-driver.duckdns.org {\n reverse_proxy app:3000\n}\n';
  const next=maintenanceProxy(old);
  assert.ok(next.startsWith(old));assert.match(next,/jouww.com, www.jouww.com, app.jouww.com/);
  assert.match(next,/protocols tls1.2 tls1.3/);assert.match(next,/503/);
  assert.throws(()=>maintenanceProxy(next));
});
test('invalid phase, mutable digest and shell metacharacters fail input checks',()=>{
  validateInputs('prepare-tls',image('a'),'b'.repeat(40),'123-1');
  for(const args of [['publish',image('a'),'b'.repeat(40),'123-1'],['activate','jd:latest','b'.repeat(40),'123-1'],['verify',image('a'),'main;whoami','123-1'],['rollback',image('a'),'b'.repeat(40),'123;whoami']])assert.throws(()=>validateInputs(...args));
});
test('transition has no database migration, restore or key rotation command',()=>{
  const source=fs.readFileSync(new URL('../jouww-cutover.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(source,/pg_restore|\bpsql\b|docker\('volume'|CHIRON_PRODUCTION_ENABLED\s*:/);
  assert.match(source,/\.deployment-lock/);assert.match(source,/--no-deps/);
  assert.match(source,/Automatic configuration rollback failed/);
});
