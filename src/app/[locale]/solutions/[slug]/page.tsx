import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { MarketingSolution } from '@/components/landing/MarketingEditorial';
import {
  marketingOrigin, marketingCopy, marketingLocales, marketingTopics, isMarketingLocale,
  findSolution, hubHref, solutionHref, languageAlternates,
} from '@/lib/marketing-content';

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return marketingLocales.flatMap((locale) =>
    marketingTopics.map((topic) => ({ locale, slug: marketingCopy[locale].solutions[topic].slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isMarketingLocale(locale)) return { robots: { index: false } };
  const topic = findSolution(locale, slug);
  if (!topic) return { robots: { index: false } };
  const copy = marketingCopy[locale].solutions[topic];
  const path = solutionHref(locale, topic);
  return {
    metadataBase: new URL(marketingOrigin),
    title: copy.title + ' | JOUW DRIVER',
    description: copy.description,
    alternates: { canonical: path, languages: languageAlternates(topic) },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      siteName: 'JOUW DRIVER',
      url: marketingOrigin + path,
      locale: locale === 'fr' ? 'fr_BE' : locale === 'nl' ? 'nl_BE' : 'ar',
      title: copy.title,
      description: copy.description,
      images: [{ url: marketingOrigin + '/marketing-driver.jpg', width: 1400, height: 934, alt: 'JOUW DRIVER' }],
    },
  };
}

export default async function SolutionPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isMarketingLocale(locale)) notFound();
  const topic = findSolution(locale, slug);
  if (!topic) notFound();
  const nonce = (await headers()).get('x-nonce') || undefined;
  const t = marketingCopy[locale];
  const s = t.solutions[topic];
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.homeLabel, item: marketingOrigin + '/' },
      { '@type': 'ListItem', position: 2, name: t.hubTitle, item: marketingOrigin + hubHref(locale) },
      { '@type': 'ListItem', position: 3, name: s.title, item: marketingOrigin + solutionHref(locale, topic) },
    ],
  };
  return (
    <>
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }} />
      <MarketingSolution locale={locale} topic={topic} />
    </>
  );
}
