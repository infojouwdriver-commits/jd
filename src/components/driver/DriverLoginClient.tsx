
"use client";

import React, { Suspense, useCallback, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { driverTranslations } from "@/locales/driver";
import { api } from "@/lib/api-client";

const LOGO_URL =
  "https://cdn.chat2db-ai.com/app/avatar/custom/16eda623-2b94-41ea-8390-395dcb708494_737955.png";

function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full p-1"
      style={{ background: "var(--dp-card-2)", border: "1px solid var(--dp-border)" }}
      role="group"
      aria-label="Language"
    >
      {(["nl", "fr", "ar"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          className="rounded-full px-2.5 py-1 text-[11px] font-bold transition-all"
          style={
            language === lang
              ? { background: "var(--dp-accent)", color: "#fff" }
              : { color: "var(--dp-text-soft)" }
          }
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function DriverGoogleLoginButton({
  onSuccess,
  onError,
  label,
  disabled,
}: {
  onSuccess: () => void;
  onError: (message: string) => void;
  label: string;
  disabled: boolean;
}) {
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    if (typeof window === "undefined" || disabled || isLoading) {
      return;
    }

    const windowWidth = 800;
    const windowHeight = 400;
    const url = `${process.env.NEXT_PUBLIC_ZOER_HOST}/auth/google/v1/login?fromUrl=${window.location.href}&appCode=${process.env.NEXT_PUBLIC_APP_CODE}`;
    const left = Math.floor((window.screen.width - windowWidth) / 2);
    const top = Math.floor((window.screen.height - windowHeight) / 2);

    const popupWindow = window.open(
      url,
      "_blank",
      `width=${windowWidth},height=${windowHeight},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popupWindow) {
      return;
    }

    let closedCheckTimer: number | null = null;

    const onMessage = async (event: MessageEvent) => {
      if (event.source !== popupWindow) {
        return;
      }

      const data = event.data || {};
      const messageType = data.type || data.event || "";

      if (messageType !== "zoer-google-login") {
        return;
      }

      setIsLoading(true);

      try {
        await googleLogin(data.access_token);
        onSuccess();
      } catch (error: any) {
        onError(error?.errorMessage || "Google login failed");
      } finally {
        cleanup();
      }
    };

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (closedCheckTimer) {
        window.clearInterval(closedCheckTimer);
        closedCheckTimer = null;
      }
      try {
        popupWindow.close();
      } catch {}
      setIsLoading(false);
    };

    window.addEventListener("message", onMessage);

    closedCheckTimer = window.setInterval(() => {
      if (popupWindow.closed) {
        cleanup();
      }
    }, 500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="dp-btn dp-btn-ghost"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="truncate">{label}</span>
        </>
      )}
    </button>
  );
}

function DriverLoginContent() {
  const { language } = useLanguage();
  const t = driverTranslations[language];
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = z.object({
    phone: z.string().min(8, t.phoneRequired),
    password: z.string().min(1, t.passwordRequired),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const handleRedirect = useCallback(() => {
    const redirectTo = searchParams.get("redirect") || "/driver/taximeter";
    router.replace(redirectTo);
  }, [router, searchParams]);

  React.useEffect(() => {
    if (!authLoading && user?.userType === "driver") {
      handleRedirect();
    }
  }, [authLoading, handleRedirect, user?.userType]);

  const onSubmit = async (data: LoginFormData) => {
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await api.post("/auth/driver-login", {
        phone: data.phone?.trim(),
        password: data.password,
      });

      await refreshUser();
      handleRedirect();
    } catch (err: any) {
      setError(err?.errorMessage || t.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = language === "ar";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="dp-root flex min-h-[100dvh] w-full flex-col overflow-x-hidden"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <header className="flex w-full items-center justify-end px-4 pb-2 pt-4">
        <LanguageToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-6">
        <div className="w-full" style={{ maxWidth: "420px" }}>
          <div className="mb-8 flex flex-col items-center text-center">
            <div
              className="mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl"
              style={{
                background: "var(--dp-card)",
                border: "1px solid var(--dp-border)",
                boxShadow: "var(--dp-shadow)",
              }}
            >
              <Image
                src={LOGO_URL}
                alt="Jouw Driver"
                width={80}
                height={80}
                className="h-full w-full object-contain p-1.5"
                priority
              />
            </div>
            <h1
              className="dp-text text-[28px] font-black leading-none tracking-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              JOUW DRIVER
            </h1>
            <p className="dp-text-soft mt-2 text-[13px] font-medium">Driver Portal</p>
          </div>

          <div className="dp-card" style={{ padding: "24px" }}>
            <DriverGoogleLoginButton
              label={t.continueWithGoogle}
              disabled={isLoading}
              onSuccess={handleRedirect}
              onError={(message) => setError(message || t.googleLoginError)}
            />

            <div className="my-5 flex items-center gap-3">
              <div className="dp-divider flex-1" />
              <span className="dp-text-soft text-[11px] font-semibold uppercase tracking-widest">
                {t.orContinueWith}
              </span>
              <div className="dp-divider flex-1" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {error && (
                <div
                  className="dp-fade-in flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
                  role="alert"
                  style={{
                    background: "var(--dp-danger-soft)",
                    border: "1px solid rgba(239,68,68,0.25)",
                  }}
                >
                  <div
                    className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ background: "var(--dp-danger)" }}
                  />
                  <p className="text-[13px] leading-snug" style={{ color: "var(--dp-danger)" }}>
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="phone" className="dp-text mb-2 block text-[12px] font-semibold">
                  {t.phoneNumber}
                </label>
                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2"
                    style={{
                      color: "var(--dp-text-soft)",
                      right: isRTL ? "16px" : "auto",
                      left: isRTL ? "auto" : "16px",
                    }}
                    aria-hidden="true"
                  />
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={t.phonePlaceholder}
                    disabled={isLoading}
                    {...register("phone")}
                    className="dp-input"
                    style={{
                      paddingRight: isRTL ? "48px" : "16px",
                      paddingLeft: isRTL ? "16px" : "48px",
                    }}
                  />
                </div>
                {errors.phone?.message && (
                  <p
                    className="mt-1.5 text-[12px]"
                    style={{ color: "var(--dp-danger)" }}
                    role="alert"
                  >
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="dp-text mb-2 block text-[12px] font-semibold">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2"
                    style={{
                      color: "var(--dp-text-soft)",
                      right: isRTL ? "16px" : "auto",
                      left: isRTL ? "auto" : "16px",
                    }}
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={t.passwordPlaceholder}
                    disabled={isLoading}
                    {...register("password")}
                    className="dp-input"
                    style={{
                      paddingRight: isRTL ? "48px" : "48px",
                      paddingLeft: isRTL ? "48px" : "48px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute top-1/2 -translate-y-1/2 p-1"
                    style={{
                      color: "var(--dp-text-soft)",
                      right: isRTL ? "auto" : "14px",
                      left: isRTL ? "14px" : "auto",
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password?.message && (
                  <p
                    className="mt-1.5 text-[12px]"
                    style={{ color: "var(--dp-danger)" }}
                    role="alert"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="dp-btn dp-btn-primary"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t.loggingIn}</span>
                  </>
                ) : (
                  <span>{t.loginButton}</span>
                )}
              </button>

              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  className="text-[13px] font-semibold transition-colors"
                  style={{ color: "var(--dp-accent)" }}
                  onClick={() => setError(t.loginNotice)}
                >
                  {language === "ar"
                    ? "هل نسيت كلمة المرور؟"
                    : language === "fr"
                      ? "Mot de passe oublié ?"
                      : "Wachtwoord vergeten?"}
                </button>
              </div>
            </form>
          </div>

          <div className="dp-text-soft mt-6 flex items-center justify-center gap-1.5 text-[12px]">
            <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="text-center">{t.loginNotice}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export function DriverLoginClient() {
  return (
    <Suspense
      fallback={
        <div
          className="dp-root flex min-h-[100dvh] w-full items-center justify-center"
        >
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: "var(--dp-accent)" }} />
        </div>
      }
    >
      <DriverLoginContent />
    </Suspense>
  );
}
