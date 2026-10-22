"use client";
import "./platform.css";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Car,
  Check,
  FileText,
  Gauge,
  MapPin,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import CompanyRegistrationDialog from "@/components/registration/CompanyRegistrationDialog";
import { registrationCopy } from "@/components/registration/copy";
import { onboardingMarketingCopy } from "./onboarding-copy";
import CookiePreferencesButton from "@/components/gdpr/CookiePreferencesButton";
import { portalHref, registrationHandoff } from "@/lib/portal-origin";

const configuredPortal = process.env.NEXT_PUBLIC_PORTAL_ORIGIN;

const translations = {
  ar: {
    title: "من الرحلة إلى إدارة شركتك.",
    accent: "منصة واحدة.",
    intro:
      "السائق على الطريق. الشركة أمام الصورة الكاملة. والإدارة تربط التفاصيل. مساحة تجمع أدوات العمل، من العداد إلى الرحلات والعقود والفواتير.",
    discover: "اكتشف المنصة",
    quote: "اطلب عرضاً",
    nav: ["التجربة", "لمن المنصة؟", "القدرات", "التكاملات"],
    demo: "عرض توضيحي · بيانات تجريبية",
    meter: "العداد",
    distance: "المسافة",
    duration: "المدة",
    time: "18 دقيقة",
    company: "نظرة الشركة",
    trip: "رحلة",
    story: "رحلة واحدة. تفاصيل مترابطة.",
    storyIntro:
      "استكشف تسلسل العمل المقترح. هذا العرض لا ينفّذ رحلة أو يصدر فاتورة حقيقية.",
    steps: ["بدء الرحلة", "إنهاء الرحلة", "مراجعة الشركة", "الفاتورة"],
    stepText: [
      "السائق يبدأ العداد ويراجع بيانات الرحلة من هاتفه.",
      "تُراجع تفاصيل الرحلة قبل حفظها.",
      "تظهر الرحلة ضمن سجلات الشركة للمراجعة.",
      "تُراجع بيانات الفوترة من مساحة الإدارة.",
    ],
    audience: "على الطريق. في الشركة. في الإدارة.",
    roles: ["السائق", "شركة التاكسي", "الإدارة"],
    roleText: [
      "أدوات يومك قريبة منك: العداد، سجل الرحلات، المركبة والرسائل.",
      "نظّم فريقك ومركباتك، راجع رحلات شركتك واضبط الأسعار.",
      "أدر الشركات والحسابات والأسعار، وراجع العقود والفواتير.",
    ],
    roleItems: [
      ["العداد والرحلات", "الملف والمركبة", "رسائل الإدارة"],
      ["السائقون والمركبات", "رحلات الشركة", "إعدادات التسعير"],
      ["الشركات والحسابات", "العقود والفواتير", "إدارة الصلاحيات"],
    ],
    enter: ["دخول السائق", "دخول الشركة", "دخول الإدارة"],
    tools: "يوم العمل، من زاوية أوسع.",
    toolsIntro:
      "كل أداة لها مكانها. المسارات المقترحة متاحة الآن في عداد السائق؛ تتبع الأسطول الموسّع ما زال قيد التجهيز.",
    features: [
      ["العداد", "واجهة للسائق أثناء الرحلة."],
      ["الرحلات", "سجل واضح للتفاصيل والمراجعة."],
      ["الفريق والمركبات", "تنظيم السائقين ومركبات الشركة."],
      ["الرسائل", "تواصل داخل مساحة العمل."],
      ["العقود", "مستندات اشتراك ومعاينة للطباعة."],
      ["الفواتير", "مراجعة مستندات وبيانات الفوترة."],
    ],
    integrations: "التكامل يحتاج أكثر من شعار.",
    integrationIntro:
      "نميّز بين وجود الإعدادات وبين اتصال فعلي تم قبوله لدى المزود.",
    pending: "قيد التجهيز",
    chiron:
      "إعدادات ومراجعة مزامنة موجودة. قبول التشغيل الإنتاجي غير مثبت بعد.",
    external: "المنصات الخارجية",
    externalText:
      "إدارة إعدادات وعقود المنصات لا تعني اعتماداً أو اتصالاً نشطاً.",
    email: "البريد",
    emailText:
      "كود الإرسال والتحقق جاهز. تفعيل المزود والتحقق من التسليم الفعلي لم يكتمل.",
    subscription: "اشتراك يناسب طريقة عملك.",
    pricing:
      "نحدد الخدمات المطلوبة قبل تقديم عرض الاشتراك. الأسعار وتفاصيل الباقات لم تُعتمد للنشر بعد.",
    needs: [
      "احتياجات السائقين",
      "حجم الشركة وإدارة الفريق",
      "العقود والخدمات المطلوبة",
    ],
    contact: "لنبدأ من احتياجاتك.",
    contactText: "للحسابات الحالية، تواصل مع إدارتك عبر الرسائل داخل البوابة.",
    notice:
      "قناة طلب العروض العامة لم تُفعّل بعد. لا يُرسل هذا القسم طلباً ولا يجمع بياناتك.",
    account: "لديك حساب بالفعل؟",
    privacy: "الخصوصية",
    footer: "منصة لأدوات السائق وإدارة شركات النقل.",
    invoice: "معاينة فاتورة",
    invoiceNote: "مثال توضيحي، وليست وثيقة مالية",
    language: "اللغة",
    next: "التالي",
    prev: "السابق",
    eyebrow: "مساحة عمل للنقل · بلجيكا",
  },
  fr: {
    title: "Du trajet à votre entreprise.",
    accent: "Une seule plateforme.",
    intro:
      "Le chauffeur sur la route. L’entreprise avec une vue d’ensemble. L’administration relie les détails. Un espace de travail, du compteur aux trajets, contrats et factures.",
    discover: "Découvrir la plateforme",
    quote: "Demander une présentation",
    nav: ["Expérience", "Pour qui ?", "Outils", "Intégrations"],
    demo: "Démonstration · données fictives",
    meter: "Compteur",
    distance: "Distance",
    duration: "Durée",
    time: "18 minutes",
    company: "Vue entreprise",
    trip: "Trajet",
    story: "Un trajet. Des détails reliés.",
    storyIntro:
      "Explorez le parcours de travail envisagé. Cette démonstration ne crée aucun trajet ni aucune facture réelle.",
    steps: ["Départ", "Fin du trajet", "Vue entreprise", "Facture"],
    stepText: [
      "Le chauffeur démarre le compteur et consulte les données sur son téléphone.",
      "Les détails sont vérifiés avant leur enregistrement.",
      "Le trajet apparaît dans les dossiers de l’entreprise.",
      "Les données de facturation se consultent dans l’espace de gestion.",
    ],
    audience: "Sur la route. En entreprise. En gestion.",
    roles: ["Chauffeur", "Entreprise de taxi", "Administration"],
    roleText: [
      "Vos outils à portée de main : compteur, historique, véhicule et messages.",
      "Organisez vos équipes et véhicules, consultez vos trajets et configurez vos tarifs.",
      "Gérez les entreprises, comptes et tarifs, consultez les contrats et factures.",
    ],
    roleItems: [
      [
        "Compteur et trajets",
        "Profil et véhicule",
        "Messages à l’administration",
      ],
      [
        "Chauffeurs et véhicules",
        "Trajets de l’entreprise",
        "Configuration des tarifs",
      ],
      ["Entreprises et comptes", "Contrats et factures", "Gestion des accès"],
    ],
    enter: ["Connexion chauffeur", "Connexion entreprise", "Administration"],
    tools: "Votre journée, vue dans son ensemble.",
    toolsIntro:
      "Chaque outil trouve sa place. Les itinéraires proposés sont disponibles dans le compteur du chauffeur ; le suivi avancé de flotte est encore en préparation.",
    features: [
      ["Compteur", "Une interface pour le chauffeur pendant le trajet."],
      ["Trajets", "Un historique pour consulter les détails."],
      ["Équipe et véhicules", "Organisation des chauffeurs et véhicules."],
      ["Messages", "Communication dans votre espace de travail."],
      ["Contrats", "Documents d’abonnement et aperçu imprimable."],
      ["Factures", "Consultation des documents et données de facturation."],
    ],
    integrations: "Une intégration dépasse son logo.",
    integrationIntro:
      "Nous distinguons la configuration d’une connexion réellement acceptée par le prestataire.",
    pending: "En préparation",
    chiron:
      "Configuration et synchronisation en cours de revue. Acceptation en production non démontrée.",
    external: "Plateformes externes",
    externalText:
      "La gestion des paramètres et contrats ne signifie pas une connexion active ou une certification.",
    email: "E-mail",
    emailText:
      "Code d’envoi et de vérification prêt. Activation du prestataire et livraison réelle restant à vérifier.",
    subscription: "Adapté à votre activité.",
    pricing:
      "Les services nécessaires sont définis avant une proposition. Les prix et les formules ne sont pas encore validés pour publication.",
    needs: [
      "Besoins des chauffeurs",
      "Taille de l’entreprise et équipe",
      "Contrats et services nécessaires",
    ],
    contact: "Partons de vos besoins.",
    contactText:
      "Si vous avez déjà un compte, contactez votre administration via les messages du portail.",
    notice:
      "Le canal public de demande n’est pas encore activé. Cette section n’envoie aucune demande et ne collecte pas vos données.",
    account: "Vous avez déjà un compte ?",
    privacy: "Confidentialité",
    footer: "Outils pour chauffeurs et gestion des entreprises de transport.",
    invoice: "Aperçu de facture",
    invoiceNote: "Exemple illustratif, sans valeur comptable",
    language: "Langue",
    next: "Suivant",
    prev: "Précédent",
    eyebrow: "Un espace pour le transport · Belgique",
  },
  nl: {
    title: "Van uw rit tot uw bedrijf.",
    accent: "Eén platform.",
    intro:
      "De chauffeur onderweg. Het bedrijf met overzicht. Het beheer verbindt de details. Een werkplek, van de ritmeter tot ritten, contracten en facturen.",
    discover: "Ontdek het platform",
    quote: "Vraag een kennismaking",
    nav: ["Ervaring", "Voor wie?", "Tools", "Integraties"],
    demo: "Demonstratie · fictieve gegevens",
    meter: "Ritmeter",
    distance: "Afstand",
    duration: "Duur",
    time: "18 minuten",
    company: "Bedrijfsoverzicht",
    trip: "Rit",
    story: "Eén rit. Verbonden details.",
    storyIntro:
      "Verken de voorgestelde werkwijze. Deze demonstratie maakt geen echte rit of factuur aan.",
    steps: ["Vertrek", "Rit afronden", "Bedrijfsoverzicht", "Factuur"],
    stepText: [
      "De chauffeur start de ritmeter en bekijkt de gegevens op de telefoon.",
      "De gegevens worden gecontroleerd voordat ze worden opgeslagen.",
      "De rit verschijnt in het ritoverzicht van het bedrijf.",
      "Factuurgegevens worden bekeken in de beheeromgeving.",
    ],
    audience: "Onderweg. Op kantoor. In beheer.",
    roles: ["Chauffeur", "Taxibedrijf", "Beheer"],
    roleText: [
      "Uw dagelijkse tools dichtbij: ritmeter, ritgeschiedenis, voertuig en berichten.",
      "Organiseer uw team en voertuigen, bekijk bedrijfsritten en stel tarieven in.",
      "Beheer bedrijven, accounts en tarieven, bekijk contracten en facturen.",
    ],
    roleItems: [
      ["Ritmeter en ritten", "Profiel en voertuig", "Berichten aan beheer"],
      ["Chauffeurs en voertuigen", "Bedrijfsritten", "Tariefinstellingen"],
      ["Bedrijven en accounts", "Contracten en facturen", "Toegangsbeheer"],
    ],
    enter: ["Inloggen als chauffeur", "Inloggen als bedrijf", "Beheer"],
    tools: "Uw werkdag in een breder beeld.",
    toolsIntro:
      "Elke tool heeft een plek. Voorgestelde routes zijn nu beschikbaar in de chauffeurstaximeter; geavanceerde tracking van de vloot is nog in voorbereiding.",
    features: [
      ["Ritmeter", "Een interface voor de chauffeur tijdens de rit."],
      ["Ritten", "Een overzicht om ritgegevens te bekijken."],
      ["Team en voertuigen", "Organisatie van chauffeurs en voertuigen."],
      ["Berichten", "Communicatie binnen uw werkplek."],
      ["Contracten", "Abonnementsdocumenten en afdrukvoorbeeld."],
      ["Facturen", "Factuurdocumenten en gegevens bekijken."],
    ],
    integrations: "Een integratie is meer dan een logo.",
    integrationIntro:
      "We onderscheiden instellingen van een werkelijk geaccepteerde verbinding met de aanbieder.",
    pending: "In voorbereiding",
    chiron:
      "Instellingen en synchronisatie worden beoordeeld. Productieacceptatie is nog niet aangetoond.",
    external: "Externe platforms",
    externalText:
      "Platforminstellingen en contracten betekenen geen actieve verbinding of certificering.",
    email: "E-mail",
    emailText:
      "Verzend- en verificatiecode is klaar. Activering en echte aflevering moeten nog worden gecontroleerd.",
    subscription: "Afgestemd op uw manier van werken.",
    pricing:
      "We bepalen de gewenste diensten vóór een voorstel. Prijzen en pakketinhoud zijn nog niet goedgekeurd voor publicatie.",
    needs: [
      "Behoeften van chauffeurs",
      "Bedrijfsgrootte en teambeheer",
      "Contracten en gewenste diensten",
    ],
    contact: "Begin bij uw behoeften.",
    contactText:
      "Bestaande accounts kunnen hun beheerder bereiken via berichten in het portaal.",
    notice:
      "Het openbare aanvraagkanaal is nog niet actief. Dit onderdeel verstuurt geen aanvraag en verzamelt geen gegevens.",
    account: "Heeft u al een account?",
    privacy: "Privacy",
    footer: "Tools voor chauffeurs en beheer van vervoersbedrijven.",
    invoice: "Factuurvoorbeeld",
    invoiceNote: "Illustratief voorbeeld, geen financieel document",
    language: "Taal",
    next: "Volgende",
    prev: "Vorige",
    eyebrow: "Een werkplek voor vervoer · België",
  },
};

