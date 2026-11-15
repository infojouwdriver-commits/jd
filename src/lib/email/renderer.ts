export const emailLanguages = ['ar', 'fr', 'nl', 'en'] as const;
export type EmailLanguage = typeof emailLanguages[number];
export const templateIds = [
  'register', 'company-registration', 'reset-password', 'account-email',
  'contract-invitation', 'contract-confirmation', 'invoice', 'credit-note',
  'invoice-reminder', 'trip-receipt', 'driver-report',
] as const;
export type TemplateId = typeof templateIds[number];
type EmailDesignId = TemplateId | 'public-contact' | 'approval-alert';

export function resolveEmailLanguage(value: unknown, fallback: EmailLanguage = 'fr'): EmailLanguage {
  const language = typeof value === 'string' ? value.toLowerCase().split(/[-_]/)[0] : '';
  return emailLanguages.find(item => item === language) ?? fallback;
}

const logoPath = '/email/jouw-driver-logo-v2.png';

export const emailBrand = {
  site: 'https://jouww.com',
  contact: 'https://jouww.com/contact',
  staticLogo: 'https://app.jouww.com' + logoPath,
} as const;

const labels = {
  ar: {service:'إدارة الأساطيل وخدمات التنقل', contact:'تواصل معنا', attachment:'مرفق PDF', sample:'رسالة اختبار · بيانات تجريبية', subject:'اختبار'},
  fr: {service:'Gestion de flotte et services de mobilité', contact:'Nous contacter', attachment:'Pièce jointe PDF', sample:'E-mail de test · Données fictives', subject:'TEST'},
  nl: {service:'Vlootbeheer en mobiliteitsdiensten', contact:'Contact', attachment:'PDF-bijlage', sample:'Testmail · Fictieve gegevens', subject:'TEST'},
  en: {service:'Fleet management and mobility services', contact:'Contact us', attachment:'PDF attachment', sample:'Test email · Sample data', subject:'TEST'},
} as const;

export interface EmailDesign {
  id: EmailDesignId;
  language: EmailLanguage;
  subject: string;
  title: string;
  intro?: string;
  message?: string;
  fields?: {label: string; value: string; ltr?: boolean}[];
  action?: {label: string; url: string};
  note?: string;
  filenames?: string[];
  code?: string;
}

export interface EmailEdits {
  subject?: string | null;
  intro?: string | null;
  signature?: string | null;
}

export const editableTemplateIds = ['invoice', 'credit-note', 'invoice-reminder'] as const;
export function isEditableTemplate(id: EmailDesignId) {
  return editableTemplateIds.some(template => template === id);
}

export function escapeEmail(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;',
  })[character]!);
}

