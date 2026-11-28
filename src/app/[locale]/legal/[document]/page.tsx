import { notFound } from 'next/navigation';
import LegalDocument from '@/components/public/LegalDocument';
import { legalLocales, legalSlugs, legalTitles, type LegalLocale, type LegalSlug } from '@/lib/public-legal';

type Props = { params: Promise<{locale: LegalLocale; document: LegalSlug}> };
export async function generateMetadata({params}: Props) {
 const {locale, document} = await params;
 const index = legalSlugs.indexOf(document);
 if (!legalLocales.includes(locale) || index < 0) return {};
 return { title: `${legalTitles[locale][index]} — JOUW DRIVER`, alternates: {
  canonical: `https://jouww.com/${locale}/legal/${document}`,
  languages: Object.fromEntries(legalLocales.map(code => [code, `https://jouww.com/${code}/legal/${document}`])),
 }};
}
export default async function Page({params}: Props) {
 const {locale, document} = await params;
 if (!legalLocales.includes(locale) || !legalSlugs.includes(document)) notFound();
 return <LegalDocument locale={locale} document={document}/>;
}
