
"use client";

import {sanitizeHtml} from "@/lib/sanitize-html";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone } from "lucide-react";
import FloatingCard from "./FloatingCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { landingTranslations } from "@/locales/landing";

interface HomepageAdSlot {
  id: number;
  title: string;
  html_content: string;
  display_order: number;
}

function DefaultPromoBlock({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500/10 via-transparent to-blue-500/10 p-8 md:p-10 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-yellow-300 text-sm font-semibold mb-6">
        <Megaphone className="w-4 h-4" />
        <span>{title}</span>
      </div>
      <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
        JouwDriver Promotion Space
      </h3>
      <p className="text-white/70 max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
}

export default function HomepageAdSlotSection() {
  const [adSlots, setAdSlots] = useState<HomepageAdSlot[]>([]);
  const { language } = useLanguage();
  const t = landingTranslations[language];

  useEffect(() => {
    const fetchAdSlots = async () => {
      try {
        const res = await fetch("/next_api/homepage-ad-slots?slot_key=home_mid_banner");
        const json = await res.json();
        if (json?.success && Array.isArray(json?.data)) {
          setAdSlots(json.data);
        }
      } catch (error) {
        console.error("Operation failed");
      }
    };

    fetchAdSlots();
  }, []);

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4">
        <FloatingCard>
          {adSlots?.length === 0 ? (
            <DefaultPromoBlock
              title={t.adSpaceTitle}
              subtitle={t.adSpaceSubtitle}
            />
          ) : (
            <div className="space-y-5">
              {adSlots.map((slot, index) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6 shadow-xl"
                >
                  <div
                    className="prose prose-invert max-w-none [&_a]:text-yellow-300 [&_a]:underline hover:[&_a]:text-yellow-200"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(slot?.html_content || "") }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </FloatingCard>
      </div>
    </section>
  );
}
