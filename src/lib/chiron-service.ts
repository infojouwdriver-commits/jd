import {randomUUID} from 'node:crypto';
import CrudOperations from './crud-operations';
import {generateAdminUserToken} from './auth';
import {createPostgrestClient} from './postgrest';
import {ChironError,chironDestination,rideMessage} from './chiron-protocol';

export class ChironService {
 static async getCompanyConfig(companyId:number):Promise<any>{
  const company=await new CrudOperations('companies',await generateAdminUserToken()).findById(companyId);
  if(!company)throw new ChironError('الشركة غير موجودة',404);return company;
 }
 static async getPlatformContract(companyId:number,platformName:string){
  const rows=await new CrudOperations('platform_contracts',await generateAdminUserToken()).findMany({company_id:companyId,platform_name:platformName.toLowerCase(),is_active:true});return rows[0]||null;
 }
  static getPricingJson(company: any) {
    return {
      base_fee: company.minimum_fare ?? 10.00,
      km_rate: company.base_rate_per_km ?? 2.00,
      minute_rate: company.base_rate_per_minute ?? 0.50,
      minimum_fare: company.minimum_fare ?? 10.00,
      airport_fee: company.airport_surcharge ?? 5.00,
      night_surcharge_percentage: company.night_surcharge_percentage ?? 20.00,
      peak_hour_surcharge_percentage: company.peak_hour_surcharge_percentage ?? 15.00
    };
  }


