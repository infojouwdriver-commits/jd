import assert from 'node:assert/strict';
import {createHash, randomUUID} from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

const {PGlite} = await import(process.env.PGLITE_MODULE_PATH || '@electric-sql/pglite');
const sql = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8')
  .replaceAll(':"schema"', 'public').replaceAll(':"user_role"', 'browser').replaceAll(':"admin_role"', 'service');
const digest = () => createHash('sha256').update(randomUUID()).digest('hex');

test('account deletion queues one alert, blocks active work, and revokes authentication without removing trip history', async () => {
  const db = new PGlite();
  try {
    await db.exec('CREATE ROLE browser; CREATE ROLE service; ' + sql('schema/reconstructed-staging.sql'));
    for (const migration of [
      '20261009_security','20261013_mail_delivery','20261013_fleet_tracking','20261016_native_push',
      '20261017_company_registration','20261018_company_lifecycle','20261019_email_identity',
      '20261019_driver_shifts','20261018_web_change_approvals','20261115_contact_approval_alerts',
    ]) await db.exec(sql('migrations/' + migration + '.sql'));
    await db.exec(`
      INSERT INTO users(id,email,password,is_active,user_type) VALUES
        (1,'321@driver.local','current hash',true,'driver'),
        (2,'owner@example.invalid','owner hash',true,'manager'),
        (3,'admin@example.invalid',null,true,'admin');
      INSERT INTO companies(id,name) VALUES(1,'Synthetic Fleet');
      INSERT INTO company_users(company_id,user_id,role) VALUES(1,2,'owner');
      INSERT INTO vehicles(id,company_id,plate_number) VALUES(1,1,'TEST-001');
      INSERT INTO drivers(id,user_id,company_id,full_name,phone,bestuurderspas_number,status)
        VALUES(1,1,1,'Synthetic Driver','321','SYN-001','active');
      INSERT INTO driver_credentials(driver_id,phone,password_hash) VALUES(1,'321','legacy hash');
      INSERT INTO driver_documents(driver_id,file_url) VALUES(1,'https://example.invalid/driver-document');
      INSERT INTO driver_fleet_locations(driver_id,company_id,user_id,shift_active,sharing_enabled,latitude,longitude,accuracy_m,recorded_at)
        VALUES(1,1,1,true,true,50,4,20,clock_timestamp());
      INSERT INTO internal_messages(id,sender_user_id,sender_name,subject,message_body) VALUES
        (1,1,'Synthetic Driver','Personal subject','Personal content'),
        (2,2,'Synthetic Owner','Owner subject','Content from another user');
      INSERT INTO message_replies(sender_user_id,parent_message_id,reply_body) VALUES(1,2,'Personal reply');
      INSERT INTO sessions(id,user_id) VALUES(1,1);
      INSERT INTO refresh_tokens(session_id,user_id,token) VALUES(1,1,'legacy refresh token');
      INSERT INTO trips(id,user_id,driver_id,company_id,status) VALUES(1,1,1,1,'in_progress');
      INSERT INTO company_registrations(request_id,fingerprint,company_id,driver_id,vehicle_id,manager_user_id,driver_user_id,status,
        test_configured,production_configured,driver_name,driver_phone,company_email,email_verified_at)
        VALUES(gen_random_uuid(),'synthetic',1,1,1,2,1,'approved',true,false,'Synthetic Driver','321','owner@example.invalid',clock_timestamp());
      GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service;
      GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service;
      REVOKE DELETE ON driver_fleet_locations FROM service;
    `);
    await db.exec(sql('migrations/20261115_account_deletion.sql'));
    await db.exec('SET ROLE browser');
    await assert.rejects(db.query('SELECT * FROM account_deletion_requests'), /permission denied/);
    const request = (user, hash, receipt) => db.query(
      "SELECT security_request_account_deletion($1,$2,$3,'fr',now()+interval '1 month') AS status", [user, hash, receipt],
    ).then(value => value.rows[0].status);
    await assert.rejects(request(1, 'current hash', digest()), /permission denied/);
    await db.exec('SET ROLE service');
    await assert.rejects(request(1, 'legacy hash', digest()), /confirmation required/);
    const receipt = digest();
    const status = await request(1, 'current hash', receipt);
    assert.deepEqual(await request(1, 'current hash', receipt), status);
    assert.deepEqual(Object.keys(status).sort(), ['completed_at', 'due_at', 'requested_at']);
    const pending = (await db.query("SELECT * FROM account_deletion_requests WHERE receipt_digest=$1", [receipt])).rows[0];
    assert.equal((await db.query("SELECT count(*)::int AS total FROM approval_mail_outbox WHERE source='account-deletion'")).rows[0].total, 1);
    const complete = (id, keep = false, reason = '') => db.query(
      'SELECT security_complete_account_deletion($1,3,$2,$3) AS result', [id, reason, keep],
    ).then(value => value.rows[0].result);
    await assert.rejects(complete(pending.id), /Active trip or shift/);
    await db.exec("UPDATE trips SET status='completed' WHERE id=1");
    await db.exec(`INSERT INTO driver_shifts(id,driver_id,user_id,company_id,vehicle_id,driver_name,company_name,plate_number,started_at,start_odometer,odometer,work_status)
      VALUES(gen_random_uuid(),1,1,1,1,'Synthetic Driver','Synthetic Fleet','TEST-001',now(),1,1,'available')`);
    await assert.rejects(complete(pending.id), /Active trip or shift/);
    await db.exec('UPDATE driver_shifts SET ended_at=now()');
    await assert.rejects(complete(pending.id, true), /Invalid deletion review/);
    const completed = await complete(pending.id);
    assert.ok(completed.completed_at);
    assert.deepEqual(await complete(pending.id), completed);
    const account = (await db.query('SELECT email,password,display_name,is_active,security_revoked_before FROM users WHERE id=1')).rows[0];
    assert.equal(account.email, null);
    assert.equal(account.password, null);
    assert.equal(account.display_name, null);
    assert.equal(account.is_active, false);
    assert.ok(account.security_revoked_before);
    for (const table of ['sessions', 'refresh_tokens', 'driver_credentials', 'driver_documents', 'driver_fleet_locations']) {
      assert.equal((await db.query('SELECT count(*)::int AS total FROM ' + table)).rows[0].total, 0);
    }
    assert.equal((await db.query('SELECT user_id FROM trips WHERE id=1')).rows[0].user_id, 1);
    assert.equal((await db.query('SELECT driver_name FROM driver_shifts')).rows[0].driver_name, 'Synthetic Driver');
    assert.deepEqual((await db.query('SELECT message_body FROM internal_messages ORDER BY id')).rows,
      [{message_body:'—'}, {message_body:'Content from another user'}]);
    assert.equal((await db.query('SELECT reply_body FROM message_replies')).rows[0].reply_body, '—');
    assert.equal((await db.query('SELECT full_name FROM drivers WHERE id=1')).rows[0].full_name, '—');
    assert.equal((await db.query("SELECT count(*)::int AS total FROM approval_mail_outbox WHERE source='account-deletion-complete'")).rows[0].total, 0);

    const ownerReceipt = digest();
    await request(2, 'owner hash', ownerReceipt);
    const owner = (await db.query('SELECT id FROM account_deletion_requests WHERE receipt_digest=$1', [ownerReceipt])).rows[0];
    await complete(owner.id);
    assert.equal((await db.query('SELECT is_active FROM company_users WHERE user_id=2')).rows[0].is_active, false);
    assert.equal((await db.query('SELECT name FROM companies WHERE id=1')).rows[0].name, 'Synthetic Fleet');
    assert.equal((await db.query('SELECT notice_email FROM account_deletion_requests WHERE id=$1', [owner.id])).rows[0].notice_email, 'owner@example.invalid');
    await db.exec("UPDATE approval_mail_outbox SET finished_at=now() WHERE source='account-deletion-complete'");
    assert.equal((await db.query('SELECT notice_email FROM account_deletion_requests WHERE id=$1', [owner.id])).rows[0].notice_email, null);
  } finally {
    await db.close();
  }
});
