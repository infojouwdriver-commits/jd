import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { SaxesParser } from 'saxes';

const soap = 'http://schemas.xmlsoap.org/soap/envelope/';
const messages = 'http://economie.fgov.be/kbopub/webservices/v1/messages';
const datamodel = 'http://economie.fgov.be/kbopub/webservices/v1/datamodel';
const wsSecurity = 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity';
const usernameToken = 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0';
const endpoints = {
  test: 'https://kbopub-acc.economie.fgov.be/kbopubws180000/services/wsKBOPub',
  production: 'https://kbopub.economie.fgov.be/kbopubws180000/services/wsKBOPub',
} as const;
const maxReplyBytes = 2 * 1024 * 1024;

type Language = 'fr' | 'nl';
type CbeConfig = { environment: keyof typeof endpoints; username: string; password: string };
type Status = 'AC' | 'BK' | 'ST' | 'JU';
export type CbeCompany = {
  kbo_number: string;
  name: string | null;
  address: string | null;
  status: Status;
  environment: CbeConfig['environment'];
};

type CbeErrorCode = 'invalid_number' | 'not_configured' | 'not_found' | 'cancelled' |
  'not_yet_active' | 'quota' | 'credentials' | 'unavailable';

export class CbeSearchError extends Error {
  readonly code: CbeErrorCode;

  constructor(code: CbeErrorCode) {
    super(code);
    this.code = code;
  }
}

export function configuredCbeSearch(env = process.env): CbeConfig | null {
  const environment = env.CBE_SEARCH_ENV;
  const username = env.CBE_SEARCH_USERNAME?.trim();
  const password = env.CBE_SEARCH_PASSWORD;
  if ((environment !== 'test' && environment !== 'production') || !username || !password) return null;
  return { environment, username, password };
}

export function normalizeCbeNumber(value: string): string | null {
  const digits = value.trim().replace(/^BE/i, '').replace(/[\s.-]/g, '');
  if (!/^[01]?\d{9}$/.test(digits)) return null;
  const number = digits.padStart(10, '0');
  return Number(number.slice(-2)) === 97 - (Number(number.slice(0, 8)) % 97) ? number : null;
}

