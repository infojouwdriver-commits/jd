import Link from 'next/link';
import CookiePreferencesButton from '@/components/gdpr/CookiePreferencesButton';
import { supportEmail, supportPhone, supportPhoneLabel } from '@/lib/public-contact';
import { legalLocales, legalSections, legalSlugs, legalTitles, type LegalLocale, type LegalSlug } from '@/lib/public-legal';

export default function LegalDocument({locale, document}: {locale: LegalLocale; document: LegalSlug}) {
 const title = legalTitles[locale][legalSlugs.indexOf(document)];
 const links = {
  fr: { home: 'Accueil', privacy: 'Centre de confidentialité', authority: 'Autorité de protection des données', contact: 'Éditeur et contact' },
  nl: { home: 'Startpagina', privacy: 'Privacycentrum', authority: 'Gegevensbeschermingsautoriteit', contact: 'Uitgever en contact' },
  ar: { home: 'الرئيسية', privacy: 'مركز الخصوصية', authority: 'سلطة حماية البيانات البلجيكية', contact: 'الشركة وبيانات التواصل' },
 }[locale];
 const email = document === 'privacy' ? process.env.PRIVACY_CONTACT_EMAIL || supportEmail : supportEmail;
 return <main dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale} className="min-h-screen bg-[#0b1423] text-slate-100 px-5 py-10">
  <div className="mx-auto max-w-5xl">
   <header className="flex flex-wrap items-center justify-between gap-4 pb-8">
    <Link href={`/${locale}`} className="font-bold text-[#e0bd5b]">JOUW DRIVER <span className="sr-only">{links.home}</span></Link>
    <nav className="flex gap-4 text-sm">{legalLocales.map(code => <Link key={code} href={`/${code}/legal/${document}`} hrefLang={code} aria-current={code === locale ? 'page' : undefined}>{ {fr:'Français', nl:'Nederlands', ar:'العربية'}[code] }</Link>)}</nav>
   </header>
   <div className="grid gap-8 md:grid-cols-[16rem_minmax(0,1fr)]">
    <nav className="flex flex-col gap-2">{legalSlugs.map((slug, index) => <Link key={slug} href={`/${locale}/legal/${slug}`} aria-current={slug === document ? 'page' : undefined} className={`rounded-xl border p-3 ${slug === document ? 'border-[#e0bd5b] text-[#f5d87f]' : 'border-slate-700'}`}>{legalTitles[locale][index]}</Link>)}</nav>
    <article className="rounded-2xl bg-[#142238] border border-slate-700 p-5 sm:p-8 space-y-6">
     <h1 className="text-3xl font-bold text-[#f5d87f]">{title}</h1>
     {legalSections[locale][document].map(([heading, body]) => <section key={heading} className="space-y-2"><h2 className="text-xl font-semibold">{heading}</h2><p className="leading-7 text-slate-200">{body}</p></section>)}
     {document === 'cookies' && <CookiePreferencesButton />}
     {document === 'privacy' && <div className="flex flex-wrap gap-4"><a className="underline" href="https://app.jouww.com/privacy-center">{links.privacy}</a><a className="underline" href={locale === 'nl' ? 'https://www.gegevensbeschermingsautoriteit.be' : 'https://www.autoriteprotectiondonnees.be'}>{links.authority}</a></div>}
     <section className="border-t border-slate-700 pt-5 space-y-1">
      <h2 className="text-lg font-semibold">{links.contact}</h2>
      <p dir="ltr" className="text-start">{process.env.PRIVACY_CONTROLLER_NAME || (locale === 'nl' ? 'JOUW DRIVER BV' : 'JOUW DRIVER SRL')} · {process.env.PRIVACY_CONTROLLER_ADDRESS || 'Oude Heerweg 2, 9160 Lokeren, Belgique'} · BCE/KBO 0799.499.833 · TVA/BTW BE0799499833</p>
      <p><a className="underline" href={`mailto:${email}`}>{email}</a> · <a className="underline" href={`tel:${supportPhone}`} dir="ltr">{supportPhoneLabel}</a></p>
     </section>
    </article>
   </div>
  </div>
 </main>;
}
