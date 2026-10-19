
import {mailConfiguration} from "@/lib/mail-policy";
export const dynamic = "force-dynamic";

import { LoginPageClient } from "@/components/auth/LoginPageClient";

export default function LoginPage() {
  return <LoginPageClient emailEnabled={mailConfiguration(process.env).ready} />;
}
