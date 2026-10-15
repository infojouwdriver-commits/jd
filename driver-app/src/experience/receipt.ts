import {Directory,File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {driverApi} from '../api';
// Private app cache only. Never publish a receipt URL or include credentials in it.
const directory=()=>new Directory(Paths.cache,'jd-receipts');
export function clearReceiptCache(){try{const dir=directory();if(dir.exists)dir.delete();}catch{/* Cache cleanup must never touch the encrypted journal. */}}
let sharing=false;
export async function shareReceipt(owner:number,tripId:number){
 if(sharing)return;sharing=true;
 try{if(!await Sharing.isAvailableAsync())throw Error('Sharing unavailable');
 const bytes=await driverApi.invoice(owner,tripId);const dir=directory();dir.create({idempotent:true,intermediates:true});const file=new File(dir,`Receipt-${tripId}.pdf`);file.write(bytes);
 await Sharing.shareAsync(file.uri,{mimeType:'application/pdf',dialogTitle:'JOUW DRIVER · PDF',UTI:'com.adobe.pdf'});
 }finally{sharing=false;}
}
