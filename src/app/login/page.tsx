
import {mailConfiguration} from "@/lib/mail-policy";
export const dynamic = "force-dynamic";

import { companySocialConfig } from "@/lib/company-social";
import { LoginPageClient } from "@/components/auth/LoginPageClient";

export default function LoginPage() {
  const providers=(['google','apple'] as const).filter(provider=>companySocialConfig(provider));
  return <LoginPageClient emailEnabled={mailConfiguration(process.env).ready} providers={providers} />;
}
