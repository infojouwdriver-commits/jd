
"use client";

import { Shield, Lock, Key, Eye, AlertTriangle, CheckCircle, RefreshCw, UserCheck } from "lucide-react";
import FeaturePageLayout from "./FeaturePageLayout";
import FeatureDetailCard from "./FeatureDetailCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const contentNl = {
  cards: [
    { title: "JWT Authenticatie", desc: "Veilige aanmelding via JSON Web Tokens met automatische vernieuwing en verloopdatum." },
    { title: "Rolgebaseerde Toegang", desc: "Drie niveaus: Admin, Bedrijfsmanager en Chauffeur — elk met eigen rechten en beperkingen." },
    { title: "Gehaste wachtwoorden", desc: "Nieuwe wachtwoorden worden met bcrypt gehasht. Verouderde accounts moeten worden gemigreerd." },
    { title: "Sessiebeveiliging", desc: "HttpOnly cookies, tokenverval en sessie-intrekking bij uitloggen of wachtwoordwijziging." },
    { title: "Beveiligingscontrole", desc: "Beveiligingstests en een implementatierapport. Volledige onveranderbare auditlogging moet nog worden ingericht." },
    { title: "Privacyfuncties", desc: "Ondersteuning voor gegevensrechten en privacyinstellingen. Organisatorische en juridische validatie blijft nodig." },
  ],
  levelsTitle: "Toegangsniveaus",
  levels: [
    { role: "Admin", color: "text-red-400", desc: "Volledige toegang tot alle functies, gebruikers, bedrijven en systeeminstellingen." },
    { role: "Manager", color: "text-yellow-400", desc: "Beheer van chauffeurs, voertuigen, ritten en rapporten binnen het eigen bedrijf." },
    { role: "Chauffeur", color: "text-blue-400", desc: "Toegang tot eigen ritten, facturen en persoonlijk profiel. Geen toegang tot bedrijfsdata." },
  ],
};

const contentFr = {
  cards: [
    { title: "Authentification JWT", desc: "Connexion sécurisée via JSON Web Tokens avec renouvellement automatique et date d'expiration." },
    { title: "Accès Basé sur les Rôles", desc: "Trois niveaux : Admin, Gestionnaire d'entreprise et Chauffeur — chacun avec ses propres droits." },
    { title: "Mots de passe hachés", desc: "Les nouveaux mots de passe sont hachés avec bcrypt. Les anciens comptes nécessitent une migration." },
    { title: "Sécurité des Sessions", desc: "Cookies HttpOnly, expiration des jetons et révocation lors de la déconnexion ou du changement de mot de passe." },
    { title: "Contrôles de sécurité", desc: "Tests de sécurité et rapport technique. Une piste d’audit complète et immuable reste à mettre en place." },
    { title: "Fonctions de confidentialité", desc: "Gestion des demandes et paramètres de confidentialité. La conformité nécessite une validation juridique et organisationnelle." },
  ],
  levelsTitle: "Niveaux d'Accès",
  levels: [
    { role: "Admin", color: "text-red-400", desc: "Accès complet à toutes les fonctions, utilisateurs, entreprises et paramètres système." },
    { role: "Gestionnaire", color: "text-yellow-400", desc: "Gestion des chauffeurs, véhicules, courses et rapports au sein de sa propre entreprise." },
    { role: "Chauffeur", color: "text-blue-400", desc: "Accès à ses propres courses, factures et profil personnel. Pas d'accès aux données d'entreprise." },
  ],
};

const icons = [Lock, Key, Eye, AlertTriangle, CheckCircle, RefreshCw];

export default function SecurityPage() {
  const { language } = useLanguage();
  const c = language === "fr" ? contentFr : contentNl;

  return (
    <FeaturePageLayout
      icon={Shield}
      titleNl="Hoge Beveiliging"
      titleFr="Haute Sécurité"
      subtitleNl="Meerlaags authenticatiesysteem dat de bescherming van uw bedrijfs- en chauffeurgegevens garandeert."
      subtitleFr="Système d'authentification multicouche garantissant la protection des données de votre entreprise et de vos chauffeurs."
      gradient="from-green-500 to-emerald-700"
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
        <h2 className="text-2xl font-black text-white mb-6 text-center">{c.levelsTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {c.levels.map((level, i) => (
            <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/5 text-center">
              <UserCheck className={`w-8 h-8 mx-auto mb-3 ${level.color}`} />
              <h3 className={`font-black text-lg mb-2 ${level.color}`}>{level.role}</h3>
              <p className="text-white/50 text-sm">{level.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </FeaturePageLayout>
  );
}
