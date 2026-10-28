import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';
import { marketingOrigin } from '@/lib/marketing-content';

// Historical alias: do not create a second indexed copy of the homepage.
export const metadata: Metadata = {
  metadataBase: new URL(marketingOrigin),
  alternates: { canonical: '/' },
  robots: { index: false, follow: true },
};

export default function LandingPageRoute() {
  return <LandingPage />;
}
