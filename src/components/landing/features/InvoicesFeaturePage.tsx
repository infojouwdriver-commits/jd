
"use client";

import { FileText, Send, PenLine, Archive, Link, RefreshCw, Clock, CheckCircle, Euro } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";
import FeatureDetailCard from "./FeatureDetailCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

interface PublicStats {
  invoicesCount: number;
  paidInvoices: number;
  totalRevenue: number;
  completedTrips: number;
}

const contentNl = {
  cards: [
    { title: "Automatische Aanmaak", desc: "Facturen worden automatisch aangemaakt bij het beëindigen van een rit, inclusief alle ritdetails." },
    { title: "Digitale Handtekening", desc: "Klanten kunnen contracten en facturen digitaal ondertekenen via een beveiligde link." },
    { title: "E-mail Verzending", desc: "Facturen worden automatisch per e-mail verstuurd naar de klant direct na de rit." },
    { title: "Deelbare Links", desc: "Genereer unieke links voor elke factuur die u kunt delen via WhatsApp, e-mail of SMS." },
    { title: "Archivering", desc: "Alle facturen worden veilig gearchiveerd en zijn altijd terug te vinden via de zoekfunctie." },
    { title: "Terugkerende Facturen", desc: "Stel automatische maandelijkse facturen in voor vaste klanten en bedrijfscontracten." },
  ],
  processTitle: "Facturatieproces",
  steps: [
    { n: "1", t: "Rit beëindigd", d: "Zodra de chauffeur de rit beëindigt, berekent het systeem automatisch het totaalbedrag." },
    { n: "2", t: "Factuur aangemaakt", d: "Een professionele factuur wordt gegenereerd met alle wettelijk verplichte gegevens." },
    { n: "3", t: "Verzonden & Gearchiveerd", d: "De factuur wordt per e-mail verstuurd en opgeslagen in het archief voor toekomstige referentie." },
  ],
  statsTitle: "Facturatie Overzicht",
  totalInvoices: "Totaal Facturen",
  paidInvoices: "Betaalde Facturen",
  totalRevenue: "Totale Omzet",
  tripsInvoiced: "Gefactureerde Ritten",
};

const contentFr = {
  cards: [
    { title: "Création Automatique", desc: "Les factures sont créées automatiquement à la fin d'une course, incluant tous les détails." },
    { title: "Signature Numérique", desc: "Les clients peuvent signer numériquement les contrats et factures via un lien sécurisé." },
    { title: "Envoi par E-mail", desc: "Les factures sont automatiquement envoyées par e-mail au client directement après la course." },
    { title: "Liens Partageables", desc: "Générez des liens uniques pour chaque facture à partager via WhatsApp, e-mail ou SMS." },
    { title: "Archivage", desc: "Toutes les factures sont archivées en toute sécurité et toujours retrouvables via la recherche." },
    { title: "Factures Récurrentes", desc: "Configurez des factures mensuelles automatiques pour les clients réguliers et les contrats d'entreprise." },
  ],
  processTitle: "Processus de Facturation",
  steps: [
    { n: "1", t: "Course terminée", d: "Dès que le chauffeur termine la course, le système calcule automatiquement le montant total." },
    { n: "2", t: "Facture créée", d: "Une facture professionnelle est générée avec toutes les données légalement requises." },
    { n: "3", t: "Envoyée & Archivée", d: "La facture est envoyée par e-mail et stockée dans l'archive pour référence future." },
  ],
  statsTitle: "Aperçu Facturation",
  totalInvoices: "Total Factures",
  paidInvoices: "Factures Payées",
  totalRevenue: "Revenus Totaux",
  tripsInvoiced: "Courses Facturées",
};

const icons = [RefreshCw, PenLine, Send, Link, Archive, Clock];

export default function InvoicesFeaturePage() {
  const { language } = useLanguage();
  const c = language === "fr" ? contentFr : contentNl;
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    api.get<PublicStats>("/public-stats")
      .then(setStats)
      .catch(() => null);
  }, []);

  return (
    <FeaturePageLayout
      icon={FileText}
      titleNl="Elektronische Facturen"
      titleFr="Factures Électroniques"
      subtitleNl="Automatisch facturen aanmaken en verzenden met ondersteuning voor digitale handtekening en archivering."
      subtitleFr="Créez et envoyez des factures automatiquement avec prise en charge de la signature numérique et de l'archivage."
      gradient="from-purple-500 to-violet-700"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
        {c.cards.map((card, i) => (
          <FeatureDetailCard key={i} icon={icons[i]} title={card.title} description={card.desc} delay={i * 0.08} />
        ))}
      </div>

      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 p-8 rounded-3xl border border-purple-400/20 bg-purple-400/5"
        >
          <h2 className="text-xl font-black text-purple-300 mb-6 text-center">{c.statsTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: c.totalInvoices, value: stats.invoicesCount.toLocaleString(), color: "text-purple-300" },
              { label: c.paidInvoices, value: stats.paidInvoices.toLocaleString(), color: "text-green-400" },
              { label: c.totalRevenue, value: `€${stats.totalRevenue.toLocaleString()}`, color: "text-yellow-400" },
              { label: c.tripsInvoiced, value: stats.completedTrips.toLocaleString(), color: "text-blue-400" },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 rounded-2xl border border-white/10 bg-black/20">
                <div className={`text-2xl font-black mb-1 ${item.color}`}>{item.value}</div>
                <div className="text-white/50 text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-8 rounded-3xl border border-white/10 bg-white/3"
      >
        <h2 className="text-2xl font-black text-white mb-8 text-center">{c.processTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {c.steps.map((step, i) => (
            <div key={i} className="text-center p-6 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-5xl font-black text-purple-400/30 mb-3">{step.n}</div>
              <h3 className="text-white font-bold mb-2">{step.t}</h3>
              <p className="text-white/50 text-sm">{step.d}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </FeaturePageLayout>
  );
}
