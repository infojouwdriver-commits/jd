
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Shield,
  Zap,
  BarChart3,
  Users,
  FileText,
  Bell,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  MapPin,
  Car,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { landingTranslations } from "@/locales/landing";
import HeroCanvas from "./HeroCanvas";
import FloatingCard from "./FloatingCard";
import FeatureCard from "./FeatureCard";
import StatCounter from "./StatCounter";
import LoginModal from "./LoginModal";
import LandingNav from "./LandingNav";
import DriverGuideSection from "./DriverGuideSection";
import AnimatedLogo from "./AnimatedLogo";
import HomepageAdSlotSection from "./HomepageAdSlotSection";

interface PlatformStats {
  activeDrivers: number;
  companies: number;
  completedTrips: number;
  satisfactionRate: number;
}

const POLL_INTERVAL_MS = 30000;
const WHATSAPP_NUMBER = "32465555596";

interface PricingPlan {
  name: string;
  description: string;
  price: string;
  message: string;
}

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [stats, setStats] = useState<PlatformStats>({
    activeDrivers: 0,
    companies: 0,
    completedTrips: 0,
    satisfactionRate: 99,
  });

  const { user } = useAuth();
  const router = useRouter();
  const { scrollY } = useScroll();
  const { language } = useLanguage();
  const t = landingTranslations[language];

  const heroY = useTransform(scrollY, [0, 600], [0, 180]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/next_api/stats");
      const json = await res.json();
      if (json?.success && json?.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Operation failed");
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStats]);

  useEffect(() => {
    if (user) {
      if (user.userType === "distributor") {
        router.push("/distributor/dashboard");
      } else if (user.userType === "driver") {
        router.push("/driver/taximeter");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, router]);

  const features = [
    {
      icon: Car,
      title: t.feature1Title,
      description: t.feature1Desc,
      gradient: "from-blue-500/20 to-blue-600/5",
      href: "/features/trip-management",
    },
    {
      icon: BarChart3,
      title: t.feature2Title,
      description: t.feature2Desc,
      gradient: "from-yellow-500/20 to-amber-600/5",
      href: "/features/reports",
    },
    {
      icon: Shield,
      title: t.feature3Title,
      description: t.feature3Desc,
      gradient: "from-green-500/20 to-emerald-600/5",
      href: "/features/security",
    },
    {
      icon: FileText,
      title: t.feature4Title,
      description: t.feature4Desc,
      gradient: "from-purple-500/20 to-violet-600/5",
      href: "/features/invoices",
    },
    {
      icon: Bell,
      title: t.feature5Title,
      description: t.feature5Desc,
      gradient: "from-orange-500/20 to-red-600/5",
      href: "/features/notifications",
    },
    {
      icon: Users,
      title: t.feature6Title,
      description: t.feature6Desc,
      gradient: "from-cyan-500/20 to-sky-600/5",
      href: "/features/team-management",
    },
  ];

  const pricingPlans: PricingPlan[] = [
    {
      name: t.pricingPlan1Name,
      description: t.pricingPlan1Desc,
      price: t.pricingPlan1Price,
      message:
        "Hello JouwDriver, I want the monthly subscription: 1 vehicle + 1 driver (€49.99).",
    },
    {
      name: t.pricingPlan2Name,
      description: t.pricingPlan2Desc,
      price: t.pricingPlan2Price,
      message:
        "Hello JouwDriver, I want the monthly subscription: 2 vehicles + 2 drivers (€89.99).",
    },
    {
      name: t.pricingPlan3Name,
      description: t.pricingPlan3Desc,
      price: t.pricingPlan3Price,
      message:
        "Hello JouwDriver, I want the monthly subscription: 3rd vehicle or 3rd driver (€119.99).",
    },
  ];

  const openWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const steps = [
    { number: t.step1Number, title: t.step1Title, description: t.step1Desc },
    { number: t.step2Number, title: t.step2Title, description: t.step2Desc },
    { number: t.step3Number, title: t.step3Title, description: t.step3Desc },
  ];

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: "linear-gradient(180deg, #020817 0%, #050d1a 40%, #020817 100%)",
      }}
    >
      <LandingNav onLoginClick={() => setLoginOpen(true)} />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroCanvas />

        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
            style={{ background: "radial-gradient(circle, #38bdf8, transparent)" }}
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-10"
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute rounded-full border border-yellow-400/10"
                style={{ width: 160, height: 160 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {[0, 180].map((deg, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300/50"
                    style={{
                      top: "50%",
                      left: "50%",
                      transformOrigin: "0 80px",
                      transform: `rotate(${deg}deg) translateY(-80px) translate(-50%,-50%)`,
                    }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.4, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 1 }}
                  />
                ))}
              </motion.div>

              <motion.div
                className="absolute rounded-full border border-blue-400/15"
                style={{ width: 120, height: 120 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              >
                {[0, 120, 240].map((deg, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-blue-400/60"
                    style={{
                      top: "50%",
                      left: "50%",
                      transformOrigin: "0 60px",
                      transform: `rotate(${deg}deg) translateY(-60px) translate(-50%,-50%)`,
                    }}
                    animate={{ opacity: [0.2, 0.9, 0.2] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6 }}
                  />
                ))}
              </motion.div>

              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 88,
                  height: 88,
                  background:
                    "conic-gradient(from 0deg, #D4AF37, #FFD700, transparent, #D4AF37)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />

              <motion.div
                className="absolute rounded-full"
                style={{ width: 84, height: 84 }}
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(212,175,55,0.3), 0 0 30px rgba(212,175,55,0.1)",
                    "0 0 35px rgba(212,175,55,0.7), 0 0 70px rgba(212,175,55,0.3)",
                    "0 0 15px rgba(212,175,55,0.3), 0 0 30px rgba(212,175,55,0.1)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />

              <div
                className="absolute rounded-full"
                style={{
                  width: 80,
                  height: 80,
                  background: "linear-gradient(135deg, #0a0f1e, #050d1a)",
                  border: "1px solid rgba(212,175,55,0.2)",
                }}
              />

              <motion.div
                className="relative z-10 rounded-full overflow-hidden flex items-center justify-center"
                style={{ width: 72, height: 72 }}
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="absolute left-0 right-0 h-px z-20 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(212,175,55,0.9), transparent)",
                  }}
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <img
                  src="https://cdn.chat2db-ai.com/app/avatar/custom/7347d0be-473d-488e-83d8-d3186ec96765_737955.png"
                  alt="JouwDriver"
                  className="w-14 h-14 object-contain"
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-1 mb-8"
          >
            <span className="text-2xl font-black text-white tracking-tight">Jouw</span>
            <motion.span
              className="text-2xl font-black text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(90deg, #D4AF37, #FFD700, #FFA500, #D4AF37)",
                backgroundSize: "200% 100%",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              Driver
            </motion.span>
            <motion.span
              className="ml-2 text-xs font-mono text-yellow-400/40 tracking-widest self-end mb-0.5"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              TAXI PLATFORM
            </motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 text-sm font-medium mb-8"
          >
            <Star className="w-4 h-4" />
            <span>{t.heroBadge}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="text-5xl md:text-7xl font-black text-white leading-tight mb-6"
          >
            {t.heroTitle1}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300">
              {t.heroTitle2}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => setLoginOpen(true)}
              className="group relative flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-all duration-300 shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/50 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.5 }}
              />
              <span className="relative">{t.heroCta}</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white border border-white/20 hover:border-yellow-400/40 hover:bg-white/5 transition-all duration-300"
            >
              {t.heroExplore}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-14"
          >
            {[
              { icon: Shield, text: t.heroBadge1 },
              { icon: Globe, text: t.heroBadge2 },
              { icon: Zap, text: t.heroBadge3 },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-white/40 text-sm">
                <badge.icon className="w-4 h-4 text-yellow-400/60" />
                <span>{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2"
          >
            <div className="w-1 h-3 rounded-full bg-yellow-400/60" />
          </motion.div>
        </motion.div>
      </section>

      <HomepageAdSlotSection />

      <section id="stats" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5" />
        <div className="max-w-5xl mx-auto px-4">
          <FloatingCard className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10 rounded-3xl border border-white/10 bg-white/3 backdrop-blur-sm">
            <StatCounter value={stats.activeDrivers} suffix="+" label={t.statDrivers} delay={0} />
            <StatCounter value={stats.companies} suffix="+" label={t.statCompanies} delay={0.1} />
            <StatCounter value={stats.completedTrips} suffix="+" label={t.statTrips} delay={0.2} />
            <StatCounter
              value={stats.satisfactionRate}
              suffix="%"
              label={t.statSatisfaction}
              delay={0.3}
            />
          </FloatingCard>
        </div>
      </section>

      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <FloatingCard className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-400/20 bg-yellow-400/5 text-yellow-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              <span>{t.featuresBadge}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              {t.featuresTitle1}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                {" "}
                {t.featuresTitle2}
              </span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">{t.featuresSubtitle}</p>
          </FloatingCard>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4">
          <FloatingCard className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-400/20 bg-yellow-400/5 text-yellow-400 text-sm mb-6">
              <MessageCircle className="w-4 h-4" />
              <span>{t.pricingBadge}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              {t.pricingTitle1}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                {" "}
                {t.pricingTitle2}
              </span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">{t.pricingSubtitle}</p>
          </FloatingCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <FloatingCard key={plan.name} delay={index * 0.1}>
                <div className="h-full p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-yellow-400/40 transition-all duration-300 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/60 mb-5">{plan.description}</p>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300 mb-7">
                    {plan.price}
                  </div>
                  <button
                    onClick={() => openWhatsApp(plan.message)}
                    className="mt-auto w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-all duration-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t.pricingCta}</span>
                  </button>
                </div>
              </FloatingCard>
            ))}
          </div>

          <FloatingCard delay={0.2} className="mt-8">
            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5 text-center text-yellow-200/90">
              {t.pricingMore}
            </div>
          </FloatingCard>
        </div>
      </section>

      <section id="how-it-works" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/3 to-transparent" />
        <div className="max-w-5xl mx-auto px-4">
          <FloatingCard className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              {t.howTitle1}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                {" "}
                {t.howTitle2}
              </span>
            </h2>
            <p className="text-white/50 text-lg">{t.howSubtitle}</p>
          </FloatingCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <FloatingCard key={i} delay={i * 0.15}>
                <div className="relative p-8 rounded-2xl border border-white/10 bg-white/3 text-center group hover:border-yellow-400/30 transition-all duration-300">
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400/30 to-amber-300/10 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-yellow-400/30">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      <DriverGuideSection />

      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FloatingCard>
            <div
              className="relative p-12 md:p-16 rounded-3xl overflow-hidden border border-yellow-400/20"
              style={{
                background:
                  "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(5,10,20,0.9) 50%, rgba(212,175,55,0.05) 100%)",
              }}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">{t.ctaTitle}</h2>
                <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">{t.ctaSubtitle}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.button
                    onClick={() => setLoginOpen(true)}
                    className="group relative flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-all duration-300 shadow-2xl shadow-yellow-500/30 overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                    />
                    <span className="relative">{t.ctaButton}</span>
                    <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                  {[t.ctaBenefit1, t.ctaBenefit2, t.ctaBenefit3].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/40 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400/60" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FloatingCard>
        </div>
      </section>

      <footer className="py-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <AnimatedLogo size="sm" showText={true} href="/" />

          <p className="text-white/30 text-sm">{t.footerRights}</p>

          <div className="flex items-center gap-6">
            <a href="/faq" className="text-white/40 hover:text-yellow-400 text-sm transition-colors">
              FAQ
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-yellow-400/40" />
              <span className="text-white/30 text-sm">{t.footerLocation}</span>
            </div>
          </div>
        </div>
      </footer>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => setLoginOpen(false)}
      />
    </div>
  );
}
