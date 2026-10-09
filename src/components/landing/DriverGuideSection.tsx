
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  Car,
  Navigation,
  CheckCircle,
  FileText,
  BarChart3,
  MessageSquare,
  Bell,
  ChevronRight,
  ChevronLeft,
  BookOpen,
} from "lucide-react";
import FloatingCard from "./FloatingCard";

type GuideLanguage = "nl" | "fr" | "ar";

interface GuideStep {
  id: number;
  icon: React.ElementType;
  imageUrl: string;
  titleNl: string;
  titleFr: string;
  titleAr: string;
  descNl: string;
  descFr: string;
  descAr: string;
  stepsNl: string[];
  stepsFr: string[];
  stepsAr: string[];
}

const guideSteps: GuideStep[] = [
  {
    id: 1,
    icon: LogIn,
    imageUrl: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800&q=80",
    titleNl: "Inloggen",
    titleFr: "Connexion",
    titleAr: "تسجيل الدخول",
    descNl: "Log in met uw telefoonnummer en wachtwoord om toegang te krijgen tot het chauffeurportaal.",
    descFr: "Connectez-vous avec votre numéro de téléphone et mot de passe pour accéder au portail chauffeur.",
    descAr: "سجّل دخولك برقم هاتفك وكلمة المرور للوصول إلى بوابة السائق.",
    stepsNl: [
      "Ga naar /driver-login",
      "Vul uw telefoonnummer in",
      "Vul uw wachtwoord in",
      "Klik op Inloggen",
      "U wordt doorgestuurd naar het taximeter-scherm",
    ],
    stepsFr: [
      "Accédez à /driver-login",
      "Entrez votre numéro de téléphone",
      "Entrez votre mot de passe",
      "Cliquez sur Se connecter",
      "Vous serez redirigé vers l'écran taximètre",
    ],
    stepsAr: [
      "افتح صفحة /driver-login",
      "أدخل رقم هاتفك",
      "أدخل كلمة المرور",
      "اضغط على زر تسجيل الدخول",
      "سيتم توجيهك تلقائياً إلى شاشة العداد",
    ],
  },
  {
    id: 2,
    icon: Car,
    imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
    titleNl: "Rit starten",
    titleFr: "Démarrer un trajet",
    titleAr: "بدء رحلة جديدة",
    descNl: "Kies het rittype en vul de benodigde gegevens in om een nieuwe rit te starten.",
    descFr: "Choisissez le type de trajet et remplissez les informations nécessaires pour démarrer.",
    descAr: "اختر نوع الرحلة وأدخل البيانات المطلوبة لبدء رحلة جديدة.",
    stepsNl: [
      "Kies rittype: INTERNAL, BOLT, UBER of HEETCH",
      "Vul startadres en bestemming in (voor INTERNAL)",
      "Voeg passagiersnaam toe (optioneel)",
      "Kies betaalmethode",
      "Klik op Prijs berekenen en start de rit",
    ],
    stepsFr: [
      "Choisissez le type: INTERNAL, BOLT, UBER ou HEETCH",
      "Entrez l'adresse de départ et d'arrivée (pour INTERNAL)",
      "Ajoutez le nom du passager (optionnel)",
      "Choisissez le mode de paiement",
      "Cliquez sur Calculer le prix puis Démarrer",
    ],
    stepsAr: [
      "اختر نوع الرحلة: INTERNAL أو BOLT أو UBER أو HEETCH",
      "أدخل عنوان البداية والوجهة (للرحلات الداخلية)",
      "أضف اسم الراكب (اختياري)",
      "اختر طريقة الدفع",
      "اضغط حساب السعر ثم بدء الرحلة",
    ],
  },
  {
    id: 3,
    icon: Navigation,
    imageUrl: "https://images.unsplash.com/photo-1476973422084-e0fa66ff9456?w=800&q=80",
    titleNl: "Tijdens de rit",
    titleFr: "Pendant le trajet",
    titleAr: "أثناء الرحلة",
    descNl: "Volg de actieve rit in realtime en gebruik navigatie via Waze of Google Maps.",
    descFr: "Suivez le trajet actif en temps réel et utilisez la navigation via Waze ou Google Maps.",
    descAr: "تابع الرحلة النشطة في الوقت الفعلي واستخدم الملاحة عبر Waze أو Google Maps.",
    stepsNl: [
      "De actieve rit wordt live weergegeven",
      "Afstand en duur worden bijgewerkt (INTERNAL)",
      "Gebruik Waze of Google Maps voor navigatie",
      "Klik op Rit beëindigen wanneer u aankomt",
    ],
    stepsFr: [
      "Le trajet actif est affiché en direct",
      "Distance et durée sont mises à jour (INTERNAL)",
      "Utilisez Waze ou Google Maps pour naviguer",
      "Cliquez sur Fin du trajet à l'arrivée",
    ],
    stepsAr: [
      "تظهر الرحلة النشطة بشكل مباشر على الشاشة",
      "يتم تحديث المسافة والمدة تلقائياً (للرحلات الداخلية)",
      "استخدم Waze أو Google Maps للملاحة",
      "اضغط إنهاء الرحلة عند الوصول",
    ],
  },
  {
    id: 4,
    icon: CheckCircle,
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    titleNl: "Rit afronden",
    titleFr: "Terminer le trajet",
    titleAr: "إنهاء الرحلة",
    descNl: "Voer de eindprijs in en bevestig de rit om deze op te slaan en te synchroniseren.",
    descFr: "Entrez le prix final et confirmez le trajet pour l'enregistrer et le synchroniser.",
    descAr: "أدخل السعر النهائي وأكّد الرحلة لحفظها ومزامنتها.",
    stepsNl: [
      "Klik op Rit beëindigen",
      "Voer de eindprijs in",
      "Bevestig de verzending",
      "Online: direct gesynchroniseerd",
      "Offline: lokaal opgeslagen voor later",
    ],
    stepsFr: [
      "Cliquez sur Fin du trajet",
      "Entrez le prix final",
      "Confirmez l'envoi",
      "En ligne: synchronisation immédiate",
      "Hors ligne: sauvegarde locale temporaire",
    ],
    stepsAr: [
      "اضغط زر إنهاء الرحلة",
      "أدخل السعر النهائي",
      "أكّد الإرسال",
      "عند توفر الإنترنت: يُرسل فوراً",
      "بدون إنترنت: يُحفظ محلياً مؤقتاً",
    ],
  },
  {
    id: 5,
    icon: FileText,
    imageUrl: "https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=800&q=80",
    titleNl: "Factuur genereren",
    titleFr: "Générer une facture",
    titleAr: "إصدار الفاتورة",
    descNl: "Genereer automatisch een PDF-factuur na het afronden van een rit.",
    descFr: "Générez automatiquement une facture PDF après la fin d'un trajet.",
    descAr: "أصدر فاتورة PDF تلقائياً بعد إنهاء الرحلة بنجاح.",
    stepsNl: [
      "Ga naar /driver/trips",
      "Zoek de gewenste rit",
      "Klik op Generate Invoice",
      "PDF wordt automatisch gedownload",
    ],
    stepsFr: [
      "Accédez à /driver/trips",
      "Trouvez le trajet souhaité",
      "Cliquez sur Generate Invoice",
      "Le PDF est téléchargé automatiquement",
    ],
    stepsAr: [
      "افتح صفحة /driver/trips",
      "ابحث عن الرحلة المطلوبة",
      "اضغط Generate Invoice",
      "يتم تنزيل ملف PDF تلقائياً",
    ],
  },
  {
    id: 6,
    icon: BarChart3,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    titleNl: "Samenvatting & Rapporten",
    titleFr: "Résumé & Rapports",
    titleAr: "الملخص والتقارير",
    descNl: "Bekijk gedetailleerde statistieken en download rapporten voor elke gewenste periode.",
    descFr: "Consultez des statistiques détaillées et téléchargez des rapports pour chaque période.",
    descAr: "اطّلع على إحصائيات مفصّلة وحمّل التقارير لأي فترة زمنية.",
    stepsNl: [
      "Ga naar /driver/summary",
      "Kies de gewenste periode (dag/week/maand/jaar)",
      "Bekijk omzet, afstand en rittenstatistieken",
      "Download het PDF-rapport",
    ],
    stepsFr: [
      "Accédez à /driver/summary",
      "Choisissez la période (jour/semaine/mois/an)",
      "Consultez revenus, distance et statistiques",
      "Téléchargez le rapport PDF",
    ],
    stepsAr: [
      "افتح صفحة /driver/summary",
      "اختر الفترة الزمنية (يومي/أسبوعي/شهري/سنوي)",
      "راجع الإيرادات والمسافة وعدد الرحلات",
      "حمّل تقرير PDF",
    ],
  },
  {
    id: 7,
    icon: MessageSquare,
    imageUrl: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&q=80",
    titleNl: "Berichten",
    titleFr: "Messages",
    titleAr: "الرسائل",
    descNl: "Communiceer met het beheer via het berichtensysteem.",
    descFr: "Communiquez avec la direction via le système de messagerie.",
    descAr: "تواصل مع الإدارة عبر نظام الرسائل.",
    stepsNl: [
      "Ga naar /driver/messages",
      "Lees berichten van het beheer",
      "Open een gesprek en antwoord",
      "Maak een nieuw bericht aan",
    ],
    stepsFr: [
      "Accédez à /driver/messages",
      "Lisez les messages de la direction",
      "Ouvrez une conversation et répondez",
      "Créez un nouveau message",
    ],
    stepsAr: [
      "افتح صفحة /driver/messages",
      "اقرأ رسائل الإدارة",
      "افتح المحادثة وردّ عليها",
      "أنشئ رسالة جديدة للإدارة",
    ],
  },
  {
    id: 8,
    icon: Bell,
    imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
    titleNl: "Meldingen",
    titleFr: "Notifications",
    titleAr: "الإشعارات",
    descNl: "Blijf op de hoogte van alle updates via het meldingensysteem.",
    descFr: "Restez informé de toutes les mises à jour via le système de notifications.",
    descAr: "ابقَ على اطّلاع بجميع التحديثات عبر نظام الإشعارات.",
    stepsNl: [
      "Ga naar /driver/notifications",
      "Bekijk meldingen per type en prioriteit",
      "Klik op een melding om als gelezen te markeren",
      "Teller toont ongelezen meldingen",
    ],
    stepsFr: [
      "Accédez à /driver/notifications",
      "Consultez les notifications par type et priorité",
      "Cliquez pour marquer comme lu",
      "Le compteur affiche les non-lus",
    ],
    stepsAr: [
      "افتح صفحة /driver/notifications",
      "اعرض الإشعارات حسب النوع والأولوية",
      "اضغط على الإشعار لتمييزه كمقروء",
      "يعرض العدّاد الإشعارات غير المقروءة",
    ],
  },
];

