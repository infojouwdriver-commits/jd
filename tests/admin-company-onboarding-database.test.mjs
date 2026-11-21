import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { hashSync } from 'bcryptjs';

const { PGlite } = await import(process.env.PGLITE_MODULE_PATH || '@electric-sql/pglite');
const sql = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
  .replaceAll(':"schema"', 'public').replaceAll(':"user_role"', 'browser').replaceAll(':"admin_role"', 'service');

test('admin onboarding activates and links the fleet, replays safely and rolls back on a driver conflict', async () => {
  const db = new PGlite();
  try {
    await db.exec('CREATE ROLE service; CREATE ROLE browser;' + sql('schema/reconstructed-staging.sql'));
    for (const migration of [
      '20261009_security', '20261010_driver_lifecycle', '20261012_accounts_messages',
      '20261017_company_registration', '20261018_company_lifecycle', '20261018_subscription_billing',
      '20261018_web_billing', '20261026_manual_invoices', '20261121_admin_company_onboarding',
    ]) await db.exec(sql('migrations/' + migration + '.sql'));
    await db.exec(`
      INSERT INTO users(id, email, is_active) VALUES(999,'admin@example.invalid',true);
      GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO service;
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service;
    `);

    const company = {name: 'Synthetic company', vat_number: 'BE0123456789', kbo_number: '0123456789'};
    const driver = {full_name: 'Synthetic driver', phone: '+32470000001'};
    const password = hashSync('synthetic-password', 4);
    const login = {email: '+32470000001@driver.local', password, role: 'browser'};
    const owner = {email: 'owner@example.invalid', password, role: 'browser'};
    const vehicle = {brand: 'Synthetic', model: 'Taxi', plate_number: '1-ABC-123', vin: 'TESTVIN1234567890'};
    const onboard = async (request, details, car = vehicle, driverDetails = driver, driverLogin = login, ownerLogin = owner) =>
      (await db.query('SELECT security_onboard_admin_company(999,$1,$2,$3,$4,$5,$6) AS receipt',
        [request, details, ownerLogin, driverDetails, driverLogin, car])).rows[0].receipt;

    await db.exec('SET ROLE browser');
    await assert.rejects(onboard(randomUUID(), company), {code: '42501'});
    await db.exec('SET ROLE service');
    const request = randomUUID();
    const created = await onboard(request, company);
    assert.deepEqual(await onboard(request, company), created);
    assert.deepEqual(Object.keys(created).sort(), ['company_id', 'driver_id', 'vehicle_id']);
    const [record] = (await db.query(`
      SELECT c.subscription_status, d.status AS driver_status, u.is_active, v.plate_number,
             d.assigned_vehicle_id = v.id AND d.current_vehicle_id = v.id AS assigned
      FROM companies c JOIN drivers d ON d.company_id = c.id JOIN users u ON u.id = d.user_id
      JOIN vehicles v ON v.company_id = c.id WHERE c.id = $1
    `, [created.company_id])).rows;
    assert.deepEqual(record, {
      subscription_status: 'active', driver_status: 'active', is_active: true, plate_number: '1ABC123', assigned: true,
    });
    assert.equal((await db.query(`
      SELECT count(*)::int AS n FROM company_users
      WHERE company_id = $1 AND role = 'portal_owner'
    `, [created.company_id])).rows[0].n, 1);

    const second = {...company, name: 'Second company', vat_number: 'BE0222222222', kbo_number: '0222222222'};
    const secondVehicle = {...vehicle, plate_number: '1ABC124'};
    const secondOwner = {...owner, email: 'second-owner@example.invalid'};
    const secondRequest = randomUUID();
    await assert.rejects(onboard(secondRequest, second, secondVehicle, driver, login, secondOwner), {code: '23505'});
    const [counts] = (await db.query(`
      SELECT (SELECT count(*)::int FROM companies) AS companies, (SELECT count(*)::int FROM vehicles) AS vehicles,
             (SELECT count(*)::int FROM users) AS users,
             (SELECT count(*)::int FROM subscription_billing_events) AS events
    `)).rows;
    assert.deepEqual(counts, {companies: 1, vehicles: 1, users: 3, events: 1});
    await assert.rejects(onboard(randomUUID(), second, {...vehicle, plate_number: '1 abc-123'},
      {...driver, phone: '+32470000002'}, {...login, email: '+32470000002@driver.local'}, secondOwner), {code: '23505'});
    const companyOnly = await onboard(secondRequest, second, null, null, null, {});
    assert.ok(companyOnly.company_id > created.company_id);
    assert.equal(companyOnly.driver_id, null);
    assert.equal(companyOnly.vehicle_id, null);
  } finally {
    await db.close();
  }
});
