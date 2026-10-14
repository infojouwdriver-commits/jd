import CrudOperations from '@/lib/crud-operations';
import {createSuccessResponse, createErrorResponse} from '@/lib/create-response';
import {requestMiddleware, parseQueryParams} from '@/lib/api-utils';
import {generateAdminUserToken} from '@/lib/auth';
// This endpoint is always the authenticated driver's own history, even for an admin session.
export const GET = requestMiddleware(async (request, context) => {
  const userId = Number(context.payload?.sub);
  if (!Number.isSafeInteger(userId) || userId < 1) return createErrorResponse({errorMessage:'معرف المستخدم غير صالح',status:400});
  const query = parseQueryParams(request);
  const limit = Math.min(query.limit, 25), offset = query.offset;
  if (offset > 100000) return createErrorResponse({errorMessage:'صفحة غير صالحة',status:400});
  try {
    const token = await generateAdminUserToken();
    const drivers = await new CrudOperations('drivers',token).findMany({user_id:userId},{limit:2,offset:0});
    if (drivers.length !== 1 || !Number.isSafeInteger(Number(drivers[0].id)) || Number(drivers[0].id) < 1) return createErrorResponse({errorMessage:'ملف السائق غير متاح',status:403});
    const driverId = Number(drivers[0].id);
    const rows = await new CrudOperations('trips',token).findMany({user_id:userId,driver_id:driverId,status:'completed'},{limit,offset,orderBy:{column:'created_at',direction:'desc'}});
    if (rows.some(row=>Number(row.user_id)!==userId || Number(row.driver_id)!==driverId)) throw Error('History ownership mismatch');
    const trips = rows.map(row=>({id:row.id,driver_id:driverId,start_time:row.start_time || null,end_time:row.end_time || null,start_address:row.start_address || null,end_address:row.end_address || null,price:Number(row.price),currency:row.currency || 'EUR',distance:row.distance_km == null ? null : Number(row.distance_km),duration:row.duration_minutes == null ? null : Number(row.duration_minutes),chiron_environment:row.chiron_environment || null,chiron_sync_state:row.chiron_sync_state || null}));
    return createSuccessResponse({driver_id:driverId,trips,next_offset:rows.length===limit?offset+limit:null});
  } catch {return createErrorResponse({errorMessage:'تعذّر تحميل الرحلات',status:500});}
},true);
