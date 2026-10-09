
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { landingTranslations } from "@/locales/landing";
import type { AppLanguage } from "@/contexts/LanguageContext";
import AnimatedLogo from "./AnimatedLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LandingNavProps {
  onLoginClick: () => void;
}

const LANG_OPTIONS: { value: AppLanguage; label: string }[] = [
  { value: "nl", label: "NL" },
  { value: "fr", label: "FR" },
  { value: "ar", label: "AR" },
];

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
      {LANG_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => setLanguage(option.value)}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-300 ${
            language === option.value
              ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/30"
              : "text-white/50 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function LandingNav({ onLoginClick }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { language } = useLanguage();
  const t = landingTranslations[language];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: t.navFeatures, href: "#features" },
    { label: t.navStats, href: "#stats" },
    { label: t.navHowItWorks, href: "#how-it-works" },
    { label: "FAQ", href: "/faq" },
  ];

  const isRtl = language === "ar";

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl"
          : "bg-transparent"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #D4AF37, #FFD700, #D4AF37, transparent)",
        }}
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <AnimatedLogo size="sm" showText={true} href="/" />

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) =>
              link.href.startsWith("#") ? (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className="relative text-white/70 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 group"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i + 0.3 }}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-yellow-400 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ) : (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i + 0.3 }}
                >
                  <Link
                    href={link.href}
                    className="relative text-white/70 hover:text-yellow-400 text-sm font-medium transition-colors duration-200 group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-yellow-400 group-hover:w-full transition-all duration-300" />
                  </Link>
                </motion.div>
              )
            )}
          </div>

          <motion.div
            className="hidden md:flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <LanguageSwitcher />

            {/* زر تبديل الوضع الليلي/النهاري */}
            <div className="[&_button]:border-white/20 [&_button]:hover:bg-white/10 [&_button_svg]:text-white/70">
              <ThemeToggle />
            </div>

            <Link href="/driver-login">
              <button className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
                {t.navDriverLogin}
              </button>
            </Link>
            <motion.button
              onClick={onLoginClick}
              className="relative px-5 py-2 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-all duration-200 shadow-lg shadow-yellow-500/20 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <span className="relative">{t.navLogin}</span>
            </motion.button>
          </motion.div>

          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4 border-t border-white/10 mt-2 pt-4 space-y-3 overflow-hidden"
            >
              {navLinks.map((link) =>
                link.href.startsWith("#") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block text-white/70 hover:text-yellow-400 text-sm font-medium py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-white/70 hover:text-yellow-400 text-sm font-medium py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <div className="[&_button]:border-white/20 [&_button]:hover:bg-white/10 [&_button_svg]:text-white/70">
                    <ThemeToggle />
                  </div>
                </div>
                <Link href="/driver-login">
                  <button className="w-full px-4 py-2 text-sm text-white/70 border border-white/20 rounded-xl hover:bg-white/10 transition-colors">
                    {t.navDriverLogin}
                  </button>
                </Link>
                <button
                  onClick={() => {
                    onLoginClick();
                    setMenuOpen(false);
                  }}
                  className="w-full px-5 py-2 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-yellow-400 to-amber-500"
                >
                  {t.navLogin}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
