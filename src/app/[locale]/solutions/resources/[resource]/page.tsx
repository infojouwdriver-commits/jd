import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MarketingSiteShell } from '@/components/landing/MarketingEditorial';
import { DriverSettlementCalculator } from '@/components/landing/DriverSettlementCalculator';
import { isMarketingLocale, marketingLocales, marketingOrigin } from '@/lib/marketing-content';
import {
  calculatorDescription, chironGuide, resourceCopy, resourceHref, resourcePages,
  resourceTitles, taxiGuideSources, type ResourcePage,
} from '@/lib/marketing-resources';

type Props = { params: Promise<{ locale: string; resource: string }> };
const reviewDate = '2026-11-11';

function isResource(value: string): value is ResourcePage {
  return resourcePages.some((page) => page === value);
}

async function getPage(params: Props['params']) {
  const { locale, resource } = await params;
  if (!isMarketingLocale(locale) || !isResource(resource)) notFound();
  const copy = resourceCopy[locale];
  const title = resourceTitles[locale][resource];
  const description = resource === 'driver-calculator' ? calculatorDescription[locale] :
    resource === 'faq' ? copy.faqDesc : resource === 'chiron' ? chironGuide[locale][0] : copy.guideDesc;
  return { locale, resource, copy, title, description };
}

export function generateStaticParams() {
  return marketingLocales.flatMap((locale) => resourcePages.map((resource) => ({ locale, resource })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, resource, title, description } = await getPage(params);
  const path = resourceHref(locale, resource);
  return {
    metadataBase: new URL(marketingOrigin),
    title: title + ' | JOUW DRIVER',
    description,
    alternates: { canonical: path, languages: {
      'fr-BE': resourceHref('fr', resource), 'nl-BE': resourceHref('nl', resource),
      ar: resourceHref('ar', resource), 'x-default': resourceHref('fr', resource),
    } },
    robots: { index: true, follow: true },
    openGraph: { type: 'website', title, description, url: path, siteName: 'JOUW DRIVER' },
  };
}

export default async function MarketingResource({ params }: Props) {
  const { locale, resource, copy, title, description } = await getPage(params);
  const sourceClass = 'inline-flex min-h-11 items-center text-[#e0bd5b] underline underline-offset-4';
  const reviewed = { ar: 'آخر مراجعة', fr: 'Dernière vérification', nl: 'Laatst gecontroleerd' }[locale];
  return (
    <MarketingSiteShell locale={locale} resource={resource}>
      <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-[#c1cbd8]">{description}</p>
      {resource === 'driver-calculator' && <DriverSettlementCalculator locale={locale} />}
      {resource === 'faq' && <div className="mt-9 max-w-3xl divide-y divide-[#364357] border-y border-[#364357]">
        {copy.questions.map(([question, answer, destination]) => (
          <details className="py-4" key={question}>
            <summary className="cursor-pointer py-2 text-lg font-semibold">{question}</summary>
            <p className="mt-2 leading-7 text-[#c1cbd8]">{answer}</p>
            {destination && <Link className={sourceClass} href={resourceHref(locale, destination === 'calc' ? 'driver-calculator' : 'flanders-taxi-guide')}>{resourceTitles[locale][destination === 'calc' ? 'driver-calculator' : 'flanders-taxi-guide']}</Link>}
          </details>
        ))}
      </div>}
      {resource === 'flanders-taxi-guide' && <div className="mt-9 grid gap-5 sm:grid-cols-2">
        {copy.guides.map(([heading, text], index) => (
          <article key={heading} className="rounded-2xl border border-[#364357] bg-[#142239] p-5">
            <h2 className="text-xl font-semibold">{heading}</h2>
            <p className="mt-2 leading-7 text-[#c1cbd8]">{text}</p>
            {index === 0 && <Link className={sourceClass + ' me-4'} href={resourceHref(locale, 'chiron')}>{resourceTitles[locale].chiron}</Link>}
            <a className={sourceClass} href={taxiGuideSources[index]}>{copy.source}</a>
          </article>
        ))}
      </div>}
      {resource === 'chiron' && <>
        <ol className="mt-7 max-w-3xl list-decimal space-y-4 ps-6 leading-8 text-[#c1cbd8]">
          {chironGuide[locale].slice(1).map((step) => <li key={step}>{step}</li>)}
        </ol>
        <a className={sourceClass + ' mt-4'} href={taxiGuideSources[0]}>{copy.source} · Vlaanderen.be</a>
      </>}
      {(resource === 'chiron' || resource === 'flanders-taxi-guide') &&
        <p className="mt-6 text-sm text-[#c1cbd8]">{reviewed} <time dateTime={reviewDate} dir="ltr">11/11/2026</time></p>}
    </MarketingSiteShell>
  );
}