export function safeEmailUrl(value: string): string | null {
  if (!/^https:\/\//i.test(value) || /[\s\u0000-\u001f\u007f\\]/u.test(value)) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function emailMessageHtml(value: string, linkify = false): string {
  const parts = linkify ? value.split(/(https:\/\/[^\s<>]+)/g) : [value];
  return parts.map(part => {
    const url = linkify ? safeEmailUrl(part) : null;
    return url ? `<a style="color:#14243F;text-decoration:underline" href="${escapeEmail(url)}">${escapeEmail(part)}</a>` :
      escapeEmail(part).replace(/\r\n?|\n/g, '<br>');
  }).join('');
}

export function renderEmail(design: EmailDesign, edits: EmailEdits = {}, options: {sample?: boolean; logo?: 'local'} = {}) {
  const {language, title, fields = [], filenames = [], note, code, message} = design;
  const copy = labels[language];
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const align = dir === 'rtl' ? 'right' : 'left';
  const intro = (isEditableTemplate(design.id) && edits.intro) || design.intro;
  const subject = ((isEditableTemplate(design.id) && edits.subject)
    ? `${edits.subject} — ${design.subject}`
    : design.subject).replace(/[\r\n\u0000-\u001f\u007f]+/g, ' ');
  const finalSubject = options.sample ? `[${copy.subject}] ${subject}` : subject;
  const signature = edits.signature || '';
  const actionUrl = design.action && !options.sample ? safeEmailUrl(design.action.url) : null;
  const logo = options.logo === 'local' ? logoPath : emailBrand.staticLogo;
  const table = 'role="presentation" cellpadding="0" cellspacing="0" border="0"';
  const paragraph = (value: string, linkify = false) =>
    `<p style="margin:0 0 16px;overflow-wrap:anywhere;word-break:break-word">${emailMessageHtml(value, linkify)}</p>`;
  const html = `<!doctype html>
<html lang="${language}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${escapeEmail(finalSubject)}</title>
<style>:root{color-scheme:light dark;supported-color-schemes:light dark}@media(prefers-color-scheme:dark){.jd-bg{background:#101D34!important}.jd-body{background:#14243F!important;color:#F2F4F8!important}.jd-heading,.jd-link{color:#F2F4F8!important}.jd-card{background:#101D34!important;color:#F2F4F8!important}.jd-body a:not(.jd-action){color:#F2F4F8!important}}@media(max-width:440px){.jd-pad{padding:22px 18px!important}}</style></head>
<body style="margin:0;padding:0;background:#F2F4F8">
<table ${table} class="jd-bg" width="100%" bgcolor="#F2F4F8"><tr><td align="center" style="padding:18px 10px">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table ${table} width="100%" dir="${dir}" style="width:100%;max-width:600px;font-family:Arial,Tahoma,sans-serif;border-collapse:separate">
<tr><td bgcolor="#101D34" class="jd-pad" style="border-top:4px solid #D7AC60;padding:24px 32px;color:#FFFFFF">
<table ${table} dir="${dir}"><tr><td width="66" valign="middle">
<!--[if mso]><img src="${logo}" alt="" width="54" height="54" style="display:block;border:0"><![endif]-->
<!--[if !mso]><!--><table ${table} aria-hidden="true"><tr><td class="jd-logo" width="54" height="54" background="${logo}" style="background-image:url('${logo}');background-position:center;background-repeat:no-repeat;font-size:0;line-height:0">&nbsp;</td></tr></table><!--<![endif]-->
</td><td valign="middle" align="${align}"><strong style="display:block;color:#FFFFFF;font-size:19px;letter-spacing:1px" dir="ltr">JOUW DRIVER</strong><span style="color:#D7AC60;font-size:13px;line-height:1.5">${copy.service}</span></td></tr></table>
</td></tr>
<tr><td bgcolor="#FFFFFF" align="${align}" class="jd-body jd-pad" style="padding:30px 32px;color:#344054;font-size:16px;line-height:1.65">
${options.sample ? `<p class="jd-card" style="margin:0 0 12px;background:#F2F4F8;padding:8px 12px;font-weight:bold">${copy.sample}</p>` : ''}
<h1 class="jd-heading" style="margin:0 0 16px;font-size:24px;line-height:1.35;color:#101D34">${escapeEmail(title)}</h1>
${intro ? paragraph(intro) : ''}${message ? paragraph(message, design.id === 'trip-receipt') : ''}
${fields.length || code ? `<table ${table} width="100%" style="margin:0 0 18px"><tr><td class="jd-card" bgcolor="#F2F4F8" align="${align}" style="padding:14px 16px;border:1px solid #B38B48;overflow-wrap:anywhere;word-break:break-word">${fields.map(field => `<div style="margin:4px 0;font-size:14px">${escapeEmail(field.label)} <strong${field.ltr ? ' dir="ltr"' : ''}>${escapeEmail(field.value)}</strong></div>`).join('')}${code ? `<div dir="ltr" align="center" style="font-size:30px;letter-spacing:5px;font-weight:bold">${escapeEmail(code)}</div>` : ''}</td></tr></table>` : ''}
${(actionUrl || options.sample) && design.action ? `<table ${table} style="margin:0 0 18px"><tr><td bgcolor="#D7AC60" style="border-radius:7px">${actionUrl ? `<a class="jd-action" href="${escapeEmail(actionUrl)}" style="display:inline-block;padding:12px 20px;color:#101D34;font-weight:bold;text-decoration:none">${escapeEmail(design.action.label)}</a>` : `<span style="display:inline-block;padding:12px 20px;color:#101D34;font-weight:bold">${escapeEmail(design.action.label)}</span>`}</td></tr></table>` : ''}
${note ? paragraph(note) : ''}
${filenames.map(filename => `<div style="margin:8px 0;font-size:14px">${copy.attachment} · <strong dir="ltr">${escapeEmail(filename)}</strong></div>`).join('')}
</td></tr>
<tr><td bgcolor="#14243F" align="${align}" class="jd-pad" style="padding:18px 32px;color:#FFFFFF;font-size:13px;line-height:1.65">
<strong style="color:#D7AC60" dir="ltr">JOUW DRIVER</strong>${signature ? `<div>${emailMessageHtml(signature)}</div>` : ''}
<div><a href="${emailBrand.site}" style="color:#FFFFFF" dir="ltr">jouww.com</a> · <a href="${emailBrand.contact}" style="color:#FFFFFF">${copy.contact}</a></div>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
  const text = [
    options.sample ? copy.sample : '', title, intro, message,
    fields.map(field => `${field.label} ${field.value}`).join('\n'), code,
    actionUrl && design.action ? `${design.action.label}: ${actionUrl}` : '', note,
    filenames.map(filename => `${copy.attachment}: ${filename}`).join('\n'),
    ['JOUW DRIVER', signature, emailBrand.site, `${copy.contact}: ${emailBrand.contact}`].filter(Boolean).join('\n'),
  ].filter(Boolean).join('\n\n');
  return {subject: finalSubject, html, text, design};
}
