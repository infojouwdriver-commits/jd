import {z} from 'zod';
const text=(min=1,max=160)=>z.string().trim().min(min).max(max);
const password=z.string().min(12).max(72).refine(v=>new TextEncoder().encode(v).length<=72);
const optional=text(0,512).default('');
export const companyRegistrationSchema=z.object({
 email_code:z.string().regex(/^\d{6}$/).optional(),request_id:z.string().uuid(),subscription_offer:z.literal('annual-50-v1'),subscription_acknowledged:z.literal(true),company_name:text(2),company_email:z.string().trim().toLowerCase().email().max(254),company_password:password,
 company_phone:text(8,30),company_address:text(5,400),vat_number:text(8,32).transform(v=>v.replace(/[ .-]/g,'').toUpperCase()),kbo_number:text(8,20).transform(v=>v.replace(/[ .-]/g,'')).refine(v=>/^\d{10}$/.test(v)),
 chiron_test_client_id:text(1,512),chiron_test_client_secret:text(1,2048),chiron_prod_client_id:optional,chiron_prod_client_secret:text(0,2048).default(''),
 vehicle_brand:text(2,80),vehicle_model:text(1,80),plate_number:text(3,20).transform(v=>v.replace(/\s/g,'').toUpperCase()),vin:text(17,17).transform(v=>v.toUpperCase()).refine(v=>/^[A-HJ-NPR-Z0-9]{17}$/.test(v)),chiron_vehicle_id:text(0,120).default(''),
 driver_name:text(2),driver_phone:text(8,30).transform(v=>v.replace(/[ ()-]/g,'').replace(/^00/,'+')).refine(v=>/^\+[1-9]\d{7,14}$/.test(v)),driver_password:password,driver_license:text(3,80),bestuurderspas:text(3,80),language:z.enum(['ar','fr','nl','en']),website:z.string().max(0).optional(),
}).strict().superRefine((v,c)=>{if(Boolean(v.chiron_prod_client_id)!==Boolean(v.chiron_prod_client_secret))c.addIssue({code:'custom',path:['chiron_prod_client_id'],message:'Complete both production fields or leave both empty'});});
export type CompanyRegistration=z.input<typeof companyRegistrationSchema>;
export const chironPortals={test:'https://chiron-acc.vlaanderen.be',production:'https://chiron.vlaanderen.be',guide:'https://www.vlaanderen.be/mobiliteit-en-openbare-werken/taxi/rittendatabank-chiron'} as const;
