import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {PGlite} = await import(process.env.PGLITE_MODULE_PATH || '@electric-sql/pglite');

test('pricing migration preserves companies and old amounts and supports cents on repeated application', async () => {
  const db = new PGlite();
  await db.waitReady;
  try {
    await db.exec(fs.readFileSync(new URL('../schema/reconstructed-staging.sql', import.meta.url), 'utf8'));
    await db.exec("INSERT INTO companies(id,name,minimum_fare,airport_surcharge,night_surcharge_percentage) VALUES(1,'Synthetic company',10,5,20)");
    const sql = fs.readFileSync(new URL('../migrations/20261013_company_pricing.sql', import.meta.url), 'utf8').replaceAll(':"schema"', 'public');
    await db.exec(sql);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM companies')).rows[0].n, 1);
    const previous = (await db.query('SELECT minimum_fare,airport_surcharge FROM companies WHERE id=1')).rows[0];
    assert.equal(Number(previous.minimum_fare), 10);
    assert.equal(Number(previous.airport_surcharge), 5);
    await db.exec('UPDATE companies SET minimum_fare=10.75,airport_surcharge=3.95,night_surcharge_percentage=12.5 WHERE id=1');
    await db.exec(sql);
    const current = (await db.query('SELECT minimum_fare,airport_surcharge,night_surcharge_percentage FROM companies WHERE id=1')).rows[0];
    assert.equal(Number(current.minimum_fare), 10.75);
    assert.equal(Number(current.airport_surcharge), 3.95);
    assert.equal(Number(current.night_surcharge_percentage), 12.5);
  } finally { await db.close(); }
});