const langLabels: Record<GuideLanguage, string> = { nl: "NL", fr: "FR", ar: "AR" };

function getTitle(step: GuideStep, lang: GuideLanguage) {
  return lang === "nl" ? step.titleNl : lang === "fr" ? step.titleFr : step.titleAr;
}

function getDesc(step: GuideStep, lang: GuideLanguage) {
  return lang === "nl" ? step.descNl : lang === "fr" ? step.descFr : step.descAr;
}

function getSteps(step: GuideStep, lang: GuideLanguage) {
  return lang === "nl" ? step.stepsNl : lang === "fr" ? step.stepsFr : step.stepsAr;
}

const sectionTitles: Record<GuideLanguage, { badge: string; title1: string; title2: string; subtitle: string }> = {
  nl: {
    badge: "Chauffeur Handleiding",
    title1: "Hoe gebruik je het",
    title2: "Chauffeurportaal?",
    subtitle: "Een stap-voor-stap visuele gids voor chauffeurs — beschikbaar in NL, FR en AR",
  },
  fr: {
    badge: "Guide Chauffeur",
    title1: "Comment utiliser le",
    title2: "Portail Chauffeur ?",
    subtitle: "Un guide visuel étape par étape pour les chauffeurs — disponible en NL, FR et AR",
  },
  ar: {
    badge: "دليل السائق",
    title1: "كيف تستخدم",
    title2: "بوابة السائق؟",
    subtitle: "دليل مرئي خطوة بخطوة للسائقين — متاح بالهولندية والفرنسية والعربية",
  },
};

