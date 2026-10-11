// One-time owner enrollment behind Caddy basic authentication; never publish its port.
import http from 'node:http';
import fs from 'node:fs';
import {createHmac,timingSafeEqual} from 'node:crypto';

export function totp(secret,step) {
  if(!/^[A-Z2-7]{32,128}$/.test(secret))throw Error('Invalid enrollment configuration');
  let bits=0,value=0;const bytes=[];
  for(const c of secret){value=(value<<5)|'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(c);bits+=5;if(bits>=8){bits-=8;bytes.push((value>>bits)&255);}}
  const message=Buffer.alloc(8);message.writeBigUInt64BE(BigInt(step));
  const hash=createHmac('sha1',Buffer.from(bytes)).update(message).digest();
  return String((hash.readUInt32BE(hash[hash.length-1]&15)&0x7fffffff)%1000000).padStart(6,'0');
}
const escapeHtml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

export function createEnrollmentHandler({env=process.env,marker='/state/owner-enrolled.json',fetchImpl=fetch,now=Date.now}={}){
  const owner=env.INITIAL_ADMIN_EMAIL;
  if(owner!=='jouw2023@gmail.com'||env.PLATFORM_ADMIN_IDS!=='1'||!/^\$2[aby]\$12\$/.test(env.INITIAL_ADMIN_HASH||''))throw Error('Owner configuration is not ready');
  const secret=JSON.parse(env.ADMIN_TOTP_SECRETS_JSON)['1'];totp(secret,0);
  let busy=false,attempts=0,bucket=0;
  const api=async(path,body)=>{
    const seconds=Math.floor(now()/1000),encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
    const input=encode({alg:'HS256',typ:'JWT'})+'.'+encode({sub:'0',role:env.SCHEMA_ADMIN_USER,iat:seconds,exp:seconds+60,aud:'jouw-driver'});
    const token=input+'.'+createHmac('sha256',env.JWT_SECRET).update(input).digest('base64url');
    return fetchImpl(env.POSTGREST_URL+path,{method:body?'POST':'GET',redirect:'error',signal:AbortSignal.timeout(10000),headers:{Authorization:'Bearer '+token,'Accept-Profile':env.POSTGREST_SCHEMA,'Content-Profile':env.POSTGREST_SCHEMA,'Content-Type':'application/json',Prefer:'return=representation'},body:body?JSON.stringify(body):undefined});
  };
  return async(req,res)=>{
    const send=(status,text,type='text/plain; charset=utf-8')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"});res.end(text);};
    if(req.url!=='/admin-setup'&&req.url!=='/admin-setup/finish')return send(404,'Not found');
    if(fs.existsSync(marker))return send(200,'تم إعداد حساب الإدارة. أغلق هذه الصفحة.');
    if(req.method==='GET'&&req.url==='/admin-setup'){
      return send(200,`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>إعداد حساب الإدارة — JOUW DRIVER</title><body style="font:18px system-ui;max-width:650px;margin:60px auto;padding:20px"><h1>إعداد المصادقة الثنائية</h1><p>حساب الإدارة: ${escapeHtml(owner)}</p><p>كلمة المرور هي التي أدخلتها في إعداد الحساب. أضف حساباً يدوياً في Google Authenticator أو Microsoft Authenticator، باسم JOUW DRIVER، واختر رمزاً يعتمد على الوقت.</p><p>مفتاح الإعداد الخاص — انسخه داخل تطبيق المصادقة فقط:</p><code style="display:block;overflow-wrap:anywhere;direction:ltr;padding:20px;background:#eee;user-select:all">${secret}</code><p>لا تشاركه في المحادثة أو الصور. أدخل الرمز المكوّن من 6 أرقام الذي يظهر في التطبيق لإكمال الإعداد:</p><form id="setup"><input id="otp" name="otp" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required><button>تأكيد وتفعيل حساب الإدارة</button></form><p id="result"></p><script>document.getElementById('setup').onsubmit=async e=>{e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;try{const r=await fetch('/admin-setup/finish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({otp:document.getElementById('otp').value})});document.getElementById('result').textContent=await r.text();if(r.ok){document.getElementById('otp').value='';document.querySelector('code').remove();e.target.remove();}}catch{document.getElementById('result').textContent='تعذر الإكمال؛ حاول مرة أخرى.'}finally{button.disabled=false}};</script></body></html>`,'text/html; charset=utf-8');
    }
    if(req.method!=='POST'||req.url!=='/admin-setup/finish')return send(405,'Method not allowed');
    if(req.headers.origin!==env.APP_ORIGIN||req.headers['content-type']!=='application/json')return send(403,'Request rejected');
    const minute=Math.floor(now()/60000);if(bucket!==minute){bucket=minute;attempts=0;}if(++attempts>10)return send(429,'حاول بعد دقيقة.');
    if(busy)return send(409,'الإعداد جارٍ.');
    let body='',ownsLock=false;try{
      for await(const part of req){body+=part;if(Buffer.byteLength(body)>256)return send(413,'Request too large');}
      const otp=JSON.parse(body).otp;
      if(typeof otp!=='string'||!/^\d{6}$/.test(otp))return send(400,'أدخل 6 أرقام.');
      const step=Math.floor(now()/30000);
      if(![step-1,step,step+1].filter(s=>s>=0).some(s=>timingSafeEqual(Buffer.from(totp(secret,s)),Buffer.from(otp))))return send(401,'رمز المصادقة غير صحيح؛ جرّب الرمز الحالي.');
      if(busy)return send(409,'الإعداد جارٍ.');busy=true;ownsLock=true;
      // The private service-only RPC checks the empty installation, inserts the
      // reviewed owner and advances the sequence together under a transaction lock.
      const created=await api('/rpc/security_enroll_initial_owner',{p_password:env.INITIAL_ADMIN_HASH});
      if(created.status===409)return send(409,'توجد حسابات سابقة؛ توقف الإعداد للمراجعة.');
      if(!created.ok)throw Error('Account creation failed');
      const row=await created.json();if(row?.id!==1||row.email!==owner)throw Error('Account confirmation failed');
      fs.writeFileSync(marker,JSON.stringify({email:owner,enrolledAt:new Date(now()).toISOString()})+'\n',{flag:'wx',mode:0o600});
      return send(200,'تم تفعيل حساب الإدارة والمصادقة الثنائية. الموقع ما زال في مرحلة الإعداد.');
    }catch{return send(503,'تعذر إكمال الإعداد بأمان؛ يلزم فحص الخادم.');}
    finally{if(ownsLock)busy=false;}
  };
}
if(process.argv[1]&&new URL(import.meta.url).pathname===process.argv[1]){
  http.createServer(createEnrollmentHandler()).listen(4000,'0.0.0.0',()=>console.log('Owner enrollment service started; credential values are not logged.'));
}
