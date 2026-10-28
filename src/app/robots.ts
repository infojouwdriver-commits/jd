import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { marketingOrigin } from '@/lib/marketing-content';

// Keep the application, authentication links and historic host out of search.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = ((await headers()).get('host') || '').split(':')[0].toLowerCase();
  if (host !== 'jouww.com' && host !== 'www.jouww.com' && host !== 'localhost') {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/', '/next_api/', '/admin/', '/company/', '/driver/', '/distributor/',
        '/login', '/driver-login', '/register-company', '/dashboard', '/taximeter',
        '/trips', '/invoices', '/invoice/', '/pay/', '/documents/', '/contract-print/',
        '/sign-contract/', '/privacy-center', '/landing', '/features/',
      ],
    }],
    sitemap: marketingOrigin + '/sitemap.xml',
    host: marketingOrigin,
  };
}
