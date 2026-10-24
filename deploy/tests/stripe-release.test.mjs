import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('Stripe deployment requires exact tested source/image, native restore drill and isolated financial schema grants',()=>{
 const s=fs.readFileSync('.github/workflows/publish-stripe-billing.yml','utf8');
 for(const x of ["refs/heads/main",'release-domain-candidate.yml','verify-domain-image.yml','backup-foundation.yml','checks / native-database','20261024_stripe_billing.sql','STRIPE_MIGRATION_SHA','independent_schema_ready','has_function_privilege','has_table_privilege','preserved.sha256','Unsigned payment notification accepted'])assert.ok(s.includes(x),x);
 assert.ok(!s.includes('STRIPE_SECRET_KEY'));assert.match(s,/--no-deps/);
});
test('private configuration is main-only, environment-scoped, stdin-only and never makes customer payments',()=>{
 const s=fs.readFileSync('.github/workflows/configure-stripe.yml','utf8');assert.match(s,/environment: production/);assert.ok(s.includes('secrets.STRIPE_SECRET_KEY'));assert.ok(s.includes('refs/heads/main'));assert.ok(s.includes("printf '%s' \"$STRIPE_KEY\" | ssh"));assert.ok(!s.includes('--api-key'));assert.ok(!/set -x/.test(s));
});
