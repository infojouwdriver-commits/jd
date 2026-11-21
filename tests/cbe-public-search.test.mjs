import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { configuredCbeSearch, normalizeCbeNumber, readCbeCompany } from '../src/lib/cbe-public-search.ts';

const config = {environment: 'test', username: 'fixture&user', password: 'synthetic-password'};
const number = '0314595348';
const messages = 'http://economie.fgov.be/kbopub/webservices/v1/messages';
const datamodel = 'http://economie.fgov.be/kbopub/webservices/v1/datamodel';
const soap = 'http://schemas.xmlsoap.org/soap/envelope/';
const success = `<d:Enterprise>
  <d:Number>314595348</d:Number>
  <d:JuridicalSituation><d:Status><d:Code>AC</d:Code></d:Status></d:JuridicalSituation>
  <d:Denomination><d:Code>003</d:Code><d:Description><d:Value>Trading Name</d:Value><d:Language>nl</d:Language></d:Description></d:Denomination>
  <d:Denomination><d:Code>001</d:Code>
    <d:Description><d:Value>Synthetic &amp; Co</d:Value><d:Language>fr</d:Language></d:Description>
    <d:Description><d:Value>Voorbeeld NV</d:Value><d:Language>nl</d:Language></d:Description>
  </d:Denomination>
  <d:Address><d:TypeOfAddress><d:Code>NOAD</d:Code></d:TypeOfAddress></d:Address>
  <d:Address>
    <d:Street><d:Description><d:Value>Voorbeeldstraat</d:Value><d:Language>nl</d:Language></d:Description></d:Street>
    <d:HouseNumber>12</d:HouseNumber><d:Box>B</d:Box><d:Zipcode>1000</d:Zipcode>
    <d:Municipality><d:Description><d:Value>Brussel</d:Value><d:Language>nl</d:Language></d:Description></d:Municipality>
    <d:TypeOfAddress><d:Code>REGO</d:Code></d:TypeOfAddress>
  </d:Address>
  <d:ContactInformation><d:Value>fixture@example.invalid</d:Value></d:ContactInformation>
</d:Enterprise>`;

function reply(request, {code = '00001', enterprise = success, id = request.match(/<mes:Id>([^<]+)/)?.[1]} = {}) {
  return `<s:Envelope xmlns:s="${soap}" xmlns:d="${datamodel}">
    <s:Header><ReplyContext xmlns="${messages}"><RequestId>${id}</RequestId>
      <ReplyStatus><Code>${code}</Code></ReplyStatus>
    </ReplyContext></s:Header>
    <s:Body><ReadEnterpriseReply xmlns="${messages}">${enterprise}</ReadEnterpriseReply></s:Body>
  </s:Envelope>`;
}

test('CBE numbers validate the Belgian checksum and preserve leading zero', () => {
  assert.equal(normalizeCbeNumber('be 0314.595.348'), number);
  assert.equal(normalizeCbeNumber('314595348'), number);
  assert.equal(normalizeCbeNumber('1.000.000.021'), '1000000021');
  assert.equal(normalizeCbeNumber('0314.595.349'), null);
  assert.equal(normalizeCbeNumber('DE0314595348'), null);
  assert.equal(configuredCbeSearch({CBE_SEARCH_USERNAME:'fixture', CBE_SEARCH_PASSWORD:'fixture'}), null);
});

test('CBE lookup uses the official WS-Security digest and returns only mapped enterprise fields', async () => {
  const result = await readCbeCompany(config, number, 'nl', async (url, options) => {
    assert.equal(url, 'https://kbopub-acc.economie.fgov.be/kbopubws180000/services/wsKBOPub');
    assert.equal(options.headers.SOAPAction, '"http://fgov.economie.be/kbopub/ReadEnterprise"');
    assert.equal(options.redirect, 'error');
    assert.match(options.body, /fixture&amp;user/);
    assert.ok(!options.body.includes(config.password));
    assert.match(options.body, /<mes:Language>nl<\/mes:Language>/);
    assert.match(options.body, /<dat:EnterpriseNumber>0314595348<\/dat:EnterpriseNumber>/);
    const nonce = options.body.match(/<wsse:Nonce[^>]*>([^<]+)/)[1];
    const created = options.body.match(/<wsse:UsernameToken[^>]*>[\s\S]*?<wsu:Created>([^<]+)/)[1];
    const digest = createHash('sha1').update(Buffer.from(nonce, 'base64')).update(created).update(config.password).digest('base64');
    assert.equal(options.body.match(/<wsse:Password[^>]*>([^<]+)/)[1], digest);
    return new Response(reply(options.body));
  });
  assert.deepEqual(result, {
    kbo_number: number, name:'Voorbeeld NV', address:'Voorbeeldstraat 12 bus B, 1000 Brussel',
    status:'AC', environment:'test',
  });
});

test('CBE faults, inconsistent responses and struck-off addresses are handled explicitly', async () => {
  for (const [code, expected] of [['00010','not_found'],['00014','cancelled'],['00016','not_yet_active']]) {
    await assert.rejects(readCbeCompany(config, number, 'fr', async (_url, {body}) =>
      new Response(reply(body, {code, enterprise:''}))), {code:expected});
  }
  await assert.rejects(readCbeCompany(config, number, 'fr', async () =>
    new Response(`<s:Envelope xmlns:s="${soap}"><s:Body><s:Fault><faultstring>Quota Exceeded!</faultstring></s:Fault></s:Body></s:Envelope>`, {status:500})),
  {code:'quota'});
  await assert.rejects(readCbeCompany(config, number, 'fr', async () =>
    new Response(`<s:Envelope xmlns:s="${soap}"><s:Body><s:Fault><faultstring>A security error was encountered when verifying the message</faultstring></s:Fault></s:Body></s:Envelope>`, {status:500})),
  {code:'credentials'});
  await assert.rejects(readCbeCompany(config, number, 'fr', async (_url, {body}) =>
    new Response(reply(body, {id:'different-request'}))), {code:'unavailable'});
  await assert.rejects(readCbeCompany(config, number, 'fr', async (_url, {body}) =>
    new Response('<!DOCTYPE envelope>' + reply(body))), {code:'unavailable'});
  const struckOff = success.replace('<d:Code>REGO</d:Code></d:TypeOfAddress>', '<d:Code>REGO</d:Code></d:TypeOfAddress><d:StrikingOff>2025-01-01</d:StrikingOff>');
  const company = await readCbeCompany(config, number, 'fr', async (_url, {body}) =>
    new Response(reply(body, {enterprise:struckOff})));
  assert.equal(company.address, null);
  assert.equal(company.name, 'Synthetic & Co');
});
