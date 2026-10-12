import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCompanyPricing, driverPricing, companyPricingPatch} from '../src/lib/company-pricing.ts';

test('configured zero fares and surcharges are not replaced by defaults', () => {
  const pricing = driverPricing({minimum_fare: 0, base_rate_per_km: 0, base_rate_per_minute: 0, airport_surcharge: 0, night_surcharge_percentage: 0});
  for (const key of ['base_fee', 'minimum_fare', 'km_rate', 'minute_rate', 'airport_fee', 'night_fee']) assert.equal(pricing[key], 0);
});
test('unset legacy fields and numeric database strings normalize consistently', () => {
  const pricing = normalizeCompanyPricing({minimum_fare: null, base_rate_per_km: '2.75', peak_hours: null});
  assert.equal(pricing.minimum_fare, 10);
  assert.equal(pricing.base_rate_per_km, 2.75);
  assert.equal(pricing.peak_hours.length, 2);
  assert.deepEqual(normalizeCompanyPricing({peak_hours: []}).peak_hours, []);
});
test('partial updates do not reset unrelated settings', () => {
  assert.deepEqual(companyPricingPatch({airport_surcharge: 0, name: 'Company'}), {airport_surcharge: 0});
  assert.deepEqual(companyPricingPatch({}), {});
});
test('invalid values and periods are rejected before any database update', () => {
  for (const input of [{minimum_fare: null}, {minimum_fare: ''}, {minimum_fare: -1}, {base_rate_per_km: Infinity}, {night_start_hour: 24}, {night_end_hour: 2.5}, {peak_hours: '[]'}, {peak_hours: [{start: '25:00', end: '09:00'}]}, {peak_hours: [{start: '09:00', end: '09:00'}]}]) assert.throws(() => companyPricingPatch(input));
  assert.deepEqual(companyPricingPatch({peak_hours: [{start: '22:00', end: '06:00'}]}).peak_hours, [{start: '22:00', end: '06:00'}]);
});
