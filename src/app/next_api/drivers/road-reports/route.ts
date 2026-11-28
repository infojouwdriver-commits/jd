import { z } from 'zod';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import { createPostgrestClient } from '@/lib/postgrest';
import { createErrorResponse, createSuccessResponse } from '@/lib/create-response';

const coordinates = {lat:z.number().min(49.49).max(51.52),lon:z.number().min(2.50).max(6.42)};
const command = z.union([
 z.object({...coordinates,kind:z.enum(['collision','hazard','closure','congestion'])}).strict(),
 z.object({...coordinates,id:z.number().int().positive(),present:z.boolean()}).strict(),
]);
async function driverClient(subject: string | undefined) {
 const actor = Number(subject);
 if (!Number.isSafeInteger(actor) || actor < 1) return null;
 const client = createPostgrestClient(await generateAdminUserToken());
 const driver = await client.from('drivers').select('id').eq('user_id',actor).is('archived_at',null).limit(1).maybeSingle();
 if (driver.error) throw Error('Road reports unavailable');
 return driver.data ? {client,actor} : null;
}
const airportPosition = {lat:50.8984,lon:4.4844};
export const GET = requestMiddleware(async (request,context) => {
 const query = request.nextUrl.searchParams;
 const point = z.object(coordinates).safeParse({lat:Number(query.get('lat')),lon:Number(query.get('lon'))});
 if (!point.success) return createErrorResponse({status:400,errorMessage:'Invalid position'});
 const access = await driverClient(context.payload?.sub);
 if (!access) return createErrorResponse({status:403,errorMessage:'Active driver required'});
 const {lat,lon} = point.data;
 const nearAirport = Math.abs(lat-airportPosition.lat)<0.12 && Math.abs(lon-airportPosition.lon)<0.2;
 const now = new Date().toISOString();
 const [reports,airport] = await Promise.all([
  access.client.from('road_reports').select('id,kind,lat,lon,expires_at')
   .gt('expires_at',now).gte('lat',lat-0.10).lte('lat',lat+0.10)
   .gte('lon',lon-0.16).lte('lon',lon+0.16).order('created_at',{ascending:false}).limit(100),
  nearAirport ? access.client.from('airport_road_notices').select('id,kind,detail,expires_at').gt('expires_at',now).order('created_at',{ascending:false}).limit(5) : null,
 ]);
 if (reports.error || airport?.error) throw Error('Road reports unavailable');
 return createSuccessResponse({reports:reports.data,airport:airport?.data??[]});
});

export const POST = requestMiddleware(async (request,context) => {
 const parsed = command.safeParse(await validateRequestBody(request));
 if (!parsed.success) return createErrorResponse({status:400,errorMessage:'Invalid report'});
 const access = await driverClient(context.payload?.sub);
 if (!access) return createErrorResponse({status:403,errorMessage:'Active driver required'});
 const point = parsed.data;
 const result = await access.client.rpc('road_report_command',{
  p_actor:access.actor,p_lat:point.lat,p_lon:point.lon,
  p_kind:'kind' in point ? point.kind : null,p_report:'id' in point ? point.id : null,p_present:'present' in point ? point.present : null,
 });
 if (result.error) throw Error('Road reports unavailable');
 if (!result.data) return createErrorResponse({status:'id' in point ? 404 : 429,errorMessage:'Report unavailable'});
 return createSuccessResponse({id:result.data});
});
