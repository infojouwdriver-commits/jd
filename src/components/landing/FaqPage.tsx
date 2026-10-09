
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Car, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  items: FaqItem[];
}

const faqDataNl: FaqCategory[] = [
  {
    title: "Aan de slag",
    items: [
      {
        question: "Hoe registreer ik mijn taxibedrijf op JouwDriver?",
        answer:
          "Klik op 'Nu gratis starten' op de startpagina en volg het registratieproces. Na goedkeuring krijgt u toegang tot het volledige platform.",
      },
      {
        question: "Hoeveel kost het platform?",
        answer:
          "JouwDriver werkt met een abonnementsmodel op basis van uw behoeften. Neem contact op voor een gepersonaliseerde offerte.",
      },
    ],
  },
  {
    title: "Facturen & Betalingen",
    items: [
      {
        question: "Worden facturen automatisch aangemaakt?",
        answer:
          "Ja, zodra een rit wordt beëindigd, genereert het systeem automatisch een professionele factuur.",
      },
      {
        question: "Hoe verstuur ik facturen naar klanten?",
        answer:
          "Facturen kunnen automatisch per e-mail worden verstuurd of handmatig gedeeld via link.",
      },
    ],
  },
];

const faqDataFr: FaqCategory[] = [
  {
    title: "Démarrage",
    items: [
      {
        question: "Comment inscrire mon entreprise de taxi sur JouwDriver ?",
        answer:
          "Cliquez sur 'Commencer gratuitement' depuis la page d'accueil puis suivez les étapes d'inscription.",
      },
      {
        question: "Combien coûte la plateforme ?",
        answer:
          "JouwDriver fonctionne avec un modèle d'abonnement adapté à votre activité. Contactez-nous pour une offre personnalisée.",
      },
    ],
  },
  {
    title: "Factures & Paiements",
    items: [
      {
        question: "Les factures sont-elles créées automatiquement ?",
        answer:
          "Oui, dès qu'une course est terminée, le système génère automatiquement une facture professionnelle.",
      },
      {
        question: "Comment envoyer des factures aux clients ?",
        answer:
          "Les factures peuvent être envoyées automatiquement par e-mail ou partagées via un lien.",
      },
    ],
  },
];

const faqDataAr: FaqCategory[] = [
  {
    title: "البدء",
    items: [
      {
        question: "كيف أسجل شركة التاكسي الخاصة بي على JouwDriver؟",
        answer:
          "اضغط على زر البدء من الصفحة الرئيسية ثم أكمل خطوات التسجيل، وبعد الموافقة تحصل على وصول كامل للمنصة.",
      },
      {
        question: "ما تكلفة المنصة؟",
        answer:
          "المنصة تعمل بنظام اشتراك حسب احتياج شركتك. تواصل معنا للحصول على عرض مناسب.",
      },
    ],
  },
  {
    title: "الفواتير والمدفوعات",
    items: [
      {
        question: "هل يتم إنشاء الفواتير تلقائيًا؟",
        answer:
          "نعم، عند إنهاء الرحلة يتم إنشاء فاتورة احترافية تلقائيًا بجميع البيانات المطلوبة.",
      },
      {
        question: "كيف أرسل الفواتير للعملاء؟",
        answer:
          "يمكن إرسال الفواتير تلقائيًا عبر البريد الإلكتروني أو مشاركتها يدويًا عبر رابط.",
      },
    ],
  },
];

function FaqAccordionItem({ item, index }: { item: FaqItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border border-white/10 rounded-2xl overflow-hidden hover:border-yellow-400/30 transition-colors duration-300"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-white/3 hover:bg-white/5 transition-colors duration-200"
      >
        <span className="text-white font-semibold text-sm md:text-base pr-4">{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-yellow-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 pb-5 pt-2 text-white/60 text-sm leading-relaxed border-t border-white/5">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FaqPage() {
  const { language } = useLanguage();

  const faqData =
    language === "ar" ? faqDataAr : language === "fr" ? faqDataFr : faqDataNl;

  const title =
    language === "ar"
      ? "الأسئلة الشائعة"
      : language === "fr"
        ? "Questions Fréquentes"
        : "Veelgestelde Vragen";

  const subtitle =
    language === "ar"
      ? "اعثر على إجابات واضحة لأكثر الأسئلة شيوعًا حول JouwDriver"
      : language === "fr"
        ? "Trouvez des réponses aux questions les plus courantes sur JouwDriver"
        : "Vind antwoorden op de meest gestelde vragen over JouwDriver";

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
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <HelpCircle className="w-10 h-10 text-black" />
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
        <div className="max-w-4xl mx-auto space-y-12">
          {faqData.map((category, catIndex) => (
            <motion.div
              key={catIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: catIndex * 0.05 }}
            >
              <h2 className="text-xl font-black text-yellow-400 mb-5 flex items-center gap-2">
                <span className="w-1 h-6 bg-yellow-400 rounded-full inline-block" />
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <FaqAccordionItem key={itemIndex} item={item} index={itemIndex} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="py-8 border-t border-white/5 text-center">
        <p className="text-white/30 text-sm">{footerLabel}</p>
      </footer>
    </div>
  );
}
