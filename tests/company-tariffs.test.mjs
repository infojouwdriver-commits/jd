import test from 'node:test';
import assert from 'node:assert/strict';
import {activeCompanyTariffs, companyTariffs, driverPricing, indicativeFare, validateCompanyTariffs} from '../src/lib/company-pricing.ts';
import {readTariffQuote, signTariffQuote} from '../src/lib/tariff-quote.ts';

const company={base_rate_per_km:'2.25',base_rate_per_minute:'0.41',minimum_fare:'9.20'};
const [t1]=companyTariffs(company);
const t2={...t1,code:'T2',name:'Airport',base_fee:15,starts_on:'2026-11-05'};
const t3={...t1,code:'T3',name:'Night',enabled:false};
test('legacy T1 preserves configured amounts, minimum and the map-estimate formula',()=>{
 const legacy=driverPricing(company);
 assert.equal(indicativeFare(t1,8.7,23),Number((legacy.base_fee+8.7*legacy.km_rate+23*legacy.minute_rate).toFixed(2)));
 assert.equal(indicativeFare({...t1,base_fee:0},0,0),9.2);
 assert.equal(companyTariffs({...company,minimum_fare:0})[0].base_fee,0);
});
test('companies have independent tariffs; inactive and future entries stay hidden in Brussels time',()=>{
 const data={...company,tariff_profiles:[t1,t2,t3]};
 assert.deepEqual(activeCompanyTariffs(data,new Date('2026-11-04T22:59:59Z')).map(t=>t.code),['T1']);
 assert.deepEqual(activeCompanyTariffs(data,new Date('2026-11-04T23:00:00Z')).map(t=>t.code),['T1','T2']);
 assert.deepEqual(activeCompanyTariffs(company).map(t=>t.code),['T1']);
 assert.notEqual(indicativeFare(t1,5,15),indicativeFare(t2,5,15));
 assert.throws(()=>validateCompanyTariffs([t1,t3]));
 assert.throws(()=>validateCompanyTariffs([{...t1,starts_on:'2026-02-31'}]));
 assert.throws(()=>validateCompanyTariffs([{...t1,settings:{}}]));
});
test('a signed snapshot survives configuration changes and delayed sync, but rejects tampering and cross-tenant reuse',()=>{
 const secret='synthetic-test-key-'.repeat(3);
 const issued=Date.parse('2026-11-05T15:00:00Z');
 const quote={user:'41',company:'4',issued,tariff:t2,km:15,minutes:27,price:indicativeFare(t2,15,27)};
 const token=signTariffQuote(quote,secret);
 assert.deepEqual(readTariffQuote(token,'41','4',issued+1000,secret),quote);
 assert.throws(()=>readTariffQuote(token,'42','4',issued+1000,secret));
 assert.throws(()=>readTariffQuote(token,'41','9',issued+1000,secret));
 assert.throws(()=>readTariffQuote(token,'41','4',issued+3600001,secret));
 assert.throws(()=>readTariffQuote('A'+token.slice(1),'41','4',issued+1000,secret));
});
