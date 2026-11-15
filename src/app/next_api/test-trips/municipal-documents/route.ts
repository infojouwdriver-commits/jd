import {z} from 'zod';
import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createErrorResponse,createSuccessResponse} from '@/lib/create-response';
import {municipalTestDocuments} from '@/lib/municipal-test-documents';
import {createPostgrestClient} from '@/lib/postgrest';
import {generateAdminUserToken} from '@/lib/auth';
import {sendTransactionalMail} from '@/lib/mail-service';

const command=z.object({
  companyId:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  batchId:z.string().uuid(),
  action:z.enum(['download','send','details']),
  expectedTo:z.string().email().max(254).optional(),
}).strict();

export const GET=requestMiddleware(async(request,context)=>{
  if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Admin access required'});
  const companyId=Number(request.nextUrl.searchParams.get('companyId'));
  if(!Number.isSafeInteger(companyId)||companyId<1)return createErrorResponse({status:400,errorMessage:'اختر شركة'});
  const db=createPostgrestClient(await generateAdminUserToken());
  const rows=await db.from('test_trips').select('ritnummer,timestamp').eq('company_id',companyId)
    .like('ritnummer','TEST-%').eq('sync_status','success').order('timestamp',{ascending:false}).limit(150);
  if(rows.error)return createErrorResponse({status:503,errorMessage:'تعذّر تحميل دفعات الاختبار'});
  const batches=new Map<string,{id:string;date:string;count:number}>();
  for(const row of rows.data??[]){
    const id=String(row.ritnummer).match(/^TEST-([a-f0-9-]{36})-[1-5]-(?:vertrek|aankomst)$/)?.[1];
    if(!id||!z.string().uuid().safeParse(id).success)continue;
    const previous=batches.get(id);
    batches.set(id,{id,date:row.timestamp,count:(previous?.count??0)+1});
  }
  return createSuccessResponse([...batches.values()].filter(batch=>batch.count===10));
},true);

export const POST=requestMiddleware(async(request,context)=>{
  if(!context.payload?.isAdmin)return createErrorResponse({status:403,errorMessage:'Admin access required'});
  const parsed=command.safeParse(await validateRequestBody(request));
  if(!parsed.success)return createErrorResponse({status:400,errorMessage:'اختر شركة ودفعة اختبار صالحة'});
  const {companyId,batchId,action,expectedTo}=parsed.data;
  const documents=await municipalTestDocuments(companyId,batchId);
  if(!documents)return createErrorResponse({status:409,errorMessage:'تتوفر الحزمة عند تأكيد قبول الرسائل العشر'});
  if(action==='details')return createSuccessResponse({to:documents.to});
  if(action==='download')return createSuccessResponse({
    to:documents.to,
    files:documents.attachments.map(({filename,content})=>({filename,base64:content.toString('base64')})),
  });
  if(!documents.to)return createErrorResponse({status:409,errorMessage:'بريد الشركة المسجل غير متوفر'});
  if(expectedTo!==documents.to)return createErrorResponse({status:409,errorMessage:'تغيّر البريد المسجل. حدّث بيانات الحزمة قبل الإرسال.'});
  const result=await sendTransactionalMail({
    to:documents.to,event:`municipal-test-documents:${companyId}:${batchId}`,purpose:'municipal_test_documents',attachments:documents.attachments,
    design:{id:'municipal-test-documents',language:'nl',subject:'JOUW DRIVER – Chiron-testdocumenten',title:'Chiron-testdocumenten',intro:'In de bijlagen vindt u het bewijs van de Chiron-testberichten en de voorbeelden van de dienststaat en het vervoerbewijs.',note:'De dienststaat en het vervoerbewijs zijn documenten uit de testomgeving.',filenames:documents.attachments.map(item=>item.filename)},
  });
  return createSuccessResponse({to:documents.to,...result});
},true);
