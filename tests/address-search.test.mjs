import test from 'node:test';
import assert from 'node:assert/strict';
import { belgianSuggestions, sortByDistance } from '../src/lib/address-search.ts';
const entry = (name, lat, lon, country = 'be') => ({display_name:name, lat:String(lat), lon:String(lon),address:{country_code:country}});
test('Belgian suggestions exclude foreign, unconfirmed and malformed coordinates', () => {
  const good = entry('Bruxelles',50.85,4.35,'BE');
  assert.deepEqual(belgianSuggestions([good,entry('Paris',48.85,2.35,'fr'),entry('Invalid','NaN',4),entry('Invalid',91,4),{...good,address:undefined}]), [{display_name:'Bruxelles',lat:'50.85',lon:'4.35'}]);
  assert.deepEqual(belgianSuggestions(null),[]);
});
test('Nearest valid match ranks first and reranking does not mutate results', () => {
  const source = belgianSuggestions([entry('Antwerpen',51.22,4.4),entry('Bruxelles',50.85,4.35),entry('Namur',50.46,4.87)]);
  assert.equal(sortByDistance(source,{lat:50.85,lon:4.35})[0].display_name,'Bruxelles');
  assert.equal(sortByDistance(source,{lat:51.22,lon:4.4})[0].display_name,'Antwerpen');
  assert.equal(source[0].display_name,'Antwerpen');
  assert.equal(source[0].distance,undefined);
  assert.deepEqual(sortByDistance(source,null),source);
});
