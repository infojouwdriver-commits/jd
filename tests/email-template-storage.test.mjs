import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {PGlite}=await import(process.env.PGLITE_MODULE_PATH||'@electric-sql/pglite');
const sqlName=name=>readFileSync(new URL('../migrations/'+name+'.sql',import.meta.url),'utf8')
  .replaceAll(':"schema"','public').replaceAll(':"user_role"','browser_role').replaceAll(':"admin_role"','service_role');

test('template updates persist at one revision, record audit history, and reject the browser role and security copy changes',async()=>{
  const db=new PGlite();
  try {
    await db.exec(`CREATE ROLE browser_role; CREATE ROLE service_role;
      CREATE TABLE users(id bigint primary key,is_active boolean not null);
      INSERT INTO users VALUES(8,true);
      GRANT SELECT ON users TO service_role;
      ${sqlName('20261013_mail_delivery')}
      ${sqlName('20261114_email_templates')}`);
    const change={signature:'Finance team',templates:{invoice:{subject:'Accounts',intro:'Hello'}}};
    const save=(value=change,version=1)=>db.query('SELECT security_save_email_templates(8,\'en\',$1,$2) AS result',[version,value]);
    await db.exec('SET ROLE browser_role');
    await assert.rejects(save(),{code:'42501'});
    await assert.rejects(db.query('SELECT * FROM email_template_audit'),{code:'42501'});
    await db.exec('SET ROLE service_role');
    assert.equal((await save()).rows[0].result.version,2);
    await assert.rejects(save(),{code:'PT409'});
    await assert.rejects(save({signature:'No',templates:{'reset-password':{subject:'No',intro:'No'}}},2),{code:'22023'});
    assert.equal((await db.query('SELECT count(*)::int AS count FROM email_template_audit')).rows[0].count,1);
    await assert.rejects(db.exec('DELETE FROM email_template_audit'),{code:'42501'});
    const event='jd-'+'1'.repeat(64),recipient='jd-'+'2'.repeat(64);
    const send=()=>db.query("SELECT security_reserve_mail($1,$2,'template_test') AS result",[event,recipient]);
    const first=(await send()).rows[0].result,second=(await send()).rows[0].result;
    assert.equal(first.reserved,true);
    assert.equal(second.reserved,false);
    assert.equal(first.id,second.id);
  } finally {
    await db.close();
  }
});
