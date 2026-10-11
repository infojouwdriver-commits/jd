
"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Car, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { CompanyLoginForm } from "@/components/auth/CompanyLoginForm";

enum ModeEnum {
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
  RESET = "RESET",
}

enum PortalEnum {
  ADMIN = "ADMIN",
  COMPANY = "COMPANY",
}

function LoginPageContent({emailEnabled}: {emailEnabled: boolean}) {
  const [mode, setMode] = useState<ModeEnum>(ModeEnum.LOGIN);
  const [portal, setPortal] = useState<PortalEnum>(PortalEnum.ADMIN);
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSuccess = () => {
    const redirectTo = searchParams.get("redirect") || "/";
    router.replace(redirectTo);
  };

  const handlePortalSwitch = (newPortal: PortalEnum) => {
    setPortal(newPortal);
    setMode(ModeEnum.LOGIN);
  };

  return (
    <div
      className="dark relative flex min-h-[100vh] items-center justify-center overflow-hidden bg-[#0b0f1a] text-white"
      style={{
        background:
          "radial-gradient(1200px 800px at 10% -10%, rgba(56,189,248,0.18), rgba(0,0,0,0) 60%), radial-gradient(900px 700px at 90% 0%, rgba(167,139,250,0.16), rgba(0,0,0,0) 55%), radial-gradient(700px 500px at 50% 110%, rgba(248,113,113,0.12), rgba(0,0,0,0) 50%), linear-gradient(180deg, #0b0f1a 0%, #0a0a0a 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-[42rem] w-[42rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(56,189,248,0.35), rgba(56,189,248,0))",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(167,139,250,0.32), rgba(167,139,250,0))",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(248,113,113,0.22), rgba(248,113,113,0))",
        }}
      />

      <div className="absolute right-6 top-6 z-50">
        <Link href="/driver-login">
          <Button
            variant="outline"
            className="rounded-2xl border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20"
          >
            <Car className="mr-2 h-4 w-4" />
            Driver Login
          </Button>
        </Link>
      </div>

      <div className="z-10 mx-auto w-full max-w-md px-4">
        <div className="mb-6 flex overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <button
            onClick={() => handlePortalSwitch(PortalEnum.ADMIN)}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              portal === PortalEnum.ADMIN
                ? "bg-white/15 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <User className="h-4 w-4" />
              Admin / User
            </span>
          </button>
          <button
            onClick={() => handlePortalSwitch(PortalEnum.COMPANY)}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              portal === PortalEnum.COMPANY
                ? "bg-white/15 text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Building2 className="h-4 w-4" />
              Company Portal
            </span>
          </button>
        </div>

        {portal === PortalEnum.ADMIN && (
          <>
            {mode === ModeEnum.LOGIN && (
              <LoginForm
                onSuccess={handleSuccess}
                onSwitchToRegister={emailEnabled ? () => setMode(ModeEnum.REGISTER) : undefined}
                onForgotPassword={emailEnabled ? () => setMode(ModeEnum.RESET) : undefined}
              />
            )}
            {mode === ModeEnum.REGISTER && (
              <RegisterForm
                onSuccess={() => setMode(ModeEnum.LOGIN)}
                onSwitchToLogin={() => setMode(ModeEnum.LOGIN)}
              />
            )}
            {mode === ModeEnum.RESET && (
              <ResetPasswordForm
                onBack={() => setMode(ModeEnum.LOGIN)}
                onSuccess={() => setMode(ModeEnum.LOGIN)}
              />
            )}
          </>
        )}

        {portal === PortalEnum.COMPANY && (
          <CompanyLoginForm onSuccess={handleSuccess} />
        )}
        {!emailEnabled && <p dir="rtl" className="mt-5 text-center text-sm text-slate-200">لإنشاء حساب أو استعادة الوصول، تواصل مع إدارة شركتك.</p>}
        <p className="mt-4 text-center text-sm text-slate-200"><Link href="/privacy-policy" className="underline">الخصوصية · Confidentialité</Link></p>
      </div>
    </div>
  );
}

export function LoginPageClient({emailEnabled = false}: {emailEnabled?: boolean}) {
  return (
    <Suspense fallback={null}>
      <LoginPageContent emailEnabled={emailEnabled} />
    </Suspense>
  );
}
