import type { Metadata } from "next";
import type { AppLanguage } from "@/contexts/LanguageContext";
import { marketingOrigin } from "@/lib/marketing-content";
import { cinematicCopy } from "./copy";
export const homeAlternates = {
  "fr-BE": "/fr",
  "nl-BE": "/nl",
  ar: "/ar",
  "x-default": "/",
};
export function homepageMetadata(locale: AppLanguage, path: string): Metadata {
  const t = cinematicCopy[locale];
  const title =
    locale === "fr"
      ? "Gestion des entreprises de taxi en Belgique | JOUW DRIVER"
      : locale === "nl"
        ? "Platform voor taxibedrijven in België | JOUW DRIVER"
        : "إدارة شركات التاكسي في بلجيكا | JOUW DRIVER";
  return {
    metadataBase: new URL(marketingOrigin),
    title,
    description: t.intro,
    alternates: { canonical: path, languages: homeAlternates },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: "JOUW DRIVER",
      url: marketingOrigin + path,
      title,
      description: t.intro,
      locale: locale === "fr" ? "fr_BE" : locale === "nl" ? "nl_BE" : "ar",
      images: [
        {
          url: "/cinematic/poster.webp",
          width: 1200,
          height: 1000,
          alt: "JOUW DRIVER",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t.intro,
      images: ["/cinematic/poster.webp"],
    },
  };
}
export function homepageSchema(locale: AppLanguage) {
  const t = cinematicCopy[locale];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": marketingOrigin + "/#organization",
        name: "JOUW DRIVER",
        url: marketingOrigin,
        logo: marketingOrigin + "/app-brand/app-icon.png",
      },
      {
        "@type": "SoftwareApplication",
        name: "JOUW DRIVER",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        inLanguage: ["ar", "fr-BE", "nl-BE"],
        offers: {
          "@type": "Offer",
          price: "50.00",
          priceCurrency: "EUR",
          description: t.contract + " · " + t.vat + " · " + t.renewal,
        },
      },
      {
        "@type": "FAQPage",
        inLanguage: locale,
        mainEntity: t.questions.map(([q, a]) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };
}