function ButtonStart({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button className="pm-nav-cta" onClick={onClick}>
      {children}
      <ArrowUpRight size={15} />
    </button>
  );
}
function Route() {
  return (
    <svg
      className="pm-route"
      viewBox="0 0 400 220"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="pm-streets"
        d="M0 40H400M0 110H400M0 180H400M65 0V220M150 0V220M260 0V220M340 0V220M0 220L400 0"
      />
      <path className="pm-track" d="M65 180V110H150V40H340" />
      <circle cx="65" cy="180" r="7" fill="var(--pm-accent)" />
      <circle cx="340" cy="40" r="7" fill="var(--pm-accent)" />
      <circle className="pm-car" r="5" fill="white" />
    </svg>
  );
}

export default function PlatformLanding({
  startRegistration = false,
}: { startRegistration?: boolean } = {}) {
  const { language, setLanguage, isRtl } = useLanguage();
  const t = { ...translations[language], ...onboardingMarketingCopy[language] };
  const [registration, setRegistration] = useState(startRegistration);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const registrationTrigger = useRef<HTMLButtonElement | null>(null);
  const portals = ["/driver-login", "/login?portal=company", "/login"].map(path => portalHref(path, configuredPortal));
  const icons = [Gauge, MapPin, Users, Mail, FileText, Building2];
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = root.current?.querySelectorAll(".pm-section");
    if (!nodes) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("pm-await");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.06 },
    );
    nodes.forEach((node) => {
      node.classList.add("pm-await");
      observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const visibility = () =>
      root.current?.setAttribute("data-paused", String(document.hidden));
    document.addEventListener("visibilitychange", visibility);
    visibility();
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  useEffect(() => {
    if (!startRegistration) return;
    const lang = new URLSearchParams(location.search).get("lang");
    if (lang === "ar" || lang === "fr" || lang === "nl") setLanguage(lang);
  }, [startRegistration, setLanguage]);
  function openRegistration(event: React.MouseEvent<HTMLButtonElement>) {
    const destination = registrationHandoff(window.location.origin, language, configuredPortal);
    if (destination) {
      window.location.assign(destination);
      return;
    }
    registrationTrigger.current = event.currentTarget;
    setRegistration(true);
  }
  function closeRegistration() {
    setRegistration(false);
    requestAnimationFrame(() => registrationTrigger.current?.focus());
  }
  function tabKey(
    e: React.KeyboardEvent<HTMLButtonElement>,
    i: number,
    count: number,
    set: (n: number) => void,
    prefix: string,
  ) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? count - 1
          : (i + (e.key === "ArrowRight" ? 1 : count - 1)) % count;
    set(next);
    document.getElementById(`${prefix}-${next}`)?.focus();
  }
  return (
    <div ref={root} className="pm" dir={isRtl ? "rtl" : "ltr"}>
      <header className="pm-nav">
        <Link className="pm-brand" href="/" aria-label="JOUW DRIVER">
          <Car size={24} />
          <span>
            JOUW <b>DRIVER</b>
          </span>
        </Link>
        <nav className="pm-links" aria-label={t.discover}>
          {["experience", "audiences", "capabilities", "integrations"].map(
            (id, i) => (
              <a href={`#${id}`} key={id}>
                {t.nav[i]}
              </a>
            ),
          )}
        </nav>
        <nav className="pm-languages" aria-label={t.language}>
          {(["fr", "nl", "ar"] as const).map((l) => (
            <button
              aria-pressed={language === l}
              onClick={() => setLanguage(l)}
              key={l}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </nav>
        <ButtonStart onClick={openRegistration}>{t.quote}</ButtonStart>
        <Link href={portalHref("/login", configuredPortal)} className="pm-login">
          {t.login}
        </Link>
      </header>
      <main>
        <section className="pm-hero" aria-labelledby="pm-title">
          <div className="pm-hero-copy">
            <p className="pm-eyebrow">{t.eyebrow}</p>
            <h1 id="pm-title">
              {t.title}
              <em>{t.accent}</em>
            </h1>
            <p className="pm-lead">{t.intro}</p>
            <div className="pm-actions">
              <button className="pm-button" onClick={openRegistration}>
                {t.quote}
                <ArrowUpRight size={18} />
              </button>
              <a className="pm-button pm-secondary" href="#experience">
                {t.discover}
                <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="pm-hero-note">
              <ShieldCheck size={18} />
              {t.review}
            </div>
          </div>
          <div className="pm-product" role="img" aria-label={t.demo}>
            <div className="pm-orbital" aria-hidden="true">
              <div className="pm-orbit pm-orbit-one" />
              <div className="pm-orbit pm-orbit-two" />
              <div className="pm-orbit pm-orbit-three" />
              <span className="pm-orbit-point" />
            </div>
            <span className="pm-product-index" aria-hidden="true">
              JD / 01 — 03
            </span>
            <div className="pm-dashboard">
              <div className="pm-window">
                <span />
                <span />
                <span />
                <b>JOUW DRIVER</b>
              </div>
              <div className="pm-dashboard-body">
                <small>{t.company}</small>
                <h3>
                  {t.trip} <span dir="ltr">DEMO–018</span>
                </h3>
                <Route />
                <div className="pm-data-row">
                  <span>DEMO–01</span>
                  <b dir="ltr">€ 24,80</b>
                  <Check size={16} />
                </div>
              </div>
            </div>
            <div className="pm-phone">
              <div className="pm-notch" />
              <small>{t.demo}</small>
              <p>
                <Gauge size={20} />
                {t.meter}
              </p>
              <strong dir="ltr">€ 24,80</strong>
              <div className="pm-phone-stats">
                <span>
                  {t.distance}
                  <b dir="ltr">8,4 km</b>
                </span>
                <span>
                  {t.duration}
                  <b>{t.time}</b>
                </span>
              </div>
              <Route />
              <div className="pm-phone-bottom">
                <MapPin size={15} />
                Bruxelles · Brussel
              </div>
            </div>
            <p className="pm-demo-tag">{t.demo}</p>
          </div>
          <div className="pm-hero-index" aria-label={t.audience}>
            {t.roles.map((label, i) => (
              <a href="#audiences" key={label}>
                <span>0{i + 1}</span>
                {label}
                <ArrowUpRight size={16} />
              </a>
            ))}
          </div>
        </section>
        <section id="join" className="pm-section pm-onboarding">
          <div className="pm-heading">
            <p className="pm-eyebrow">{t.join}</p>
            <h2>{t.journeyTitle}</h2>
            <p>{t.journeyNote}</p>
          </div>
          <ol>
            {registrationCopy[language].steps.map((label, i) => (
              <li key={label}>
                <span>{i + 1}</span>
                <strong>{label}</strong>
                {i === 4 && <ShieldCheck size={20} />}
              </li>
            ))}
          </ol>
        </section>
        <section id="experience" className="pm-section">
          <div className="pm-heading">
            <p className="pm-eyebrow">01 / {t.nav[0]}</p>
            <h2>{t.story}</h2>
            <p>{t.storyIntro}</p>
          </div>
          <div className="pm-story">
            <div className="pm-step-tabs" role="tablist" aria-label={t.story}>
              {t.steps.map((label, i) => (
                <button
                  id={`journey-${i}`}
                  role="tab"
                  aria-selected={step === i}
                  aria-controls="journey-panel"
                  tabIndex={step === i ? 0 : -1}
                  onClick={() => setStep(i)}
                  onKeyDown={(e) => tabKey(e, i, 4, setStep, "journey")}
                  key={label}
                >
                  <span>0{i + 1}</span>
                  {label}
                </button>
              ))}
            </div>
            <div
              id="journey-panel"
              role="tabpanel"
              aria-labelledby={`journey-${step}`}
              className="pm-story-panel"
            >
              <div>
                <small className="pm-demo-label">{t.demo}</small>
                <h3>{t.steps[step]}</h3>
                <p>{t.stepText[step]}</p>
                <div className="pm-story-controls">
                  <button
                    disabled={step === 0}
                    onClick={() => setStep(step - 1)}
                  >
                    {t.prev}
                  </button>
                  <button
                    disabled={step === 3}
                    onClick={() => setStep(step + 1)}
                  >
                    {t.next}
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
              <div className="pm-story-preview">
                {step < 2 ? (
                  <>
                    <Route />
                    <div className="pm-preview-total">
                      <Gauge />
                      <strong dir="ltr">
                        {step === 0 ? "€ 12,40" : "€ 24,80"}
                      </strong>
                      <span>{t.meter}</span>
                    </div>
                  </>
                ) : step === 2 ? (
                  <div className="pm-demo-table">
                    <h4>{t.company}</h4>
                    {["DEMO–018", "DEMO–017", "DEMO–016"].map((id, i) => (
                      <div key={id}>
                        <span>{id}</span>
                        <span>{t.trip}</span>
                        <b dir="ltr">€ {["24,80", "18,60", "32,10"][i]}</b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pm-invoice">
                    <FileText size={28} />
                    <h4>{t.invoice}</h4>
                    <p dir="ltr">DEMO–018</p>
                    <div>
                      <span>{t.trip}</span>
                      <b dir="ltr">€ 24,80</b>
                    </div>
                    <small>{t.invoiceNote}</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <section id="audiences" className="pm-section">
          <div className="pm-editorial">
            <Image
              src="/marketing-driver.jpg"
              alt=""
              width={1400}
              height={934}
              sizes="(max-width:720px) 100vw, 1200px"
            />
            <span>{t.eyebrow}</span>
          </div>
          <div className="pm-heading">
            <p className="pm-eyebrow">02 / {t.nav[1]}</p>
            <h2>{t.audience}</h2>
          </div>
          <div className="pm-role-tabs" role="tablist" aria-label={t.audience}>
            {t.roles.map((label, i) => (
              <button
                id={`role-${i}`}
                role="tab"
                aria-selected={role === i}
                aria-controls="role-panel"
                tabIndex={role === i ? 0 : -1}
                onClick={() => setRole(i)}
                onKeyDown={(e) => tabKey(e, i, 3, setRole, "role")}
                key={label}
              >
                {i === 0 ? (
                  <Car size={19} />
                ) : i === 1 ? (
                  <Building2 size={19} />
                ) : (
                  <ShieldCheck size={19} />
                )}{" "}
                {label}
              </button>
            ))}
          </div>
          <div
            id="role-panel"
            role="tabpanel"
            aria-labelledby={`role-${role}`}
            className="pm-role-panel"
          >
            <div>
              <h3>{t.roles[role]}</h3>
              <p>{t.roleText[role]}</p>
              <Link href={portals[role]}>
                {t.enter[role]}
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <ul>
              {t.roleItems[role].map((item, i) => (
                <li key={item}>
                  {item}
                  <Check size={18} />
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section id="capabilities" className="pm-section">
          <div className="pm-heading">
            <p className="pm-eyebrow">03 / {t.nav[2]}</p>
            <h2>{t.tools}</h2>
            <p>{t.toolsIntro}</p>
          </div>
          <div className="pm-capabilities">
            {t.features.map(([title, text], i) => {
              const Icon = icons[i];
              return (
                <article key={title}>
                  <Icon size={26} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              );
            })}
          </div>
        </section>
        <section id="integrations" className="pm-section">
          <div className="pm-heading">
            <p className="pm-eyebrow">04 / {t.nav[3]}</p>
            <h2>{t.integrations}</h2>
            <p>{t.integrationIntro}</p>
          </div>
          <div className="pm-integrations">
            {[
              ["Chiron", t.chiron],
              [t.external, t.externalText],
              [t.email, t.emailText],
            ].map(([title, text]) => (
              <article key={title}>
                <div>
                  <h3>{title}</h3>
                  <span>{t.pending}</span>
                </div>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="pm-section pm-pricing">
          <div className="pm-heading">
            <p className="pm-eyebrow">05 / JOUW DRIVER</p>
            <h2>{t.subscription}</h2>
            <p>{t.pricing}</p>
          </div>
          <div>
            <ul>
              {t.needs.map((item) => (
                <li key={item}>
                  <Check size={18} />
                  {item}
                </li>
              ))}
            </ul>
            <button className="pm-button" onClick={openRegistration}>
              {t.quote}
              <ArrowUpRight size={18} />
            </button>
          </div>
        </section>
        <section id="contact" className="pm-section pm-contact">
          <p className="pm-eyebrow">JOUW DRIVER</p>
          <h2>{t.contact}</h2>
          <p>{t.contactText}</p>
          <p className="pm-contact-notice">{t.notice}</p>
          <button className="pm-button" onClick={openRegistration}>
            {t.quote}
            <ArrowUpRight size={18} />
          </button>
          <div className="pm-portals">
            <h3>{t.account}</h3>
            <div>
              {t.enter.map((label, i) => (
                <Link href={portals[i]} key={label}>
                  {label}
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="pm-footer">
        <div>
          <span className="pm-brand">
            JOUW <b>DRIVER</b>
          </span>
          <p>{t.footer}</p>
        </div>
        <div>
          <Link href="/privacy-policy">{t.privacy}</Link>
          <CookiePreferencesButton />
        </div>
        <span>© {new Date().getFullYear()} JOUW DRIVER</span>
      </footer>
      {registration && (
        <CompanyRegistrationDialog
          open={registration}
          onClose={closeRegistration}
        />
      )}
    </div>
  );
}
