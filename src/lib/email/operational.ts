import type {EmailDesign} from './renderer.ts';
import type {ContactSubmission} from '../public-contact.ts';
import {contactCopy} from '../public-contact.ts';
import {accountDeletionPage,approvalPath,type ApprovalTab} from '../approval-link.ts';

export function contactEmailDesign(submission:ContactSubmission):EmailDesign {
  const {language,topic,name,email,message}=submission;
  const t=contactCopy[language];
  const title={ar:'رسالة من صفحة التواصل',fr:'Message du formulaire de contact',nl:'Bericht via het contactformulier',en:'Message from the contact form'}[language];
  return {id:'public-contact',language,subject:`JOUW DRIVER — ${title} · ${t.topics[topic]}`,title,message,
    fields:[{label:t.name,value:name},{label:t.email,value:email,ltr:true},{label:t.topic,value:t.topics[topic]}]};
}

export interface ApprovalAlert {
  id:string;
  source:ApprovalTab;
  request_key:string;
  entity:'company'|'driver'|'vehicle'|'staff';
  operation:'create'|'update'|'deactivate'|'delete';
  company_name:string|null;
  submitted_at:string;
}

export function approvalEmailDesign(alert:ApprovalAlert):EmailDesign {
  const entity={company:'شركة',driver:'سائق',vehicle:'مركبة',staff:'عضو فريق'}[alert.entity];
  const operation={create:'إضافة',update:'تعديل بيانات',deactivate:'إيقاف',delete:'حذف'}[alert.operation];
  const kind=alert.source==='company-registration'?'تسجيل شركة جديدة':alert.source==='driver-registration'?'تسجيل سائق جديد':`${operation} ${entity}`;
  const time=new Intl.DateTimeFormat('ar-BE',{timeZone:'Europe/Brussels',dateStyle:'medium',timeStyle:'short'}).format(new Date(alert.submitted_at));
  const title='طلب جديد بانتظار الموافقة';
  return {id:'approval-alert',language:'ar',subject:`JOUW DRIVER — ${title} · ${kind}`,title,
    fields:[{label:'نوع الطلب',value:kind},...(alert.company_name?[{label:'الشركة',value:alert.company_name}]:[]),{label:'وقت الطلب',value:time}],
    action:{label:'مراجعة الطلب',url:'https://app.jouww.com'+approvalPath(alert.source,alert.request_key)}};
}

const deletedAccountCopy = {
  ar: ['اكتمل حذف حسابك', 'تم حذف حساب دخولك في JOUW DRIVER وإلغاء جلساتك. تُحفظ البيانات التي يلزم الاحتفاظ بها قانونياً فقط للمدة المقررة.'],
  fr: ['Votre compte a été supprimé', 'Votre compte JOUW DRIVER et ses sessions ont été supprimés. Les données soumises à une obligation légale de conservation restent conservées pendant la durée requise.'],
  nl: ['Uw account is verwijderd', 'Uw JOUW DRIVER-account en sessies zijn verwijderd. Gegevens met een wettelijke bewaarplicht blijven gedurende de vereiste termijn bewaard.'],
  en: ['Your account has been deleted', 'Your JOUW DRIVER account and sessions have been removed. Data subject to a legal retention obligation is kept for the required period.'],
} as const;

export function accountDeletionEmailDesign(request: string, completedLanguage?: keyof typeof deletedAccountCopy): EmailDesign {
  if (completedLanguage) {
    const [title, message] = deletedAccountCopy[completedLanguage];
    return { id: 'account-deletion-complete', language: completedLanguage, subject: `JOUW DRIVER — ${title}`, title, message };
  }
  const title = 'طلب حذف حساب جديد';
  return {
    id: 'account-deletion-review', language: 'ar', subject: `JOUW DRIVER — ${title}`, title,
    message: 'ورد طلب حذف حساب شخصي. موعد الحذف المتوقع وتفاصيل الطلب متاحان في لوحة الإدارة.',
    action: { label: 'مراجعة الطلب', url: 'https://app.jouww.com' + accountDeletionPage + '?' + new URLSearchParams({ request }) },
  };
}
