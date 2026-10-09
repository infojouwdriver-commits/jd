
"use client";

import { Users, Building2, UserCheck, BarChart2, Shield, Globe, Settings, Layers } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";
import FeatureDetailCard from "./FeatureDetailCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const contentNl = {
  cards: [
    { title: "Chauffeurbeheer", desc: "Voeg chauffeurs toe, beheer hun profielen, voertuigen, licenties en prestaties vanuit één dashboard." },
    { title: "Bedrijfsbeheer", desc: "Beheer meerdere taxibedrijven tegelijk met aparte instellingen, prijzen en rapporten per bedrijf." },
    { title: "Distributeurnetwerk", desc: "Distributeurs kunnen meerdere bedrijven beheren en toewijzen via een speciaal distributeursdashboard." },
    { title: "Goedkeuringsworkflow", desc: "Nieuwe chauffeurs doorlopen een goedkeuringsproces met documentverificatie voor ze actief worden." },
    { title: "Rolbeheer", desc: "Wijs rollen toe aan teamleden: Admin, Manager of Chauffeur — elk met aangepaste rechten." },
    { title: "Activiteitenlog", desc: "Volg alle activiteiten van uw team: aanmeldingen, ritwijzigingen, factuuracties en meer." },
  ],
  structureTitle: "Organisatiestructuur",
  levels: [
    { icon: "👑", role: "Admin", desc: "Beheert het volledige platform, alle bedrijven en gebruikers.", color: "border-yellow-400/30" },
    { icon: "🏢", role: "Distributeur", desc: "Beheert een groep van taxibedrijven en hun chauffeurs.", color: "border-blue-400/30" },
    { icon: "🚖", role: "Bedrijfsmanager", desc: "Beheert zijn eigen bedrijf, chauffeurs en voertuigen.", color: "border-green-400/30" },
    { icon: "🚗", role: "Chauffeur", desc: "Voert ritten uit en beheert zijn eigen profiel en facturen.", color: "border-white/20" },
  ],
};

const contentFr = {
  cards: [
    { title: "Gestion des Chauffeurs", desc: "Ajoutez des chauffeurs, gérez leurs profils, véhicules, licences et performances depuis un seul tableau de bord." },
    { title: "Gestion des Entreprises", desc: "Gérez plusieurs entreprises de taxi simultanément avec des paramètres, tarifs et rapports séparés par entreprise." },
    { title: "Réseau de Distributeurs", desc: "Les distributeurs peuvent gérer et attribuer plusieurs entreprises via un tableau de bord distributeur dédié." },
    { title: "Workflow d'Approbation", desc: "Les nouveaux chauffeurs passent par un processus d'approbation avec vérification des documents avant d'être actifs." },
    { title: "Gestion des Rôles", desc: "Attribuez des rôles aux membres de l'équipe : Admin, Gestionnaire ou Chauffeur — chacun avec des droits personnalisés." },
    { title: "Journal d'Activité", desc: "Suivez toutes les activités de votre équipe : connexions, modifications de courses, actions de facturation et plus." },
  ],
  structureTitle: "Structure Organisationnelle",
  levels: [
    { icon: "👑", role: "Admin", desc: "Gère l'ensemble de la plateforme, toutes les entreprises et utilisateurs.", color: "border-yellow-400/30" },
    { icon: "🏢", role: "Distributeur", desc: "Gère un groupe d'entreprises de taxi et leurs chauffeurs.", color: "border-blue-400/30" },
    { icon: "🚖", role: "Gestionnaire", desc: "Gère sa propre entreprise, ses chauffeurs et véhicules.", color: "border-green-400/30" },
    { icon: "🚗", role: "Chauffeur", desc: "Effectue des courses et gère son propre profil et factures.", color: "border-white/20" },
  ],
};

const icons = [UserCheck, Building2, Globe, Shield, Settings, BarChart2];

export default function TeamManagementPage() {
  const { language } = useLanguage();
  const c = language === "fr" ? contentFr : contentNl;

  return (
    <FeaturePageLayout
      icon={Users}
      titleNl="Teambeheer"
      titleFr="Gestion d'Équipe"
      subtitleNl="Beheer chauffeurs, bedrijven en distributeurs vanuit één unified en gebruiksvriendelijk dashboard."
      subtitleFr="Gérez les chauffeurs, les entreprises et les distributeurs depuis un tableau de bord unifié et facile à utiliser."
      gradient="from-cyan-500 to-sky-700"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
        {c.cards.map((card, i) => (
          <FeatureDetailCard key={i} icon={icons[i]} title={card.title} description={card.desc} delay={i * 0.08} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-8 rounded-3xl border border-white/10 bg-white/3"
      >
        <h2 className="text-2xl font-black text-white mb-6 text-center">{c.structureTitle}</h2>
        <div className="space-y-3 max-w-2xl mx-auto">
          {c.levels.map((level, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 p-4 rounded-2xl border ${level.color} bg-white/3`}
              style={{ marginLeft: `${i * 20}px` }}
            >
              <span className="text-2xl">{level.icon}</span>
              <div>
                <h3 className="text-white font-bold">{level.role}</h3>
                <p className="text-white/50 text-sm">{level.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </FeaturePageLayout>
  );
}
