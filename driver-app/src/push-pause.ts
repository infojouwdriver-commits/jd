// Opt out locally first. Never acquire/request a token or enable registration.
export async function pausePushInstallation(store:{get:(key:string)=>Promise<string|null>;set:(key:string,value:string)=>Promise<void>},revoke:(id:string)=>Promise<unknown>){
 await store.set('jd-push-opt-in-v1','0');
 const id=await store.get('jd-push-installation-v1');
 if(id)await revoke(id);
}
