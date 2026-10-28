import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const workflow=fs.readFileSync(new URL('../../.github/workflows/publish-driver-reference-email.yml',import.meta.url),'utf8');
const gate=workflow.split("node --input-type=module <<'GATE'\n")[1].split('\n          GATE')[0];
function scope(files,ref='refs/heads/main') {
  return spawnSync(process.execPath,['--input-type=module'],{
    input:`globalThis.fetch=async url=>({ok:true,json:async()=>({status:'ahead',files:String(url).includes('/compare/6560324')?${JSON.stringify(['.github/workflows/publish-marketing-seo-once.yml','docs/MARKETING_SEO_AR.md','graphify-out/GRAPH_REPORT.md','graphify-out/SOURCE_INDEX.md','graphify-out/graph.json','graphify-out/source-manifest.json','src/middleware.ts','tests/marketing-seo.test.mjs'].map(filename=>({filename,status:'modified'})))}:${JSON.stringify(files)}})});\n`+gate,
    encoding:'utf8',env:{PATH:process.env.PATH,GITHUB_REF:ref,GITHUB_SHA:'a'.repeat(40),EXPECTED_BASELINE:'b'.repeat(40),GITHUB_REPOSITORY:'fixture/jd',GH_TOKEN:'synthetic'},
  });
}
test('driver reference release accepts its reviewed frontend scope on main',()=>{
  const r=scope([{filename:'src/components/driver/DriverShiftWorkspace.tsx',status:'modified'}]);assert.equal(r.status,0,r.stderr);
});
test('driver reference publication refuses native, API, database, dependency and deleted source changes',()=>{
  for(const filename of ['driver-app/src/app/index.tsx','mobile/android/app/build.gradle','src/app/next_api/trips/end/route.ts','migrations/unreviewed.sql','pnpm-lock.yaml'])assert.notEqual(scope([{filename,status:'modified'}]).status,0,filename);
  assert.notEqual(scope([{filename:'src/app/driver/home/page.tsx',status:'removed'}]).status,0);
  assert.notEqual(scope([]).status,0);
  assert.notEqual(scope([{filename:'src/app/driver/home/page.tsx',status:'modified'}],'refs/heads/other').status,0);
});
test('publication is gated by full checks, reference, exact image and recoverable backup',()=>{
  assert.match(workflow,/needs: \[scope, reference, checks, domain, build, image-acceptance, backup\]/);
  assert.match(workflow,/ACCEPTANCE_APP_IMAGE: \$\{\{ needs.build.outputs.digest \}\}/);
  assert.match(workflow,/uses: \.\/\.github\/workflows\/backup-foundation.yml/);
  assert.match(workflow,/sha256sum \.app-staging.env \.database.env compose.yaml Caddyfile/);
  const publish=workflow.split('  publish:')[1];
  assert.match(publish,/migrations\/20261028_receipt_email.sql/);assert.match(publish,/Migration identity mismatch/);assert.doesNotMatch(publish,/apply-release|UPDATE invoices|UPDATE trips|native-driver.yml/);
  assert.match(publish,/Previous application requires operator recovery/);
});
