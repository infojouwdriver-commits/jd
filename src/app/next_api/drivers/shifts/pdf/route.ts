import {NextResponse} from 'next/server';
import {requestMiddleware} from '@/lib/api-utils';
import {createErrorResponse} from '@/lib/create-response';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {driverShiftPdf} from '@/lib/driver-shift-pdf';
import type {ShiftDetail} from '@/lib/driver-shifts';
export const runtime='nodejs';
// Same snapshot and Dutch document as the portal, scoped by authenticated user.
// This endpoint is read-only and never issues or changes a customer invoice.
export const GET=requestMiddleware(async(request,context)=>{
 const owner=Number(context.payload?.sub),id=request.nextUrl.searchParams.get('id');
 if(!Number.isSafeInteger(owner)||owner<1)return createErrorResponse({status:403,errorMessage:'Shift unavailable'});
 if(!id||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return createErrorResponse({status:400,errorMessage:'Invalid shift'});
 const {data,error}=await createPostgrestClient(await generateAdminUserToken()).rpc('security_driver_shifts',{p_user_id:owner,p_shift_id:id,p_offset:0});
 if(error||!data)return createErrorResponse({status:error?.code==='42501'?403:503,errorMessage:'Shift unavailable'});
 const detail=data as ShiftDetail;
 if(detail.shift?.id!==id||!Array.isArray(detail.events))return createErrorResponse({status:503,errorMessage:'Shift unavailable'});
 const bytes=driverShiftPdf(detail).output('arraybuffer');
 return new NextResponse(bytes,{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="Dienststaat-${id}.pdf"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
},true);
