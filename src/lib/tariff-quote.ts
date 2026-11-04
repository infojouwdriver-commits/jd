import {createHmac, timingSafeEqual} from 'node:crypto';
import type {CompanyTariff} from './company-pricing';

interface Quote {
 user: string;
 company: string;
 issued: number;
 tariff: CompanyTariff;
 km: number|null;
 minutes: number|null;
 price: number|null;
}
function signature(body: string, secret: string) {
 if (secret.length < 32) throw Error('Tariff signing unavailable');
 return createHmac('sha256',secret).update('jd-tariff-quote-v1:'+body).digest();
}
export function signTariffQuote(quote: Quote, secret: string) {
 const body=Buffer.from(JSON.stringify(quote)).toString('base64url');
 return body+'.'+signature(body,secret).toString('base64url');
}
export function readTariffQuote(token: unknown, user: string, company: string, start: number, secret: string): Quote {
 if (typeof token!=='string'||token.length>6000||!/^[\w-]+\.[\w-]{43}$/.test(token)) throw Error('Invalid quote');
 const [body,mac]=token.split('.');
 if (!timingSafeEqual(signature(body,secret),Buffer.from(mac,'base64url'))) throw Error('Invalid quote');
 const quote:Quote=JSON.parse(Buffer.from(body,'base64url').toString('utf8'));
 if (quote.user!==user||quote.company!==company||!Number.isFinite(start)||
     start<quote.issued-120000||start>quote.issued+3600000) throw Error('Quote does not match trip');
 return quote;
}
