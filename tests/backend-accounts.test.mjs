import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
function load(file, mocks) {
 const source=fs.readFileSync(new URL(file,import.meta.url),'utf8');
 const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};vm.runInNewContext(output,{exports,Buffer,Response,console,process,require:name=>mocks[name] || require(name)});return exports;
}
const calls=[];
const accounts=load('../src/lib/driver-account.ts',{
 './server-utils':{hashString:async value=>`hash:${value}`},
 './auth':{getAuthRoles:()=>({userRole:'test_user'})},
 './postgrest':{createPostgrestClient:()=>({rpc:async (name,args)=>{calls.push({name,args});return {data:{driver:{id:1}}};}})},
});
test('driver validation rejects short/multibyte overlong passwords and mass assignment',()=>{
 for(const body of [{password:'short'},{password:'界'.repeat(25)},{user_id:2},{company_id:3},{full_name:' '}]) assert.throws(()=>accounts.parseDriverFields(body));
 assert.equal(accounts.parseDriverFields({password:'界'.repeat(20)}).password.length,20);
});
test('driver phone creation normalizes punctuation and international prefix',()=>{
 assert.equal(accounts.parseDriverFields({full_name:' Driver ',phone:'0032 (471) 22-33-44',password:'long-password-123'},true).phone,'+32471223344');
 assert.throws(()=>accounts.parseDriverFields({phone:'123'},true));
});
test('account create/update/deactivate use single RPC and omit plain password',async()=>{
 calls.length=0;
 await accounts.mutateDriverAccount('token','create',{companyId:4,fields:accounts.parseDriverFields({full_name:'Driver',phone:'+32471223344',password:'long-password-123'},true)});
 await accounts.mutateDriverAccount('token','update',{id:'1',fields:accounts.parseDriverFields({phone:'+32471998877',password:'changed-password-123'})});
 await accounts.mutateDriverAccount('token','deactivate',{id:'1'});
 assert.deepEqual(calls.map(c=>c.name),['security_create_driver_account','security_update_driver_account','security_deactivate_driver_account']);
 assert.equal(calls[0].args.p_account.role,'test_user');
 assert.equal(calls[1].args.p_account.email,'+32471998877@driver.local');
 assert.equal(calls[1].args.p_account.password,'hash:changed-password-123');
 assert.equal(calls[1].args.p_driver.password,undefined);
 assert.equal(calls[2].args.p_driver_id,1);
});
test('stale legacy password cannot authenticate driver after canonical reset',async()=>{
 class Crud {
  constructor(table){this.table=table;}
  async findMany(){return this.table==='drivers' ? [] : this.table==='users' ? [] : [{id:8,driver_id:1,password_hash:'$2legacy',is_active:true}];}
  async findById(){return this.table==='drivers' ? {id:1,user_id:4,status:'active'} : {id:4,email:'driver@example.test',password:'$2new'};}
 }
 const route=load('../src/app/next_api/auth/driver-login/route.ts',{
 '@/lib/security-policy':{isPlatformAdmin:()=>false},
 '@/lib/api-utils':{requestMiddleware:handler=>handler,validateRequestBody:async()=>({phone:'+32471223344',password:'old-password'}),getRequestIp:()=>''},
 '@/lib/create-response':{createErrorResponse:({status})=>new Response(null,{status}),createAuthResponse:()=>new Response(null,{status:200})},
 '@/lib/auth':{getAuthRoles:()=>({userRole:'test_user'}),generateAdminUserToken:async()=>'',authCrudOperations:async()=>{throw Error('Must not create session');}},
 '@/lib/server-utils':{verifyHashString:async(_plain,hash)=>hash==='$2legacy'},
 '@/lib/crud-operations':{default:Crud}, '@/constants/auth':{REFRESH_TOKEN_EXPIRE_TIME:3600},
 });
 const result=await route.POST({headers:new Headers()});assert.equal(result.status,401);
});