export default function DriverGuideSection() {
  const [activeLang, setActiveLang] = useState<GuideLanguage>("nl");
  const [activeStep, setActiveStep] = useState(0);

  const t = sectionTitles[activeLang];
  const isRtl = activeLang === "ar";
  const current = guideSteps[activeStep];

  const handlePrev = () => setActiveStep((p) => Math.max(0, p - 1));
  const handleNext = () => setActiveStep((p) => Math.min(guideSteps.length - 1, p + 1));

  return (
    <section id="driver-guide" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/3 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <FloatingCard className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-400/20 bg-yellow-400/5 text-yellow-400 text-sm mb-6">
            <BookOpen className="w-4 h-4" />
            <span>{t.badge}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            {t.title1}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
              {" "}{t.title2}
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">{t.subtitle}</p>

          {/* Language Switcher */}
          <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl border border-white/10 bg-white/5">
            {(["nl", "fr", "ar"] as GuideLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeLang === lang
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/30"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {langLabels[lang]}
              </button>
            ))}
          </div>
        </FloatingCard>

        {/* Step Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {guideSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  activeStep === i
                    ? "bg-yellow-400/15 border border-yellow-400/40 text-yellow-400"
                    : "border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{getTitle(step, activeLang)}</span>
                <span className="sm:hidden">{step.id}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeStep}-${activeLang}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            dir={isRtl ? "rtl" : "ltr"}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            {/* Image */}
            <div className={isRtl ? "lg:order-2" : "lg:order-1"}>
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 group">
                <img
                  src={current.imageUrl}
                  alt={getTitle(current, activeLang)}
                  className="w-full h-72 lg:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <current.icon className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <p className="text-yellow-400/80 text-xs font-mono">
                      {isRtl
                        ? `خطوة ${current.id} من ${guideSteps.length}`
                        : activeLang === "fr"
                        ? `Étape ${current.id} sur ${guideSteps.length}`
                        : `Stap ${current.id} van ${guideSteps.length}`}
                    </p>
                    <p className="text-white font-bold text-lg leading-tight">
                      {getTitle(current, activeLang)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 flex gap-1.5">
                {guideSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeStep
                        ? "bg-yellow-400 flex-[3]"
                        : i < activeStep
                        ? "bg-yellow-400/40 flex-1"
                        : "bg-white/10 flex-1"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className={`space-y-6 ${isRtl ? "lg:order-1" : "lg:order-2"}`}>
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                  {getTitle(current, activeLang)}
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {getDesc(current, activeLang)}
                </p>
              </div>

              <div className="space-y-3">
                {getSteps(current, activeLang).map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/8 hover:border-yellow-400/20 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-400/20 to-amber-500/10 border border-yellow-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-yellow-400 text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">{step}</p>
                  </motion.div>
                ))}
              </div>

              {/* Navigation */}
              <div className={`flex gap-3 pt-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                <button
                  onClick={handlePrev}
                  disabled={activeStep === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  {isRtl ? "السابق" : activeLang === "fr" ? "Précédent" : "Vorige"}
                </button>
                <button
                  onClick={handleNext}
                  disabled={activeStep === guideSteps.length - 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isRtl ? "التالي" : activeLang === "fr" ? "Suivant" : "Volgende"}
                  {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quick Tips */}
        <FloatingCard delay={0.2} className="mt-16">
          <div
            className="p-8 rounded-2xl border border-yellow-400/15"
            style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(5,10,20,0.9) 100%)" }}
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold">
                {activeLang === "nl" ? "Snelle tips" : activeLang === "fr" ? "Conseils rapides" : "نصائح سريعة"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(activeLang === "nl"
                ? [
                    "Zorg dat GPS is ingeschakeld voor nauwkeurige rittracking",
                    "Installeer de app als PWA voor snellere toegang",
                    "Controleer uw internetverbinding voor het starten van een rit",
                    "Wis browsercache als u problemen heeft met inloggen",
                  ]
                : activeLang === "fr"
                ? [
                    "Assurez-vous que le GPS est activé pour un suivi précis",
                    "Installez l'app en PWA pour un accès plus rapide",
                    "Vérifiez votre connexion Internet avant de démarrer",
                    "Videz le cache du navigateur en cas de problème de connexion",
                  ]
                : [
                    "تأكد من تفعيل GPS لتتبع الرحلات بدقة",
                    "ثبّت التطبيق كـ PWA للوصول السريع",
                    "تحقق من اتصال الإنترنت قبل بدء الرحلة",
                    "امسح ذاكرة التخزين المؤقت إذا واجهت مشكلة في تسجيل الدخول",
                  ]
              ).map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white/60 text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </FloatingCard>
      </div>
    </section>
  );
}
