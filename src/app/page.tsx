import { headers } from "next/headers";
import LandingPage from "@/components/landing/LandingPage";
import {
  homepageMetadata,
  homepageSchema,
} from "@/components/landing/cinematic/seo";
// Gestion des entreprises de taxi en Belgique. Organization and FAQ are HTML companions to WebGL.
export const metadata = homepageMetadata("fr", "/");
export default async function HomePage() {
  const nonce = (await headers()).get("x-nonce") || undefined;
  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageSchema("fr")).replace(/</g, "\\u003c"),
        }}
      />
      <LandingPage locale="fr" />
    </>
  );
}
