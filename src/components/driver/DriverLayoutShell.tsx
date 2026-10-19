
"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import DriverSplashScreen from "@/components/DriverSplashScreen";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import VehicleSelectionModal from "@/components/VehicleSelectionModal";
import { api } from "@/lib/api-client";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { driverTranslations } from "@/locales/driver";
import {
  Bell,
  FileText,
  Loader2,
  LogOut,
  MapPin,
  MessageSquare,
  BarChart3,
  User,
  TestTube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DriverFleetShift from "@/components/driver/DriverFleetShift";

const LOGO_URL =
  "https://cdn.chat2db-ai.com/app/avatar/custom/16eda623-2b94-41ea-8390-395dcb708494_737955.png";

interface DriverInfo {
  driver: {
    id: number;
    full_name: string;
    phone: string;
    status: string;
    company_id: number;
  };
  company: {
    id: number;
    name: string;
    chiron_mode: string;
  };
}

interface VehicleData {
  vehicles: Array<{
    id: number;
    brand: string;
    model: string;
    plate_number: string;
  }>;
  current_vehicle_id: number | null;
  driver_id: number;
}

function TabItem({
  href,
  icon: Icon,
  label,
  isActive,
  badge,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  badge?: number;
}) {
  return (
    <Link href={href} className="dp-tab-item" data-active={isActive} aria-current={isActive ? 'page' : undefined}>
      <div className="relative">
        <Icon
          className="h-[22px] w-[22px]"
          strokeWidth={isActive ? 2.4 : 1.8}
          aria-hidden="true"
        />
        {badge !== undefined && badge > 0 && (
          <span
            className="absolute -right-2 -top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
            style={{ background: "var(--dp-danger)" }}
          >
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className="dp-tab-label">{label}</span>
    </Link>
  );
}

function DriverLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const t = driverTranslations[language];
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [loadingDriver, setLoadingDriver] = useState(true);
  const [driverError, setDriverError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [showVehicleSelection, setShowVehicleSelection] = useState(false);
  const [vehicleCheckDone, setVehicleCheckDone] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/driver-login");
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    const loadDriverInfo = async () => {
      if (!user) {
        return;
      }

      setLoadingDriver(true);
      setDriverError(false);
      try {
        const info = await api.get<DriverInfo>("/drivers/me");
        setDriverInfo(info);
      } catch (error) {
        setDriverError(true);
      } finally {
        setLoadingDriver(false);
      }
    };

    if (user) {
      loadDriverInfo();
    }
  }, [user, reloadKey]);

  useEffect(() => {
    const checkVehicleSelection = async () => {
      if (!user || showSplash || vehicleCheckDone) {
        return;
      }

      try {
        const data = await api.get<VehicleData>("/drivers/vehicles");

        if (data?.vehicles?.length > 1 && !data?.current_vehicle_id) {
          setShowVehicleSelection(true);
        } else if (data?.vehicles?.length === 1 && !data?.current_vehicle_id) {
          await api.put("/drivers/vehicles", { vehicle_id: data.vehicles[0]?.id });
        }
      } catch (error) {
        console.error("Operation failed");
      } finally {
        setVehicleCheckDone(true);
      }
    };

    checkVehicleSelection();
  }, [showSplash, user, vehicleCheckDone]);

  const loadUnreadCounts = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const [notifications, messages] = await Promise.all([
        api.get<any[]>("/notifications/driver"),
        api.get<any[]>("/messages/driver"),
      ]);

      setUnreadNotifications(
        notifications?.filter((item) => !item?.is_read)?.length || 0
      );
      setUnreadMessages(messages?.filter((item) => !item?.is_read)?.length || 0);
    } catch (error) {
      console.error("Operation failed");
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    loadUnreadCounts();
    const interval = setInterval(loadUnreadCounts, 60000);

    return () => clearInterval(interval);
  }, [loadUnreadCounts, user]);

  const isReady = !isLoading && (!user || !loadingDriver);

  if (showSplash) {
    return (
      <DriverSplashScreen
        isReady={isReady}
        onComplete={() => setShowSplash(false)}
      />
    );
  }

  if (user && driverError) {
    return <div className="dp-root flex min-h-[100dvh] flex-col items-center justify-center gap-4 p-6 text-center" role="alert"><p>{language === 'ar' ? 'تعذّر تحميل حساب السائق. تحقق من الاتصال وأعد المحاولة.' : language === 'fr' ? 'Impossible de charger votre profil. Vérifiez votre connexion.' : 'Profiel laden mislukt. Controleer uw verbinding.'}</p><button type="button" className="dp-accent-bg rounded-xl px-6 py-3" onClick={() => setReloadKey(key => key + 1)}>{language === 'ar' ? 'إعادة المحاولة' : language === 'fr' ? 'Réessayer' : 'Opnieuw proberen'}</button><button type="button" onClick={logout}>{t.logout}</button></div>;
  }

  if (!user || !driverInfo) {
    return (
      <div className="dp-root flex items-center justify-center" style={{ minHeight: "100dvh" }}>
        <Loader2 className="h-9 w-9 animate-spin" style={{ color: "var(--dp-accent)" }} />
      </div>
    );
  }

  const mainTabs = [
    {
      href: "/driver/taximeter",
      icon: MapPin,
      label:
        language === "ar" ? "الرئيسية" : language === "fr" ? "Accueil" : "Home",
    },
    { href: "/driver/trips", icon: FileText, label: t.trips },
    {
      href: "/driver/summary",
      icon: BarChart3,
      label:
        language === "ar" ? "الأرباح" : language === "fr" ? "Revenus" : "Earnings",
    },
    { href: "/driver/profile", icon: User, label: t.profile },
  ];

  return (
    <div className="dp-root">
      {showVehicleSelection && (
        <VehicleSelectionModal
          language={language}
          onVehicleSelected={() => setShowVehicleSelection(false)}
        />
      )}

      <header
        className="dp-app-header"
        style={{
          paddingTop: "max(10px, env(safe-area-inset-top))",
        }}
      >
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/driver/profile"
              className="flex min-w-0 flex-1 items-center gap-3 transition-opacity active:opacity-70"
              aria-label={t.myProfile}
            >
              <div className="dp-surface-2 relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={LOGO_URL}
                  alt="Jouw Driver"
                  fill
                  className="object-contain p-0.5"
                  priority
                />
              </div>
              <div className="min-w-0">
                <h1 className="dp-text truncate text-[14px] font-bold tracking-tight">
                  {driverInfo?.driver?.full_name}
                </h1>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ background: "var(--dp-success)" }}
                  />
                  <p className="dp-text-soft truncate text-[11px]">
                    {driverInfo?.company?.name}
                  </p>
                </div>
              </div>
            </Link>

            <div className="flex flex-shrink-0 items-center gap-1.5">
              <div
                className="dp-surface-2 flex gap-0.5 rounded-xl p-0.5"
                role="group"
                aria-label="Language"
              >
                {(["nl", "fr", "ar"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className="rounded-lg px-2 py-1 text-[10.5px] font-bold transition-all"
                    style={
                      language === lang
                        ? { background: "var(--dp-text)", color: "var(--dp-bg)" }
                        : { color: "var(--dp-text-muted)" }
                    }
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <ThemeToggle />

              <button
                type="button"
                onClick={logout}
                className="dp-surface-2 flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                title={t.logout}
                aria-label={t.logout}
              >
                <LogOut className="h-4 w-4" style={{ color: "var(--dp-danger)" }} />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/driver/messages"
              className="dp-surface-2 dp-text flex flex-1 items-center justify-between rounded-xl px-3 py-2 text-[12px] font-semibold"
              style={{ minHeight: "auto" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                {t.messages}
              </span>
              {unreadMessages > 0 && (
                <span
                  className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ background: "var(--dp-danger)" }}
                >
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>

            <Link
              href="/driver/notifications"
              className="dp-surface-2 dp-text flex flex-1 items-center justify-between rounded-xl px-3 py-2 text-[12px] font-semibold"
              style={{ minHeight: "auto" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5" />
                {t.notifications}
              </span>
              {unreadNotifications > 0 && (
                <span
                  className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ background: "var(--dp-danger)" }}
                >
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>

            <Link
              href="/driver/test"
              className="dp-surface-2 dp-text flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold"
              style={{ minHeight: "auto" }}
            >
              <TestTube className="h-3.5 w-3.5" />
              <span>{t.test}</span>
            </Link>
          </div>
        </div>
        <Link href="/driver/shifts" className="dp-surface-2 dp-text mx-4 mb-2 block rounded-xl px-3 py-3 text-sm font-semibold">{language === "ar" ? "كشف الوردية" : language === "fr" ? "Feuille de service" : "Dienststaat"}</Link>
        <DriverFleetShift language={language} />
      </header>

      <main className="dp-content-with-tabbar dp-fade-in">{children}</main>

      <nav
        className="dp-tab-bar flex items-stretch"
        role="navigation"
        aria-label="Main navigation"
      >
        {mainTabs.map((tab) => (
          <TabItem
            key={tab.href}
            href={tab.href}
            icon={tab.icon}
            label={tab.label}
            isActive={pathname === tab.href}
          />
        ))}
      </nav>

      <PWAInstallPrompt />
    </div>
  );
}

export function DriverLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <DriverLayoutContent>{children}</DriverLayoutContent>
    </LanguageProvider>
  );
}
