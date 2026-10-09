
"use client";

import { BarChart3, TrendingUp, Calendar, Download, PieChart, DollarSign, Users, FileText } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";
import FeatureDetailCard from "./FeatureDetailCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

interface PublicStats {
  completedTrips: number;
  invoicesCount: number;
  totalRevenue: number;
  paidInvoices: number;
  companies: number;
}

const contentNl = {
  cards: [
    { title: "Dagelijkse Omzetrapport", desc: "Bekijk de dagelijkse omzet per chauffeur en per voertuig met gedetailleerde uitsplitsing." },
    { title: "Maandelijkse Statistieken", desc: "Maandoverzichten met totale ritten, omzet, gemiddelde ritduur en klanttevredenheid." },
    { title: "Chauffeursprestaties", desc: "Vergelijk de prestaties van uw chauffeurs op basis van ritten, omzet en beoordelingen." },
    { title: "PDF Export", desc: "Exporteer elk rapport als PDF voor boekhouding, belastingaangifte of interne rapportage." },
    { title: "Kostenanalyse", desc: "Volg bedrijfskosten en vergelijk ze met de omzet voor een volledig financieel overzicht." },
    { title: "Aangepaste Periodes", desc: "Genereer rapporten voor elke gewenste periode: dag, week, maand of aangepast datumbereik." },
  ],
  infoTitle: "Waarom geavanceerde rapporten?",
  infoDesc: "Met JouwDriver heeft u altijd een volledig beeld van uw bedrijfsprestaties. Neem betere beslissingen op basis van echte data.",
  liveTitle: "Platform Overzicht",
  totalTrips: "Voltooide Ritten",
  totalInvoices: "Totaal Facturen",
  totalRevenue: "Totale Omzet (€)",
  paidInvoices: "Betaalde Facturen",
  companies: "Actieve Bedrijven",
};

const contentFr = {
  cards: [
    { title: "Rapport de Revenus Quotidiens", desc: "Consultez les revenus quotidiens par chauffeur et par véhicule avec une ventilation détaillée." },
    { title: "Statistiques Mensuelles", desc: "Aperçus mensuels avec le total des courses, revenus, durée moyenne et satisfaction client." },
    { title: "Performances des Chauffeurs", desc: "Comparez les performances de vos chauffeurs en fonction des courses, revenus et évaluations." },
    { title: "Export PDF", desc: "Exportez chaque rapport en PDF pour la comptabilité, la déclaration fiscale ou le reporting interne." },
    { title: "Analyse des Coûts", desc: "Suivez les coûts d'exploitation et comparez-les aux revenus pour un aperçu financier complet." },
    { title: "Périodes Personnalisées", desc: "Générez des rapports pour toute période souhaitée : jour, semaine, mois ou plage de dates personnalisée." },
  ],
  infoTitle: "Pourquoi des rapports avancés ?",
  infoDesc: "Avec JouwDriver, vous avez toujours une vue complète des performances de votre entreprise. Prenez de meilleures décisions basées sur des données réelles.",
  liveTitle: "Aperçu de la Plateforme",
  totalTrips: "Courses Complétées",
  totalInvoices: "Total Factures",
  totalRevenue: "Revenus Totaux (€)",
  paidInvoices: "Factures Payées",
  companies: "Entreprises Actives",
};

const icons = [DollarSign, Calendar, Users, Download, PieChart, FileText];

export default function ReportsPage() {
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
      icon={BarChart3}
      titleNl="Geavanceerde Rapporten"
      titleFr="Rapports Avancés"
      subtitleNl="Uitgebreide statistieken en rapporten voor dagelijkse en maandelijkse prestatie- en omzetopvolging."
      subtitleFr="Statistiques et rapports complets pour suivre les performances et les revenus quotidiens et mensuels."
      gradient="from-yellow-500 to-amber-600"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
        {c.cards.map((card, i) => (
          <FeatureDetailCard key={i} icon={icons[i]} title={card.title} description={card.desc} delay={i * 0.08} />
        ))}
      </div>

      {/* Live platform stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 p-8 rounded-3xl border border-yellow-400/20 bg-yellow-400/5"
        >
          <h2 className="text-xl font-black text-yellow-400 mb-6 text-center">{c.liveTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: c.totalTrips, value: stats.completedTrips.toLocaleString() },
              { label: c.totalInvoices, value: stats.invoicesCount.toLocaleString() },
              { label: c.totalRevenue, value: `€${stats.totalRevenue.toLocaleString()}` },
              { label: c.paidInvoices, value: stats.paidInvoices.toLocaleString() },
              { label: c.companies, value: stats.companies.toLocaleString() },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 rounded-2xl border border-yellow-400/10 bg-black/20">
                <div className="text-2xl font-black text-yellow-400 mb-1">{item.value}</div>
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
        className="p-8 rounded-3xl border border-yellow-400/20 bg-yellow-400/5 text-center"
      >
        <TrendingUp className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white mb-3">{c.infoTitle}</h2>
        <p className="text-white/60 max-w-xl mx-auto">{c.infoDesc}</p>
      </motion.div>
    </FeaturePageLayout>
  );
}
