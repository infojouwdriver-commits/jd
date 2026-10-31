/** Shared, email-client-safe JOUW DRIVER template library.
 * No scripts, external assets, or live tracking pixels. GIFs are optional and
 * must be hosted on an explicitly trusted HTTPS origin.
 */
export type EmailLocale = 'ar'|'fr'|'nl'|'en';
export type EmailKind = 'payment'|'invoice'|'contract'|'message';
export type EmailTemplateInput = {
 kind: EmailKind; locale: EmailLocale; title: string; message: string;
 amount?: string; reference?: string; rows?: {label:string;value:string}[];
 action?: {label:string;url:string}; animationGifUrl?: string;
};
const escapeHtml=(v:string)=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const labels:Record<EmailLocale,{brand:string;reference:string;amount:string}> = {
 ar:{brand:'رسالة رسمية',reference:'المرجع',amount:'المبلغ'},
 fr:{brand:'Communication officielle',reference:'Référence',amount:'Montant'},
 nl:{brand:'Officiële communicatie',reference:'Referentie',amount:'Bedrag'},
 en:{brand:'Official communication',reference:'Reference',amount:'Amount'}
};
export function renderJouwEmail(input:EmailTemplateInput):{html:string;text:string}{
 const lang=labels[input.locale],dir=input.locale==='ar'?'rtl':'ltr';
 const safeUrl=(raw:string)=>{try{const u=new URL(raw);return u.protocol==='https:'?u.toString():null}catch{return null}};
 const rows=[...(input.amount?[{label:lang.amount,value:input.amount}]:[]),...(input.reference?[{label:lang.reference,value:input.reference}]:[]),...(input.rows??[])];
 const rowsHtml=rows.map(r=>'<tr><td style="padding:11px 14px;border-bottom:1px solid #30415a;color:#c4cfdf">'+escapeHtml(r.label)+'</td><td style="padding:11px 14px;border-bottom:1px solid #30415a;color:#ffffff;text-align:end">'+escapeHtml(r.value)+'</td></tr>').join('');
 const actionUrl=input.action&&safeUrl(input.action.url);
 const gifUrl=input.animationGifUrl&&safeUrl(input.animationGifUrl);
 const html='<div dir="'+dir+'" style="background:#f1f4f8;padding:24px 8px;font-family:Arial,Helvetica,sans-serif"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:auto;background:#0a1425;color:#fff;border-collapse:separate;border-radius:14px"><tr><td style="padding:28px;border-bottom:1px solid #30415a"><strong style="color:#d7b878;font-size:22px;letter-spacing:1px">JOUW DRIVER</strong><div style="color:#a5b4ca;font-size:12px;padding-top:8px">'+escapeHtml(lang.brand)+'</div></td></tr><tr><td style="padding:32px 28px;text-align:center">'+(gifUrl?'<img src="'+escapeHtml(gifUrl)+'" width="80" height="80" alt="" style="display:block;margin:0 auto 14px;border:0">':'<div style="font-size:34px;color:#d7b878">✓</div>')+'<h1 style="font-size:25px;color:#fff;margin:12px 0">'+escapeHtml(input.title)+'</h1></td></tr><tr><td style="padding:0 28px 30px"><p style="color:#dbe5f0;line-height:1.8;white-space:pre-line">'+escapeHtml(input.message)+'</p>'+(rowsHtml?'<table role="presentation" width="100%" style="border-collapse:collapse;background:#14243a">'+rowsHtml+'</table>':'')+(actionUrl?'<div style="text-align:center;padding:24px 0"><a href="'+escapeHtml(actionUrl)+'" style="display:inline-block;background:#d7b878;color:#0a1425;text-decoration:none;padding:13px 22px;border-radius:7px;font-weight:bold">'+escapeHtml(input.action!.label)+'</a></div>':'')+'<p style="color:#91a3bb;font-size:12px;padding-top:24px">JOUW DRIVER SRL</p></td></tr></table></div>';
 const text=[input.title,input.message,...rows.map(r=>r.label+': '+r.value),...(actionUrl?[input.action!.label+': '+actionUrl]:[]),'JOUW DRIVER SRL'].join('\n\n');
 return {html,text};
}
