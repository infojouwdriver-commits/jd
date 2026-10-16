import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3001';
const checks = [];
async function check(path, options, status) {
 const result = await fetch(base + path,options);
 assert.equal(result.status,status,`${path}: ${await result.clone().text()}`);
 checks.push({path,status:result.status}); return result;
}
const denied = await check('/next_api/companies',{},401);
assert.match(denied.headers.get('cache-control'),/no-store/);
await check('/next_api/companies',{headers:{authorization:'Bearer malformed'}},401);
for(const path of ['/next_api/push/devices','/next_api/push/test','/next_api/push/receipt']){
 await check(path,{method:'POST',headers:{origin:base,'Content-Type':'application/json'},body:'{}'},401);
 await check(path,{method:'POST',headers:{origin:'https://untrusted.example','Content-Type':'application/json'},body:'{}'},403);
}
await check('/next_api/auth/login',{method:'POST',headers:{origin:'https://attacker.zoer.cloud','Content-Type':'application/json'},body:'{}'},403);
await check('/next_api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'},403);
await check('/next_api/auth/login',{method:'POST',headers:{origin:base,'Content-Type':'text/plain'},body:'{}'},415);
await check('/next_api/ai-assistant/chat',{method:'POST',headers:{origin:base,'Content-Type':'application/json'},body:'{}'},503);
await check('/next_api/invoices/view?token=legacy',{},503);
await check('/zoer_proxy/anything',{},410);
const contractPrint = await check('/contract-print/1',{},200);
assert.match(contractPrint.headers.get('cache-control'),/no-store/);
const page = await check('/privacy-policy',{},200);
assert.match(page.headers.get('content-security-policy'),/script-src 'self' 'nonce-/);
assert.match(page.headers.get('content-security-policy'),/connect-src 'self' https:\/\/api\.mapbox\.com(?: |;)/);
assert.equal(page.headers.get('x-frame-options'),'DENY');
const nonce = page.headers.get('content-security-policy').match(/'nonce-([^']+)'/)[1];
assert.ok((await page.text()).includes(`nonce="${nonce}"`));
console.log(JSON.stringify({passed:checks.length,checks},null,2));