 static resolveEnvironment(company:any){
  if(process.env.CHIRON_TRANSMISSION_ENABLED!=='true')throw new ChironError('مزامنة Chiron غير مفعّلة على الخادم',409,'CHIRON_NOT_ENABLED');
  const mode=company.chiron_mode;
  if(!['TEST','PRODUCTION'].includes(mode))throw new ChironError('اختر بيئة Chiron للشركة');
  if(mode==='PRODUCTION'&&process.env.CHIRON_PRODUCTION_ENABLED!=='true')throw new ChironError('الإرسال الفعلي يحتاج نجاح اختبار القبول وإكمال تفعيل الإنتاج',409,'CHIRON_PRODUCTION_NOT_ENABLED');
  const prefix=mode==='TEST'?'chiron_test_':'chiron_prod_';const host=mode==='TEST'?'mow-acc.api.vlaanderen.be':'mow.api.vlaanderen.be';
  if(!company[prefix+'client_id']||!company[prefix+'client_secret'])throw new ChironError('أدخل Client ID وClient Secret في إعدادات Chiron للشركة',422,'CHIRON_CREDENTIALS_REQUIRED');
  return {mode,clientId:company[prefix+'client_id'],clientSecret:company[prefix+'client_secret'],authUrl:chironDestination(company[prefix+'auth_url']||'https://'+host+'/oauth/token',mode,'auth'),apiUrl:chironDestination(company[prefix+'api_url']||'https://'+host+'/chiron/taxirit',mode,'trip')};
 }
 static async getAccessToken(companyId:number):Promise<string>{
  const env=this.resolveEnvironment(await this.getCompanyConfig(companyId));let response:Response;
  try{response=await fetch(env.authUrl,{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/x-www-form-urlencoded',Authorization:'Basic '+Buffer.from(env.clientId+':'+env.clientSecret).toString('base64')},body:new URLSearchParams({grant_type:'client_credentials'})});}
  catch{throw new ChironError('تعذّر الاتصال بخادم مصادقة Chiron',424,'CHIRON_AUTH_UNAVAILABLE');}
  if(!response.ok)throw new ChironError('رفض Chiron بيانات الاتصال. تحقق من بيانات البيئة المختارة.',424,'CHIRON_AUTH_REJECTED');
  let body:any;try{body=await response.json();}catch{throw new ChironError('استجابة مصادقة Chiron غير صالحة',424);}
  if(typeof body.access_token!=='string'||!body.access_token||body.access_token.length>8192)throw new ChironError('لم يصدر Chiron رمز اتصال صالحاً',424);return body.access_token;
 }
 static async sendChironMessage(companyId:number,message:any){
  const env=this.resolveEnvironment(await this.getCompanyConfig(companyId));const token=await this.getAccessToken(companyId);
  let response:Response;try{response=await fetch(env.apiUrl,{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,Accept:'application/json'},body:JSON.stringify(message)});}
  catch{throw new ChironError('نتيجة الإرسال غير مؤكدة. راجع Chiron قبل إعادة الإرسال لتجنب التكرار.',409,'CHIRON_DELIVERY_UNCERTAIN',true);}
  if(!response.ok){
   const uncertain=response.status>=500||response.status===408||response.status===409;
   throw new ChironError(uncertain?'نتيجة الإرسال غير مؤكدة. راجع Chiron قبل إعادة الإرسال.':'رفض Chiron الرسالة. راجع بيانات الرحلة قبل المحاولة التالية.',uncertain?409:424,uncertain?'CHIRON_DELIVERY_UNCERTAIN':'CHIRON_MESSAGE_REJECTED',uncertain);
  }
  // Raw upstream bodies can contain private data; retain only the acceptance status.
  return {httpStatus:response.status};
 }
 private static async sendEvent(tripId:number,companyId:number,status:'vertrek'|'aankomst'){
  const token=await generateAdminUserToken(),crud=new CrudOperations('trips',token),trip=await crud.findById(tripId);
  if(!trip||String(trip.company_id)!==String(companyId))throw new ChironError('الرحلة غير موجودة',404);
  const state=trip.chiron_sync_state;
  if(state==='COMPLETED')return {success:true,response:{httpStatus:200},replayed:true};
  if(status==='vertrek'&&state==='START_ACCEPTED')return {success:true,response:{httpStatus:200},replayed:true};
  if(['START_SENT','ARRIVAL_SENT'].includes(state))throw new ChironError('طلب سابق قيد المعالجة أو نتيجته غير مؤكدة. راجع Chiron قبل إعادة الإرسال.',409,'CHIRON_DELIVERY_UNCERTAIN');
  if(status==='aankomst'&&state!=='START_ACCEPTED')throw new ChironError('يجب قبول رسالة الانطلاق أولاً',409);
  const company=await this.getCompanyConfig(companyId),env=this.resolveEnvironment(company);
  if(trip.chiron_environment&&trip.chiron_environment!==(env.mode==='TEST'?'test':'production'))throw new ChironError('بيئة الرحلة السابقة تختلف عن بيئة الشركة. لا تُرسل الرحلة إلى بيئة أخرى.',409);
  const driver=await new CrudOperations('drivers',token).findById(trip.driver_id),vehicle=await new CrudOperations('vehicles',token).findById(trip.vehicle_id);
  if(!driver||!vehicle)throw new ChironError('السائق أو المركبة غير موجودة',422);
  const contract=trip.external_source?await this.getPlatformContract(companyId,trip.external_source):null;
  const message=rideMessage(status,company,driver,vehicle,trip,contract);
  const next=status==='vertrek'?'START_SENT':'ARRIVAL_SENT';
  // Compare-and-set in PostgreSQL: only one request claims this event across all instances.
  let query=createPostgrestClient(token).from('trips').update({chiron_sync_state:next,chiron_environment:env.mode==='TEST'?'test':'production',last_sync_attempt:new Date().toISOString()}).eq('id',tripId);
  query=state===null||state===undefined?query.is('chiron_sync_state',null):query.eq('chiron_sync_state',state);
  const claim=await query.select('id');if(claim.error)throw new ChironError('تعذّر حجز طلب المزامنة',424);if(claim.data?.length!==1)throw new ChironError('هناك طلب مزامنة آخر لهذه الرحلة',409);
  try{
   const response=await this.sendChironMessage(companyId,message);
   const values=status==='vertrek'?{chiron_sync_state:'START_ACCEPTED',start_accepted_at:new Date().toISOString(),start_sync_response:response}:{chiron_sync_state:'COMPLETED',arrival_sync_response:response,arrival_sent_at:new Date().toISOString()};
   // Business status, price, times and financial records stay unchanged.
   const saved=await createPostgrestClient(token).from('trips').update({...values,sync_error_message:null}).eq('id',tripId).eq('chiron_sync_state',next).select('id');
   if(saved.error||saved.data?.length!==1)throw new ChironError('قبل Chiron الرسالة ولكن تعذّر حفظ الإقرار. راجع الاتصال قبل المحاولة التالية.',409,'CHIRON_DELIVERY_UNCERTAIN',true);
   return {success:true,response};
  }catch(error){
   // A lost receipt must not cause an automatic duplicate. Definitive rejection can be retried.
   if(error instanceof ChironError&&!error.uncertain)await crud.update(tripId,{chiron_sync_state:status==='vertrek'?'CREATED':'START_ACCEPTED',sync_error_message:error.code});
   throw error;
  }
 }
 static async sendTripStart(tripId:number,companyId:number,_data:any){return this.sendEvent(tripId,companyId,'vertrek');}
 static async sendTripArrival(tripId:number,companyId:number,_data:any){return this.sendEvent(tripId,companyId,'aankomst');}
 static async runAcceptanceTest(companyId:number,driverId:number,vehicleId:number){
  const token=await generateAdminUserToken(),company=await this.getCompanyConfig(companyId);
  if(company.chiron_mode!=='TEST')throw new ChironError('اختبار القبول مسموح في بيئة TEST فقط',409,'CHIRON_TEST_ONLY');
  this.resolveEnvironment(company);
  const driver=await new CrudOperations('drivers',token).findById(driverId),vehicle=await new CrudOperations('vehicles',token).findById(vehicleId);
  if(!driver||!vehicle)throw new ChironError('السائق أو المركبة غير موجودة',404);
  const example={ritnummer:'TEST-'+randomUUID(),start_time:new Date(Date.now()-600000).toISOString(),end_time:new Date(Date.now()-300000).toISOString(),start_lat:50.850,start_lon:4.352,end_lat:50.847,end_lon:4.353,distance_km:1.25,price:12.5};
  rideMessage('aankomst',company,driver,vehicle,example); // Validate everything before any transmission.
  const results:any[]=[];const log=new CrudOperations('test_trips',token);
  for(let i=0;i<5;i++){
   const trip={...example,ritnummer:'TEST-'+randomUUID()};let startAccepted=false;
   for(const [position,status] of (['vertrek','aankomst'] as const).entries()){
    const sequence=i*2+position+1,message=rideMessage(status,company,driver,vehicle,trip);
    const record=await log.create({company_id:companyId,driver_id:driverId,vehicle_id:vehicleId,chiron_driver_id:driver.capacity_certificate_number,chiron_vehicle_id:vehicle.plate_number,ritnummer:trip.ritnummer+'-'+status,message_type:status,timestamp:new Date().toISOString(),test_sequence_number:sequence,sync_status:'pending'});
    if(status==='aankomst'&&!startAccepted){await log.update(record.id,{sync_status:'failed',error_message:'Start not accepted'});results.push({sequence,messageType:status,ritnummer:trip.ritnummer,success:false,error:'لم تُرسل رسالة الوصول لأن الانطلاق لم يُقبل'});continue;}
    try{const response=await this.sendChironMessage(companyId,message);await log.update(record.id,{sync_status:'success',http_status_code:response.httpStatus});startAccepted=true;results.push({sequence,messageType:status,ritnummer:trip.ritnummer,success:true,httpStatus:response.httpStatus});}
    catch(error){await log.update(record.id,{sync_status:error instanceof ChironError&&error.uncertain?'pending':'failed',error_message:error instanceof ChironError?error.code:'CHIRON_FAILED'});results.push({sequence,messageType:status,ritnummer:trip.ritnummer,success:false,error:error instanceof ChironError?error.message:'تعذّر إرسال الرسالة'});}
   }
  }
  const successCount=results.filter(r=>r.success).length;return {success:successCount===10,totalMessages:10,successCount,failedCount:10-successCount,results};
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
