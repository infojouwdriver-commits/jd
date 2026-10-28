"use client";
import "./cinematic/cinematic.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Car,
  Gauge,
  Building2,
  Check,
  Globe2,
} from "lucide-react";
import { useLanguage, type AppLanguage } from "@/contexts/LanguageContext";
import CompanyRegistrationDialog from "@/components/registration/CompanyRegistrationDialog";
import CookiePreferencesButton from "@/components/gdpr/CookiePreferencesButton";
import { portalHref, registrationHandoff } from "@/lib/portal-origin";
import { subscriptionOfferCopy } from "@/lib/subscription-offer";
import MarketingExplore from "./MarketingExplore";
import Cinema from "./cinematic/Cinema";
import { cinematicCopy } from "./cinematic/copy";
const configuredPortal = process.env.NEXT_PUBLIC_PORTAL_ORIGIN;

export default function PlatformLanding({
  startRegistration = false,
  locale,
}: { startRegistration?: boolean; locale?: AppLanguage } = {}) {
  const context = useLanguage();
  const setLanguageRef = useRef(context.setLanguage);
  setLanguageRef.current = context.setLanguage;
  const language = locale || context.language;
  const t = cinematicCopy[language];
  const rtl = language === "ar";
  const [registration, setRegistration] = useState(startRegistration);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!startRegistration) return;
    const l = new URLSearchParams(location.search).get("lang");
    if (l === "ar" || l === "fr" || l === "nl") setLanguageRef.current(l);
  }, [startRegistration]); // Existing registration handoff owns its URL preference.
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("jd-in");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    root.current
      ?.querySelectorAll("[data-reveal]")
      .forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);
  function openRegistration(e: React.MouseEvent<HTMLButtonElement>) {
    const destination = registrationHandoff(
      location.origin,
      language,
      configuredPortal,
    );
    if (destination) {
      location.assign(destination);
      return;
    }
    if (context.language !== language) context.setLanguage(language);
    trigger.current = e.currentTarget;
    setRegistration(true);
  }
  function closeRegistration() {
    setRegistration(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }
  return (
    <div className="jd" ref={root} dir={rtl ? "rtl" : "ltr"} lang={language}>
      <a className="jd-skip-focus" href="#platform">
        {t.skip}
      </a>
      <header className="jd-header">
        <Link
          className="jd-brand"
          href={locale ? `/${locale}` : "/"}
          aria-label="JOUW DRIVER"
        >
          <Car size={25} />
          <span>
            JOUW <b>DRIVER</b>
          </span>
        </Link>
        <nav className="jd-links" aria-label={t.experience}>
          <a href="#experience">{t.experience}</a>
          <a href="#platform">{t.drivers}</a>
          <a href="#subscription">{t.subscription}</a>
        </nav>
        <nav className="jd-languages" aria-label={t.language}>
          {(["fr", "nl", "ar"] as const).map((l) => (
            <Link
              key={l}
              href={`/${l}`}
              hrefLang={l}
              lang={l}
              aria-current={language === l ? "page" : undefined}
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </nav>
        <button
          className="jd-header-register"
          onClick={openRegistration}
          aria-label={t.register}
        >
          <span>{t.register}</span>
          <ArrowUpRight size={18} />
        </button>
        <a className="jd-login" aria-label={t.login} href={portalHref("/login", configuredPortal)}>
          {t.login}
          <ArrowUpRight size={15} />
        </a>
      </header>
      <main>
        <Cinema t={t} rtl={rtl} />
        <section className="jd-platform jd-section" id="platform" data-reveal>
          <div className="jd-section-intro">
            <p className="jd-eyebrow">JOUW DRIVER / {t.drivers}</p>
            <h2>{t.driverTitle}</h2>
            <p>{t.driverText}</p>
          </div>
          <div className="jd-platform-grid">
            <div className="jd-instrument" aria-hidden="true">
              <Gauge size={40} />
              <span>JOUW DRIVER</span>
              <div className="jd-dial">
                <i />
                <strong>
                  128 640<small>km</small>
                </strong>
              </div>
              <p>{t.demo}</p>
              <b>{t.active}</b>
            </div>
            <div className="jd-feature-list">
              {t.driverItems.map((s, i) => (
                <div key={s}>
                  <span>0{i + 1}</span>
                  <h3>{s}</h3>
                  <Check size={18} />
                </div>
              ))}
              <a
                className="jd-text-link"
                href={portalHref("/driver-login", configuredPortal)}
              >
                {t.driverLogin}
                <ArrowUpRight size={20} />
              </a>
            </div>
          </div>
        </section>
        <section className="jd-section jd-company" id="companies" data-reveal>
          <div className="jd-section-intro">
            <p className="jd-eyebrow">
              <Building2 size={18} /> {t.companies}
            </p>
            <h2>{t.companyTitle}</h2>
            <p>{t.companyText}</p>
          </div>
          <div className="jd-company-network">
            <span className="jd-network-brand">JOUW DRIVER</span>
            <div className="jd-network-lines" aria-hidden="true" />
            {t.companyItems.map((item, i) => (
              <article key={item}>
                <span className="jd-node" aria-hidden="true" />
                <small>0{i + 1}</small>
                <h3>{item}</h3>
              </article>
            ))}
          </div>
          <a
            className="jd-text-link"
            href={portalHref("/login?portal=company", configuredPortal)}
          >
            {t.companyLogin}
            <ArrowUpRight size={20} />
          </a>
        </section>
        <section className="jd-section jd-belgium" id="belgium" data-reveal>
          <div className="jd-section-intro">
            <p className="jd-eyebrow">
              <Globe2 size={18} /> BE / AR · FR · NL
            </p>
            <h2>{t.belgium}</h2>
            <p>{t.belgiumText}</p>
          </div>
          <div className="jd-connection-list">
            {t.connections.map(([title, text]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          className="jd-section jd-pricing"
          id="subscription"
          data-reveal
        >
          <div>
            <p className="jd-eyebrow">{t.subscription}</p>
            <h2>{t.priceTitle}</h2>
            <p>{subscriptionOfferCopy[language].note}</p>
          </div>
          <div className="jd-price">
            <p>
              <strong dir="ltr">50€</strong>
              <span>{t.month}</span>
            </p>
            <span>{t.vat}</span>
            <h3>{t.contract}</h3>
            <p>{t.renewal}</p>
            <small>{t.priceNote}</small>
            <button className="jd-button" onClick={openRegistration}>
              {t.register}
              <ArrowUpRight size={20} />
            </button>
          </div>
        </section>
        <div className="jd-explore">
          <MarketingExplore locale={language} />
        </div>
        <section className="jd-section jd-faq" id="faq" data-reveal>
          <p className="jd-eyebrow">JOUW DRIVER</p>
          <h2>{t.faq}</h2>
          <div>
            {t.questions.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="jd-section jd-final" id="contact" data-reveal>
          <span className="jd-final-line" aria-hidden="true" />
          <p className="jd-eyebrow">JOUW DRIVER</p>
          <h2>{t.finalTitle}</h2>
          <p>{t.finalText}</p>
          <div className="jd-actions">
            <button className="jd-button" onClick={openRegistration}>
              {t.register}
              <ArrowUpRight size={20} />
            </button>
            <a
              className="jd-button jd-outline"
              href={portalHref("/login", configuredPortal)}
            >
              {t.login}
              <ArrowUpRight size={20} />
            </a>
          </div>
        </section>
      </main>
      <footer className="jd-footer">
        <div>
          <span className="jd-brand">
            JOUW <b>DRIVER</b>
          </span>
          <p>{t.footer}</p>
        </div>
        <div>
          <Link href="/privacy-policy">{t.privacy}</Link>
          <CookiePreferencesButton />
        </div>
        <small>© {new Date().getFullYear()} JOUW DRIVER</small>
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
