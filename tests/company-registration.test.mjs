import {randomBytes} from 'node:crypto';import test from 'node:test';import assert from 'node:assert/strict';
import {companyRegistrationSchema,chironPortals,normalizeCompanyDriverPhone} from '../src/lib/company-registration.ts';
import {rideMessage,serializeRideMessage} from '../src/lib/chiron-protocol.ts';
import {publicEndpoint,memberEndpoint} from '../src/lib/security-policy.ts';
const valid={request_id:'684778fa-9fd4-4a31-aa18-a44df9d97bd1',subscription_offer:'annual-50-v1',subscription_acknowledged:true,company_name:'Synthetic Transport',company_email:' Demo@Example.Invalid ',company_password:randomBytes(18).toString('base64url'),company_phone:'+32470000001',company_address:'Synthetic street 123',vat_number:'be 0123.456.789',kbo_number:'0123.456.789',chiron_test_client_id:'synthetic-test',chiron_test_client_secret:randomBytes(24).toString('base64url'),vehicle_brand:'Demo',vehicle_model:'Car',plate_number:'demo 123',vin:'wvwzzz1jzxw000001',driver_name:'Synthetic Driver',driver_phone:'0032 470 00 00 00',driver_password:randomBytes(18).toString('base64url'),driver_license:'SYN-LICENCE',bestuurderspas:'SYN-PASS',language:'fr'};
test('registration normalizes identities, accepts missing production pair and rejects privilege or invalid input',()=>{const v=companyRegistrationSchema.parse(valid);assert.equal(v.company_email,'demo@example.invalid');assert.equal(v.driver_phone,'+32470000000');assert.equal(v.kbo_number,'0123456789');assert.equal(v.vat_number,'BE0123456789');assert.equal(v.vin,'WVWZZZ1JZXW000001');assert.equal(v.plate_number,'DEMO123');assert.equal(v.chiron_prod_client_secret,'');for(const patch of [{subscription_offer:'other'},{subscription_acknowledged:false},{is_active:true},{status:'active'},{company_id:1},{driver_password:'short'},{company_password:'س'.repeat(40)},{chiron_prod_client_id:'orphan'},{chiron_prod_client_secret:'orphan'},{vin:'bad'},{driver_phone:'0470000000'},{website:'bot'}])assert.equal(companyRegistrationSchema.safeParse({...valid,...patch}).success,false);});
test('only submit is public; ledger and administrator decisions remain protected',()=>{assert.equal(publicEndpoint('/next_api/company-registrations','POST'),true);for(const method of ['GET','PUT','DELETE']){assert.equal(publicEndpoint('/next_api/company-registrations',method),false);assert.equal(memberEndpoint('/next_api/company-registrations',method,'driver'),false);}assert.equal(chironPortals.test,'https://chiron-acc.vlaanderen.be');assert.equal(chironPortals.production,'https://chiron.vlaanderen.be');});

test('vehicle registration requires a plate and supports reusing the company phone',()=>{
 const {vin,driver_license,bestuurderspas,driver_password,driver_phone,chiron_test_client_id,chiron_test_client_secret,...minimal}=valid;
 for(const language of ['ar','fr','nl']){
  const result=companyRegistrationSchema.parse({...minimal,language,company_phone:'0470 00 00 01',same_company_phone:true});
  assert.equal(result.plate_number,'DEMO123');
  assert.equal(result.vin,'');
  assert.equal(result.driver_license,'');
  assert.equal(result.driver_password,'');
  assert.equal(result.bestuurderspas,'');
  assert.equal(normalizeCompanyDriverPhone(result.company_phone),'+32470000001');
 }
 assert.equal(companyRegistrationSchema.safeParse({...minimal,same_company_phone:true,plate_number:''}).success,false);
 assert.equal(companyRegistrationSchema.safeParse({...minimal}).success,false);
 assert.equal(companyRegistrationSchema.safeParse({...minimal,same_company_phone:true,company_phone:'invalid phone'}).success,false);
 assert.equal(companyRegistrationSchema.safeParse({...minimal,same_company_phone:true,bestuurderspas:'12-345'}).success,false);
});

test('Chiron refuses to construct or serialize a ride with the temporary card',()=>{
 assert.throws(()=>rideMessage('vertrek',{}, {bestuurderspas_number:'12-345'}, {}, {}), {code:'CHIRON_DRIVER_CARD_REQUIRED'});
 const rit={uitvoerder:{bestuurderspasnummer:'12345'}};
 assert.throws(()=>rideMessage('aankomst',{}, {}, {}, {},undefined,{rit}), {code:'CHIRON_DRIVER_CARD_REQUIRED'});
 assert.throws(()=>serializeRideMessage({rit}), {code:'CHIRON_DRIVER_CARD_REQUIRED'});
});
