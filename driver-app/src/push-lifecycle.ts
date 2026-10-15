// Logout must wait for token registration before revoking the installation.
let stopper:(()=>Promise<void>)|null=null;
export function registerPushStopper(stop:()=>Promise<void>){stopper=stop;return()=>{if(stopper===stop)stopper=null;};}
export async function stopPushRuntime(){await stopper?.();}
export function pushDestination(data:Record<string,unknown>):'/messages'|'/notifications'|null{
 if(typeof data.job_id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.job_id))return null;
 return data.screen==='messages'?'/messages':data.screen==='notifications'?'/notifications':null;
}
export function serialPushRegistration(){let active=true,stopping=false,generation=0,tail:Promise<void>=Promise.resolve();return {
 run(work:(current:()=>boolean)=>Promise<void>){const epoch=generation;tail=tail.catch(()=>{}).then(async()=>{if(active&&epoch===generation)await work(()=>active&&epoch===generation);});return tail;},
 async stop(revoke:()=>Promise<void>){active=false;stopping=true;generation++;try{await tail.catch(()=>{});await revoke();}finally{stopping=false;}},
 resume(){if(!stopping)active=true;},
 dispose(){active=false;generation++;}
};}
