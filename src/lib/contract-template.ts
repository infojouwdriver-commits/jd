import {CONTRACT_DOCUMENT_CSS} from './contract-document-style';
export const CONTRACT_TEMPLATE_HTML_NL = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <title>JOUW TAXI OS 26 – Legal Info & Licentie</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root {
      --bg: #020617;
      --bg-card: rgba(15,23,42,0.96);
      --bg-soft: rgba(15,23,42,0.9);
      --border-subtle: rgba(148,163,184,0.35);
      --accent: #22c55e;
      --accent-soft: rgba(34,197,94,0.12);
      --accent-blue: #38bdf8;
      --text-main: #e5e7eb;
      --text-muted: #9ca3af;
      --text-soft: #6b7280;
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at top left, rgba(56,189,248,0.16), transparent 55%),
        radial-gradient(circle at bottom right, rgba(34,197,94,0.12), transparent 55%),
        #020617;
      color: var(--text-main);
    }

    body {
      padding: 24px;
      display: flex;
      justify-content: center;
    }

    .page {
      width: 100%;
      max-width: 980px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 18px;
    }

    .logo-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-badge {
      width: 40px;
      height: 40px;
      border-radius: 16px;
      background: radial-gradient(circle at 30% 20%, #4ade80, #22c55e 40%, #22d3ee 80%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 0 28px rgba(34,197,94,0.75),
        0 14px 36px rgba(0,0,0,0.85);
    }

    .logo-badge span {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: -0.08em;
      color: #020617;
    }

    .logo-text-main {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .logo-text-sub {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: var(--text-soft);
    }

    .tagline {
      text-align: right;
      font-size: 11px;
      color: var(--text-soft);
    }

    .tagline strong {
      color: var(--accent-blue);
    }

    .top-banner {
      border-radius: 18px;
      padding: 14px 16px;
      background: linear-gradient(to right, rgba(15,23,42,0.9), rgba(15,23,42,0.7));
      border: 1px solid rgba(148,163,184,0.4);
      display: flex;
      justify-content: space-between;
      gap: 16px;
      font-size: 12px;
      margin-bottom: 18px;
    }

    .top-banner .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.5);
      font-size: 11px;
      color: var(--text-soft);
      background: rgba(15,23,42,0.6);
    }

    .pill strong {
      color: var(--text-main);
    }

    .pill.accent {
      border-color: rgba(34,197,94,0.9);
      background: var(--accent-soft);
      color: #bbf7d0;
    }

    .pill.warn {
      border-color: rgba(248,113,113,0.9);
      background: rgba(248,113,113,0.12);
      color: #fecaca;
    }

    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr);
      gap: 18px;
      margin-top: 18px;
    }

    @media (max-width: 900px) {
      .grid {
        grid-template-columns: minmax(0, 1fr);
      }
      body {
        padding: 12px;
      }
    }

    .card {
      background: radial-gradient(circle at top left, rgba(15,23,42,0.98), #020617 85%);
      border-radius: 20px;
      padding: 16px 18px 18px;
      border: 1px solid var(--border-subtle);
      box-shadow:
        0 18px 35px rgba(15,23,42,0.9),
        0 0 18px rgba(15,23,42,0.8);
      margin-bottom: 14px;
    }

    .card h2 {
      font-size: 15px;
      margin: 0 0 4px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #e5e7eb;
    }

    .card .kicker {
      font-size: 11px;
      color: var(--text-soft);
      margin-bottom: 10px;
    }

    .card section + section {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed rgba(148,163,184,0.35);
    }

    h3 {
      font-size: 13px;
      margin: 0 0 4px;
      color: #e5e7eb;
    }

    p {
      font-size: 13px;
      margin: 3px 0 8px;
      color: var(--text-muted);
      line-height: 1.55;
    }

    ul {
      margin: 4px 0 8px 16px;
      padding: 0;
    }

    li {
      font-size: 13px;
      color: var(--text-muted);
      margin: 2px 0;
    }

    .small {
      font-size: 11px;
      color: var(--text-soft);
    }

    .muted {
      color: var(--text-soft);
    }

    .inline-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: var(--text-soft);
      margin-bottom: 3px;
    }

    .footer-note {
      margin-top: 10px;
      font-size: 11px;
      color: var(--text-soft);
      text-align: right;
    }

    .contract-info {
      background: rgba(34,197,94,0.08);
      border: 1px solid rgba(34,197,94,0.3);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 18px;
    }

    .contract-info h3 {
      color: #22c55e;
      margin-bottom: 12px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px dashed rgba(148,163,184,0.2);
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      color: var(--text-soft);
      font-size: 12px;
    }

    .info-value {
      color: var(--text-main);
      font-weight: 600;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <header class="header">
      <div class="logo-wrap">
        <div class="logo-badge">
          <span>JT</span>
        </div>
        <div>
          <div class="logo-text-main">JOUW TAXI OS 26</div>
          <div class="logo-text-sub">VVB / TAXI SaaS platform – Vlaanderen</div>
        </div>
      </div>
      <div class="tagline">
        <div><strong>Legal Info &amp; Licentievoorwaarden</strong></div>
        <div>Enkel voor professionele VVB / taxi-ondernemingen</div>
      </div>
    </header>

    <!-- Contract Info Section -->
    <div class="contract-info">
      <h3>Contractgegevens</h3>
      <div class="info-row">
        <span class="info-label">Contractnummer:</span>
        <span class="info-value">{{CONTRACT_NUMBER}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Bedrijfsnaam:</span>
        <span class="info-value">{{COMPANY_NAME}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">BTW-nummer:</span>
        <span class="info-value">{{COMPANY_VAT}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">KBO-nummer:</span>
        <span class="info-value">{{COMPANY_KBO}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Startdatum:</span>
        <span class="info-value">{{START_DATE}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Einddatum:</span>
        <span class="info-value">{{END_DATE}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Maandelijkse vergoeding:</span>
        <span class="info-value">€{{MONTHLY_FEE}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Jaarlijkse vergoeding:</span>
        <span class="info-value">€{{ANNUAL_FEE}}</span>
      </div>
    </div>

    <!-- Top banner -->
    <div class="top-banner">
      <div>
        <div class="inline-label">Samenvatting</div>
        <div style="font-size:12px;color:var(--text-muted);">
          Dit document beschrijft de juridische informatie, licentievoorwaarden en gegevensverwerking
          voor het gebruik van <strong>JOUW TAXI OS 26</strong> in Vlaanderen (VVB / taxi-sector).
        </div>
        <div class="badges">
          <span class="pill accent"><strong>Min. duur</strong> {{DURATION_MONTHS}} maanden</span>
          <span class="pill"><strong>Opzeg</strong> 3 maanden vooraf</span>
          <span class="pill warn">Geen garantie op ononderbroken werking</span>
        </div>
      </div>
      <div>
        <div class="inline-label">Belangrijke disclaimer</div>
        <p class="small">
          Deze tekst is een sjabloon. Laat de inhoud nakijken door een juridisch adviseur voordat u
          deze voorwaarden als definitief contract gebruikt.
        </p>
      </div>
    </div>

    <div class="grid">
      <!-- Linkerkolom: Legal info + licentie -->
      <div>
        <!-- Legal Info -->
        <article class="card">
          <h2>Legal Info</h2>
          <div class="kicker">Algemene juridische informatie – JOUW TAXI OS 26</div>

          <section>
            <h3>1. Partijen en toepassingsgebied</h3>
            <p>
              Deze voorwaarden zijn van toepassing op het gebruik van de softwareoplossing
              <strong>JOUW TAXI OS 26</strong> (hierna: <strong>"de Dienst"</strong>), aangeboden door de
              exploitant (hierna: <strong>"Dienstverlener"</strong>), door professionele klanten
              (hierna: <strong>"Klant"</strong>) die actief zijn in de VVB- en/of taxi-sector in Vlaanderen.
            </p>
            <p>
              De Dienst is bedoeld als digitaal hulpmiddel voor ritregistratie, prijscalculatie,
              rapportering en (optionele) technische koppeling met officiële platformen zoals
              <strong>Chiron</strong>. De Dienst vormt geen officieel erkende taximeter en vervangt geen wettelijke verplichtingen
              van de Klant.
            </p>
          </section>

          <section>
            <h3>2. Geen aansprakelijkheid als taximeter / wettelijke conformiteit</h3>
            <p>
              De Dienstverlener garandeert niet dat de Dienst voldoet aan alle specifieke technische
              of juridische vereisten van lokale, regionale of nationale regelgeving inzake VVB,
              taxi, rittenregistratie of fiscale rapportering.
            </p>
            <p>
              De Klant blijft <strong>volledig zelf verantwoordelijk</strong> voor:
            </p>
            <ul>
              <li>De naleving van alle toepasselijke wet- en regelgeving (o.a. VVB-regels in Vlaanderen, Chiron-verplichtingen, fiscale verplichtingen).</li>
              <li>De juistheid van de ingevoerde gegevens (prijzen, ritten, KBO-nummer, nummerplaten, bestuurderspassen, enz.).</li>
              <li>Het correct gebruik van de Dienst in combinatie met andere noodzakelijke systemen en apparatuur (bijvoorbeeld een officieel goedgekeurde taximeter waar dat vereist is).</li>
            </ul>
            <p>
              De Dienstverlener aanvaardt geen aansprakelijkheid voor boetes, sancties, intrekking
              van vergunningen of enig ander gevolg dat voortvloeit uit onjuist of onwettig gebruik
              van de Dienst door de Klant.
            </p>
          </section>

          <section>
            <h3>3. Beschikbaarheid, storingen en onderbreking</h3>
            <p>
              De Dienst wordt aangeboden volgens het <strong>"best effort"</strong>-principe. De
              Dienstverlener streeft naar een stabiele en performante werking, maar
              <strong>geeft geen garantie op ononderbroken beschikbaarheid</strong>.
            </p>
            <p>
              De Klant erkent uitdrukkelijk dat:
            </p>
            <ul>
              <li>De Dienst tijdelijk of permanent onderbroken kan worden, bijvoorbeeld door onderhoud, storingen, beveiligingsincidenten, wijzigingen bij externe platformen (zoals Chiron) of om andere technische of bedrijfseconomische redenen.</li>
              <li>De Dienstverlener het recht heeft de Dienst <strong>op elk moment en zonder voorafgaande kennisgeving</strong> te wijzigen, op te schorten of stop te zetten.</li>
              <li>
                In geval van onderbreking, storing of stopzetting van de Dienst,
                <strong>geen enkele schadevergoeding of compensatie</strong> verschuldigd is aan de Klant of aan derden.
              </li>
            </ul>
          </section>

          <section>
            <h3>4. Aansprakelijkheidsbeperking</h3>
            <p>
              Voor zover wettelijk toegestaan, is de aansprakelijkheid van de Dienstverlener ten
              aanzien van de Klant beperkt tot het bedrag van de door de Klant betaalde abonnementskosten
              voor de laatste twaalf (12) maanden.
            </p>
            <p>
              In geen geval is de Dienstverlener aansprakelijk voor:
            </p>
            <ul>
              <li>Indirecte schade, gevolgschade, gederfde winst of verlies van data.</li>
              <li>Boetes, administratieve sancties of andere maatregelen opgelegd door overheden of controle-instanties.</li>
              <li>Schade die voortvloeit uit foutieve configuratie, foutieve KBO-gegevens of foutieve koppeling door de Klant.</li>
            </ul>
            <p class="small">
              Niets in deze clausule sluit aansprakelijkheid uit waar dit dwingend door de wet verboden is.
            </p>
          </section>
        </article>

        <!-- License Agreement -->
        <article class="card">
          <h2>Licentieovereenkomst</h2>
          <div class="kicker">Gebruik van JOUW TAXI OS 26 als SaaS voor VVB / taxi</div>

          <section>
            <h3>5. Licentie en gebruiksrechten</h3>
            <p>
              De Dienst wordt aangeboden als Software-as-a-Service (SaaS).
              De Klant krijgt een <strong>niet-exclusief, niet-overdraagbaar</strong> gebruiksrecht
              om de Dienst te gebruiken voor de eigen professionele activiteiten binnen de VVB- en/of
              taxi-activiteiten in Vlaanderen.
            </p>
            <p>Het is de Klant niet toegestaan om:</p>
            <ul>
              <li>De Dienst te kopiëren, verhuren, sublicentiëren of aan derden commercieel door te verkopen.</li>
              <li>De broncode te decompileren, reverse-engineeren of op een andere manier te proberen de interne werking van het systeem te achterhalen, behalve waar dit door dwingend recht uitdrukkelijk is toegestaan.</li>
              <li>De Dienst te gebruiken voor illegale activiteiten of op een manier die de reputatie van de Dienstverlener kan schaden.</li>
            </ul>
          </section>

          <section>
            <h3>6. Abonnement, minimale duur en opzeg</h3>
            <p>
              De Dienst wordt aangeboden op basis van een abonnement per onderneming (bedrijfsklant).
            </p>
            <ul>
              <li><strong>Minimale looptijd:</strong> 12 maanden (één jaar) vanaf de ingangsdatum van de overeenkomst.</li>
              <li>Na de eerste periode van 12 maanden wordt het abonnement stilzwijgend verlengd met opeenvolgende periodes van telkens 12 maanden.</li>
              <li>
                De Klant kan het abonnement beëindigen op het einde van een lopende periode, mits
                <strong>schriftelijke opzeg minstens 3 maanden vóór het einde</strong> van die periode
                (bijvoorbeeld via e-mail met leesbevestiging).
              </li>
            </ul>
            <p>
              Bij gebrek aan tijdige opzeg blijft de overeenkomst automatisch doorlopen voor een
              nieuwe periode van 12 maanden, zonder recht op terugbetaling van reeds betaalde bedragen.
            </p>
          </section>

          <section>
            <h3>7. Vergoeding, facturatie en niet-betaling</h3>
            <p>
              De abonnementsprijs, betaalritme (maandelijks / jaarlijks) en eventuele extra diensten
              worden vastgelegd in de afzonderlijke offerte of bestelbon tussen de Dienstverlener en de Klant.
            </p>
            <p>
              Bij niet-tijdige betaling heeft de Dienstverlener het recht om:
            </p>
            <ul>
              <li>De toegang tot de Dienst (tijdelijk) te beperken of te schorsen, en</li>
              <li>Wettelijke interesten en eventuele administratieve kosten aan te rekenen.</li>
            </ul>
          </section>
        </article>
      </div>

      <!-- Rechterkolom: GDPR / DPA -->
      <div>
        <!-- GDPR & DPA -->
        <article class="card">
          <h2>Gegevensbescherming (GDPR) & DPA</h2>
          <div class="kicker">Verwerkersovereenkomst volgens de Europese privacyregels</div>

          <section>
            <h3>8. Rollen: verwerkingsverantwoordelijke en verwerker</h3>
            <p>
              In de zin van de Algemene Verordening Gegevensbescherming (<strong>AVG / GDPR</strong>):
            </p>
            <ul>
              <li>De <strong>Klant</strong> is de <strong>verwerkingsverantwoordelijke</strong> voor alle persoonsgegevens die via de Dienst worden ingevoerd of verwerkt (gegevens van bestuurders, voertuigen, ritten, passagiers, enz.).</li>
              <li>De <strong>Dienstverlener</strong> treedt op als <strong>verwerker</strong> en verwerkt de persoonsgegevens uitsluitend in opdracht en volgens de instructies van de Klant.</li>
            </ul>
          </section>

          <section>
            <h3>9. Verwerkingsdoeleinden en -grondslag</h3>
            <p>
              De Dienst verwerkt persoonsgegevens uitsluitend voor volgende doeleinden:
            </p>
            <ul>
              <li>Registratie van ritten, voertuigen en chauffeurs in het kader van VVB / taxi-activiteiten.</li>
              <li>Technische koppeling en doorgifte van ritgegevens aan officiële platformen (zoals Chiron), indien geactiveerd door de Klant.</li>
              <li>Genereren van rapporten, facturen en overzichten voor de Klant.</li>
            </ul>
            <p>
              De <strong>Klant</strong> bepaalt zelf de rechtsgrond van de verwerking (bijvoorbeeld:
              wettelijke verplichting, uitvoering van een overeenkomst met de passagier) en is verantwoordelijk
              voor correcte naleving van informatieplicht en rechten van betrokkenen.
            </p>
          </section>

          <section>
            <h3>10. Beveiliging, hosting en subverwerkers</h3>
            <p>
              De Dienstverlener neemt passende technische en organisatorische maatregelen om persoonsgegevens te beschermen
              tegen verlies, ongeoorloofde toegang of misbruik, rekening houdend met de stand van de techniek en de aard
              van de verwerking.
            </p>
            <p>
              Waar mogelijk worden gegevens gehost binnen de <strong>Europese Economische Ruimte (EER)</strong>.
              Indien subverwerkers worden ingeschakeld, sluit de Dienstverlener overeenkomsten die minimaal
              dezelfde beschermingsniveaus garanderen als in deze verwerkersovereenkomst.
            </p>
          </section>

          <section>
            <h3>11. Rechten van betrokkenen en datalekken</h3>
            <p>
              De Klant blijft aanspreekpunt voor betrokkenen (passagiers, chauffeurs, medewerkers) die hun
              GDPR-rechten willen uitoefenen (inzage, rechtzetting, verwijdering, beperking, bezwaar, enz.).
            </p>
            <p>
              De Dienstverlener zal de Klant in de mate van het redelijke bijstaan om aan deze verzoeken te voldoen,
              voor zover de gegevens technisch via de Dienst beschikbaar zijn.
            </p>
            <p>
              In geval van een <strong>beveiligingsincident of datalek</strong> dat relevant is voor de door
              de Klant verwerkte gegevens, zal de Dienstverlener de Klant zonder onredelijke vertraging informeren,
              zodat de Klant – indien vereist – de bevoegde toezichthouder en/of de betrokkenen kan verwittigen.
            </p>
          </section>

          <section>
            <h3>12. Bewaartermijn en einde van de verwerking</h3>
            <p>
              Persoonsgegevens worden niet langer bewaard dan noodzakelijk is voor de uitvoering van de Dienst
              en de wettelijke verplichtingen van de Klant (bijvoorbeeld de bewaartermijnen opgelegd door de
              Vlaamse regelgeving of fiscale wetgeving).
            </p>
            <p>
              Bij beëindiging van de overeenkomst zal de Dienstverlener, binnen een redelijke termijn en op
              verzoek van de Klant, een export van de beschikbare data aanbieden in een gangbaar formaat
              (voor zover technisch haalbaar). Daarna kan de Dienstverlener de gegevens verwijderen of anonimiseren,
              behoudens waar een langere bewaring wettelijk noodzakelijk is.
            </p>
          </section>
        </article>

        <!-- Toepasselijk recht -->
        <article class="card">
          <h2>Toepasselijk recht & forumkeuze</h2>
          <div class="kicker">Slotbepalingen</div>

          <section>
            <h3>13. Toepasselijk recht</h3>
            <p>
              Op deze voorwaarden en op het gebruik van de Dienst is uitsluitend
              <strong>Belgisch recht</strong> van toepassing.
            </p>
          </section>

          <section>
            <h3>14. Bevoegde rechtbank</h3>
            <p>
              Voor geschillen tussen de Dienstverlener en de Klant zijn de rechtbanken van de zetel
              van de Dienstverlener bevoegd, onverminderd dwingende bepalingen van het recht.
            </p>
          </section>

          <section>
            <h3>15. Wijzigingen van de voorwaarden</h3>
            <p>
              De Dienstverlener kan deze voorwaarden van tijd tot tijd wijzigen. Bij substantiële
              wijzigingen zal de Klant in de mate van het mogelijke op voorhand geïnformeerd worden.
              Voortgezet gebruik van de Dienst na de wijziging geldt als aanvaarding van de nieuwe voorwaarden.
            </p>
          </section>

          <div class="footer-note">
            Laat deze tekst juridisch nakijken voordat u hem als definitief contract gebruikt.
          </div>
        </article>
      </div>
    </div>
  </div>
</body>
</html>`;

export const CONTRACT_TEMPLATE_HTML_FR = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>JOUW TAXI OS 26 – Informations Légales & Licence</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root {
      --bg: #020617;
      --bg-card: rgba(15,23,42,0.96);
      --bg-soft: rgba(15,23,42,0.9);
      --border-subtle: rgba(148,163,184,0.35);
      --accent: #22c55e;
      --accent-soft: rgba(34,197,94,0.12);
      --accent-blue: #38bdf8;
      --text-main: #e5e7eb;
      --text-muted: #9ca3af;
      --text-soft: #6b7280;
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at top left, rgba(56,189,248,0.16), transparent 55%),
        radial-gradient(circle at bottom right, rgba(34,197,94,0.12), transparent 55%),
        #020617;
      color: var(--text-main);
    }

    body {
      padding: 24px;
      display: flex;
      justify-content: center;
    }

    .page {
      width: 100%;
      max-width: 980px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 18px;
    }

    .logo-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-badge {
      width: 40px;
      height: 40px;
      border-radius: 16px;
      background: radial-gradient(circle at 30% 20%, #4ade80, #22c55e 40%, #22d3ee 80%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 0 28px rgba(34,197,94,0.75),
        0 14px 36px rgba(0,0,0,0.85);
    }

    .logo-badge span {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: -0.08em;
      color: #020617;
    }

    .logo-text-main {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .logo-text-sub {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: var(--text-soft);
    }

    .tagline {
      text-align: right;
      font-size: 11px;
      color: var(--text-soft);
    }

    .tagline strong {
      color: var(--accent-blue);
    }

    .top-banner {
      border-radius: 18px;
      padding: 14px 16px;
      background: linear-gradient(to right, rgba(15,23,42,0.9), rgba(15,23,42,0.7));
      border: 1px solid rgba(148,163,184,0.4);
      display: flex;
      justify-content: space-between;
      gap: 16px;
      font-size: 12px;
      margin-bottom: 18px;
    }

    .top-banner .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.5);
      font-size: 11px;
      color: var(--text-soft);
      background: rgba(15,23,42,0.6);
    }

    .pill strong {
      color: var(--text-main);
    }

    .pill.accent {
      border-color: rgba(34,197,94,0.9);
      background: var(--accent-soft);
      color: #bbf7d0;
    }

    .pill.warn {
      border-color: rgba(248,113,113,0.9);
      background: rgba(248,113,113,0.12);
      color: #fecaca;
    }

    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr);
      gap: 18px;
      margin-top: 18px;
    }

    @media (max-width: 900px) {
      .grid {
        grid-template-columns: minmax(0, 1fr);
      }
      body {
        padding: 12px;
      }
    }

    .card {
      background: radial-gradient(circle at top left, rgba(15,23,42,0.98), #020617 85%);
      border-radius: 20px;
      padding: 16px 18px 18px;
      border: 1px solid var(--border-subtle);
      box-shadow:
        0 18px 35px rgba(15,23,42,0.9),
        0 0 18px rgba(15,23,42,0.8);
      margin-bottom: 14px;
    }

    .card h2 {
      font-size: 15px;
      margin: 0 0 4px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #e5e7eb;
    }

    .card .kicker {
      font-size: 11px;
      color: var(--text-soft);
      margin-bottom: 10px;
    }

    .card section + section {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed rgba(148,163,184,0.35);
    }

    h3 {
      font-size: 13px;
      margin: 0 0 4px;
      color: #e5e7eb;
    }

    p {
      font-size: 13px;
      margin: 3px 0 8px;
      color: var(--text-muted);
      line-height: 1.55;
    }

    ul {
      margin: 4px 0 8px 16px;
      padding: 0;
    }

    li {
      font-size: 13px;
      color: var(--text-muted);
      margin: 2px 0;
    }

    .small {
      font-size: 11px;
      color: var(--text-soft);
    }

    .muted {
      color: var(--text-soft);
    }

    .inline-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: var(--text-soft);
      margin-bottom: 3px;
    }

    .footer-note {
      margin-top: 10px;
      font-size: 11px;
      color: var(--text-soft);
      text-align: right;
    }

    .contract-info {
      background: rgba(34,197,94,0.08);
      border: 1px solid rgba(34,197,94,0.3);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 18px;
    }

    .contract-info h3 {
      color: #22c55e;
      margin-bottom: 12px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px dashed rgba(148,163,184,0.2);
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      color: var(--text-soft);
      font-size: 12px;
    }

    .info-value {
      color: var(--text-main);
      font-weight: 600;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <header class="header">
      <div class="logo-wrap">
        <div class="logo-badge">
          <span>JT</span>
        </div>
        <div>
          <div class="logo-text-main">JOUW TAXI OS 26</div>
          <div class="logo-text-sub">Plateforme SaaS VVB / TAXI – Flandre</div>
        </div>
      </div>
      <div class="tagline">
        <div><strong>Informations Légales &amp; Conditions de Licence</strong></div>
        <div>Uniquement pour les entreprises professionnelles VVB / taxi</div>
      </div>
    </header>

    <!-- Contract Info Section -->
    <div class="contract-info">
      <h3>Informations du Contrat</h3>
      <div class="info-row">
        <span class="info-label">Numéro de contrat:</span>
        <span class="info-value">{{CONTRACT_NUMBER}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Nom de l'entreprise:</span>
        <span class="info-value">{{COMPANY_NAME}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Numéro de TVA:</span>
        <span class="info-value">{{COMPANY_VAT}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Numéro BCE:</span>
        <span class="info-value">{{COMPANY_KBO}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date de début:</span>
        <span class="info-value">{{START_DATE}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date de fin:</span>
        <span class="info-value">{{END_DATE}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Frais mensuels:</span>
        <span class="info-value">€{{MONTHLY_FEE}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Frais annuels:</span>
        <span class="info-value">€{{ANNUAL_FEE}}</span>
      </div>
    </div>

    <!-- Top banner -->
    <div class="top-banner">
      <div>
        <div class="inline-label">Résumé</div>
        <div style="font-size:12px;color:var(--text-muted);">
          Ce document décrit les informations juridiques, les conditions de licence et le traitement des données
          pour l'utilisation de <strong>JOUW TAXI OS 26</strong> en Flandre (secteur VVB / taxi).
        </div>
        <div class="badges">
          <span class="pill accent"><strong>Durée min.</strong> {{DURATION_MONTHS}} mois</span>
          <span class="pill"><strong>Résiliation</strong> 3 mois à l'avance</span>
          <span class="pill warn">Aucune garantie de fonctionnement ininterrompu</span>
        </div>
      </div>
      <div>
        <div class="inline-label">Avertissement important</div>
        <p class="small">
          Ce texte est un modèle. Faites vérifier le contenu par un conseiller juridique avant d'utiliser
          ces conditions comme contrat définitif.
        </p>
      </div>
    </div>

    <div class="grid">
      <!-- Colonne gauche: Informations légales + licence -->
      <div>
        <!-- Legal Info -->
        <article class="card">
          <h2>Informations Légales</h2>
          <div class="kicker">Informations juridiques générales – JOUW TAXI OS 26</div>

          <section>
            <h3>1. Parties et champ d'application</h3>
            <p>
              Ces conditions s'appliquent à l'utilisation de la solution logicielle
              <strong>JOUW TAXI OS 26</strong> (ci-après: <strong>"le Service"</strong>), proposée par
              l'exploitant (ci-après: <strong>"le Prestataire"</strong>), par des clients professionnels
              (ci-après: <strong>"le Client"</strong>) actifs dans le secteur VVB et/ou taxi en Flandre.
            </p>
            <p>
              Le Service est destiné comme outil numérique pour l'enregistrement des courses, le calcul des prix,
              le reporting et (optionnel) la connexion technique avec des plateformes officielles telles que
              <strong>Chiron</strong>. Le Service ne constitue pas un taximètre officiellement reconnu et ne remplace pas les obligations légales
              du Client.
            </p>
          </section>

          <section>
            <h3>2. Aucune responsabilité en tant que taximètre / conformité légale</h3>
            <p>
              Le Prestataire ne garantit pas que le Service répond à toutes les exigences techniques
              ou juridiques spécifiques de la réglementation locale, régionale ou nationale concernant VVB,
              taxi, enregistrement des courses ou reporting fiscal.
            </p>
            <p>
              Le Client reste <strong>entièrement responsable</strong> de:
            </p>
            <ul>
              <li>Le respect de toutes les lois et réglementations applicables (notamment les règles VVB en Flandre, les obligations Chiron, les obligations fiscales).</li>
              <li>L'exactitude des données saisies (prix, courses, numéro BCE, plaques d'immatriculation, permis de conduire, etc.).</li>
              <li>L'utilisation correcte du Service en combinaison avec d'autres systèmes et équipements nécessaires (par exemple un taximètre officiellement approuvé lorsque cela est requis).</li>
            </ul>
            <p>
              Le Prestataire n'accepte aucune responsabilité pour les amendes, sanctions, retrait
              de licences ou toute autre conséquence résultant d'une utilisation incorrecte ou illégale
              du Service par le Client.
            </p>
          </section>

          <section>
            <h3>3. Disponibilité, pannes et interruption</h3>
            <p>
              Le Service est proposé selon le principe du <strong>"meilleur effort"</strong>. Le
              Prestataire vise un fonctionnement stable et performant, mais
              <strong>ne garantit pas une disponibilité ininterrompue</strong>.
            </p>
            <p>
              Le Client reconnaît expressément que:
            </p>
            <ul>
              <li>Le Service peut être interrompu temporairement ou définitivement, par exemple en raison de maintenance, de pannes, d'incidents de sécurité, de modifications sur des plateformes externes (comme Chiron) ou pour d'autres raisons techniques ou économiques.</li>
              <li>Le Prestataire a le droit de modifier, suspendre ou arrêter le Service <strong>à tout moment et sans préavis</strong>.</li>
              <li>
                En cas d'interruption, de panne ou d'arrêt du Service,
                <strong>aucune indemnisation ou compensation</strong> n'est due au Client ou à des tiers.
              </li>
            </ul>
          </section>

          <section>
            <h3>4. Limitation de responsabilité</h3>
            <p>
              Dans la mesure permise par la loi, la responsabilité du Prestataire envers
              le Client est limitée au montant des frais d'abonnement payés par le Client
              pour les douze (12) derniers mois.
            </p>
            <p>
              En aucun cas le Prestataire n'est responsable de:
            </p>
            <ul>
              <li>Dommages indirects, dommages consécutifs, perte de profit ou perte de données.</li>
              <li>Amendes, sanctions administratives ou autres mesures imposées par les autorités ou les organismes de contrôle.</li>
              <li>Dommages résultant d'une configuration incorrecte, de données BCE incorrectes ou d'une connexion incorrecte par le Client.</li>
            </ul>
            <p class="small">
              Rien dans cette clause n'exclut la responsabilité lorsque cela est impérativement interdit par la loi.
            </p>
          </section>
        </article>

        <!-- License Agreement -->
        <article class="card">
          <h2>Accord de Licence</h2>
          <div class="kicker">Utilisation de JOUW TAXI OS 26 en tant que SaaS pour VVB / taxi</div>

          <section>
            <h3>5. Licence et droits d'utilisation</h3>
            <p>
              Le Service est proposé en tant que Software-as-a-Service (SaaS).
              Le Client obtient un droit d'utilisation <strong>non exclusif, non transférable</strong>
              pour utiliser le Service pour ses propres activités professionnelles dans le cadre des activités VVB et/ou
              taxi en Flandre.
            </p>
            <p>Il est interdit au Client de:</p>
            <ul>
              <li>Copier, louer, sous-licencier ou revendre commercialement le Service à des tiers.</li>
              <li>Décompiler, faire de l'ingénierie inverse ou tenter de découvrir le fonctionnement interne du système d'une autre manière, sauf lorsque cela est expressément autorisé par la loi impérative.</li>
              <li>Utiliser le Service pour des activités illégales ou d'une manière qui pourrait nuire à la réputation du Prestataire.</li>
            </ul>
          </section>

          <section>
            <h3>6. Abonnement, durée minimale et résiliation</h3>
            <p>
              Le Service est proposé sur la base d'un abonnement par entreprise (client professionnel).
            </p>
            <ul>
              <li><strong>Durée minimale:</strong> 12 mois (un an) à partir de la date d'entrée en vigueur du contrat.</li>
              <li>Après la première période de 12 mois, l'abonnement est tacitement renouvelé pour des périodes successives de 12 mois chacune.</li>
              <li>
                Le Client peut résilier l'abonnement à la fin d'une période en cours, moyennant
                <strong>résiliation écrite au moins 3 mois avant la fin</strong> de cette période
                (par exemple par e-mail avec accusé de réception).
              </li>
            </ul>
            <p>
              En l'absence de résiliation en temps voulu, le contrat continue automatiquement pour une
              nouvelle période de 12 mois, sans droit au remboursement des montants déjà payés.
            </p>
          </section>

          <section>
            <h3>7. Rémunération, facturation et non-paiement</h3>
            <p>
              Le prix de l'abonnement, le rythme de paiement (mensuel / annuel) et les services supplémentaires éventuels
              sont fixés dans le devis ou le bon de commande séparé entre le Prestataire et le Client.
            </p>
            <p>
              En cas de non-paiement dans les délais, le Prestataire a le droit de:
            </p>
            <ul>
              <li>Limiter ou suspendre (temporairement) l'accès au Service, et</li>
              <li>Facturer des intérêts légaux et d'éventuels frais administratifs.</li>
            </ul>
          </section>
        </article>
      </div>

      <!-- Colonne droite: RGPD / DPA -->
      <div>
        <!-- GDPR & DPA -->
        <article class="card">
          <h2>Protection des Données (RGPD) & DPA</h2>
          <div class="kicker">Accord de traitement selon les règles européennes de confidentialité</div>

          <section>
            <h3>8. Rôles: responsable du traitement et sous-traitant</h3>
            <p>
              Au sens du Règlement Général sur la Protection des Données (<strong>RGPD</strong>):
            </p>
            <ul>
              <li>Le <strong>Client</strong> est le <strong>responsable du traitement</strong> pour toutes les données personnelles saisies ou traitées via le Service (données des conducteurs, véhicules, courses, passagers, etc.).</li>
              <li>Le <strong>Prestataire</strong> agit en tant que <strong>sous-traitant</strong> et traite les données personnelles uniquement sur instruction et selon les instructions du Client.</li>
            </ul>
          </section>

          <section>
            <h3>9. Finalités et base du traitement</h3>
            <p>
              Le Service traite les données personnelles uniquement pour les finalités suivantes:
            </p>
            <ul>
              <li>Enregistrement des courses, véhicules et chauffeurs dans le cadre des activités VVB / taxi.</li>
              <li>Connexion technique et transmission des données de course aux plateformes officielles (comme Chiron), si activé par le Client.</li>
              <li>Génération de rapports, factures et aperçus pour le Client.</li>
            </ul>
            <p>
              Le <strong>Client</strong> détermine lui-même la base juridique du traitement (par exemple:
              obligation légale, exécution d'un contrat avec le passager) et est responsable
              du respect correct de l'obligation d'information et des droits des personnes concernées.
            </p>
          </section>

          <section>
            <h3>10. Sécurité, hébergement et sous-traitants</h3>
            <p>
              Le Prestataire prend des mesures techniques et organisationnelles appropriées pour protéger les données personnelles
              contre la perte, l'accès non autorisé ou l'abus, en tenant compte de l'état de la technique et de la nature
              du traitement.
            </p>
            <p>
              Dans la mesure du possible, les données sont hébergées dans l'<strong>Espace Économique Européen (EEE)</strong>.
              Si des sous-traitants sont engagés, le Prestataire conclut des accords qui garantissent au minimum
              les mêmes niveaux de protection que dans cet accord de traitement.
            </p>
          </section>

          <section>
            <h3>11. Droits des personnes concernées et violations de données</h3>
            <p>
              Le Client reste le point de contact pour les personnes concernées (passagers, chauffeurs, employés) qui souhaitent
              exercer leurs droits RGPD (accès, rectification, suppression, limitation, opposition, etc.).
            </p>
            <p>
              Le Prestataire assistera le Client dans la mesure du raisonnable pour répondre à ces demandes,
              dans la mesure où les données sont techniquement disponibles via le Service.
            </p>
            <p>
              En cas d'<strong>incident de sécurité ou de violation de données</strong> pertinent pour les
              données traitées par le Client, le Prestataire informera le Client sans délai déraisonnable,
              afin que le Client puisse – si nécessaire – informer l'autorité de contrôle compétente et/ou les personnes concernées.
            </p>
          </section>

          <section>
            <h3>12. Durée de conservation et fin du traitement</h3>
            <p>
              Les données personnelles ne sont pas conservées plus longtemps que nécessaire pour l'exécution du Service
              et les obligations légales du Client (par exemple les délais de conservation imposés par la
              réglementation flamande ou la législation fiscale).
            </p>
            <p>
              À la fin du contrat, le Prestataire proposera, dans un délai raisonnable et à la demande
              du Client, une exportation des données disponibles dans un format courant
              (dans la mesure du techniquement possible). Ensuite, le Prestataire peut supprimer ou anonymiser les données,
              sauf lorsqu'une conservation plus longue est légalement nécessaire.
            </p>
          </section>
        </article>

        <!-- Droit applicable -->
        <article class="card">
          <h2>Droit Applicable & Choix du Forum</h2>
          <div class="kicker">Dispositions finales</div>

          <section>
            <h3>13. Droit applicable</h3>
            <p>
              Ces conditions et l'utilisation du Service sont exclusivement régies par le
              <strong>droit belge</strong>.
            </p>
          </section>

          <section>
            <h3>14. Tribunal compétent</h3>
            <p>
              Pour les litiges entre le Prestataire et le Client, les tribunaux du siège
              du Prestataire sont compétents, sans préjudice des dispositions impératives du droit.
            </p>
          </section>

          <section>
            <h3>15. Modifications des conditions</h3>
            <p>
              Le Prestataire peut modifier ces conditions de temps à autre. En cas de modifications substantielles,
              le Client sera informé à l'avance dans la mesure du possible.
              L'utilisation continue du Service après la modification vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <div class="footer-note">
            Faites vérifier ce texte juridiquement avant de l'utiliser comme contrat définitif.
          </div>
        </article>
      </div>
    </div>
  </div>
</body>
</html>`;

export interface ContractData {
  contractNumber: string;
  companyName: string;
  companyVAT: string;
  companyKBO: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  startDate: string;
  endDate: string;
  monthlyFee: number;
  annualFee: number;
  durationMonths: number;
  language?: 'nl' | 'fr';
}

export function generateContractHTML(data: ContractData): string {
  const template = data.language === 'fr' ? CONTRACT_TEMPLATE_HTML_FR : CONTRACT_TEMPLATE_HTML_NL;
  const locale = data.language === 'fr' ? 'fr-BE' : 'nl-BE';
  
  const escape = (value: string) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
  const values: Record<string, string> = {
    CONTRACT_NUMBER: escape(data.contractNumber), COMPANY_NAME: escape(data.companyName),
    COMPANY_VAT: escape(data.companyVAT), COMPANY_KBO: escape(data.companyKBO),
    START_DATE: new Date(data.startDate + 'T00:00:00Z').toLocaleDateString(locale, {timeZone:'UTC'}),
    END_DATE: new Date(data.endDate + 'T00:00:00Z').toLocaleDateString(locale, {timeZone:'UTC'}),
    MONTHLY_FEE: data.monthlyFee.toFixed(2), ANNUAL_FEE: data.annualFee.toFixed(2), DURATION_MONTHS: String(data.durationMonths),
  };
  return template
    .replace(/<style>[\s\S]*?<\/style>/, () => `<style>${CONTRACT_DOCUMENT_CSS}</style>`)
    .replace('<body>', '<body class="contract-document" data-contract-template="jouw-driver-v2">')
    .replace(/{{([A-Z_]+)}}/g, (placeholder, key) => values[key] ?? placeholder);
}
