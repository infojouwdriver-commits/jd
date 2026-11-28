import {z} from 'zod';
import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createPostgrestClient} from '@/lib/postgrest';
import {createErrorResponse,createSuccessResponse} from '@/lib/create-response';

const command = z.discriminatedUnion('action',[
 z.object({action:z.literal('publish'),kind:z.enum(['meeting_changed','taxi_entrance_closed']),detail:z.string().trim().min(3).max(240),minutes:z.number().int().min(15).max(720)}).strict(),
 z.object({action:z.literal('end'),id:z.number().int().positive()}).strict(),
]);
export const GET = requestMiddleware(async (_request,context)=>{
 if (!context.payload?.isAdmin) return createErrorResponse({status:403,errorMessage:'Administration required'});
 const client = createPostgrestClient(context.token);
 const result = await client.from('airport_road_notices').select('id,kind,detail,expires_at').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(50);
 if (result.error) throw Error('Airport notices unavailable');
 return createSuccessResponse(result.data);
});
export const POST = requestMiddleware(async (request,context)=>{
 if (!context.payload?.isAdmin) return createErrorResponse({status:403,errorMessage:'Administration required'});
 const parsed=command.safeParse(await validateRequestBody(request));
 if(!parsed.success) return createErrorResponse({status:400,errorMessage:'Invalid notice'});
 const input = parsed.data;
 const client = createPostgrestClient(context.token);
 const result = input.action==='publish' ? await client.from('airport_road_notices').insert({
  kind:input.kind,detail:input.detail,expires_at:new Date(Date.now()+60_000*input.minutes).toISOString(),
 }) : await client.from('airport_road_notices').update({expires_at:new Date().toISOString()}).eq('id',input.id);
 if(result.error) throw Error('Airport notice unavailable');
 return createSuccessResponse({saved:true});
});
