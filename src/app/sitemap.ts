import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { marketingOrigin, marketingLocales, marketingTopics, hubHref, solutionHref } from '@/lib/marketing-content';

// A distinct sitemap is served only for the public marketing host; the driver
// and administration hosts must not advertise public search landing pages.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = ((await headers()).get('host') || '').split(':')[0].toLowerCase();
  if (host !== 'jouww.com' && host !== 'www.jouww.com' && host !== 'localhost') return [];
  return [
    { url: marketingOrigin + '/', changeFrequency: 'weekly', priority: 1 },
    ...marketingLocales.map((locale) => ({
      url: marketingOrigin + hubHref(locale), changeFrequency: 'monthly' as const, priority: 0.8,
    })),
    ...marketingLocales.flatMap((locale) => marketingTopics.map((topic) => ({
      url: marketingOrigin + solutionHref(locale, topic),
      changeFrequency: 'monthly' as const, priority: 0.7,
    }))),
  ];
}
