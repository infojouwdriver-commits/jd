import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let ts;try{ts=require('typescript');}catch{ts=require('../driver-app/node_modules/typescript');}
function endpoint(drivers,rows,calls=[]){
 const exports={};class Crud {constructor(table){this.table=table;}async findMany(filters,options){calls.push({table:this.table,filters,options});return this.table==='drivers'?drivers:rows;}}
 const imports={'@/lib/crud-operations':{default:Crud},'@/lib/auth':{generateAdminUserToken:async()=> 'synthetic'},'@/lib/create-response':{createSuccessResponse:data=>({status:200,data}),createErrorResponse:args=>({status:args.status})},'@/lib/api-utils':{requestMiddleware:fn=>fn,parseQueryParams:request=>request}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/app/next_api/drivers/trips/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:false}}).outputText,{exports,require:name=>imports[name],Number,Math,Error});return exports.GET;
}
test('native history keeps server owner filters even for administrator and hostile client IDs',async()=>{
 const calls=[];const row={id:7,user_id:2,driver_id:3,price:'2.50',distance_km:'1.2',duration_minutes:5,private_payload:'must-not-leak',company_id:9};
 const result=await endpoint([{id:3}],[row],calls)({limit:500,offset:0,driver_id:99,company_id:99},{payload:{sub:'2',isAdmin:true}});
 assert.equal(result.status,200);assert.deepEqual(JSON.parse(JSON.stringify(calls[1].filters)),{user_id:2,driver_id:3,status:'completed'});assert.equal(calls[1].options.limit,25);assert.equal(result.data.trips[0].price,2.5);assert.equal(result.data.trips[0].distance,1.2);assert.equal(result.data.trips[0].duration,5);assert.equal('private_payload' in result.data.trips[0],false);assert.equal(result.data.driver_id,3);
});
test('ambiguous profile and foreign returned trip fail closed without exposing any history',async()=>{
 const no=await endpoint([{id:3},{id:4}],[])({limit:25,offset:0},{payload:{sub:'2'}});assert.equal(no.status,403);
 for(const row of [{id:7,user_id:9,driver_id:3},{id:7,user_id:2,driver_id:9}]){const result=await endpoint([{id:3}],[row])({limit:25,offset:0},{payload:{sub:'2'}});assert.equal(result.status,500);assert.equal(result.data,undefined);}
});
test('history pagination is bounded and invalid authenticated identity performs no read',async()=>{
 const calls=[];const get=endpoint([{id:3}],[{id:7,user_id:2,driver_id:3,price:2}],calls);assert.equal((await get({limit:1,offset:4},{payload:{sub:'2'}})).data.next_offset,5);assert.equal((await get({limit:25,offset:0},{payload:{sub:'2'}})).data.next_offset,null);
 calls.length=0;assert.equal((await get({limit:25,offset:100001},{payload:{sub:'2'}})).status,400);assert.equal((await get({limit:25,offset:0},{payload:{sub:'2malicious'}})).status,400);assert.equal(calls.length,0);
});
