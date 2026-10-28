import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('marketing sitemap lists only public editorial routes with absolute canonical origin', () => {
  const sitemap = read('src/app/sitemap.ts');
  assert.match(sitemap, /marketingOrigin \+ '\/'/);
  assert.match(sitemap, /marketingLocales\.map/);
  assert.match(sitemap, /marketingLocales\.flatMap/);
  assert.match(sitemap, /solutionHref\(locale, topic\)/);
  assert.match(sitemap, /return \[\]/);
  assert.doesNotMatch(sitemap, /\/admin\/|\/driver-login|\/sign-contract/);
});

test('robots and middleware exclude the authenticated application, token documents and duplicate host', () => {
  const robots = read('src/app/robots.ts');
  const middleware = read('src/middleware.ts');
  assert.match(robots, /disallow: '\/'/);
  for (const pattern of ['/next_api/', '/admin/', '/login', '/invoice/', '/sign-contract/']) {
    assert.ok(robots.includes(pattern), 'robots must exclude ' + pattern);
  }
  assert.match(middleware, /app\.jouww\.com/);
  assert.match(middleware, /jouw-driver\.duckdns\.org/);
  assert.match(middleware, /X-Robots-Tag/);
  assert.match(middleware, /publicMarketingRoute/);
});

test('localized solutions have stable distinct paths, page metadata and language alternates', () => {
  const data = read('src/lib/marketing-content.ts');
  const detail = read('src/app/[locale]/solutions/[slug]/page.tsx');
  const hub = read('src/app/[locale]/solutions/page.tsx');
  for (const language of ['fr', 'nl', 'ar']) {
    assert.match(data, new RegExp('  ' + language + ': \\{'));
  }
  for (const topic of ['fleet', 'shifts', 'invoicing']) {
    assert.match(data, new RegExp('      ' + topic + ': \\{'));
  }
  assert.match(data, /fr-BE/);
  assert.match(data, /nl-BE/);
  assert.match(data, /x-default/);
  assert.match(detail, /generateMetadata/);
  assert.match(detail, /generateStaticParams/);
  assert.match(detail, /languageAlternates\(topic\)/);
  assert.match(detail, /notFound\(\)/);
  assert.match(hub, /generateMetadata/);
  assert.match(hub, /languageAlternates\(\)/);
});

test('marketing pages use server-rendered content and accessible links back to homepage', () => {
  const editorial = read('src/components/landing/MarketingEditorial.tsx');
  const home = read('src/components/landing/PlatformLanding.tsx');
  assert.doesNotMatch(editorial, /^['"]use client['"]/);
  assert.match(editorial, /<h1/);
  assert.match(editorial, /<h2/);
  assert.match(editorial, /<details/);
  assert.match(editorial, /<Link href="\/"/);
  assert.match(home, /<MarketingExplore locale=\{language\}\s*\//);
  assert.match(read('src/components/landing/MarketingExplore.tsx'), /solutionHref\(language, topic\)/);
});

test('duplicate marketing alias is noindex and both marketing and application retain their own identity', () => {
  const duplicate = read('src/app/landing/page.tsx');
  const root = read('src/app/layout.tsx');
  const home = read('src/app/page.tsx');
  assert.match(duplicate, /index: false/);
  assert.match(duplicate, /canonical: '\/'/);
  assert.match(root, /pageLanguage/);
  assert.match(home, /Gestion des entreprises de taxi en Belgique/);
  assert.match(home, /Organization/);
  assert.doesNotMatch(home, /GoogleAnalytics|gtag|track\(/);
});

test('content avoids claiming official Chiron acceptance and never turns shifts into customer invoices', () => {
  const data = read('src/lib/marketing-content.ts');
  assert.match(data, /Les relevés des chauffeurs sont-ils ajoutés aux factures clients/);
  assert.match(data, /Wordt de tellerstand automatisch met GPS berekend/);
  assert.match(data, /هل كشف الوردية بديل تلقائي/);
  assert.doesNotMatch(data, /garantit une conformité totale|volledige compliance|توافق مضمون/);
});

test('public marketing drops referral query names but preserves secure user links', () => {
  const middleware = read('src/middleware.ts');
  assert.match(middleware, /marketingHost && publicMarketingPath/);
  assert.match(middleware, /trackingKeys/);
  assert.match(middleware, /utm_/);
  assert.match(middleware, /fbclid/);
  assert.match(middleware, /cleanUrl\.searchParams\.delete/);
  assert.match(middleware, /NextResponse\.redirect\(cleanUrl, 307\)/);
  assert.match(middleware, /request\.method === 'GET'/);
  assert.match(middleware, /request\.method === 'HEAD'/);
});
