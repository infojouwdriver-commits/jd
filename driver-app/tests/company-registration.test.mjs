import assert from 'node:assert/strict';
import test from 'node:test';
import {randomUUID} from 'node:crypto';
import {ApiError,createDriverApi,API_ORIGIN} from '../src/api.ts';
import {blankRegistration,companyRegistrationSchema,registrationFields} from '../src/registration/schema.ts';
import {SUBSCRIPTION_OFFER} from '../src/registration/subscription-offer.ts';

function registration() {
  return {
    ...blankRegistration(), request_id: randomUUID(), language: 'nl',
    subscription_offer: SUBSCRIPTION_OFFER, subscription_acknowledged: true, email_code: '012345',
    company_name: 'Synthetic Company', company_email: 'fleet@example.invalid', company_password: 'fictional company password',
    company_phone: '+32470000999', company_address: 'Teststraat 1', vat_number: 'BE0123456789', kbo_number: '0123456789',
    chiron_test_client_id: 'synthetic-client', chiron_test_client_secret: 'synthetic-secret',
    vehicle_brand: 'Volkswagen', vehicle_model: 'Golf', plate_number: 'TEST-001', vin: 'WVWZZZ1JZXW000001',
    driver_name: 'Synthetic Driver', driver_phone: '+32470000888', driver_password: 'fictional driver password',
    driver_license: 'DEMO-01', bestuurderspas: 'DEMO-02',
  };
}

test('native application sends code and registration to the existing anonymous endpoints and verifies the receipt', async () => {
  const application = registration();
  assert.equal(companyRegistrationSchema.safeParse(application).success, true);
  assert.deepEqual(Object.keys(blankRegistration()), registrationFields.flat());
  const calls = [];
  const api = createDriverApi(async (url, options) => {
    calls.push({url, options, body: JSON.parse(options.body)});
    return Response.json({success: true, data: calls.length === 1
      ? {data: true} : {request_id: application.request_id, status: 'pending'}});
  });
  const code = {email: application.company_email, request_id: application.request_id, language: application.language};
  await api.sendCompanyRegistrationCode(code);
  assert.deepEqual(await api.registerCompany(application), {request_id: application.request_id, status: 'pending'});
  assert.deepEqual(calls.map(call => call.url), [API_ORIGIN + '/next_api/auth/send-verification', API_ORIGIN + '/next_api/company-registrations']);
  assert.deepEqual(calls[0].body, {...code, type: 'company-registration'});
  assert.deepEqual(calls[1].body, application);
  for (const {options} of calls) {
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers.Origin, API_ORIGIN);
  }
});

test('ambiguous application responses require an explicit retry using the original request ID', async () => {
  const application = registration();
  const sent = [];
  const api = createDriverApi(async (_url, options) => {
    sent.push(options.body);
    return Response.json({success: true, data: {
      request_id: sent.length === 1 ? randomUUID() : application.request_id, status: 'pending',
    }});
  });
  await assert.rejects(api.registerCompany(application), error => error instanceof ApiError && error.status === 502);
  assert.equal(sent.length, 1);
  assert.equal((await api.registerCompany(application)).request_id, application.request_id);
  assert.equal(sent[0], sent[1]);
});
