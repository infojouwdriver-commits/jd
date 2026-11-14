import {resolveEmailLanguage, type EmailDesign} from './renderer.ts';

const copy = {
  ar:{invite:'دعوة لمراجعة وتوقيع العقد',confirmation:'تم توقيع العقد وحفظ إثبات الموافقة',company:'الشركة',reference:'رقم العقد',terms:'قيمة الاشتراك',signer:'الاسم الكامل',email:'بريد الدعوة',signedAt:'وقت التوقيع',digest:'بصمة العقد SHA-256',direct:'راجع العقد واكتب اسمك وصفتك ثم أكد موافقتك. لا يلزم تسجيل الدخول. الرابط خاص بك وصالح لمدة 72 ساعة؛ لا تشاركه.',portal:'سجّل الدخول بحساب صاحب الشركة، ثم افتح «الاشتراك وكشف الحساب ← العقد والفوترة».',sign:'مراجعة وتوقيع العقد',open:'فتح بوابة الشركة',note:'الدعوة لا تفعّل العقد ولا تنشئ دفعة أو ترسل فاتورة.'},
  fr:{invite:'Invitation à consulter et signer le contrat',confirmation:'Contrat signé et preuve d’accord conservée',company:'Entreprise',reference:'Numéro du contrat',terms:'Montant de l’abonnement',signer:'Nom complet',email:'Adresse invitée',signedAt:'Date de signature',digest:'Empreinte du contrat SHA-256',direct:'Consultez le contrat, indiquez votre nom et votre fonction, puis confirmez votre accord. Sans connexion. Ce lien personnel est valable 72 heures. Gardez-le confidentiel.',portal:'Connectez-vous avec le compte du propriétaire, puis ouvrez « Abonnement et relevé → Contrat et facturation ».',sign:'Consulter et signer le contrat',open:'Ouvrir le portail entreprise',note:'Cette invitation n’active pas le contrat et ne déclenche ni paiement ni envoi de facture.'},
  nl:{invite:'Uitnodiging om het contract te bekijken en ondertekenen',confirmation:'Contract ondertekend en akkoord vastgelegd',company:'Bedrijf',reference:'Contractnummer',terms:'Abonnementsbedrag',signer:'Volledige naam',email:'Uitgenodigd e-mailadres',signedAt:'Tijdstip van ondertekening',digest:'SHA-256-contractvingerafdruk',direct:'Bekijk het contract, vul uw naam en functie in en bevestig uw akkoord. Aanmelden is niet nodig. Deze persoonlijke link is 72 uur geldig. Houd hem geheim.',portal:'Meld u aan met het eigenaarsaccount en open « Abonnement en overzicht → Contract en facturatie ».',sign:'Contract bekijken en ondertekenen',open:'Bedrijfsportaal openen',note:'Deze uitnodiging activeert geen contract en veroorzaakt geen betaling of factuurverzending.'},
  en:{invite:'Invitation to review and sign your contract',confirmation:'Contract signed and evidence of agreement recorded',company:'Company',reference:'Contract number',terms:'Subscription amount',signer:'Full name',email:'Invited email address',signedAt:'Signed at',digest:'SHA-256 contract fingerprint',direct:'Review the contract, enter your name and role, then confirm your agreement. You can open this link without signing in. This personal link is valid for 72 hours. Keep it private.',portal:'Sign in with the company owner account and open Subscription and statement → Contract and billing.',sign:'Review and sign the contract',open:'Open the company portal',note:'This invitation does not activate the contract, create a payment or send an invoice.'},
};

export interface ContractEmailData {
  contract_number: string;
  contract_language?: string;
  monthly_fee: unknown;
  annual_fee: unknown;
}
interface SignatureEvidence {
  signer_name: string;
  signer_email: string;
  signed_at: string;
  digest: string;
}

export function contractDesign(contract: ContractEmailData, company: {name:string}, options: {url?:string; direct?:boolean; evidence?:SignatureEvidence}): EmailDesign {
  const language = resolveEmailLanguage(contract.contract_language), w = copy[language];
  const {evidence, url, direct} = options;
  const title = evidence ? w.confirmation : w.invite;
  const formatter = new Intl.NumberFormat(language + '-BE', {style:'currency', currency:'EUR'});
  const money = (value:unknown) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) throw Error('Invalid contract price');
    return formatter.format(amount);
  };
  const fields: NonNullable<EmailDesign['fields']> = [
    {label:w.company,value:company.name},
    {label:w.reference,value:contract.contract_number,ltr:true},
    {label:w.terms,value:`${money(contract.monthly_fee)} × 12 = ${money(contract.annual_fee)}`,ltr:true},
  ];
  if (evidence) fields.push(
    {label:w.signer,value:evidence.signer_name},
    {label:w.email,value:evidence.signer_email,ltr:true},
    {label:w.signedAt,value:evidence.signed_at,ltr:true},
    {label:w.digest,value:evidence.digest,ltr:true},
  );
  return {
    id:evidence ? 'contract-confirmation' : 'contract-invitation', language, title,
    subject:`JOUW DRIVER — ${title} ${contract.contract_number}`,
    fields,
    intro:evidence ? undefined : direct ? w.direct : w.portal,
    action:url ? {label:evidence || !direct ? w.open : w.sign, url} : undefined,
    note:evidence ? undefined : w.note,
  };
}
