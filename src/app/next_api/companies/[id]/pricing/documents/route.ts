import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createErrorResponse,createSuccessResponse} from '@/lib/create-response';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {activeCompanyTariffs} from '@/lib/company-pricing';
import {renderTariffSheet,tariffSheetUrl,type TariffSheet} from '@/lib/tariff-sheet';

const handler=requestMiddleware(async (request,context)=>{
 if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Admin access required'});
 const id=request.nextUrl.pathname.split('/')[3];
 if(!/^[1-9]\d*$/.test(id))return createErrorResponse({status:400,errorMessage:'Invalid company'});
 const client=createPostgrestClient(await generateAdminUserToken());
 if(request.method==='GET'){
  const {data,error}=await client.from('company_tariff_documents').select('id,issued_at').eq('company_id',id).order('issued_at',{ascending:false}).limit(100);
  if(error)return createErrorResponse({status:503,errorMessage:'Tariff history unavailable'});
  return createSuccessResponse(data.map(row=>({...row,url:tariffSheetUrl(row.id)})));
 }
 const {language,revision}=await validateRequestBody(request);
 if(language!=='fr'&&language!=='nl')return createErrorResponse({status:400,errorMessage:'Choose French or Dutch'});
 const {data:company,error}=await client.from('companies').select('*').eq('id',id).maybeSingle();
 if(error)return createErrorResponse({status:503,errorMessage:'Company unavailable'});
 if(!company||company.archived_at)return createErrorResponse({status:404,errorMessage:'Company unavailable'});
 if(revision!==(company.tariff_revision??0))return createErrorResponse({status:409,errorMessage:'Reload tariffs before issuing'});
 const text=(value:unknown)=>typeof value==='string'?value.trim():'';
 const identity={name:text(company.name),address:text(company.address),vat:text(company.vat_number),email:text(company.email),phone:text(company.phone)};
 if(!identity.name||!identity.address||!identity.vat)return createErrorResponse({status:400,errorMessage:'Company name, address and VAT number are required'});
 if(company.tariff_profiles==null&&['minimum_fare','base_rate_per_km','base_rate_per_minute'].some(key=>company[key]==null))
  return createErrorResponse({status:400,errorMessage:'Save explicit company rates before issuing the document'});
 const now=new Date();
 const tariffs=activeCompanyTariffs(company,now);
 if(!tariffs.length)return createErrorResponse({status:400,errorMessage:'No active tariffs'});
 const sheet:TariffSheet={id:randomUUID(),issuedAt:now.toISOString(),language,company:identity,tariffs};
 const logo=await readFile(join(process.cwd(),'public/app-brand/app-icon.png'));
 const pdf=renderTariffSheet(sheet,logo);
 const saved=await client.from('company_tariff_documents').insert({id:sheet.id,company_id:id,issued_at:sheet.issuedAt,snapshot:sheet,pdf_base64:pdf.toString('base64')});
 if(saved.error)return createErrorResponse({status:503,errorMessage:'Tariff document could not be issued'});
 return createSuccessResponse({id:sheet.id,issued_at:sheet.issuedAt,url:tariffSheetUrl(sheet.id)},201);
},true);
export const GET=handler;
export const POST=handler;
