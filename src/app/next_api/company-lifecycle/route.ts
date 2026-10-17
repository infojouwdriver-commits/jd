import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
import {companyLifecycleCommand,changeCompanyLifecycle} from '@/lib/company-lifecycle';
export const POST=requestMiddleware(async(request,context)=>{
 if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Administrator required'});
 const parsed=companyLifecycleCommand.safeParse(await validateRequestBody(request));
 if(!parsed.success)return createErrorResponse({status:400,errorMessage:'Company, action, request reference and reason required'});
 try{return createSuccessResponse(await changeCompanyLifecycle(await generateAdminUserToken(),Number(context.payload.sub),parsed.data));}
 catch(error){if(error instanceof Response)return error;return createErrorResponse({status:503,errorMessage:'Company archive unavailable'});}
},true);
export const GET=requestMiddleware(async(request,context)=>{
 if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Administrator required'});
 const id=Number(request.nextUrl.searchParams.get('company_id'));
 if(!Number.isSafeInteger(id)||id<1)return createErrorResponse({status:400,errorMessage:'Company required'});
 try{const client=createPostgrestClient(await generateAdminUserToken());
 const company=await client.from('companies').select('id,name,archived_at,archive_event_id,is_test,subscription_status').eq('id',id).maybeSingle();
 if(company.error)throw Error();
 if(!company.data)return createErrorResponse({status:404,errorMessage:'Company missing'});
 const companyData=company.data;
 const count=(table:string)=>{const q=client.from(table).select('id',{count:'exact',head:true}).eq('company_id',id);return companyData.archived_at?q.eq('archive_event_id',companyData.archive_event_id):q.is('archived_at',null);};
 const [drivers,vehicles,events]=await Promise.all([count('drivers'),count('vehicles'),client.from('company_lifecycle_events').select('id,action,reason,actor_id,created_at').eq('company_id',id).order('created_at',{ascending:false}).limit(50)]);
 if(company.error||drivers.error||vehicles.error||events.error)throw Error();
 return createSuccessResponse({company:company.data,drivers:drivers.count,vehicles:vehicles.count,events:events.data});
 }catch{return createErrorResponse({status:503,errorMessage:'Company archive details unavailable'});}
},true);
