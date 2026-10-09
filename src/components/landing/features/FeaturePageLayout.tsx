
"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Car } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LucideIcon } from "lucide-react";

interface FeaturePageLayoutProps {
  icon: LucideIcon;
  titleNl: string;
  titleFr: string;
  titleAr?: string;
  subtitleNl: string;
  subtitleFr: string;
  subtitleAr?: string;
  gradient: string;
  children: React.ReactNode;
}

export default function FeaturePageLayout({
  icon: Icon,
  titleNl,
  titleFr,
  titleAr,
  subtitleNl,
  subtitleFr,
  subtitleAr,
  gradient,
  children,
}: FeaturePageLayoutProps) {
  const { language } = useLanguage();

  const title =
    language === "ar" ? titleAr || titleFr : language === "fr" ? titleFr : titleNl;

  const subtitle =
    language === "ar"
      ? subtitleAr || subtitleFr
      : language === "fr"
        ? subtitleFr
        : subtitleNl;

  const backLabel =
    language === "ar"
      ? "العودة إلى الصفحة الرئيسية"
      : language === "fr"
        ? "Retour à l'accueil"
        : "Terug naar startpagina";

  const footerLabel =
    language === "ar"
      ? "© 2025 JouwDriver. جميع الحقوق محفوظة."
      : language === "fr"
        ? "© 2025 JouwDriver. Tous droits réservés."
        : "© 2025 JouwDriver. Alle rechten voorbehouden.";

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #020817 0%, #050d1a 40%, #020817 100%)" }}
    >
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
              <Car className="w-5 h-5 text-black" />
            </div>
            <span className="text-white font-bold text-lg">
              Jouw<span className="text-yellow-400">Driver</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-yellow-400 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-6 shadow-2xl`}
          >
            <Icon className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-4"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>
      </section>

      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto">{children}</div>
      </section>

      <footer className="py-8 border-t border-white/5 text-center">
        <p className="text-white/30 text-sm">{footerLabel}</p>
      </footer>
    </div>
  );
}