function soapBody(config: CbeConfig, number: string, language: Language, id: string) {
  const now = Date.now();
  const created = new Date(now).toISOString();
  const expires = new Date(now + 300_000).toISOString();
  const nonce = randomBytes(24);
  const digest = createHash('sha1').update(nonce).update(created).update(config.password).digest('base64');
  const username = config.username.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="${soap}" xmlns:mes="${messages}" xmlns:dat="${datamodel}"
  xmlns:wsse="${wsSecurity}-secext-1.0.xsd" xmlns:wsu="${wsSecurity}-utility-1.0.xsd">
  <soap:Header>
    <wsse:Security soap:mustUnderstand="1">
      <wsu:Timestamp wsu:Id="TS-${id}"><wsu:Created>${created}</wsu:Created><wsu:Expires>${expires}</wsu:Expires></wsu:Timestamp>
      <wsse:UsernameToken wsu:Id="UsernameToken-${id}">
        <wsse:Username>${username}</wsse:Username>
        <wsse:Password Type="${usernameToken}#PasswordDigest">${digest}</wsse:Password>
        <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">${nonce.toString('base64')}</wsse:Nonce>
        <wsu:Created>${created}</wsu:Created>
      </wsse:UsernameToken>
    </wsse:Security>
    <mes:RequestContext><mes:Id>${id}</mes:Id><mes:Language>${language}</mes:Language></mes:RequestContext>
  </soap:Header>
  <soap:Body><mes:ReadEnterpriseRequest><dat:EnterpriseNumber>${number}</dat:EnterpriseNumber></mes:ReadEnterpriseRequest></soap:Body>
</soap:Envelope>`;
}

type Element = { local: string; uri: string; text: string; children: Element[] };

function parseXml(xml: string): Element | undefined {
  const document: Element = { local: '', uri: '', text: '', children: [] };
  const stack = [document];
  const parser = new SaxesParser({ xmlns: true });
  parser.on('doctype', () => { throw new CbeSearchError('unavailable'); });
  parser.on('opentag', ({ local, uri }) => {
    if (stack.length > 64) throw new CbeSearchError('unavailable');
    const node: Element = { local, uri, text: '', children: [] };
    stack.at(-1)?.children.push(node);
    stack.push(node);
  });
  const appendText = (text: string) => {
    const parent = stack.at(-1);
    if (parent) parent.text += text;
  };
  parser.on('text', appendText);
  parser.on('cdata', appendText);
  parser.on('closetag', () => { stack.pop(); });
  parser.write(xml).close();
  return document.children.find(child => child.local === 'Envelope' && child.uri === soap);
}

function children(parent: Element | undefined, local: string, uri = datamodel) {
  return parent?.children.filter(node => node.local === local && node.uri === uri) ?? [];
}

function child(parent: Element | undefined, local: string, uri = datamodel) {
  return children(parent, local, uri)[0];
}

function text(parent: Element | undefined, local: string, uri = datamodel) {
  return child(parent, local, uri)?.text.trim() || '';
}

function localized(entries: Element[], language: Language) {
  const available = entries.filter(entry => text(entry, 'Value'));
  const selected = available.find(entry => text(entry, 'Language') === language) ?? available[0];
  return text(selected, 'Value');
}

function companyAddress(enterprise: Element, language: Language): string | null {
  const office = children(enterprise, 'Address').find(address =>
    text(child(address, 'TypeOfAddress'), 'Code') === 'REGO' && !child(address, 'StrikingOff'));
  if (!office) return null;
  const street = localized(children(child(office, 'Street'), 'Description'), language);
  const city = localized(children(child(office, 'Municipality'), 'Description'), language);
  if (!street || !city) return null;
  const box = text(office, 'Box');
  return [
    [street, text(office, 'HouseNumber'), box && `${language === 'nl' ? 'bus' : 'bte'} ${box}`].filter(Boolean).join(' '),
    [text(office, 'Zipcode'), city].filter(Boolean).join(' '),
    localized(children(child(office, 'Country'), 'Description'), language),
  ].filter(Boolean).join(', ');
}

function parseReply(xml: string, id: string, number: string, language: Language, environment: CbeConfig['environment']): CbeCompany {
  const envelope = parseXml(xml);
  const body = child(envelope, 'Body', soap);
  const fault = child(body, 'Fault', soap);
  if (fault) {
    const faultText = text(fault, 'faultstring', '');
    if (/quota exceeded|balance is empty/i.test(faultText)) throw new CbeSearchError('quota');
    if (/security token could not be authenticated or authorized|failed authentication|security error was encountered when verifying the message/i.test(faultText)) {
      throw new CbeSearchError('credentials');
    }
    throw new CbeSearchError('unavailable');
  }
  const reply = child(child(envelope, 'Header', soap), 'ReplyContext', messages);
  if (text(reply, 'RequestId', messages) !== id) throw new CbeSearchError('unavailable');
  switch (text(child(reply, 'ReplyStatus', messages), 'Code', messages)) {
    case '00001':
    case '10001': break;
    case '00003':
    case '00010':
    case '10003': throw new CbeSearchError('not_found');
    case '00005': throw new CbeSearchError('invalid_number');
    case '00014': throw new CbeSearchError('cancelled');
    case '00016': throw new CbeSearchError('not_yet_active');
    default: throw new CbeSearchError('unavailable');
  }
  const enterprise = child(child(body, 'ReadEnterpriseReply', messages), 'Enterprise');
  const status = text(child(child(enterprise, 'JuridicalSituation'), 'Status'), 'Code');
  if (!enterprise || normalizeCbeNumber(text(enterprise, 'Number')) !== number ||
    (status !== 'AC' && status !== 'BK' && status !== 'ST' && status !== 'JU')) throw new CbeSearchError('unavailable');

  const officialNames = children(enterprise, 'Denomination')
    .filter(entry => text(entry, 'Code') === '001' && !text(child(entry, 'ValidityPeriod'), 'End'))
    .flatMap(entry => children(entry, 'Description'));
  const name = localized(officialNames, language) || localized(children(enterprise, 'PrimaryDenomination'), language);
  const address = companyAddress(enterprise, language);
  return { kbo_number: number, name: name && name.length <= 200 ? name : null,
    address: address && address.length <= 400 ? address : null, status, environment };
}

async function readReply(response: Response) {
  if (!response.body) throw new CbeSearchError('unavailable');
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let xml = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return xml + decoder.decode();
      size += value.byteLength;
      if (size > maxReplyBytes) {
        await reader.cancel();
        throw new CbeSearchError('unavailable');
      }
      xml += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

export async function readCbeCompany(
  config: CbeConfig, input: string, language: Language, fetcher: typeof fetch = fetch,
): Promise<CbeCompany> {
  const number = normalizeCbeNumber(input);
  if (!number) throw new CbeSearchError('invalid_number');
  const id = randomUUID();
  try {
    const response = await fetcher(endpoints[config.environment], {
      method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000),
      headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '"http://fgov.economie.be/kbopub/ReadEnterprise"' },
      body: soapBody(config, number, language, id),
    });
    const company = parseReply(await readReply(response), id, number, language, config.environment);
    if (!response.ok) throw new CbeSearchError('unavailable');
    return company;
  } catch (error) {
    if (error instanceof CbeSearchError) throw error;
    throw new CbeSearchError('unavailable');
  }
}
