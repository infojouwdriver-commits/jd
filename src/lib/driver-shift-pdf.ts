import { jsPDF } from "jspdf";
import { configurePdfFonts } from "@/legal/pdf-fonts";
import { shiftKilometres, shiftTime } from "./driver-shifts";
import type { ShiftDetail, ShiftStatus } from "./driver-shifts";

// The exported service sheet is always Dutch, independently of the portal locale.
export function driverShiftPdf({ shift: s, events }: ShiftDetail) {
  const doc = new jsPDF({ compress: true, putOnlyUsedFonts: true });
  configurePdfFonts(doc);
  doc.setProperties({
    title: "Dienststaat",
    subject: s.id,
    creator: "JOUW DRIVER",
  });
  doc.setLanguage("nl-BE");
  const status: Record<ShiftStatus, string> = {
    available: "Beschikbaar",
    driving_empty: "Onbeladen rijden",
    with_passenger: "Met passagier",
    break: "Pauze",
  };
  let y = 20;
  function line(text: string, bold = false) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines: string[] = doc.splitTextToSize(text, 178);
    for (const value of lines) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(value, 16, y);
      y += 5.5;
    }
    y += 2;
  }
  const km = (n: number) =>
    Number(n).toLocaleString("nl-BE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const distance = shiftKilometres(s);
  doc.setTextColor(22, 38, 59);
  doc.setFontSize(20);
  line("JOUW DRIVER · Dienststaat", true);
  doc.setFontSize(10);
  line(
    s.ended_at ? "Afgesloten dienst" : "Open dienst — voorlopige dienststaat",
    true,
  );
  line(`Bedrijf: ${s.company_name}`);
  line(`Chauffeur: ${s.driver_name}`);
  line(`Voertuig: ${s.plate_number}`);
  line(`Dienstbegin: ${shiftTime(s.started_at)}`);
  line(
    `Diensteinde: ${s.ended_at ? shiftTime(s.ended_at) : "Nog niet afgesloten"}`,
  );
  line(`Referentie: ${s.id}`);
  line(
    `Beginstand: ${km(s.start_odometer)} km · Laatste stand: ${km(s.odometer)} km`,
  );
  line(`Totale opgegeven afstand: ${km(distance.total)} km`, true);
  line(
    `Met passagiers: ${km(distance.passenger)} km · Onbeladen: ${km(distance.withoutPassenger)} km`,
  );
  y += 3;
  line("Geregistreerde minuten per status", true);
  const durations: Record<ShiftStatus, number> = {
    available: 0,
    driving_empty: 0,
    with_passenger: 0,
    break: 0,
  };
  for (let i = 0; i < events.length - 1; i++) {
    durations[events[i].work_status] +=
      (Date.parse(events[i + 1].recorded_at) -
        Date.parse(events[i].recorded_at)) /
      60000;
  }
  for (const key of Object.keys(status) as ShiftStatus[])
    line(`${status[key]}: ${km(durations[key])} min`);
  y += 3;
  line("Tellerstanden en statussen", true);
  const action = {
    start: "Dienstbegin",
    record: "Registratie",
    end: "Diensteinde",
  };
  for (const e of events) {
    // Keep every registration together, repeating the section on subsequent pages.
    if (y > 247) {
      doc.addPage();
      y = 20;
      line("Tellerstanden en statussen (vervolg)", true);
    }
    line(
      `#${e.version} · ${action[e.action]} · ${shiftTime(e.recorded_at)} (België)`,
      true,
    );
    line(
      `Teller: ${km(e.odometer)} km · Cumulatief met passagiers: ${km(e.passenger_km)} km`,
    );
    line(`Status na registratie: ${status[e.work_status]}`);
  }
  y += 3;
  line(
    "Verklaringen van de chauffeur sinds activering van het dienstregister. Afstanden worden niet met GPS berekend. Eerdere perioden worden niet gereconstrueerd. De status geldt tot de volgende registratie; de duur stopt bij de laatste registratie.",
  );
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Dienststaat · Pagina ${page} van ${pages}`, 16, 289);
  }
  return doc;
}
