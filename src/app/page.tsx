import type { Metadata } from 'next';
import { headers } from 'next/headers';
import LandingPage from '@/components/landing/LandingPage';
import { marketingOrigin } from '@/lib/marketing-content';

const title = 'Gestion des entreprises de taxi en Belgique | JOUW DRIVER';
const description = 'JOUW DRIVER : outils pour chauffeurs et sociétés de taxi en Belgique. Gérez les trajets, les véhicules, les services et les documents dans des espaces dédiés.';

export const metadata: Metadata = {
  metadataBase: new URL(marketingOrigin),
  title,
  description,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: marketingOrigin,
    title,
    description,
    siteName: 'JOUW DRIVER',
    locale: 'fr_BE',
    images: [{ url: '/marketing-driver.jpg', width: 1400, height: 934, alt: 'JOUW DRIVER' }],
  },
  twitter: { card: 'summary_large_image', title, description },
};

export default async function HomePage() {
  const nonce = (await headers()).get('x-nonce') || undefined;
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'JOUW DRIVER',
    url: marketingOrigin,
    logo: marketingOrigin + '/app-brand/app-icon.png',
  };
  return (
    <>
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, '\\u003c') }} />
      <LandingPage />
    </>
  );
}
