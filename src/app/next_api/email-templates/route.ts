import {createHash} from 'node:crypto';
import {jsPDF} from 'jspdf';
import {authCrudOperations,generateAdminUserToken} from '@/lib/auth';
import {createPostgrestClient} from '@/lib/postgrest';
import {requestMiddleware,validateRequestBody} from '@/lib/api-utils';
import {createErrorResponse,createSuccessResponse} from '@/lib/create-response';
import {operationFailure} from '@/lib/operations-access';
import {consumeRateLimit} from '@/lib/rate-limit';
import {sendTransactionalMail} from '@/lib/mail-service';
import {emailEdits,readEmailSettings} from '@/lib/email/settings';
import {emailDesignVersion,saveEmailSettingsSchema,sendEmailSampleSchema,testRecipientAllowed} from '@/lib/email/settings-model';
import {emailLanguages,renderEmail,templateIds} from '@/lib/email/renderer';
import {emailSampleDesign} from '@/lib/email/samples';

const forbidden = () => createErrorResponse({status:403,errorMessage:'Platform administrator required'});
const invalid = () => createErrorResponse({status:400,errorMessage:'Check the template and language'});
const serviceClient = async () => createPostgrestClient(await generateAdminUserToken());

export const GET = requestMiddleware(async (request,context) => {
  if (!context.payload?.isAdmin) return forbidden();
  const rawLanguage=request.nextUrl.searchParams.get('language');
  const language=emailLanguages.find(item => item===rawLanguage);
  if (!language) return invalid();
  try {
    const state=await readEmailSettings(await serviceClient(),language);
    const templates=templateIds.map(id => {
      const design=emailSampleDesign(id,language);
      const edits=emailEdits(design,state.settings);
      const preview=renderEmail(design,edits,{sample:true,logo:'local'});
      const source=renderEmail(design,edits,{sample:true});
      return {id,title:design.title,subject:source.subject,html:source.html,preview:preview.html,text:source.text,previewOnly:id==='driver-report'};
    });
    return createSuccessResponse({...state, templates, designVersion:emailDesignVersion});
  } catch(error) {return operationFailure(error);}
});

export const PUT = requestMiddleware(async (request,context) => {
  if (!context.payload?.isAdmin) return forbidden();
  try {
    const parsed=saveEmailSettingsSchema.safeParse(await validateRequestBody(request));
    if (!parsed.success) return invalid();
    const {language,version,settings}=parsed.data;
    const saved=await (await serviceClient()).rpc('security_save_email_templates',{
      p_actor:Number(context.payload.sub),p_language:language,p_expected:version,p_settings:settings,
    });
    return saved.error ? operationFailure(saved.error) : createSuccessResponse(saved.data);
  } catch(error) {return operationFailure(error);}
});

export const POST = requestMiddleware(async (request,context) => {
  if (!context.payload?.isAdmin) return forbidden();
  try {
    const parsed=sendEmailSampleSchema.safeParse(await validateRequestBody(request));
    if (!parsed.success) return invalid();
    const {id,language,to,requestId}=parsed.data;
    const {usersCrud}=await authCrudOperations();
    const admin=await usersCrud.findById(context.payload.sub);
    if (!testRecipientAllowed(to,admin?.email||'',process.env.MAIL_TEMPLATE_TEST_RECIPIENTS)) {
      return createErrorResponse({status:403,errorMessage:'Use your administrator address or an approved test address'});
    }
    const limited=await consumeRateLimit('email-template-test:'+context.payload.sub,3);
    if(limited) return limited;
    const design=emailSampleDesign(id,language);
    const attachments=design.filenames?.map(filename => {
      const pdf=new jsPDF();
      pdf.setFontSize(24);
      pdf.setTextColor(16,29,52);
      pdf.text('JOUW DRIVER',20,27);
      pdf.setFontSize(14);
      pdf.text(['DEMO / TEST',filename,'Fictitious data. No fiscal value.'],20,50);
      return {filename,content:Buffer.from(pdf.output('arraybuffer'))};
    });
    // A retry for the same administrator/request/recipient resolves to the same delivery.
    const identity=createHash('sha256').update(to).digest('hex');
    return createSuccessResponse(await sendTransactionalMail({
      to,design,attachments,purpose:'template_test',sample:true,event:`template-test:${context.payload.sub}:${requestId}:${identity}`,
    }));
  } catch(error) {return operationFailure(error);}
});
