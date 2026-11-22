import {z} from 'zod';
import {SUBSCRIPTION_OFFER} from './subscription-offer.ts';
const text=(min=1,max=160)=>z.string().trim().min(min).max(max);
const password=z.string().min(12).max(72).refine(v=>new TextEncoder().encode(v).length<=72);
const optional=text(0,512).default('');
export function normalizeCompanyDriverPhone(value:string) {
 const phone=value.trim().replace(/[ ().-]/g,'').replace(/^00/,'+');
 return /^0[1-9]\d{7,8}$/.test(phone)?'+32'+phone.slice(1):phone;
}
const phone=text(8,30).transform(v=>v.replace(/[ ()-]/g,'').replace(/^00/,'+'))
 .refine(v=>/^\+[1-9]\d{7,14}$/.test(v));
export const unverifiedBestuurderspas='12345';
export const companyRegistrationSchema=z.object({
 email_code:z.string().regex(/^\d{6}$/).optional(),request_id:z.string().uuid(),subscription_offer:z.literal(SUBSCRIPTION_OFFER),subscription_acknowledged:z.literal(true),company_name:text(2),company_email:z.string().trim().toLowerCase().email().max(254),company_password:password,
 company_phone:text(8,30),company_address:text(5,400),vat_number:text(8,32).transform(v=>v.replace(/[ .-]/g,'').toUpperCase()),kbo_number:text(8,20).transform(v=>v.replace(/[ .-]/g,'')).refine(v=>/^\d{10}$/.test(v)),
 chiron_test_client_id:optional,chiron_test_client_secret:text(0,2048).default(''),chiron_prod_client_id:optional,chiron_prod_client_secret:text(0,2048).default(''),
 vehicle_brand:text(2,80),vehicle_model:text(1,80),plate_number:text(3,20).transform(v=>v.replace(/\s/g,'').toUpperCase()).refine(v=>v.length>=3),vin:text(0,17).transform(v=>v.toUpperCase()).refine(v=>!v||/^[A-HJ-NPR-Z0-9]{17}$/.test(v)).default(''),chiron_vehicle_id:text(0,120).default(''),
 driver_name:text(2),driver_phone:phone.or(z.literal('')).default(''),same_company_phone:z.boolean().default(false),
 driver_password:password.or(z.literal('')).default(''),driver_license:text(0,80).refine(v=>!v||v.length>=3).default(''),
 bestuurderspas:text(0,80).refine(v=>!v||(/^[A-Za-z0-9\s-]+$/.test(v)&&v.replace(/[\s-]+/g,'').length>=3&&v.replace(/[\s-]+/g,'')!==unverifiedBestuurderspas)).default(''),
 language:z.enum(['ar','fr','nl','en']),website:z.string().max(0).optional(),
}).strict().superRefine((v,c)=>{
 if(v.same_company_phone&&!phone.safeParse(normalizeCompanyDriverPhone(v.company_phone)).success)c.addIssue({code:'custom',path:['driver_phone'],message:'Enter a valid company phone before reusing it'});
 if(!v.same_company_phone&&!v.driver_phone)c.addIssue({code:'custom',path:['driver_phone'],message:'Enter the driver phone'});
 if(Boolean(v.chiron_test_client_id)!==Boolean(v.chiron_test_client_secret))c.addIssue({code:'custom',path:['chiron_test_client_id'],message:'Complete both test fields or leave both empty'});
 if(Boolean(v.chiron_prod_client_id)!==Boolean(v.chiron_prod_client_secret))c.addIssue({code:'custom',path:['chiron_prod_client_id'],message:'Complete both production fields or leave both empty'});
});
export type CompanyRegistration=z.input<typeof companyRegistrationSchema>;
export const chironPortals={test:'https://chiron-acc.vlaanderen.be',production:'https://chiron.vlaanderen.be',guide:'https://www.vlaanderen.be/mobiliteit-en-openbare-werken/taxi/rittendatabank-chiron'} as const;

export type RegistrationField = Exclude<keyof CompanyRegistration, 'request_id' | 'language' | 'website' | 'subscription_offer' | 'subscription_acknowledged' | 'email_code' | 'same_company_phone' | 'vin' | 'chiron_vehicle_id' | 'driver_license'>;
export const registrationFields: RegistrationField[][] = [
  ['company_name', 'company_email', 'company_password', 'company_phone', 'company_address', 'vat_number', 'kbo_number'],
  ['chiron_test_client_id', 'chiron_test_client_secret', 'chiron_prod_client_id', 'chiron_prod_client_secret'],
  ['vehicle_brand', 'vehicle_model', 'plate_number'],
  ['driver_name', 'driver_phone', 'bestuurderspas', 'driver_password'],
];

export function blankRegistration() {
  return Object.fromEntries(registrationFields.flat().map(field => [field, ''])) as Record<RegistrationField, string>;
}
