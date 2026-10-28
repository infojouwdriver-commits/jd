import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import PlatformLanding from "@/components/landing/PlatformLanding";
import { marketingLocales, isMarketingLocale } from "@/lib/marketing-content";
import {
  homepageMetadata,
  homepageSchema,
} from "@/components/landing/cinematic/seo";
type Props = { params: Promise<{ locale: string }> };
export function generateStaticParams() {
  return marketingLocales.map((locale) => ({ locale }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isMarketingLocale(locale)
    ? homepageMetadata(locale, "/" + locale)
    : { robots: { index: false } };
}
export default async function LocalizedHome({ params }: Props) {
  const { locale } = await params;
  if (!isMarketingLocale(locale)) notFound();
  const nonce = (await headers()).get("x-nonce") || undefined;
  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageSchema(locale)).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <PlatformLanding locale={locale} />
    </>
  );
}
