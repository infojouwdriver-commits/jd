
"use client";

import { Car, MapPin, Clock, CheckCircle, Navigation, Smartphone, BarChart2 } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";
import FeatureDetailCard from "./FeatureDetailCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

interface PublicStats {
  activeDrivers: number;
  companies: number;
  completedTrips: number;
  airportTrips: number;
  nightTrips: number;
}

const contentNl = {
  cards: [
    { title: "Realtime GPS Tracking", desc: "Volg elke rit live op de kaart. Zie de exacte positie van uw chauffeurs op elk moment van de dag." },
    { title: "Automatische Ritregistratie", desc: "Elke rit wordt automatisch geregistreerd met start- en eindpunt, tijdstip, afstand en tarief." },
    { title: "Ritgeschiedenis", desc: "Bekijk de volledige geschiedenis van alle ritten per chauffeur, per voertuig of per periode." },
    { title: "Chiron Integratie", desc: "Directe synchronisatie met het Chiron-systeem van de Vlaamse overheid voor volledige compliance." },
    { title: "Mobiele App voor Chauffeurs", desc: "Chauffeurs beheren hun ritten via een eenvoudige mobiele interface — starten, stoppen en facturen genereren." },
    { title: "Ritstatistieken", desc: "Gedetailleerde statistieken per rit: duur, afstand, wachttijd, tarief en meer." },
  ],
  howTitle: "Hoe werkt ritbeheer?",
  steps: [
    { n: "1", t: "Rit starten", d: "De chauffeur opent de app, selecteert het voertuig en start de rit met één druk op de knop." },
    { n: "2", t: "Automatische registratie", d: "Het systeem registreert automatisch de GPS-route, de tijd en berekent het tarief op basis van de ingestelde prijzen." },
    { n: "3", t: "Rit beëindigen & factuur", d: "Bij het beëindigen van de rit wordt automatisch een factuur gegenereerd en verstuurd naar de klant." },
  ],
  statsTitle: "Live Statistieken",
  totalTrips: "Voltooide Ritten",
  airportTrips: "Luchthaven Ritten",
  nightTrips: "Nachtritten",
  activeDrivers: "Actieve Chauffeurs",
};

const contentFr = {
  cards: [
    { title: "Suivi GPS en Temps Réel", desc: "Suivez chaque course en direct sur la carte. Voyez la position exacte de vos chauffeurs à tout moment." },
    { title: "Enregistrement Automatique", desc: "Chaque course est automatiquement enregistrée avec le point de départ, d'arrivée, l'heure, la distance et le tarif." },
    { title: "Historique des Courses", desc: "Consultez l'historique complet de toutes les courses par chauffeur, par véhicule ou par période." },
    { title: "Intégration Chiron", desc: "Synchronisation directe avec le système Chiron du gouvernement flamand pour une conformité totale." },
    { title: "App Mobile pour Chauffeurs", desc: "Les chauffeurs gèrent leurs courses via une interface mobile simple — démarrer, arrêter et générer des factures." },
    { title: "Statistiques de Courses", desc: "Statistiques détaillées par course : durée, distance, temps d'attente, tarif et plus encore." },
  ],
  howTitle: "Comment fonctionne la gestion des courses ?",
  steps: [
    { n: "1", t: "Démarrer la course", d: "Le chauffeur ouvre l'app, sélectionne le véhicule et démarre la course en un seul clic." },
    { n: "2", t: "Enregistrement automatique", d: "Le système enregistre automatiquement la route GPS, le temps et calcule le tarif selon les prix configurés." },
    { n: "3", t: "Terminer & Facturer", d: "À la fin de la course, une facture est automatiquement générée et envoyée au client." },
  ],
  statsTitle: "Statistiques en Direct",
  totalTrips: "Courses Complétées",
  airportTrips: "Courses Aéroport",
  nightTrips: "Courses de Nuit",
  activeDrivers: "Chauffeurs Actifs",
};

const icons = [MapPin, Clock, CheckCircle, Navigation, Smartphone, BarChart2];

export default function TripManagementPage() {
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
      icon={Car}
      titleNl="Ritbeheer"
      titleFr="Gestion des Courses"
      subtitleNl="Volg en beheer alle taxiritten in realtime met nauwkeurige interactieve kaarten en automatische registratie."
      subtitleFr="Suivez et gérez toutes les courses de taxi en temps réel avec des cartes interactives précises et un enregistrement automatique."
      gradient="from-blue-500 to-blue-700"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
        {c.cards.map((card, i) => (
          <FeatureDetailCard key={i} icon={icons[i]} title={card.title} description={card.desc} delay={i * 0.08} />
        ))}
      </div>

      {/* Live Stats from DB */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {[
            { label: c.totalTrips, value: stats.completedTrips.toLocaleString(), color: "text-blue-400" },
            { label: c.airportTrips, value: stats.airportTrips.toLocaleString(), color: "text-yellow-400" },
            { label: c.nightTrips, value: stats.nightTrips.toLocaleString(), color: "text-purple-400" },
            { label: c.activeDrivers, value: stats.activeDrivers.toLocaleString(), color: "text-green-400" },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/5 text-center">
              <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-white/50 text-xs">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-8 rounded-3xl border border-white/10 bg-white/3"
      >
        <h2 className="text-2xl font-black text-white mb-8 text-center">{c.howTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {c.steps.map((step, i) => (
            <div key={i} className="text-center p-6 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-5xl font-black text-yellow-400/30 mb-3">{step.n}</div>
              <h3 className="text-white font-bold mb-2">{step.t}</h3>
              <p className="text-white/50 text-sm">{step.d}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </FeaturePageLayout>
  );
}
