import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {PGlite} = await import(process.env.PGLITE_MODULE_PATH || '@electric-sql/pglite');
const hash = '$2b$12$' + 'a'.repeat(53), newHash = '$2b$12$' + 'b'.repeat(53);
async function database() {
 const db = new PGlite(); await db.waitReady;
 await db.exec(fs.readFileSync(new URL('../schema/reconstructed-staging.sql',import.meta.url),'utf8'));
 await db.exec('CREATE ROLE service_role; CREATE ROLE browser_role;');
 for(const file of ['20261009_security.sql','20261012_accounts_messages.sql']) await db.exec(fs.readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8').replaceAll(':"schema"','public').replaceAll(':"admin_role"','service_role'));
 return db;
}
test('company provision creates the login identity and link atomically, refuses reused email and revokes old sessions on reset',async()=>{
 const db=await database();
 try {
  const save=(id,company,account)=>db.query('SELECT security_save_company_account($1,$2::jsonb,$3::jsonb) result',[id,JSON.stringify(company),JSON.stringify(account)]);
  const company={name:'Synthetic company',vat_number:'BE0000000001',kbo_number:'0000000001',email:' COMPANY@EXAMPLE.INVALID '};
  const account={email:company.email,password:hash,role:'browser_role'};
  const c=(await save(null,company,account)).rows[0].result;
  assert.equal(c.portal_login_enabled,true);assert.equal(c.password_hash,undefined);assert.equal(c.bank_account_iban,null,'never copy another company bank account');
  const u=(await db.query('SELECT * FROM users')).rows[0];assert.equal(u.email,'company@example.invalid');assert.equal(u.user_type,'manager');assert.equal(u.password,hash);
  const link=(await db.query('SELECT * FROM company_users')).rows[0];assert.equal(link.company_id,c.id);assert.equal(link.user_id,u.id);
  await assert.rejects(save(null,{...company,name:'Duplicate'},account));
  assert.equal((await db.query('SELECT count(*)::int n FROM companies')).rows[0].n,1,'duplicate credentials roll back company insertion');
  await db.query("INSERT INTO refresh_tokens(user_id,token,revoked) VALUES($1,'synthetic',false)",[u.id]);
  await save(c.id,{name:'Changed'}, {...account,password:newHash});
  assert.equal((await db.query('SELECT password FROM users')).rows[0].password,newHash);
  assert.equal((await db.query('SELECT revoked FROM refresh_tokens')).rows[0].revoked,true);
  assert.ok((await db.query('SELECT security_revoked_before FROM users')).rows[0].security_revoked_before);
  const record=(await save(null,{...company,email:null},{})).rows[0].result;assert.equal(record.portal_login_enabled,false);
  await db.exec('SET ROLE browser_role');await assert.rejects(save(null,company,account));await db.exec('RESET ROLE');
 } finally {await db.close();}
});
test('driver messages reach management, replies check ownership and locks, recipient flags and all writes roll back on error',async()=>{
 const db=await database();
 try {
  await db.exec("INSERT INTO companies(id,name) VALUES(100,'Synthetic tenant'),(200,'Other tenant'); INSERT INTO users(id,email,user_type) VALUES(900,'admin@example.invalid','admin'),(901,'driver@example.invalid','driver'),(902,'other@example.invalid','driver'); INSERT INTO drivers(id,user_id,company_id,full_name,status) VALUES(101,901,100,'Driver one','active'),(102,902,200,'Driver two','active');");
  const write=(actor,admin,message,parent=null)=>db.query('SELECT security_write_message($1,$2,$3::jsonb,$4) result',[actor,admin,JSON.stringify(message),parent]);
  const m=(await write(901,false,{subject:'Support',message_body:'Please help',target_company_id:200,recipient_user_id:902})).rows[0].result;
  assert.equal(m.sender_type,'driver');assert.equal(m.target_company_id,100,'driver cannot spoof another tenant');assert.equal(m.recipient_type,'management');
  const reply=(await write(900,true,{message_body:'Resolved shortly'},m.id)).rows[0].result;
  assert.equal(reply.parent_message_id,m.id);
  const recipient=(await db.query('SELECT * FROM message_recipients')).rows[0];assert.equal(recipient.recipient_user_id,901);assert.equal(recipient.is_deleted,false);assert.equal(recipient.is_read,false);
  await assert.rejects(write(902,false,{message_body:'Intrusion'},m.id));
  await db.query("UPDATE internal_messages SET status='resolved',is_locked=true WHERE id=$1",[m.id]);
  await assert.rejects(write(901,false,{message_body:'Closed reply'},m.id));
  const sent=(await write(900,true,{subject:'Notice',message_body:'Synthetic notice',recipient_type:'all_active_drivers',target_company_id:100})).rows[0].result;
  const recipients=(await db.query('SELECT recipient_user_id FROM message_recipients WHERE message_id=$1',[sent.id])).rows;
  assert.deepEqual(recipients.map(row=>row.recipient_user_id),[901]);
  await assert.rejects(write(902,false,{message_body:'Other company'},sent.id));
  const inbox=(await db.query('SELECT security_driver_messages(901) result')).rows[0].result;
  assert.ok(inbox.some(item=>item.id===m.id),'sender sees own root even without recipient records');
  assert.ok(inbox.some(item=>item.id===sent.id),'recipient sees broadcast root');
  assert.ok(inbox.every(item=>item.parent_message_id===null),'reply records do not pollute conversation listing');
  const otherInbox=(await db.query('SELECT security_driver_messages(902) result')).rows[0].result;
  assert.ok(otherInbox.every(item=>item.id!==sent.id));
  const before=(await db.query('SELECT count(*)::int n FROM internal_messages')).rows[0].n;
  await assert.rejects(write(900,true,{subject:'Invalid',message_body:'No recipient',recipient_type:'individual',recipient_user_id:902,target_company_id:100}));
  assert.equal((await db.query('SELECT count(*)::int n FROM internal_messages')).rows[0].n,before);
  await db.exec('SET ROLE browser_role');await assert.rejects(write(901,false,{subject:'Direct API',message_body:'Blocked'}));await db.exec('RESET ROLE');
 } finally {await db.close();}
});
test('self account changes require the current hash, bind email codes to the user and target address, consume once and revoke sessions atomically',async()=>{
 const db=await database();
 try {
  await db.query("INSERT INTO users(id,email,password,user_type) VALUES(901,'one@example.invalid',$1,'driver'),(902,'two@example.invalid',$1,'driver')",[hash]);
  await db.exec("INSERT INTO drivers(id,user_id) VALUES(101,901); INSERT INTO driver_credentials(driver_id,is_active) VALUES(101,true); INSERT INTO refresh_tokens(user_id,token,revoked) VALUES(901,'synthetic',false);");
  const change=(expected,email=null,password=null,code=null)=>db.query('SELECT security_change_account(901,$1,$2,$3,$4) result',[expected,email,password,code]);
  await assert.rejects(change('stale',null,newHash));
  await change(hash,null,newHash);
  assert.equal((await db.query('SELECT password_hash FROM driver_credentials')).rows[0].password_hash,newHash);
  assert.equal((await db.query('SELECT revoked FROM refresh_tokens')).rows[0].revoked,true);
  await db.query("INSERT INTO user_passcode(id,pass_object,security_purpose,passcode,valid_until) VALUES(1,'new@example.invalid','account-email:902','code',clock_timestamp()+interval '3 minutes'),(2,'new@example.invalid','account-email:901','code',clock_timestamp()+interval '3 minutes'),(3,'two@example.invalid','account-email:901','code',clock_timestamp()+interval '3 minutes')");
  await assert.rejects(change(newHash,'new@example.invalid',null,1));
  await assert.rejects(change(newHash,'wrong@example.invalid',null,2));
  await assert.rejects(change(newHash,'two@example.invalid',null,3));
  assert.equal((await db.query('SELECT revoked FROM user_passcode WHERE id=3')).rows[0].revoked,false,'failed email update does not consume code');
  await change(newHash,'new@example.invalid',null,2);
  assert.equal((await db.query('SELECT email FROM users WHERE id=901')).rows[0].email,'new@example.invalid');
  assert.equal((await db.query('SELECT revoked FROM user_passcode WHERE id=2')).rows[0].revoked,true);
  await assert.rejects(change(newHash,'new@example.invalid',null,2));
  await db.exec('SET ROLE browser_role');await assert.rejects(change(newHash,null,hash));await db.exec('RESET ROLE');
 } finally {await db.close();}
});
