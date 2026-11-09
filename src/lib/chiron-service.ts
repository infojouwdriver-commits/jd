import {randomUUID} from 'node:crypto';
import CrudOperations from './crud-operations';
import {generateAdminUserToken} from './auth';
import {createPostgrestClient} from './postgrest';
import {ChironError,chironDestination,rideMessage,canonicalChironEnvironment} from './chiron-protocol';
import {driverPricing} from './company-pricing';

export class ChironService {
 static async getCompanyConfig(companyId:number):Promise<any>{
  const company=await new CrudOperations('companies',await generateAdminUserToken()).findById(companyId);
  if(!company)throw new ChironError('الشركة غير موجودة',404);return company;
 }
 static async getPlatformContract(companyId:number,platformName:string){
  const rows=await new CrudOperations('platform_contracts',await generateAdminUserToken()).findMany({company_id:companyId,platform_name:platformName.toLowerCase(),is_active:true});return rows[0]||null;
 }
  static getPricingJson(company: any) {
    return driverPricing(company);
  }


 static resolveEnvironment(company:any){
  if(process.env.CHIRON_TRANSMISSION_ENABLED!=='true')throw new ChironError('مزامنة Chiron غير مفعّلة على الخادم',409,'CHIRON_NOT_ENABLED');
  const mode=company.chiron_mode;
  if(!['TEST','PRODUCTION'].includes(mode))throw new ChironError('اختر بيئة Chiron للشركة');
  if(mode==='PRODUCTION'&&company.is_test===true)throw new ChironError('حساب الاختبار معزول عن إنتاج Chiron',409,'CHIRON_TEST_ONLY');
  if(mode==='PRODUCTION'&&process.env.CHIRON_PRODUCTION_ENABLED!=='true')throw new ChironError('الإرسال الفعلي يحتاج نجاح اختبار القبول وإكمال تفعيل الإنتاج',409,'CHIRON_PRODUCTION_NOT_ENABLED');
  const prefix=mode==='TEST'?'chiron_test_':'chiron_prod_';const host=mode==='TEST'?'mow-acc.api.vlaanderen.be':'mow.api.vlaanderen.be';
  if(!company[prefix+'client_id']||!company[prefix+'client_secret'])throw new ChironError('أدخل Client ID وClient Secret في إعدادات Chiron للشركة',422,'CHIRON_CREDENTIALS_REQUIRED');
  return {mode,clientId:company[prefix+'client_id'],clientSecret:company[prefix+'client_secret'],authUrl:chironDestination(company[prefix+'auth_url']||'https://'+host+'/oauth/token',mode,'auth'),apiUrl:chironDestination(company[prefix+'api_url']||'https://'+host+'/chiron/taxirit',mode,'trip')};
 }
 private static async getAccessToken(env:ReturnType<typeof ChironService.resolveEnvironment>):Promise<string>{
  let response:Response;
  try{response=await fetch(env.authUrl,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/x-www-form-urlencoded',Authorization:'Basic '+Buffer.from(env.clientId+':'+env.clientSecret).toString('base64')},body:new URLSearchParams({grant_type:'client_credentials'})});}
  catch{throw new ChironError('تعذّر الاتصال بخادم مصادقة Chiron',424,'CHIRON_AUTH_UNAVAILABLE');}
  if(response.status>=500 || response.status===429)throw new ChironError('تعذّر الاتصال بخادم مصادقة Chiron',424,'CHIRON_AUTH_UNAVAILABLE');
  if(!response.ok)throw new ChironError('رفض Chiron بيانات الاتصال. تحقق من بيانات البيئة المختارة.',424,'CHIRON_AUTH_REJECTED');
  let body:any;try{body=await response.json();}catch{throw new ChironError('استجابة مصادقة Chiron غير صالحة',424);}
  if(typeof body.access_token!=='string'||!body.access_token||body.access_token.length>8192)throw new ChironError('لم يصدر Chiron رمز اتصال صالحاً',424);
  return body.access_token;
 }
 private static async sendChironMessage(env:ReturnType<typeof ChironService.resolveEnvironment>,message:any,token:string){
  const uncertain=(receipt?:{httpStatus:number;errors:string[]})=>new ChironError('نتيجة الإرسال غير مؤكدة. راجع Chiron قبل إعادة الإرسال.',409,'CHIRON_DELIVERY_UNCERTAIN',true,receipt);
  const post=async(accessToken:string)=>{
   try{return await fetch(env.apiUrl,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json',Authorization:'Bearer '+accessToken,Accept:'application/json'},body:JSON.stringify(message)});}
   catch{throw uncertain();}
  };
  let response=await post(token);
  // A 401 explicitly rejects authentication. Renew once against the same pinned environment.
  if(response.status===401)response=await post(await this.getAccessToken(env));
  if(response.status===401)throw new ChironError('تعذّر تجديد مصادقة Chiron',424,'CHIRON_AUTH_EXPIRED');
  if(!response.ok){
   if(response.status>=500||[408,409].includes(response.status))throw uncertain();
   throw new ChironError('رفض Chiron الرسالة. راجع بيانات الرحلة.',424,'CHIRON_MESSAGE_REJECTED',false,{httpStatus:response.status,errors:[]});
  }
  let body:any;try{body=await response.json();}catch{throw uncertain();}
  if(response.status!==200||body?.httpStatus!=='OK'||!Array.isArray(body.fouten))throw uncertain();
  if(body.fouten.length){
   const errors=body.fouten.slice(0,25).map((item:any)=>item?.code).filter((code:unknown)=>typeof code==='string'&&/^CH[0-9]{4}$/.test(code));
   throw uncertain({httpStatus:200,errors});
  }
  if(body.message!=='De taxirit is verwerkt.')throw uncertain();
  return {httpStatus:200,accepted:true};
 }
 private static async sendEvent(tripId:number,companyId:number,status:'vertrek'|'aankomst',automatic=false){
  const token=await generateAdminUserToken(),crud=new CrudOperations('trips',token),trip=await crud.findById(tripId);
  if(!trip||String(trip.company_id)!==String(companyId))throw new ChironError('الرحلة غير موجودة',404);
  const state=trip.chiron_sync_state;
  if(state==='COMPLETED')return {success:true,response:{httpStatus:200},replayed:true};
  if(status==='vertrek'&&state==='START_ACCEPTED')return {success:true,response:{httpStatus:200},replayed:true};
  if(status==='aankomst'&&(!trip.end_time||trip.status!=='completed'))throw new ChironError('أكمل الرحلة قبل إرسال الوصول',409);
  if(automatic&&trip.sync_error_message&&(!['CHIRON_AUTH_UNAVAILABLE','CHIRON_AUTH_EXPIRED'].includes(trip.sync_error_message)||Date.now()-Date.parse(trip.last_sync_attempt)<30_000))throw new ChironError('Trip awaits review or retry',409,'CHIRON_EVENT_BUSY');
  if(['START_SENT','ARRIVAL_SENT'].includes(state))throw new ChironError('طلب سابق قيد المعالجة أو نتيجته غير مؤكدة. راجع Chiron قبل إعادة الإرسال.',409,'CHIRON_DELIVERY_UNCERTAIN');
  if(status==='aankomst'&&state!=='START_ACCEPTED')throw new ChironError('يجب قبول رسالة الانطلاق أولاً',409);
  const company=await this.getCompanyConfig(companyId),env=this.resolveEnvironment(company);
  if(trip.is_test===true&&env.mode==='PRODUCTION')throw new ChironError('حساب الاختبار معزول عن إنتاج Chiron',409,'CHIRON_TEST_ONLY');
  if(!trip.chiron_environment&&trip.chiron_realtime)throw new ChironError('بيئة الرحلة الأصلية مطلوبة',409,'CHIRON_ENVIRONMENT_INVALID');
  if(trip.chiron_environment&&canonicalChironEnvironment(trip.chiron_environment)!==canonicalChironEnvironment(env.mode))throw new ChironError('بيئة الرحلة السابقة تختلف عن بيئة الشركة. لا تُرسل الرحلة إلى بيئة أخرى.',409);
  const driver=await new CrudOperations('drivers',token).findById(trip.driver_id),vehicle=await new CrudOperations('vehicles',token).findById(trip.vehicle_id);
  if(!driver||!vehicle||String(driver.company_id)!==String(companyId)||String(vehicle.company_id)!==String(companyId))throw new ChironError('السائق أو المركبة غير موجودة',422);
  const departure=trip.chiron_departure_payload;
  const contract=!departure&&trip.external_source?await this.getPlatformContract(companyId,trip.external_source):null;
  if(status==='aankomst'&&trip.chiron_realtime&&!departure)throw new ChironError('إقرار الانطلاق غير متاح',409);
  const message=status==='vertrek'&&departure ? departure : rideMessage(status,company,driver,vehicle,trip,contract,departure);
  const accessToken=await this.getAccessToken(env);
  const next=status==='vertrek'?'START_SENT':'ARRIVAL_SENT';
  // Compare-and-set in PostgreSQL: only one request claims this event across all instances.
  const attempts=trip.chiron_sync_attempts ?? 0;
  let query=createPostgrestClient(token).from('trips').update({
   chiron_sync_state:next,chiron_environment:env.mode==='TEST'?'test':'production',last_sync_attempt:new Date().toISOString(),
   chiron_sync_attempts:attempts+1,...(status==='vertrek'&&trip.chiron_realtime?{chiron_departure_payload:message}:{}),
  }).eq('id',tripId).eq('company_id',companyId);
  query=state==null?query.is('chiron_sync_state',null):query.eq('chiron_sync_state',state);
  query=trip.chiron_sync_attempts==null?query.is('chiron_sync_attempts',null):query.eq('chiron_sync_attempts',attempts);
  const claim=await query.select('id');
  if(claim.error)throw new ChironError('تعذّر حجز طلب المزامنة',424);
  if(claim.data?.length!==1)throw new ChironError('هناك طلب مزامنة آخر لهذه الرحلة',409,'CHIRON_EVENT_BUSY');
  try{
   const response=await this.sendChironMessage(env,message,accessToken);
   const values=status==='vertrek'?{chiron_sync_state:'START_ACCEPTED',start_accepted_at:new Date().toISOString(),start_sync_response:response}:{chiron_sync_state:'COMPLETED',arrival_sync_response:response,arrival_sent_at:new Date().toISOString()};
   // Business status, price, times and financial records stay unchanged.
   const saved=await createPostgrestClient(token).from('trips').update({...values,sync_error_message:null}).eq('id',tripId).eq('company_id',companyId).eq('chiron_sync_state',next).select('id');
   if(saved.error||saved.data?.length!==1)throw new ChironError('قبل Chiron الرسالة ولكن تعذّر حفظ الإقرار. راجع الاتصال قبل المحاولة التالية.',409,'CHIRON_DELIVERY_UNCERTAIN',true);
   return {success:true,response};
  }catch(error){
   // A lost receipt must not cause an automatic duplicate. Definitive rejection can be retried.
   const definitive=error instanceof ChironError&&!error.uncertain;
   const receipt=error instanceof ChironError&&error.receipt?{[status==='vertrek'?'start_sync_response':'arrival_sync_response']:error.receipt}:{};
   const failure=definitive?{
    chiron_sync_state:status==='vertrek'?'CREATED':'START_ACCEPTED',sync_error_message:error.code,
    ...receipt,
   }:{sync_error_message:'CHIRON_DELIVERY_UNCERTAIN',...receipt};
   await createPostgrestClient(token).from('trips').update(failure)
    .eq('id',tripId).eq('company_id',companyId).eq('chiron_sync_state',next).eq('chiron_sync_attempts',attempts+1).select('id');
   throw error;
  }
 }
 static async sendTripStart(tripId:number,companyId:number,_data:any,automatic=false){return this.sendEvent(tripId,companyId,'vertrek',automatic);}
 static async sendTripArrival(tripId:number,companyId:number,_data:any,automatic=false){return this.sendEvent(tripId,companyId,'aankomst',automatic);}
 static async runAcceptanceTest(companyId:number,driverId:number,vehicleId:number){
  const token=await generateAdminUserToken(),company=await this.getCompanyConfig(companyId);
  if(company.chiron_mode!=='TEST')throw new ChironError('اختبار القبول مسموح في بيئة TEST فقط',409,'CHIRON_TEST_ONLY');
  const env=this.resolveEnvironment(company);
  const driver=await new CrudOperations('drivers',token).findById(driverId),vehicle=await new CrudOperations('vehicles',token).findById(vehicleId);
  if(!driver||!vehicle)throw new ChironError('السائق أو المركبة غير موجودة',404);
  const testDate=new Date().toISOString();
  const locations=[
   {lat:50.8503,lon:4.3517,address:'Grand Place, 1000 Brussels, Belgium'},
   {lat:50.8467,lon:4.3525,address:"Brussels Central Station, Carrefour de l’Europe 2, 1000 Brussels, Belgium"},
   {lat:50.8798,lon:4.7005,address:'Brussels Airport, Leopoldlaan, 1930 Zaventem, Belgium'},
   {lat:50.8476,lon:4.3572,address:"Manneken Pis, Rue de l’Étuve 46, 1000 Brussels, Belgium"},
   {lat:50.8411,lon:4.3571,address:'Brussels South Station, Avenue Fonsny 47B, 1060 Brussels, Belgium'}
  ];
  const example={ritnummer:'TEST-'+randomUUID(),start_time:new Date(Date.now()-600000).toISOString(),end_time:new Date(Date.now()-300000).toISOString(),start_lat:50.850,start_lon:4.352,end_lat:50.847,end_lon:4.353,distance_km:1.25,price:12.5};
  rideMessage('aankomst',company,driver,vehicle,example); // Validate everything before any transmission.
  const results:any[]=[];const log=new CrudOperations('test_trips',token);
  for(let i=0;i<5;i++){
   const from=locations[i],to=locations[(i+1)%locations.length],start=Date.parse(testDate)-(90-i*15)*60000;
   const trip={...example,ritnummer:'TEST-'+randomUUID(),start_time:new Date(start).toISOString(),end_time:new Date(start+10*60000).toISOString(),start_lat:from.lat,start_lon:from.lon,end_lat:to.lat,end_lon:to.lon,start_address:from.address,end_address:to.address};
   const canonical=rideMessage('aankomst',company,driver,vehicle,trip).rit;
   const details={startAddress:trip.start_address,endAddress:trip.end_address,startTime:trip.start_time,endTime:trip.end_time,startLat:canonical.vertrekpunt.breedtegraad,startLon:canonical.vertrekpunt.lengtegraad,endLat:canonical.aankomstpunt.breedtegraad,endLon:canonical.aankomstpunt.lengtegraad,distanceKm:trip.distance_km,price:trip.price};let startAccepted=false;
   for(const [position,status] of (['vertrek','aankomst'] as const).entries()){
    const sequence=i*2+position+1,message=rideMessage(status,company,driver,vehicle,trip);
    const record=await log.create({company_id:companyId,driver_id:driverId,vehicle_id:vehicleId,chiron_driver_id:driver.bestuurderspas_number||driver.capacity_certificate_number,chiron_vehicle_id:vehicle.plate_number,ritnummer:trip.ritnummer+'-'+status,message_type:status,timestamp:new Date().toISOString(),test_sequence_number:sequence,start_address:trip.start_address,end_address:trip.end_address,start_time:trip.start_time,end_time:trip.end_time,start_lat:details.startLat,start_lon:details.startLon,end_lat:details.endLat,end_lon:details.endLon,distance_km:trip.distance_km,price:trip.price,sync_status:'pending'});
    if(status==='aankomst'&&!startAccepted){await log.update(record.id,{sync_status:'failed',error_message:'Start not accepted'});results.push({...details,sequence,messageType:status,ritnummer:trip.ritnummer,success:false,deliveryState:'not_sent',error:'لم تُرسل رسالة الوصول لأن الانطلاق لم يُقبل'});continue;}
    try{const response=await this.sendChironMessage(env,message,await this.getAccessToken(env));await log.update(record.id,{sync_status:'success',http_status_code:response.httpStatus});startAccepted=true;results.push({...details,sequence,messageType:status,ritnummer:trip.ritnummer,success:true,deliveryState:'accepted',httpStatus:response.httpStatus});}
    catch(error){await log.update(record.id,{sync_status:error instanceof ChironError&&error.uncertain?'pending':'failed',error_message:error instanceof ChironError?error.code:'CHIRON_FAILED'});results.push({...details,sequence,messageType:status,ritnummer:trip.ritnummer,success:false,deliveryState:error instanceof ChironError&&error.uncertain?'uncertain':'failed',error:error instanceof ChironError?error.message:'تعذّر إرسال الرسالة'});}
   }
  }
  const successCount=results.filter(r=>r.success).length;return {success:successCount===10,totalMessages:10,successCount,failedCount:10-successCount,results,reportContext:{testDate,environment:'TEST',company:{id:company.id,name:company.name,kbo_number:company.kbo_number,vat_number:company.vat_number,address:company.address,email:company.email,phone:company.phone},driver:{id:driver.id,full_name:driver.full_name,capacity_certificate_number:driver.bestuurderspas_number||driver.capacity_certificate_number,phone:driver.phone},vehicle:{id:vehicle.id,brand:vehicle.brand,model:vehicle.model,plate_number:vehicle.plate_number}}};
 }
 static async logSyncAttempt(tripId:number,attemptNumber:number,status:'success'|'failed'|'pending',_request:any,_response?:any,error?:string,httpStatus?:number){
  await new CrudOperations('chiron_sync_log',await generateAdminUserToken()).create({trip_id:tripId,attempt_number:attemptNumber,status,error_message:error?'CHIRON_FAILED':null,http_status_code:httpStatus||null});
 }
  static calculateProposedFare(
    distanceKm: number,
    durationMinutes: number,
    pricing: {
      base_fee: number;
      km_rate: number;
      minute_rate: number;
      minimum_fare: number;
      night_fee?: number;
      airport_fee?: number;
    },
    options?: { isNight?: boolean; isAirport?: boolean }
  ): number {
    let price =
      pricing.base_fee +
      distanceKm * pricing.km_rate +
      durationMinutes * pricing.minute_rate;

    if (options?.isNight && pricing.night_fee) {
      price += pricing.night_fee;
    }

    if (options?.isAirport && pricing.airport_fee) {
      price += pricing.airport_fee;
    }

    if (price < pricing.minimum_fare) {
      price = pricing.minimum_fare;
    }

    return Math.round(price * 100) / 100;
  }
}
