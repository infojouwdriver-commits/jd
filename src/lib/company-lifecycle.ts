import {z} from 'zod';
import {createPostgrestClient} from './postgrest';
export const companyLifecycleCommand=z.object({company_id:z.number().int().positive(),action:z.enum(['archive','restore']),reason:z.string().trim().min(1).max(1000),request_id:z.string().uuid()}).strict();
export async function changeCompanyLifecycle(token:string,actor:number,input:z.infer<typeof companyLifecycleCommand>){
 const result=await createPostgrestClient(token).rpc(input.action==='archive'?'security_archive_company':'security_restore_company',{p_company:input.company_id,p_actor:actor,p_reason:input.reason,p_request:input.request_id});
 if(result.error){const code=result.error.code,status=code==='P0002'?404:['40001','40P01','55P03','23514'].includes(code||'')?409:code==='22023'?400:503;
 const message=status===409?'Company state changed or active trips / Chiron deliveries need review':status===404?'Company not found':'Company archive operation unavailable';
 throw new Response(JSON.stringify({success:false,errorMessage:message}),{status,headers:{'Content-Type':'application/json'}});}
 return result.data;
}
