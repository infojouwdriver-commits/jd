import {z} from 'zod';
import {emailLanguages} from './email/renderer.ts';

export const supportEmail = 'jouw2023@gmail.com';
export const supportPhone = '+32465555596';
export const supportPhoneLabel = '+32 465 55 55 96';
export const supportWhatsApp = 'https://wa.me/'+supportPhone.slice(1);
export const contactTopics = ['support','billing','subscriptions'] as const;

const singleLine = (length:number) => z.string().trim().min(1).max(length).refine(value=>!/[\u0000-\u001f\u007f]/.test(value));
export const contactSubmission = z.object({
  requestId:z.string().uuid(),
  language:z.enum(emailLanguages),
  name:singleLine(100),
  email:z.string().trim().max(254).email(),
  topic:z.enum(contactTopics),
  message:z.string().trim().min(10).max(2000).refine(value=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)),
  website:z.string().max(300).optional(),
}).strict();
export type ContactSubmission = z.infer<typeof contactSubmission>;

export const contactCopy = {
  ar:{intro:'راسل فريقنا للاستفسار عن الدعم أو الفواتير أو اشتراك JOUW DRIVER.',direct:'تواصل مباشرة',email:'البريد الإلكتروني',phone:'اتصال مباشر',form:'أرسل رسالة',name:'الاسم',topic:'نوع الطلب',topics:{support:'الدعم الفني',billing:'الفواتير',subscriptions:'الاشتراكات'},message:'رسالتك',note:'اكتب رسالتك من دون كلمات مرور أو معلومات دفع.',send:'إرسال الرسالة',sending:'جارٍ الإرسال…',success:'استلمنا رسالتك. سنردّ على بريدك الإلكتروني.',invalid:'راجع الحقول. اكتب رسالة من 10 إلى 2000 حرف.',limited:'انتظر دقيقة ثم أعد المحاولة، أو تواصل معنا مباشرة.',failure:'تعذّر تأكيد الإرسال. أعد المحاولة أو استخدم إحدى وسائل التواصل المباشر.'},
  fr:{intro:'Contactez notre équipe pour une question de support, de facturation ou d’abonnement JOUW DRIVER.',direct:'Contact direct',email:'Adresse e-mail',phone:'Appeler',form:'Envoyer un message',name:'Nom',topic:'Motif',topics:{support:'Support technique',billing:'Facturation',subscriptions:'Abonnements'},message:'Votre message',note:'N’incluez aucun mot de passe ni donnée de paiement.',send:'Envoyer le message',sending:'Envoi en cours…',success:'Nous avons reçu votre message. Nous vous répondrons par e-mail.',invalid:'Vérifiez les champs. Le message doit contenir entre 10 et 2 000 caractères.',limited:'Attendez une minute avant de réessayer ou contactez-nous directement.',failure:'L’envoi n’a pas pu être confirmé. Réessayez ou contactez-nous directement.'},
  nl:{intro:'Neem contact op met ons team voor ondersteuning, facturatie of een JOUW DRIVER-abonnement.',direct:'Rechtstreeks contact',email:'E-mailadres',phone:'Bellen',form:'Stuur een bericht',name:'Naam',topic:'Onderwerp',topics:{support:'Technische hulp',billing:'Facturatie',subscriptions:'Abonnementen'},message:'Uw bericht',note:'Vermeld geen wachtwoorden of betaalgegevens.',send:'Bericht versturen',sending:'Bezig met versturen…',success:'Wij hebben uw bericht ontvangen. Wij antwoorden per e-mail.',invalid:'Controleer de velden. Het bericht moet 10 tot 2.000 tekens bevatten.',limited:'Wacht één minuut en probeer opnieuw, of neem rechtstreeks contact op.',failure:'Verzending kon niet worden bevestigd. Probeer opnieuw of neem rechtstreeks contact op.'},
  en:{intro:'Contact our team about support, billing or a JOUW DRIVER subscription.',direct:'Contact us directly',email:'Email address',phone:'Call us',form:'Send a message',name:'Name',topic:'Topic',topics:{support:'Technical support',billing:'Billing',subscriptions:'Subscriptions'},message:'Your message',note:'Keep passwords and payment details out of your message.',send:'Send message',sending:'Sending…',success:'We received your message. We’ll reply by email.',invalid:'Check the fields. Enter a message between 10 and 2,000 characters.',limited:'Wait a minute before retrying, or contact us directly.',failure:'Sending could not be confirmed. Try again or contact us directly.'},
} as const;
