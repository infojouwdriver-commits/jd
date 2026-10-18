import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {memberEndpoint} from '../src/lib/security-policy.ts';
const require=createRequire(import.meta.url);
function load(file,mocks,env={}) {
 const output=ts.transpileModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};vm.runInNewContext(output,{exports,Buffer,Response,URL,console,process:{env},require:name=>mocks[name]||require(name)});return exports;
}
const jsonResponse={createSuccessResponse:data=>Response.json({success:true,data}),createErrorResponse:({status,errorMessage})=>Response.json({success:false,errorMessage},{status})};
test('driver allowlist grants only composing messages and viewing/replying; administration writes remain blocked',()=>{
 for(const method of ['GET','PUT','DELETE']) assert.equal(memberEndpoint('/next_api/messages',method,'driver'),false);
 assert.equal(memberEndpoint('/next_api/messages','POST','driver'),true);
 for(const method of ['GET','POST']) assert.equal(memberEndpoint('/next_api/messages/replies',method,'driver'),true);
 assert.equal(memberEndpoint('/next_api/messages/replies','DELETE','driver'),false);
 assert.equal(memberEndpoint('/next_api/auth/account','POST','manager'),true);
});
test('message creation strips caller sender/locking fields, validates text and invokes one server RPC',async()=>{
 const calls=[];
 const helper=load('../src/lib/message-access.ts',{'./crud-operations':{default:class{}},'./postgrest':{createPostgrestClient:()=>({rpc:async(name,args)=>{calls.push({name,args});return {data:{id:1}};}})}});
 await helper.writeMessage('token','7',false,{subject:' Help ',message_body:' Body ',sender_type:'admin',is_locked:true});
 assert.equal(calls[0].name,'security_write_message');assert.equal(calls[0].args.p_is_admin,false);assert.equal(calls[0].args.p_message.sender_type,undefined);assert.equal(calls[0].args.p_message.is_locked,undefined);
 assert.equal(calls[0].args.p_message.subject,'Help');
 await assert.rejects(helper.writeMessage('token','7',false,{subject:' ',message_body:'Body'}),error=>error.status===400);
 assert.equal(calls.length,1);
});
test('broadcast recipient cannot read another driver reply, and deleting a recipient removes access',async()=>{
 const messages={1:{id:1,sender_user_id:99},2:{id:2,sender_user_id:8},3:{id:3,sender_user_id:99}};
 class Crud {constructor(table){this.table=table;}async findById(id){return messages[id];}async findMany({message_id,recipient_user_id}){return message_id===1?[{recipient_user_id,is_deleted:null}]:message_id===3?[{recipient_user_id,is_deleted:true}]:[];}}
 const helper=load('../src/lib/message-access.ts',{'./crud-operations':{default:Crud},'./postgrest':{}});
 assert.equal((await helper.accessibleMessage('token',1,'7',false)).id,1);
 for(const id of [2,3])await assert.rejects(helper.accessibleMessage('token',id,'7',false),error=>error.status===404);
 assert.equal((await helper.accessibleMessage('token',2,'8',false)).id,2);
});
test('trip listing defaults admin to live snapshots across tenants, selected tenant when requested, and authenticated driver ownership otherwise',async()=>{
 const queries=[];
 class Crud {constructor(table){this.table=table;}async findMany(filter){if(this.table==='trips')queries.push(filter);return [];}}
 const route=load('../src/app/next_api/trips/route.ts',{
 '@/lib/crud-operations':{default:Crud},'@/lib/create-response':jsonResponse,
 '@/lib/api-utils':{requestMiddleware:handler=>handler,parseQueryParams:request=>({limit:50,offset:0,company_id:request.company})},
 '@/lib/auth':{generateAdminUserToken:async()=>''},
 });
 assert.equal((await route.GET({nextUrl:new URL('https://app.example/next_api/trips')}, {payload:{sub:'1',isAdmin:true}})).status,200);assert.equal(queries[0].is_test,false);
 await route.GET({company:'9',nextUrl:new URL('https://app.example/next_api/trips')},{payload:{sub:'1',isAdmin:true}});assert.equal(queries[1].company_id,9);
 await route.GET({company:'9',nextUrl:new URL('https://app.example/next_api/trips')},{payload:{sub:'7',isAdmin:false}});assert.equal(queries[2].user_id,'7');assert.equal(queries[2].company_id,undefined);
 assert.equal((await route.GET({company:'bad',nextUrl:new URL('https://app.example/next_api/trips')},{payload:{sub:'1',isAdmin:true}})).status,400);
});
test('company identity uses normalized email and canonical user password; invalid credentials never call storage',async()=>{
 const calls=[];
 const helper=load('../src/lib/company-account.ts',{'./crud-operations':{default:class{}},'./server-utils':{hashString:async value=>'hashed:'+value},'./auth':{getAuthRoles:()=>({userRole:'browser'})},'./postgrest':{createPostgrestClient:()=>({rpc:async(name,args)=>{calls.push({name,args});return {data:{id:1}};}})}});
 await helper.saveCompanyAccount('token',null,{email:' Owner@Example.invalid '},'valid-password-123');
 assert.equal(calls[0].args.p_account.email,'owner@example.invalid');assert.equal(calls[0].args.p_account.password,'hashed:valid-password-123');
 for(const [email,password]of [['invalid','valid-password-123'],['valid@example.invalid','short'],['valid@example.invalid','界'.repeat(25)]])await assert.rejects(helper.saveCompanyAccount('token',null,{email},password),error=>error.status===400);
 assert.equal(calls.length,1);
});
test('administrator company reset preserves a self-updated login email separately from the company contact address',async()=>{
 const calls=[];
 class Crud {constructor(table){this.table=table;}async findMany(){return [{user_id:8}];}async findById(){return {email:'updated-login@example.invalid'};}}
 const helper=load('../src/lib/company-account.ts',{'./crud-operations':{default:Crud},'./server-utils':{hashString:async()=> 'hashed'},'./auth':{getAuthRoles:()=>({userRole:'browser'})},'./postgrest':{createPostgrestClient:()=>({rpc:async(name,args)=>{calls.push(args);return {data:{id:1}};}})}});
 await helper.saveCompanyAccount('token',1,{email:'contact@example.invalid'},'valid-password-123');
 assert.equal(calls[0].p_account.email,'updated-login@example.invalid');assert.equal(calls[0].p_company.email,'contact@example.invalid');
});
test('self password changes require current credentials and ignore caller user IDs',async()=>{
 const calls=[];
 const route=load('../src/app/next_api/auth/account/route.ts',{
 '@/lib/api-utils':{requestMiddleware:handler=>handler,validateRequestBody:async request=>request.body},
 '@/lib/auth':{authCrudOperations:async()=>({usersCrud:{findById:async id=>({id,password:'existing-hash',email:'owner@example.invalid'})}}),generateAdminUserToken:async()=>''},
 '@/lib/create-response':jsonResponse,
 '@/lib/server-utils':{verifyHashString:async plain=>plain==='current-password',hashString:async()=> 'new-hash'},
 '@/lib/rate-limit':{consumeRateLimit:async()=>null},
 '@/lib/postgrest':{createPostgrestClient:()=>({rpc:async(name,args)=>{calls.push({name,args});return {data:{id:7}};}})},
 });
 const context={payload:{sub:'7'}};
 const body={action:'update_password',current_password:'current-password',password:'new-password-123'};
 assert.equal((await route.POST({body:{...body,user_id:99}},context)).status,400);
 assert.equal((await route.POST({body:{...body,current_password:'wrong'}},context)).status,403);
 assert.equal(calls.length,0);
 assert.equal((await route.POST({body},context)).status,200);assert.equal(calls[0].args.p_user_id,7);assert.equal(calls[0].args.p_expected_hash,'existing-hash');
 assert.equal((await route.POST({body:{action:'request_email_code',current_password:'current-password',email:'new@example.invalid'}},context)).status,409);
});
test('verification email never claims delivery without a configured provider or after a provider rejection',async()=>{
 const source=fs.readFileSync(new URL('../src/lib/api-utils.ts',import.meta.url),'utf8');
 const snippet=source.slice(source.indexOf('export async function sendVerificationEmail'),source.indexOf('function shouldUseSecureCookies'));
 const output=ts.transpileModule(snippet,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const run=async(result)=>{const exports={};let message;vm.runInNewContext(output,{exports,sendTransactionalMail:async(value)=>{message=value;return result;}});return {sent:await exports.sendVerificationEmail('recipient@example.invalid','123456'),message};};
 assert.equal((await run({accepted:false,status:'not_configured'})).sent,false);
 assert.equal((await run({accepted:false,status:'failed'})).sent,false);
 const accepted=await run({accepted:true,status:'accepted'});assert.equal(accepted.sent,true);assert.equal(accepted.message.purpose,'verification');assert.match(accepted.message.text,/123456/);assert.equal(accepted.message.event,'verification:recipient@example.invalid:123456');
});
