import CrudOperations from '@/lib/crud-operations';
import {requestMiddleware} from '@/lib/api-utils';
import {generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {createErrorResponse,createSuccessResponse} from '@/lib/create-response';
import {activityColumns,activityFilters,summarizeActivity} from '@/lib/driver-activity';
export const GET=requestMiddleware(async(request,context)=>{
 let filters:ReturnType<typeof activityFilters>;try{filters=activityFilters(request.nextUrl.searchParams);}catch{return createErrorResponse({status:400,errorMessage:'Invalid activity filters'});}
 const userId=Number(context.payload?.sub);if(!Number.isSafeInteger(userId)||userId<1)return createErrorResponse({status:401,errorMessage:'Session required'});
 try{
  const token=await generateAdminUserToken();const drivers=await new CrudOperations('drivers',token).findMany({user_id:userId},{limit:2,offset:0});
  if(drivers.length!==1)return createErrorResponse({status:403,errorMessage:'Driver profile unavailable'});const owner=Number(drivers[0].id);
  const base=()=>{
   let q=createPostgrestClient(token).from('trips').select(activityColumns,{count:'exact'}).eq('user_id',userId).eq('driver_id',owner).gte('start_time',filters.start).lt('start_time',filters.end);
   if(filters.platform==='INTERNAL')q=q.eq('ride_type','INTERNAL');else if(filters.platform!=='all')q=q.eq('external_source',filters.platform);
   const status=filters.mode==='summary'?'completed':filters.status;
   if(status==='completed')q=q.in('status',['completed','success']);else if(status!=='all')q=q.eq('status',status);
   return q.order('start_time',{ascending:false}).order('id',{ascending:false});
  };
  const assertOwner=(rows:Record<string,unknown>[])=>{if(rows.some(r=>Number(r.user_id)!==userId||Number(r.driver_id)!==owner))throw Error('Owner mismatch');};
  if(filters.mode==='summary'){
   const rows:Record<string,unknown>[]=[];for(let offset=0;;offset+=1000){const page=await base().range(offset,offset+999);if(page.error)throw Error('Activity unavailable');const data=page.data||[];assertOwner(data);rows.push(...data);if(data.length<1000)break;if(rows.length>=100000)throw Error('Select a shorter period');}
   return createSuccessResponse({driver_id:owner,from:filters.from,to:filters.to,...summarizeActivity(rows)});
  }
  const page=await base().range(filters.offset,filters.offset+24);if(page.error)throw Error('Activity unavailable');const rows=page.data||[];assertOwner(rows);
  const trips=rows.map(({user_id,driver_id,distance_km,duration_minutes,...row})=>({...row,driver_id:owner,price:row.price==null?null:Number(row.price),distance:distance_km==null?null:Number(distance_km),duration:duration_minutes==null?null:Number(duration_minutes)}));
  const total=page.count;if(total==null)throw Error('Count unavailable');
  return createSuccessResponse({driver_id:owner,trips,total,next_offset:filters.offset+rows.length<total?filters.offset+rows.length:null});
 }catch{return createErrorResponse({status:503,errorMessage:'Activity temporarily unavailable; try a shorter period'});}
},true);
