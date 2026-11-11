import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSettlement, emptySettlement } from '../src/lib/public-driver-settlement.ts';
import { resourceHref, resourcePages } from '../src/lib/marketing-resources.ts';

test('public settlement deducts all cash and only the driver share of fuel', () => {
  const form = emptySettlement();
  form.rows = [
    { income: '420', cash: '60' }, { income: '330', cash: '40' },
    { income: '150', cash: '20' }, { income: '100', cash: '30' },
  ];
  form.fuel = '120';
  const first = calculateSettlement(form);
  assert.deepEqual([first.income, first.cash, first.gross, first.driverFuel, first.companyFuel, first.balance],
    [100000, 15000, 50000, 6000, 6000, 29000]);
  form.share = '٤٥';
  form.fuelShare = '25';
  assert.equal(calculateSettlement(form).balance, 27000);
  form.rows[0].cash = '421';
  assert.deepEqual(calculateSettlement(form).excessCash, ['Uber']);
  form.share = '100,01';
  assert.equal(calculateSettlement(form).invalid, true);
});

test('every marketing resource has a crawlable URL in all three locales', () => {
  const urls = ['ar', 'fr', 'nl'].flatMap((locale) => resourcePages.map((page) => resourceHref(locale, page)));
  assert.equal(new Set(urls).size, 12);
  assert.ok(urls.every((url) => /^\/(ar|fr|nl)\/solutions\/resources\//.test(url)));
});
