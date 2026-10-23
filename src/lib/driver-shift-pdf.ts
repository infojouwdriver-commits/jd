import { jsPDF } from "jspdf";
import {drawPdfQr} from "./pdf-qr";
import {shiftReference, shiftDocumentUrl} from "./shift-document";
import { configurePdfFonts } from "@/legal/pdf-fonts";
import { shiftDurations, shiftKilometres, shiftTime } from "./driver-shifts";
import type { ShiftDetail, ShiftStatus } from "./driver-shifts";

// Independent Dutch service document. Customer receipts are a separate document.
export function driverShiftPdf(detail: ShiftDetail) {
  const { shift: s, events, activity, summary } = detail;
  const doc = new jsPDF({ compress: true, putOnlyUsedFonts: true });
  configurePdfFonts(doc);
  doc.setProperties({
    title: "Dienststaat",
    subject: s.id,
    creator: "JOUW DRIVER",
  });
  doc.setLanguage("nl-BE");
  const navy: [number, number, number] = [20, 36, 56],
    gold: [number, number, number] = [5, 150, 105];
  const gray: [number, number, number] = [98, 110, 124];
  const status: Record<ShiftStatus, string> = {
    available: "Beschikbaar",
    driving_empty: "Onbeladen rijden",
    with_passenger: "Met passagier",
    break: "Pauze",
  };
  const action = {
    start: "Dienstbegin",
    record: "Registratie",
    end: "Diensteinde",
  };
  const labels = {
    status: "Statuswijziging",
    trip_start: "Ritbegin",
    trip_end: "Riteinde",
    trip_cancel: "Rit geannuleerd",
    declaration: "Tellerstand",
  };
  const profile = s.document_profile || {};
  const number = (value: number) =>
    Number(value).toLocaleString("nl-BE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const present = (value: unknown) =>
    value === null || value === undefined || value === "" ? "-" : String(value);
  const font = (size = 9, bold = false, color = navy) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };
  let y = 48;
  function page() {
    doc.addPage();
    y = 22;
    font(9, true);
    doc.text("JOUW DRIVER  /  DIENSTSTAAT", 16, 13);
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(16, 16, 194, 16);
  }
  function ensure(height: number) {
    if (y + height > 276) page();
  }
  function block(
    value: string,
    x: number,
    width: number,
    size = 9,
    bold = false,
    color = navy,
  ) {
    font(size, bold, color);
    const lines: string[] = doc.splitTextToSize(value, width);
    doc.text(lines, x, y);
    return lines.length * size * 0.43;
  }
  function paragraph(value: string, size = 8, color = gray) {
    font(size, false, color);
    const lines: string[] = doc.splitTextToSize(value, 178);
    for (const line of lines) {
      ensure(size * 0.5 + 1);
      doc.text(line, 16, y);
      y += size * 0.5;
    }
    y += 3;
  }
  function section(title: string) {
    ensure(15);
    y += 3;
    font(10, true);
    doc.text(title.toUpperCase(), 16, y);
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(16, y + 3, 194, y + 3);
    y += 8;
  }
  function pairs(rows: [string, string][]) {
    for (let i = 0; i < rows.length; i += 2) {
      const cells = rows.slice(i, i + 2);
      font(9, true);
      const heights = cells.map(
        ([, value]) => doc.splitTextToSize(value, 84).length * 4.2,
      );
      ensure(Math.max(...heights) + 6);
      cells.forEach(([label, value], j) => {
        const x = 16 + j * 91;
        font(7.5, false, gray);
        doc.text(label, x, y);
        font(9, true);
        doc.text(doc.splitTextToSize(value, 84), x, y + 4.5);
      });
      y += Math.max(...heights) + 6;
    }
  }
  function table(headers: string[], rows: string[][], widths: number[]) {
    const header = () => {
      ensure(14);
      doc.setFillColor(...navy);
      doc.rect(16, y - 4, 178, 11, "F");
      let x = 16;
      headers.forEach((value, i) => {
        font(7, true, [255, 255, 255]);
        doc.text(doc.splitTextToSize(value, widths[i] - 4), x + 2, y);
        x += widths[i];
      });
      y += 11;
    };
    header();
    rows.forEach((row, index) => {
      font(8);
      const cells = row.map(
        (value, i) => doc.splitTextToSize(value, widths[i] - 4) as string[],
      );
      const height = Math.max(...cells.map((a) => a.length)) * 3.8 + 5;
      if (y + height > 274) {
        page();
        header();
      }
      // Source names may be long. Split oversized rows instead of clipping them.
      const count = Math.max(...cells.map((a) => a.length));
      for (let from = 0; from < count;) {
        const capacity = Math.max(1, Math.floor((271 - y - 5) / 3.8)),
          take = Math.min(capacity, count - from);
        if (index % 2 === 0) {
          doc.setFillColor(243, 246, 249);
          doc.rect(16, y - 3, 178, take * 3.8 + 5, "F");
        }
        let x = 16;
        cells.forEach((cell, i) => {
          font(8);
          const lines = cell.slice(from, from + take);
          if (lines.length) doc.text(lines, x + 2, y + 1);
          x += widths[i];
        });
        y += take * 3.8 + 5;
        from += take;
        if (from < count) {
          page();
          header();
        }
      }
      doc.setDrawColor(222, 228, 234);
      doc.setLineWidth(0.15);
      doc.line(16, y - 3, 194, y - 3);
    });
    y += 3;
  }
  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 36, "F");
  font(9, true, [110, 231, 183]);
  doc.text("JOUW DRIVER  /  SERVICE ADMINISTRATIE", 16, 10);
  font(24, true, [255, 255, 255]);
  doc.text("Dienststaat", 16, 23);
  font(9, false, [235, 239, 244]);
  doc.text(
    s.ended_at ? "AFGESLOTEN DIENST" : "OPEN DIENST - VOORLOPIG",
    16,
    31,
  );
  doc.setFillColor(...gold);
  doc.rect(0, 36, 210, 1.2, "F");
  y += block(s.company_name, 16, 178, 14, true) + 3;
  const contact = [
    profile.company_address,
    profile.company_phone ? `Tel. ${profile.company_phone}` : null,
    profile.company_email,
  ]
    .filter(Boolean)
    .join("  |  ");
  paragraph(
    contact || "Adres / telefoon / e-mail: niet geregistreerd bij dienstbegin",
    8,
  );
  paragraph(
    `BTW: ${present(profile.company_vat)}  |  KBO: ${present(profile.company_kbo)}`,
    8,
  );
  section("Dienstgegevens");
  pairs([
    ["Chauffeur", s.driver_name],
    ["Chauffeursnummer", present(s.driver_id)],
    ["Bestuurderskaart / pasnummer", present(profile.driver_card)],
    ["Voertuig / wagen", s.plate_number],
    [
      "Voertuig-ID / identificatiecode",
      `${present(s.vehicle_id)} / ${present(profile.vehicle_code)}`,
    ],
    ["Dienstnummer / referentie", shiftReference(s.id)],
    ["Aanvang dienst - België", shiftTime(s.started_at)],
    [
      "Einde dienst - België",
      s.ended_at ? shiftTime(s.ended_at) : "Nog niet afgesloten",
    ],
  ]);
  section("Kilometerteller en afstanden");
  pairs([
    ["Km stand begin", `${number(s.start_odometer)} km`],
    [
      s.ended_at ? "Km stand eind" : "Laatst opgegeven km stand",
      `${number(s.odometer)} km`,
    ],
  ]);
  const km = shiftKilometres(s);
  ensure(23);
  [
    ["Totale afstand", km.total],
    ["Afstand beladen", km.passenger],
    ["Afstand onbeladen", km.withoutPassenger],
  ].forEach(([label, value], i) => {
    const x = 16 + i * 60;
    doc.setFillColor(243, 246, 249);
    doc.roundedRect(x, y - 3, 58, 21, 2, 2, "F");
    font(7.5, false, gray);
    doc.text(String(label), x + 3, y + 2);
    font(14, true);
    doc.text(`${number(Number(value))} km`, x + 3, y + 11);
  });
  y += 24;
  section("Tijdsregistratie");
  const d = shiftDurations(detail),
    time = (minutes: number) => {
      const n = Math.max(0, Math.round(minutes * 60));
      return `${String(Math.floor(n / 3600)).padStart(2, "0")}:${String(Math.floor(n / 60) % 60).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
    };
  const times = [
    d.driving_empty + d.with_passenger,
    d.available,
    d.break,
    Object.values(d).reduce((a, b) => a + b, 0),
  ];
  table(
    ["Rijtijd", "Overige / beschikbaar", "Pauze", "Totaal geregistreerd"],
    [times.map(time)],
    [44, 46, 42, 46],
  );
  paragraph(
    "Tijden in uu:mm:ss, tot de laatste registratie. Rijtijd omvat onbeladen rijden en rijden met passagier.",
    7.5,
  );
  pairs([
    [
      "Aantal afgeronde ritten",
      summary ? String(summary.trip_count) : "Niet beschikbaar",
    ],
    [
      "Aantal activiteiten / registraties",
      String(
        summary?.activity_count ??
          events.length +
            (activity || []).filter((a) => a.kind !== "declaration").length,
      ),
    ],
  ]);
  section("Geregistreerde ontvangsten");
  if (!summary)
    paragraph("Geen betalingssamenvatting beschikbaar voor deze registratie.");
  else if (!summary.payments.length)
    paragraph("Nog geen afgeronde ritten met geregistreerde ontvangsten.");
  else {
    table(
      ["Valuta", "Contant", "Kaart", "Platform / overig", "Onbekend", "Totaal"],
      summary.payments.map((p) => [
        p.currency,
        number(p.cash),
        number(p.card),
        number(p.other),
        number(p.unknown),
        number(p.total),
      ]),
      [24, 30, 30, 34, 30, 30],
    );
    if (summary.payments.some((p) => p.missing_amounts > 0))
      paragraph(
        "Let op: ritten zonder bedrag zijn niet in de bedragen opgeteld.",
        8,
      );
  }
  ensure(48);
  drawPdfQr(doc, shiftDocumentUrl(s.id), 16, y, 34);
  font(9, true);
  doc.text("Open deze dienst in het portaal", 55, y + 10);
  font(8, false, gray);
  doc.text("Aanmelden vereist. PDF wordt op aanvraag gemaakt.", 55, y + 17);
  doc.text(s.ended_at ? "Afgesloten dienst" : "Voorlopig: open dienst kan nog wijzigen.", 55, y + 24);
  y += 40;
  page();
  section("Tellerstanden en statussen");
  table(
    [
      "Nr.",
      "Tijdstip - België",
      "Registratie",
      "Teller (km)",
      "Beladen (km)",
      "Status",
    ],
    events.map((e) => [
      `#${e.version}`,
      shiftTime(e.recorded_at),
      action[e.action],
      number(e.odometer),
      number(e.passenger_km),
      status[e.work_status],
    ]),
    [12, 39, 31, 28, 28, 40],
  );
  const items = (activity || []).filter((a) => a.kind !== "declaration");
  if (items.length) {
    section("Dienstactiviteit en ritten");
    table(
      ["Tijdstip - België", "Activiteit", "Rit / bron", "Status"],
      items.map((a) => [
        shiftTime(a.occurred_at),
        labels[a.kind],
        a.trip_id ? `#${a.trip_id} / ${a.source || "-"}` : "-",
        a.work_status ? status[a.work_status] : "-",
      ]),
      [40, 39, 59, 40],
    );
  }
  paragraph(
    "Bedragen betreffen gekoppelde afgeronde ritten, per oorspronkelijke valuta. Dit overzicht is geen klantenfactuur. Kilometerstanden en beladen afstand zijn verklaringen van de chauffeur, niet afgeleid uit GPS. Ontbrekende gegevens worden niet aangevuld. Registraties zijn bewaard met hun oorspronkelijke tijdstippen. De status geldt tot de volgende registratie. Eerdere perioden worden niet gereconstrueerd.",
    7.5,
  );
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(222, 228, 234);
    doc.line(16, 281, 194, 281);
    font(7, false, gray);
    doc.text(`Dienststaat ${shiftReference(s.id)}`, 16, 286);
    doc.text(`${p} / ${pages}`, 194, 286, { align: "right" });
  }
  return doc;
}
