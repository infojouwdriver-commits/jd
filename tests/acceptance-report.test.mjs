import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {jsPDF} from 'jspdf';
import * as model from '../src/lib/chiron-test-result.ts';
const fixture=()=>({company:{id:1,name:'Demo Taxi NV',kbo_number:'0000000000',vat_number:'BE0000000000',address:'Demostraat 1, 1000 Brussel',email:'demo@example.invalid',phone:'+32 000 00 00 00'},driver:{id:1,full_name:'Demo Chauffeur',capacity_certificate_number:'DEMO-PAS',phone:'Niet geregistreerd'},vehicle:{id:1,brand:'Demo',model:'Voertuig',plate_number:'DEMO-001'},testDate:'2026-10-15T20:00:00Z',totalMessages:10,successCount:10,failedCount:0,results:Array.from({length:5},(_,i)=>['vertrek','aankomst'].map(messageType=>({ritnummer:`TEST-DEMO-${i+1}`,messageType,success:true,httpStatus:200,startAddress:`Demostraat ${i+1}, 1000 Brussel, België`,endAddress:`Stationsstraat ${i+2}, 1930 Zaventem, België`,startTime:'2026-10-15T18:00:00Z',endTime:'2026-10-15T18:10:00Z',startLat:50.85,startLon:4.35,endLat:50.86,endLon:4.36}))).flat()});
function compile(path,imports){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Date,Intl,Number,Map,Set,Error,console,require:name=>{if(!(name in imports))throw Error(name);return imports[name];}});return exports;}
let rendered=[];
class CapturedPDF extends jsPDF {constructor(...args){super(...args);const text=this.text;this.text=(...a)=>{rendered.push({text:a[0],x:a[1],y:a[2]});return text.apply(this,a);};}}
const fonts=compile('../src/legal/pdf-fonts.ts',{});
const {generateAcceptanceReportPdf}=compile('../src/lib/acceptance-report-pdf.ts',{'jspdf':{jsPDF:CapturedPDF},'../legal/pdf-fonts':fonts,'./chiron-test-result':model});

test('ten actual event results form five rides with original addresses, times and coordinates',()=>{
 const data=fixture(),before=JSON.stringify(data),s=model.acceptanceSummary(data);assert.equal(s.complete,true);assert.equal(s.trips.length,5);assert.equal(s.total,10);assert.equal(s.accepted,10);
 rendered=[];const doc=generateAcceptanceReportPdf(data),lines=rendered.flatMap(r=>r.text);assert.equal(lines.filter(v=>/^Rit [1-5]$/.test(v)).length,5);assert.ok(lines.some(v=>v.includes('Demostraat 1, 1000 Brussel')));assert.ok(lines.some(v=>v.includes('50.850000, 4.350000')));assert.ok(lines.some(v=>v.includes('15/10/2026')&&v.includes('22:00:00')));assert.ok(lines.some(v=>v.includes('gemeentelijke goedkeuring')));assert.equal(doc.getNumberOfPages(),3);assert.equal(JSON.stringify(data),before);
 if(process.env.JD_REPORT_PREVIEW){fs.mkdirSync(process.env.JD_REPORT_PREVIEW,{recursive:true});doc.save(process.env.JD_REPORT_PREVIEW+'/acceptance-report-demo.pdf');}
});
test('missing, duplicate, conflicting or uncertain events never become a completed acceptance dossier',()=>{
 for(const mutate of [d=>d.results.pop(),d=>d.results.push({...d.results[0]}),d=>d.results[1].startAddress='Conflicting address',d=>d.results[1].deliveryState='uncertain',d=>d.results[1].success=false,d=>d.totalMessages=0,d=>delete d.results[1].httpStatus,d=>d.results[1].httpStatus=400]){const d=fixture();mutate(d);assert.equal(model.acceptanceSummary(d).complete,false);}
 const historical=fixture();historical.results=[{ritnummer:'LEGACY',status:'success',vertrek:true,aankomst:false}];assert.equal(model.acceptanceSummary(historical).accepted,0);assert.equal(model.acceptanceSummary(historical).complete,false);
});
test('missing historical metadata stays explicitly missing and long fields paginate without clipping',()=>{
 const d=fixture();d.results=d.results.map(({startAddress,endAddress,startTime,endTime,startLat,startLon,endLat,endLon,...row})=>row);rendered=[];generateAcceptanceReportPdf(d);assert.ok(rendered.flatMap(r=>r.text).filter(v=>v.includes('Niet geregistreerd')).length>=20);
 const long=fixture();long.company.address='Demonstratieadres '.repeat(90);for(const row of long.results)row.endAddress='Een bijzonder lang testadres '.repeat(60);rendered=[];const doc=generateAcceptanceReportPdf(long);assert.ok(doc.getNumberOfPages()>3);assert.ok(rendered.every(r=>r.y<=287));
 if(process.env.JD_REPORT_PREVIEW)doc.save(process.env.JD_REPORT_PREVIEW+'/acceptance-report-long-demo.pdf');
});
test('Brussels test timestamps do not depend on the browser/server timezone or PDF generation date',()=>{
 const original=process.env.TZ;try{for(const zone of ['UTC','America/Los_Angeles','Asia/Tokyo']){process.env.TZ=zone;rendered=[];generateAcceptanceReportPdf(fixture());const lines=rendered.flatMap(r=>r.text);assert.ok(lines.some(v=>v.includes('15/10/2026')&&v.includes('22:00:00')));assert.ok(lines.some(v=>v.includes('20:10:00')));}}finally{if(original===undefined)delete process.env.TZ;else process.env.TZ=original;}
});
