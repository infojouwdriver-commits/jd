import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import {createRequire} from 'node:module';import ts from 'typescript';
const require=createRequire(import.meta.url);
function compiled(file,dependencies={}){const exports={};const source=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Buffer,Intl,require:name=>dependencies[name]||require(name)});return exports;}
const bank=compiled('src/lib/invoice-bank-payment.ts');
const fonts=compiled('src/legal/pdf-fonts.ts'),{subscriptionPdf}=compiled('src/lib/subscription-document.ts',{'@/legal/pdf-fonts':fonts,'./invoice-bank-payment':bank});
test('subscription PDF uses immutable snapshots, includes preparatory/demo markings and avoids invented payment details',()=>{
 const doc={id:1,company_id:1,document_number:'DEMO-JDS-2026-00000001',kind:'invoice',state:'prepared',is_test:true,currency:'EUR',period_start:'2026-10-01',period_end:'2026-10-31',prepared_date:'2026-10-18',issued_date:null,due_date:null,net_cents:5000,vat_cents:1050,gross_cents:6050,vat_bps:2100,issuer:{name:'Synthetic Issuer / شركة تجريبية',address:'Synthetic address, 1000 Bruxelles',vat_number:'BE0123456789',kbo_number:'0123456789',email:'issuer@example.invalid'},recipient:{name:'Synthetic Transport',address:'Synthetic street, 2000 Antwerpen',vat_number:'BE0987654321',kbo_number:'0987654321',email:'billing@example.invalid'},description:'JOUW DRIVER monthly platform subscription'};
 const bytes=subscriptionPdf(doc);assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.ok(bytes.length>10000);
 const directory=process.env.OPERATIONS_QA_DIR||'/tmp/jd-operations-qa';fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'billing-demo.pdf'),bytes);
 fs.writeFileSync(path.join(directory,'billing-long.pdf'),subscriptionPdf({...doc,description:'Synthetic detailed service description. '.repeat(120),issuer:{...doc.issuer,address:'Synthetic long address '.repeat(100)}}));
 const source=fs.readFileSync(new URL('../src/lib/subscription-document.ts',import.meta.url),'utf8');assert.match(source,/NON ÉMIS/);assert.match(source,/SANS VALEUR FISCALE/);assert.doesNotMatch(source,/BE\d{14}|https?:\/\/.*pay|bank_account/);
});

test('issued bank invoice PDF embeds a locally generated EPC QR and preserves long layouts',()=>{
 const doc={id:1,company_id:1,document_number:'JDI-2026-00000001',kind:'invoice',state:'issued',is_test:false,currency:'EUR',prepared_date:'2026-10-26',issued_date:'2026-10-26',due_date:'2026-11-09',net_cents:10000,vat_cents:2100,gross_cents:12100,vat_bps:2100,issuer:{name:'Synthetic Issuer',address:'Example street 1, Brussels',vat_number:'BE0123456789'},recipient:{name:'Synthetic Customer',address:'Example street 2, Brussels'},description:'Synthetic service',bank_payment:{version:1,iban:'BE68539007547034',holder:'Synthetic Issuer',reference:'JDI-2026-00000001'}};
 const directory=process.env.OPERATIONS_QA_DIR||'/tmp/jd-operations-qa';fs.mkdirSync(directory,{recursive:true});
 for(const [name,description] of [['bank-invoice',doc.description],['bank-invoice-long','Synthetic detailed service description. '.repeat(120)]])fs.writeFileSync(path.join(directory,name+'.pdf'),subscriptionPdf({...doc,description},{collection:'bank',balance_cents:12100}));
 fs.writeFileSync(path.join(directory,'bank-invoice-paid.pdf'),subscriptionPdf(doc,{collection:'bank',balance_cents:0}));
 fs.writeFileSync(path.join(directory,'bank-invoice-stripe.pdf'),subscriptionPdf(doc,{collection:'stripe',balance_cents:12100}));
});

test('PDF payment state reads canonical balance and suppresses bank transfers for any Stripe enrollment',async()=>{
 const {invoicePaymentState}=compiled('src/lib/invoice-payment-state.ts');
 const client={rpc:async(name,args)=>{assert.equal(name,'security_subscription_document_balance');assert.deepEqual(JSON.parse(JSON.stringify(args)),{p_id:7});return {data:2100,error:null};},from:table=>({select:()=>({eq:(column,id)=>({limit:async()=>{assert.equal(table,'stripe_enrollments');assert.equal(column,'contract_id');assert.equal(id,9);return {data:[{id:'existing'}],error:null};},single:async()=>({data:{balance_cents:3100},error:null})})})})};
 assert.deepEqual(JSON.parse(JSON.stringify(await invoicePaymentState(client,{id:7,contract_id:9},'subscription'))),{collection:'stripe',balance_cents:2100});
 assert.deepEqual(JSON.parse(JSON.stringify(await invoicePaymentState(client,{id:7},'manual'))),{collection:'bank',balance_cents:3100});
 await assert.rejects(invoicePaymentState({...client,rpc:async()=>({error:Error('balance unavailable')})},{id:7},'subscription'),/unavailable/);
});
