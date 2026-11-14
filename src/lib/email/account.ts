import {resolveEmailLanguage, type EmailDesign} from './renderer.ts';

export type VerificationPurpose = 'register' | 'company-registration' | 'reset-password' | 'account-email';

const copy = {
  ar: {
    titles: {'register':'تأكيد بريدك الإلكتروني','company-registration':'تأكيد بريد الشركة','reset-password':'استعادة كلمة المرور','account-email':'تأكيد بريدك الجديد'},
    instructions: {'register':'أدخل الرمز في نموذج التسجيل لتأكيد بريدك.','company-registration':'أدخل الرمز في نموذج تسجيل الشركة. يبقى الطلب بانتظار موافقة الإدارة.','reset-password':'أدخل الرمز في نموذج استعادة كلمة المرور، ثم اختر كلمة مرور جديدة.','account-email':'أدخل الرمز في نموذج تعديل الحساب لتأكيد بريدك الجديد.'},
    hello:'مرحباً', expires:'الرمز صالح لمدة 3 دقائق.', warning:'إذا لم تطلب هذا الرمز، تجاهل الرسالة. حافظ على سرية الرمز.',
  },
  fr: {
    titles: {'register':'Confirmez votre adresse e-mail','company-registration':'Confirmez l’adresse e-mail de votre entreprise','reset-password':'Réinitialisez votre mot de passe','account-email':'Confirmez votre nouvelle adresse e-mail'},
    instructions: {'register':'Saisissez le code dans le formulaire d’inscription pour confirmer votre adresse.','company-registration':'Saisissez le code dans le formulaire d’inscription de l’entreprise. L’approbation de l’administration reste nécessaire.','reset-password':'Saisissez le code dans le formulaire de récupération, puis choisissez un nouveau mot de passe.','account-email':'Saisissez le code dans les paramètres du compte pour confirmer votre nouvelle adresse.'},
    hello:'Bonjour', expires:'Ce code est valable 3 minutes.', warning:'Si vous n’avez pas demandé ce code, ignorez cet e-mail. Gardez le code confidentiel.',
  },
  nl: {
    titles: {'register':'Bevestig uw e-mailadres','company-registration':'Bevestig het e-mailadres van uw bedrijf','reset-password':'Stel uw wachtwoord opnieuw in','account-email':'Bevestig uw nieuwe e-mailadres'},
    instructions: {'register':'Voer de code in op het registratieformulier om uw adres te bevestigen.','company-registration':'Voer de code in op het bedrijfsregistratieformulier. Goedkeuring door het beheer blijft vereist.','reset-password':'Voer de code in op het herstelformulier en kies daarna een nieuw wachtwoord.','account-email':'Voer de code in bij uw accountinstellingen om uw nieuwe adres te bevestigen.'},
    hello:'Hallo', expires:'Deze code is 3 minuten geldig.', warning:'Hebt u deze code niet aangevraagd? Negeer dan deze e-mail. Houd de code geheim.',
  },
  en: {
    titles: {'register':'Confirm your email address','company-registration':'Confirm your company email address','reset-password':'Reset your password','account-email':'Confirm your new email address'},
    instructions: {'register':'Enter the code on the registration form to confirm your address.','company-registration':'Enter the code on the company registration form. Administrative approval is still required.','reset-password':'Enter the code on the recovery form, then choose a new password.','account-email':'Enter the code in your account settings to confirm your new address.'},
    hello:'Hello', expires:'This code is valid for 3 minutes.', warning:'If you did not request this code, ignore this email. Keep the code private.',
  },
};

export function verificationDesign(purpose: VerificationPurpose, code: string, locale?: string, name?: string): EmailDesign {
  const language = resolveEmailLanguage(locale, 'en');
  const w = copy[language], title = w.titles[purpose];
  return {
    id: purpose, language, title, subject: `JOUW DRIVER — ${title}`, code,
    intro: name ? `${w.hello} ${name},` : `${w.hello},`,
    message: w.instructions[purpose],
    note: `${w.expires}\n${w.warning}`,
  };
}
