import {Share} from 'react-native';
import {Directory,File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {driverApi,ApiError} from '../api';
// Share a stable receipt capability, never an authenticated session or blob URL.
// Legacy receipts without snapshots retain the existing private PDF fallback.
const directory=()=>new Directory(Paths.cache,'jd-receipts');
export function clearReceiptCache(){try{const dir=directory();if(dir.exists)dir.delete();}catch{/* Cache cleanup must never touch the encrypted journal. */}}
let sharing=false;
export async function shareReceipt(owner:number,tripId:number){
 if(sharing)return;sharing=true;
 try{
 try{const document=await driverApi.invoiceLink(owner,tripId);await Share.share({message:document.url,url:document.url,title:document.reference});return;}catch(error){if(!(error instanceof ApiError)||error.status!==409)throw error;}
 if(!await Sharing.isAvailableAsync())throw Error('Sharing unavailable');
 const bytes=await driverApi.invoice(owner,tripId);const dir=directory();dir.create({idempotent:true,intermediates:true});const file=new File(dir,`Receipt-${tripId}.pdf`);file.write(bytes);
 await Sharing.shareAsync(file.uri,{mimeType:'application/pdf',dialogTitle:'JOUW DRIVER · PDF',UTI:'com.adobe.pdf'});
 }finally{sharing=false;}
}

export async function shareShiftReport(owner:number,id:string){
 if(sharing)return;sharing=true;
 try{if(!await Sharing.isAvailableAsync())throw Error('Sharing unavailable');const bytes=await driverApi.shiftPdf(owner,id);const dir=directory();dir.create({idempotent:true,intermediates:true});const file=new File(dir,`Dienststaat-${id}.pdf`);file.write(bytes);await Sharing.shareAsync(file.uri,{mimeType:'application/pdf',dialogTitle:'JOUW DRIVER · Dienststaat',UTI:'com.adobe.pdf'});}finally{sharing=false;}
}
