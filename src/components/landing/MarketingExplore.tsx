'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  marketingCopy, marketingTopics, hubHref, solutionHref,
} from '@/lib/marketing-content';

// Internal links make the new editorial pages discoverable from the main site.
export default function MarketingExplore() {
  const { language } = useLanguage();
  const copy = marketingCopy[language];
  return (
    <section className="pm-section" aria-labelledby="pm-solutions-title" id="solutions">
      <div className="pm-heading">
        <p className="pm-eyebrow">JOUW DRIVER · BELGIUM</p>
        <h2 id="pm-solutions-title">{copy.hubTitle}</h2>
        <p>{copy.hubIntroduction}</p>
      </div>
      <div className="pm-capabilities">
        {marketingTopics.map((topic) => {
          const item = copy.solutions[topic];
          return (
            <article key={topic}>
              <h3>{item.eyebrow}</h3>
              <p>{item.description}</p>
              <Link href={solutionHref(language, topic)} className="mt-5 inline-block text-[#e0bd5b] underline underline-offset-4">
                {copy.learnMore}
              </Link>
            </article>
          );
        })}
      </div>
      <p className="mt-8">
        <Link href={hubHref(language)} className="text-[#e0bd5b] underline underline-offset-4">
          {copy.hubTitle}
        </Link>
      </p>
    </section>
  );
}
