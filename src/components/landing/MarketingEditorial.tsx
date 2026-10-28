import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  marketingCopy, marketingTopics, hubHref, solutionHref,
  type MarketingLocale, type MarketingTopic,
} from '@/lib/marketing-content';
import { portalHref } from '@/lib/portal-origin';

const navLink = 'rounded-full border border-[#64748b] px-4 py-2 text-sm text-[#f5f2e9] transition-colors hover:border-[#e0bd5b] hover:text-[#e0bd5b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e0bd5b]';

function SiteShell({ locale, topic, children }: { locale: MarketingLocale; topic?: MarketingTopic; children: ReactNode }) {
  const t = marketingCopy[locale];
  const localeLink = (language: MarketingLocale) => topic ? solutionHref(language, topic) : hubHref(language);
  const signup = portalHref('/register-company?lang=' + locale, process.env.NEXT_PUBLIC_PORTAL_ORIGIN);
  return (
    <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-[#0d1727] text-[#f5f2e9]">
      <header className="border-b border-[#364357]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link href="/" className="text-xl font-semibold tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e0bd5b]" aria-label="JOUW DRIVER">
            JOUW <span className="text-[#e0bd5b]">DRIVER</span>
          </Link>
          <nav aria-label="Languages" className="flex flex-wrap items-center gap-3">
            <Link href={localeLink('fr')} hrefLang="fr-BE" className={locale === 'fr' ? 'font-bold text-[#e0bd5b]' : 'text-[#d9e2ed] hover:text-[#e0bd5b]'}>FR</Link>
            <Link href={localeLink('nl')} hrefLang="nl-BE" className={locale === 'nl' ? 'font-bold text-[#e0bd5b]' : 'text-[#d9e2ed] hover:text-[#e0bd5b]'}>NL</Link>
            <Link href={localeLink('ar')} hrefLang="ar" className={locale === 'ar' ? 'font-bold text-[#e0bd5b]' : 'text-[#d9e2ed] hover:text-[#e0bd5b]'}>AR</Link>
            <Link href="/" className={navLink}>{t.homeLabel}</Link>
          </nav>
        </div>
      </header>
      <main id="content" className="mx-auto max-w-6xl px-5 py-16 md:py-24">{children}</main>
      <footer className="border-t border-[#364357]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-10 text-sm text-[#c1cbd8]">
          <span>© {new Date().getFullYear()} JOUW DRIVER</span>
          <nav className="flex flex-wrap items-center gap-5">
            <Link href={hubHref(locale)} className="underline decoration-[#e0bd5b] underline-offset-4">{t.homeLabel} / {t.overview}</Link>
            <Link href="/privacy-policy" className="underline decoration-[#e0bd5b] underline-offset-4">Privacy</Link>
            <a href={signup} className="font-semibold text-[#e0bd5b] underline underline-offset-4">{t.companyLink}</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function TopicCard({ locale, topic }: { locale: MarketingLocale; topic: MarketingTopic }) {
  const t = marketingCopy[locale];
  const value = t.solutions[topic];
  return (
    <article className="flex h-full flex-col rounded-3xl border border-[#364357] bg-[#142239] p-7 shadow-lg">
      <p className="mb-3 text-xs font-semibold tracking-widest text-[#e0bd5b]">{value.eyebrow}</p>
      <h2 className="mb-4 text-2xl font-semibold leading-snug">{value.title}</h2>
      <p className="mb-8 flex-1 text-sm leading-7 text-[#c1cbd8]">{value.description}</p>
      <Link href={solutionHref(locale, topic)} className="inline-flex min-h-11 items-center text-sm font-semibold text-[#e0bd5b] underline underline-offset-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e0bd5b]">{t.learnMore}</Link>
    </article>
  );
}

function Caution({ locale }: { locale: MarketingLocale }) {
  return <p className="mt-14 max-w-4xl border-s-2 border-[#e0bd5b] ps-5 text-sm leading-7 text-[#c1cbd8]">{marketingCopy[locale].caution}</p>;
}

export function MarketingHub({ locale }: { locale: MarketingLocale }) {
  const t = marketingCopy[locale];
  return (
    <SiteShell locale={locale}>
      <nav aria-label="Breadcrumb" className="mb-9 text-sm text-[#c1cbd8]"><Link href="/" className="underline underline-offset-4">{t.homeLabel}</Link><span aria-hidden="true"> / </span>{t.overview}</nav>
      <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-[#e0bd5b]">JOUW DRIVER · BELGIUM</p>
      <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">{t.hubTitle}</h1>
      <p className="mt-7 max-w-3xl text-lg leading-9 text-[#c1cbd8]">{t.hubIntroduction}</p>
      <section aria-label={t.overview} className="mt-14 grid gap-6 md:grid-cols-3">
        {marketingTopics.map((topic) => <TopicCard key={topic} locale={locale} topic={topic} />)}
      </section>
      <Caution locale={locale} />
    </SiteShell>
  );
}

export function MarketingSolution({ locale, topic }: { locale: MarketingLocale; topic: MarketingTopic }) {
  const t = marketingCopy[locale];
  const s = t.solutions[topic];
  return (
    <SiteShell locale={locale} topic={topic}>
      <nav aria-label="Breadcrumb" className="mb-9 text-sm text-[#c1cbd8]">
        <Link href="/" className="underline underline-offset-4">{t.homeLabel}</Link>
        <span aria-hidden="true"> / </span>
        <Link href={hubHref(locale)} className="underline underline-offset-4">{t.overview}</Link>
        <span aria-hidden="true"> / </span><span aria-current="page">{s.eyebrow}</span>
      </nav>
      <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-[#e0bd5b]">{s.eyebrow}</p>
      <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">{s.title}</h1>
      <p className="mt-8 max-w-3xl text-lg leading-9 text-[#c1cbd8]">{s.introduction}</p>
      <section aria-labelledby="benefits-heading" className="mt-16">
        <h2 id="benefits-heading" className="mb-7 text-3xl font-semibold">{t.overview}</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {s.benefits.map((benefit) => (
            <article key={benefit.title} className="rounded-2xl border border-[#364357] bg-[#142239] p-7">
              <h3 className="mb-3 text-xl font-semibold text-[#e0bd5b]">{benefit.title}</h3>
              <p className="text-sm leading-8 text-[#c1cbd8]">{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section aria-labelledby="steps-heading" className="mt-16">
        <h2 id="steps-heading" className="mb-6 text-3xl font-semibold">{t.stepsTitle}</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {s.steps.map((step, i) => (
            <li key={step} className="rounded-2xl border border-[#364357] p-6">
              <span className="mb-4 block text-2xl text-[#e0bd5b]" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <p className="leading-8 text-[#e2e8f0]">{step}</p>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="faq-heading" className="mt-16 max-w-4xl">
        <h2 id="faq-heading" className="mb-6 text-3xl font-semibold">{t.questionsTitle}</h2>
        <div className="space-y-3">
          {s.questions.map((item) => (
            <details key={item.question} className="group rounded-2xl border border-[#364357] bg-[#142239] p-6">
              <summary className="cursor-pointer font-semibold leading-7 text-[#f5f2e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e0bd5b]">{item.question}</summary>
              <p className="mt-4 leading-8 text-[#c1cbd8]">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section aria-labelledby="related-heading" className="mt-16">
        <h2 id="related-heading" className="mb-7 text-3xl font-semibold">{t.nextTitle}</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {marketingTopics.filter((key) => key !== topic).map((key) => <TopicCard key={key} locale={locale} topic={key} />)}
        </div>
      </section>
      <Caution locale={locale} />
    </SiteShell>
  );
}
