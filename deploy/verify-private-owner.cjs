// Runs only inside the private application container. Never log response bodies,
// passwords, MFA configuration, OTPs, tokens or cookie values.
const fs=require('node:fs');
const {createHmac}=require('node:crypto');
const assert=require('node:assert/strict');
function otpAt(secret,step){
  if(!/^[A-Z2-7]{32,128}$/.test(secret))throw Error('Invalid private MFA setup');
  let bits=0,acc=0;const bytes=[];
  for(const c of secret){acc=(acc<<5)|'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(c);bits+=5;if(bits>=8){bits-=8;bytes.push((acc>>bits)&255);}}
  const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(step));
  const digest=createHmac('sha1',Buffer.from(bytes)).update(counter).digest();
  return String((digest.readUInt32BE(digest[digest.length-1]&15)&0x7fffffff)%1000000).padStart(6,'0');
}
async function main(){
  const input=JSON.parse(fs.readFileSync(0,'utf8'));
  assert.equal(input.email,'jouw2023@gmail.com');assert.ok(typeof input.password==='string'&&input.password.length>=12);
  const origin=process.env.APP_ORIGIN;assert.equal(origin,'https://jouw-driver.duckdns.org');
  const request=(path,method='GET',body,cookie)=>fetch('http://127.0.0.1:3000'+path,{method,redirect:'error',signal:AbortSignal.timeout(20000),headers:{Origin:origin,'X-Forwarded-Proto':'https',...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const checks=[];
  async function expect(name,promise,status){const response=await promise;assert.equal(response.status,status);checks.push(name);return response;}
  await expect('Unauthenticated access rejected',request('/next_api/auth/user'),401);
  await expect('Owner password alone rejected',request('/next_api/auth/login','POST',input),401);
  const secrets=JSON.parse(process.env.ADMIN_TOTP_SECRETS_JSON||'{}');
  const otp=otpAt(secrets['1'],Math.floor(Date.now()/30000));
  const login=await expect('Owner password and MFA accepted',request('/next_api/auth/login','POST',{...input,otp}),200);
  const cookies=login.headers.getSetCookie();assert.equal(cookies.length,2);
  assert.ok(cookies.every(c=>/HttpOnly/.test(c)&&/Secure/.test(c)&&/SameSite=Lax/.test(c)));checks.push('Secure HTTP-only login cookies');
  let cookie=cookies.map(c=>c.split(';')[0]).join('; ');
  try{
    await expect('Authenticated owner session accepted',request('/next_api/auth/user','GET',undefined,cookie),200);
    await expect('Owner administration endpoint accepted',request('/next_api/companies','GET',undefined,cookie),200);
    await expect('Consumed MFA code rejected',request('/next_api/auth/login','POST',{...input,otp}),401);
    const refreshed=await expect('Owner session refresh accepted',request('/next_api/auth/refresh','POST',{},cookie),200);
    const previous=cookie;cookie=refreshed.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');assert.ok(cookie);
    await expect('Replayed refresh rejected',request('/next_api/auth/refresh','POST',{},previous),401);
    await expect('Owner logout accepted',request('/next_api/auth/logout','POST',{},cookie),200);
    await expect('Logged-out access rejected',request('/next_api/auth/user','GET',undefined,cookie),401);
  }finally{
    // Close the temporary test login even when an intermediate check fails.
    await request('/next_api/auth/logout','POST',{},cookie).catch(()=>{});
  }
  console.log(JSON.stringify({privateOwnerAuthentication:'passed',checks,database:'Native deployed PostgreSQL through deployed PostgREST',publicMaintenance:true}));
}
main().catch(()=>{console.error('Private owner authentication verification failed; credential and response values were not logged.');process.exitCode=1;});
