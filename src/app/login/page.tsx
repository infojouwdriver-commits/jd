
import { LoginPageClient } from "@/components/auth/LoginPageClient";

export default function LoginPage() {
  return <LoginPageClient emailEnabled={Boolean(process.env.RESEND_KEY && process.env.RESEND_FROM_EMAIL)} />;
}
