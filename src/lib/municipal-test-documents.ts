import type {jsPDF} from 'jspdf';
import {generateAdminUserToken} from './auth';
import {createPostgrestClient} from './postgrest';
import {acceptanceSummary,type AcceptanceReportData} from './chiron-test-result';
import {generateAcceptanceReportPdf} from './acceptance-report-pdf';
import {driverShiftPdf} from './driver-shift-pdf';
import type {ShiftDetail} from './driver-shifts';
import {generateVervoerbewijs} from '../legal/vervoerbewijs';

export async function municipalTestDocuments(companyId:number,batchId:string) {
  const db=createPostgrestClient(await generateAdminUserToken());
  const [company,registration,rows]=await Promise.all([
    db.from('companies').select('id,name,email,phone,address,vat_number,kbo_number').eq('id',companyId).is('archived_at',null).maybeSingle(),
    db.from('company_registrations').select('company_email').eq('company_id',companyId).eq('status','approved').limit(1).maybeSingle(),
    db.from('test_trips').select('driver_id,vehicle_id,timestamp,ritnummer,message_type,request_payload,sync_status,http_status_code,start_address,end_address,start_time,end_time,start_lat,start_lon,end_lat,end_lon,distance_km,price').eq('company_id',companyId).like('ritnummer','TEST-'+batchId+'-%').order('test_sequence_number').limit(11),
  ]);
  if(company.error||registration.error||rows.error)throw Error('Municipal documents could not be loaded');
  if(!company.data||rows.data?.length!==10)return null;
  const first=rows.data[0],start=first.request_payload?.rit;
  if(!start?.taxibedrijf?.aanbieder||rows.data.some(row=>row.driver_id!==first.driver_id||row.vehicle_id!==first.vehicle_id||row.timestamp!==first.timestamp))return null;
  const [driver,vehicle]=await Promise.all([
    db.from('drivers').select('id,full_name,phone').eq('id',first.driver_id).eq('company_id',companyId).maybeSingle(),
    db.from('vehicles').select('id,brand,model,chiron_vehicle_id').eq('id',first.vehicle_id).eq('company_id',companyId).maybeSingle(),
  ]);
  if(driver.error||vehicle.error)throw Error('Municipal documents could not be loaded');
  if(!driver.data||!vehicle.data)return null;
  const results=rows.data.map(row=>({
    ritnummer:row.request_payload?.ritnummer,messageType:row.message_type,
    success:row.sync_status==='success',httpStatus:row.http_status_code,
    startAddress:row.start_address,endAddress:row.end_address,startTime:row.start_time,endTime:row.end_time,
    startLat:Number(row.start_lat),startLon:Number(row.start_lon),endLat:Number(row.end_lat),endLon:Number(row.end_lon),
    distanceKm:Number(row.distance_km),price:Number(row.price),
  }));
  const report:AcceptanceReportData={
    company:{...company.data,name:start.taxibedrijf.aanbieder.naam,kbo_number:start.taxibedrijf.aanbieder.registratie},
    driver:{...driver.data,capacity_certificate_number:start.uitvoerder.bestuurderspasnummer},
    vehicle:{...vehicle.data,plate_number:start.voertuig.nummerplaat},
    testDate:first.timestamp,totalMessages:10,successCount:results.filter(row=>row.success).length,failedCount:results.filter(row=>!row.success).length,results,
  };
  if(!acceptanceSummary(report).complete)return null;
  const departures=results.filter(row=>row.messageType==='vertrek');
  const ride=departures[0],last=departures.at(-1)!;
  const distance=departures.reduce((total,row)=>total+row.distanceKm,0);
  const price=departures.reduce((total,row)=>total+row.price,0);
  const time=(date:string,minutes:number)=>new Date(Date.parse(date)+minutes*60000).toISOString();
  const begin=time(ride.startTime,-5),end=time(last.endTime,5),odometer=10000;
  const shift:ShiftDetail={
    shift:{id:batchId,company_id:companyId,driver_id:driver.data.id,vehicle_id:vehicle.data.id,driver_name:driver.data.full_name,company_name:report.company.name,plate_number:report.vehicle.plate_number,
      document_profile:{company_address:report.company.address,company_phone:report.company.phone,company_email:report.company.email,company_vat:report.company.vat_number,company_kbo:report.company.kbo_number,driver_card:report.driver.capacity_certificate_number,vehicle_code:vehicle.data.chiron_vehicle_id},
      started_at:begin,ended_at:end,start_odometer:odometer,odometer:odometer+distance,passenger_km:distance,work_status:'available',version:2},
    events:[
      {version:1,action:'start',recorded_at:begin,odometer,passenger_km:0,work_status:'available'},
      {version:2,action:'end',recorded_at:end,odometer:odometer+distance,passenger_km:distance,work_status:'available'},
    ],
    activity:departures.flatMap((row,index)=>[
      {id:row.ritnummer+'-start',kind:'trip_start',recorded_at:row.startTime,occurred_at:row.startTime,work_status:'with_passenger',trip_id:index+1,source:'CHIRON TEST'},
      {id:row.ritnummer+'-end',kind:'trip_end',recorded_at:row.endTime,occurred_at:row.endTime,work_status:'available',trip_id:index+1,source:'CHIRON TEST'},
    ]),
    summary:{trip_count:5,activity_count:10,payments:[{currency:'EUR',cash:0,card:0,other:0,unknown:price,total:price,missing_amounts:0}]},
  };
  const receipt=generateVervoerbewijs({
    company:report.company,driver:report.driver,
    vehicle:{brand:report.vehicle.brand??'',model:report.vehicle.model??'',plate_number:report.vehicle.plate_number,chiron_vehicle_id:vehicle.data.chiron_vehicle_id},
    trip:{ritnummer:ride.ritnummer,trip_uuid:batchId,start_time:ride.startTime,end_time:ride.endTime,start_address:ride.startAddress,end_address:ride.endAddress,start_lat:ride.startLat,start_lon:ride.startLon,end_lat:ride.endLat,end_lon:ride.endLon,distance_km:ride.distanceKm,duration_minutes:(Date.parse(ride.endTime)-Date.parse(ride.startTime))/60000,price:ride.price,currency:'EUR'},
    chiron:{sync_state:'completed'},sample:true,document_number:'TEST-'+batchId.slice(0,8).toUpperCase(),document_date:ride.endTime,
  });
  const pdf=(filename:string,document:jsPDF)=>({filename,content:Buffer.from(document.output('arraybuffer'))});
  return {
    to:registration.data?.company_email??company.data.email,
    attachments:[
      pdf('CHIRON-TESTRITTEN.pdf',generateAcceptanceReportPdf(report)),
      pdf('DIENSTSTAAT-TEST.pdf',driverShiftPdf(shift,true)),
      pdf('VERVOERBEWIJS-TEST.pdf',receipt),
    ],
  };
}
