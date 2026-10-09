
"use client";

import { Bell, Smartphone, Mail, AlertCircle, CheckCircle, Clock, Settings, Users } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";
import FeatureDetailCard from "./FeatureDetailCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const contentNl = {
  cards: [
    { title: "Push Meldingen", desc: "Ontvang directe pushmeldingen op uw smartphone voor nieuwe ritten, betalingen en updates." },
    { title: "E-mail Notificaties", desc: "Automatische e-mailmeldingen voor facturen, contracten en belangrijke systeemgebeurtenissen." },
    { title: "Ritstatusmelding", desc: "Chauffeurs en managers worden automatisch op de hoogte gesteld bij elke statuswijziging van een rit." },
    { title: "Betalingsalerts", desc: "Directe melding bij ontvangst van betalingen of bij achterstallige facturen." },
    { title: "Systeemwaarschuwingen", desc: "Proactieve waarschuwingen bij technische problemen, synchronisatiefouten of Chiron-verbindingsproblemen." },
    { title: "Aanpasbare Instellingen", desc: "Stel zelf in welke meldingen u wilt ontvangen en via welk kanaal: app, e-mail of beide." },
  ],
  typesTitle: "Soorten Meldingen",
  types: [
    { icon: "🚕", label: "Rit gestart", color: "border-blue-400/30 bg-blue-400/5" },
    { icon: "✅", label: "Rit voltooid", color: "border-green-400/30 bg-green-400/5" },
    { icon: "💶", label: "Betaling ontvangen", color: "border-yellow-400/30 bg-yellow-400/5" },
    { icon: "📄", label: "Factuur verstuurd", color: "border-purple-400/30 bg-purple-400/5" },
    { icon: "⚠️", label: "Synchronisatiefout", color: "border-red-400/30 bg-red-400/5" },
    { icon: "👤", label: "Nieuwe chauffeur", color: "border-cyan-400/30 bg-cyan-400/5" },
  ],
};

const contentFr = {
  cards: [
    { title: "Notifications Push", desc: "Recevez des notifications push instantanées sur votre smartphone pour les nouvelles courses, paiements et mises à jour." },
    { title: "Notifications E-mail", desc: "Notifications e-mail automatiques pour les factures, contrats et événements système importants." },
    { title: "Statut de Course", desc: "Les chauffeurs et managers sont automatiquement informés à chaque changement de statut d'une course." },
    { title: "Alertes de Paiement", desc: "Notification immédiate lors de la réception de paiements ou en cas de factures en retard." },
    { title: "Alertes Système", desc: "Avertissements proactifs en cas de problèmes techniques, erreurs de synchronisation ou problèmes de connexion Chiron." },
    { title: "Paramètres Personnalisables", desc: "Définissez vous-même quelles notifications vous souhaitez recevoir et via quel canal : app, e-mail ou les deux." },
  ],
  typesTitle: "Types de Notifications",
  types: [
    { icon: "🚕", label: "Course démarrée", color: "border-blue-400/30 bg-blue-400/5" },
    { icon: "✅", label: "Course terminée", color: "border-green-400/30 bg-green-400/5" },
    { icon: "💶", label: "Paiement reçu", color: "border-yellow-400/30 bg-yellow-400/5" },
    { icon: "📄", label: "Facture envoyée", color: "border-purple-400/30 bg-purple-400/5" },
    { icon: "⚠️", label: "Erreur de sync", color: "border-red-400/30 bg-red-400/5" },
    { icon: "👤", label: "Nouveau chauffeur", color: "border-cyan-400/30 bg-cyan-400/5" },
  ],
};

const icons = [Smartphone, Mail, AlertCircle, CheckCircle, Clock, Settings];

export default function NotificationsPage() {
  const { language } = useLanguage();
  const c = language === "fr" ? contentFr : contentNl;

  return (
    <FeaturePageLayout
      icon={Bell}
      titleNl="Directe Meldingen"
      titleFr="Notifications Instantanées"
      subtitleNl="Slim meldingssysteem dat chauffeurs en managers altijd op de hoogte houdt van alles wat er gebeurt."
      subtitleFr="Système de notifications intelligent qui tient toujours les chauffeurs et les managers informés."
      gradient="from-orange-500 to-red-600"
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
        <h2 className="text-2xl font-black text-white mb-6 text-center">{c.typesTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {c.types.map((type, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${type.color} text-center`}>
              <div className="text-3xl mb-2">{type.icon}</div>
              <p className="text-white/70 text-sm font-medium">{type.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </FeaturePageLayout>
  );
}
