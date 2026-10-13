import test from 'node:test';
import assert from 'node:assert/strict';
import {originAllowed, isPlatformAdmin, publicEndpoint, disabledEndpoint, memberEndpoint, ownsRecord, calendarMonthDeadline, safeChironUrl, stripSecrets} from '../src/lib/security-policy.ts';
test('reject attacker domains and suffix confusion', () => {
 for (const origin of ['https://evil.zoer.cloud','https://app.example.com.evil.test','https://evil.example.com','https://app.example.com:444',null]) assert.equal(originAllowed(origin,'https://app.example.com'),false);
 assert.equal(originAllowed('https://app.example.com','https://app.example.com'),true);
});
test('admin role is granted only by exact server configuration', () => {
 assert.equal(isPlatformAdmin('1','11,21'),false);
 assert.equal(isPlatformAdmin('1',''),false);
 assert.equal(isPlatformAdmin('1','1,2'),true);
});
test('public read cannot authorize anonymous writes', () => {
 assert.equal(publicEndpoint('/next_api/gdpr/privacy-policy','GET'),true);
 assert.equal(publicEndpoint('/next_api/gdpr/privacy-policy','POST'),false);
 assert.equal(publicEndpoint('/next_api/stats','GET'),false);
 assert.equal(publicEndpoint('/next_api/companies','GET'),false);
});
test('driver cannot enter admin paths, manager cannot edit platform settings', () => {
 assert.equal(memberEndpoint('/next_api/companies','PUT','driver'),false);
 assert.equal(memberEndpoint('/next_api/chiron-settings','PUT','manager'),false);
 assert.equal(memberEndpoint('/next_api/drivers/profile','POST','driver'),false);
 assert.equal(memberEndpoint('/next_api/trips/end','POST','driver'),true);
 assert.equal(memberEndpoint('/next_api/fleet/location','POST','driver'),true);
 assert.equal(memberEndpoint('/next_api/fleet/location','DELETE','driver'),false);
 assert.equal(memberEndpoint('/next_api/fleet','GET','manager'),true);
 assert.equal(memberEndpoint('/next_api/fleet','POST','manager'),false);
});
test('cross-user objects denied', () => {
 assert.equal(ownsRecord({user_id:4},'5'),false);
 assert.equal(ownsRecord(null,'5'),false);
 assert.equal(ownsRecord({user_id:5},'5'),true);
});
test('calendar month deadlines handle leap years and month ends', () => {
 assert.equal(calendarMonthDeadline(new Date('2024-01-31T12:30:00Z')).toISOString(),'2024-02-29T12:30:00.000Z');
 assert.equal(calendarMonthDeadline(new Date('2026-01-31T12:30:00Z')).toISOString(),'2026-02-28T12:30:00.000Z');
});
test('SSRF, non-HTTPS, credentials and custom ports denied', () => {
 for (const url of ['http://mow.api.vlaanderen.be/oauth/token','https://127.0.0.1/','https://mow.api.vlaanderen.be.evil.test/','https://u:p@mow.api.vlaanderen.be/','https://mow.api.vlaanderen.be:444/']) assert.throws(() => safeChironUrl(url));
 assert.equal(safeChironUrl('https://mow.api.vlaanderen.be/oauth/token'),'https://mow.api.vlaanderen.be/oauth/token');
});
test('nested credentials are removed from responses', () => {
 assert.deepEqual(stripSecrets({name:'safe',password:'x',nested:[{chiron_prod_client_secret:'x',access_token:'y',id:1}]}),{name:'safe',nested:[{id:1}]});
});
test('risky legacy integrations fail closed', () => {
 for (const path of ['/next_api/invoices/view','/next_api/websocket','/next_api/auth/google-login','/next_api/ai-assistant/chat']) assert.equal(disabledEndpoint(path),true);
});
import {encryptSecret, decryptSecret} from '../src/lib/secret-vault.ts';
test('secret encryption authenticates contents and field context', () => {
 process.env.DATA_ENCRYPTION_KEY = 'a'.repeat(64);
 const encrypted = encryptSecret('test-secret','companies.chiron_test_client_secret');
 assert.ok(!encrypted.includes('test-secret'));
 assert.notEqual(encrypted,encryptSecret('test-secret','companies.chiron_test_client_secret'));
 assert.equal(decryptSecret(encrypted,'companies.chiron_test_client_secret'),'test-secret');
 assert.throws(() => decryptSecret(encrypted,'companies.chiron_prod_client_secret'));
 const chunks = encrypted.split('.'); chunks[1] = 'A'.repeat(chunks[1].length);
 assert.throws(() => decryptSecret(chunks.join('.'),'companies.chiron_test_client_secret'));
});
