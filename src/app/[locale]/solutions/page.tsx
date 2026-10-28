import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { MarketingHub } from '@/components/landing/MarketingEditorial';
import {
  marketingOrigin, marketingCopy, marketingLocales, isMarketingLocale,
  hubHref, languageAlternates,
} from '@/lib/marketing-content';

type Props = { params: Promise<{ locale: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return marketingLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isMarketingLocale(locale)) return { robots: { index: false } };
  const copy = marketingCopy[locale];
  const path = hubHref(locale);
  return {
    metadataBase: new URL(marketingOrigin),
    title: copy.hubTitle + ' | JOUW DRIVER',
    description: copy.hubDescription,
    alternates: { canonical: path, languages: languageAlternates() },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: 'JOUW DRIVER',
      url: marketingOrigin + path,
      locale: locale === 'fr' ? 'fr_BE' : locale === 'nl' ? 'nl_BE' : 'ar',
      title: copy.hubTitle,
      description: copy.hubDescription,
      images: [{ url: marketingOrigin + '/marketing-driver.jpg', width: 1400, height: 934, alt: 'JOUW DRIVER' }],
    },
  };
}

export default async function SolutionsPage({ params }: Props) {
  const { locale } = await params;
  if (!isMarketingLocale(locale)) notFound();
  const nonce = (await headers()).get('x-nonce') || undefined;
  const path = hubHref(locale);
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: marketingCopy[locale].homeLabel, item: marketingOrigin + '/' },
      { '@type': 'ListItem', position: 2, name: marketingCopy[locale].hubTitle, item: marketingOrigin + path },
    ],
  };
  return (
    <>
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }} />
      <MarketingHub locale={locale} />
    </>
  );
}
