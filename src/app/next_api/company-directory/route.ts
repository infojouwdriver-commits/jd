import {z} from 'zod';
import {requestMiddleware} from '@/lib/api-utils';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {createSuccessResponse,createErrorResponse} from '@/lib/create-response';
const filters=z.object({kind:z.enum(['companies','drivers','vehicles']),company_id:z.coerce.number().int().positive().optional(),scope:z.enum(['live','test','all']).default('live'),state:z.enum(['current','all','archived','active','inactive','suspended','maintenance']).default('current'),q:z.string().trim().max(100).default(''),sort:z.enum(['newest','name','name_desc']).default('newest'),limit:z.coerce.number().int().min(1).max(100).default(25),offset:z.coerce.number().int().min(0).max(100000).default(0)}).strict();
export const GET=requestMiddleware(async(request,context)=>{
 if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Administrator required'});
 const parsed=filters.safeParse(Object.fromEntries(request.nextUrl.searchParams));
 if(!parsed.success)return createErrorResponse({status:400,errorMessage:'Invalid directory filters'});
 const p=parsed.data;
 try{const r=await createPostgrestClient(await generateAdminUserToken()).rpc('security_company_directory',{p_kind:p.kind,p_company:p.company_id??null,p_scope:p.scope,p_state:p.state,p_query:p.q,p_sort:p.sort,p_limit:p.limit,p_offset:p.offset});if(r.error)throw Error();return createSuccessResponse(r.data);}
 catch{return createErrorResponse({status:503,errorMessage:'Directory temporarily unavailable'});}
},true);
