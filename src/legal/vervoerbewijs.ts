
import { jsPDF } from 'jspdf';
import {configurePdfFonts} from './pdf-fonts';

// ─── Data Types ───────────────────────────────────────────────────────────────

export interface VervoerbewijsCompany {
  name: string;
  address?: string;
  vat_number?: string;
  kbo_number?: string;
  phone?: string;
  email?: string;
}

export interface VervoerbewijsDriver {
  full_name: string;
  bestuurderspas_number?: string;
  capacity_certificate_number?: string;
  phone?: string;
}

export interface VervoerbewijsVehicle {
  brand: string;
  model: string;
  plate_number: string;
  chiron_vehicle_id?: string;
}

export interface VervoerbewijsTrip {
  ritnummer: string;
  trip_uuid: string;
  start_time: string;
  end_time: string;
  start_address: string;
  end_address: string;
  start_lat?: number | null;
  start_lon?: number | null;
  end_lat?: number | null;
  end_lon?: number | null;
  distance_km: number;
  duration_minutes: number;
  price: number;
  passenger_name?: string | null;
  payment_method?: string | null;
  currency?: string;
}

export interface VervoerbewijsChiron {
  sync_state: string;
  chiron_trip_id?: string | null;
}

export interface VervoerbewijsData {
  company: VervoerbewijsCompany;
  driver: VervoerbewijsDriver;
  vehicle: VervoerbewijsVehicle;
  trip: VervoerbewijsTrip;
  chiron: VervoerbewijsChiron;
  document_number: string;
  document_date: string;
  vat_rate?: number;
  qr_code_url?: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Brussels' });
  } catch {
    return iso;
  }
}

function fmtDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('nl-BE', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Brussels' });
    const time = d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Brussels' });
    return `${date} ${time}`;
  } catch {
    return iso;
  }
}

function fmtGps(lat?: number | null, lon?: number | null): string {
  if (lat == null || lon == null) return 'N/A';
  return `${Number(lat).toFixed(6)}, ${Number(lon).toFixed(6)}`;
}

function chironLabel(state: string): string {
  const map: Record<string, string> = {
    completed: 'SUCCESS',
    start_accepted: 'START ACCEPTED',
    arrival_sent: 'ARRIVAL SENT',
    start_sent: 'START SENT',
    created: 'PENDING',
    failed: 'FAILED',
  };
  return map[state?.toLowerCase()] ?? state?.toUpperCase() ?? 'UNKNOWN';
}

function chironColor(state: string): [number, number, number] {
  const s = state?.toLowerCase();
  if (s === 'completed') return [22, 120, 22];
  if (s === 'failed') return [190, 30, 30];
  return [160, 100, 0];
}

// ─── Core renderer ────────────────────────────────────────────────────────────

/**
 * Generates a Belgian legal Vervoerbewijs PDF (80 mm thermal format).
 * Compliant with Articles 33 & 34 — Vlaanderen MOW / SPW Mobilite / Chiron.
 * No taximeter references. Immutable document.
 */
export function generateVervoerbewijs(data: VervoerbewijsData): jsPDF {
  const PAGE_W = 80;
  const MARGIN = 5;
  const RIGHT = PAGE_W - MARGIN;
  const MID = PAGE_W / 2;
  const CW = PAGE_W - MARGIN * 2;

  const BLACK: [number, number, number] = [0, 0, 0];
  const DARK: [number, number, number] = [25, 25, 25];
  const GRAY: [number, number, number] = [95, 95, 95];
  const LIGHT: [number, number, number] = [155, 155, 155];

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [PAGE_W, 500] });
  configurePdfFonts(doc);

  let y = 5;

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setFont = (size: number, bold: boolean, color: [number, number, number]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...color);
  };

  const hline = (thick = 0.2, color: [number, number, number] = GRAY) => {
    doc.setLineWidth(thick);
    doc.setDrawColor(...color);
    doc.line(MARGIN, y, RIGHT, y);
    y += 3;
  };

  const kv = (label: string, value: string) => {
    setFont(8, false, GRAY);
    doc.text(label, MARGIN, y);
    setFont(8, false, DARK);
    doc.text(value, RIGHT, y, { align: 'right' });
    y += 4;
  };

  const ml = (str: string, size = 8, color: [number, number, number] = DARK) => {
    setFont(size, false, color);
    const lines = doc.splitTextToSize(str, CW) as string[];
    lines.forEach((l) => { doc.text(l, MARGIN, y); y += 3.2; });
  };

  const section = (title: string) => {
    setFont(8.5, true, BLACK);
    doc.text(title, MARGIN, y);
    y += 5;
  };

  // ── Company header ─────────────────────────────────────────────────────────
  setFont(13, true, BLACK);
  doc.text(data.company.name, MID, y, { align: 'center' });
  y += 6;

  setFont(7.5, false, GRAY);
  if (data.company.address) {
    const lines = doc.splitTextToSize(data.company.address, CW) as string[];
    lines.forEach((l) => { doc.text(l, MID, y, { align: 'center' }); y += 3; });
  }
  if (data.company.vat_number) { doc.text(`BTW: ${data.company.vat_number}`, MID, y, { align: 'center' }); y += 3; }
  if (data.company.kbo_number) { doc.text(`KBO: ${data.company.kbo_number}`, MID, y, { align: 'center' }); y += 3; }
  if (data.company.phone) { doc.text(`Tel: ${data.company.phone}`, MID, y, { align: 'center' }); y += 3; }
  if (data.company.email) { doc.text(`Email: ${data.company.email}`, MID, y, { align: 'center' }); y += 3; }

  y += 2;
  hline(0.4, BLACK);

  // ── Document title ─────────────────────────────────────────────────────────
  setFont(13, true, BLACK);
  doc.text('VERVOERBEWIJS', MID, y, { align: 'center' });
  y += 5;

  setFont(7, false, GRAY);
  doc.text('Digitaal Ritbeheer — Vervoerplatform', MID, y, { align: 'center' });
  y += 4;

  setFont(7.5, false, GRAY);
  doc.text(`Nr: ${data.document_number}`, MID, y, { align: 'center' });
  y += 3;
  doc.text(fmtDateTime(data.document_date), MID, y, { align: 'center' });
  y += 4;

  hline(0.3);

  // ── Ritregistratie ─────────────────────────────────────────────────────────
  section('RITREGISTRATIE');
  kv('Ritnummer:', data.trip.ritnummer);
  const shortUuid = data.trip.trip_uuid.length > 28
    ? data.trip.trip_uuid.substring(0, 26) + '..'
    : data.trip.trip_uuid;
  kv('Trip UUID:', shortUuid);
  y += 1;
  hline(0.2);

  // ── Chauffeur ──────────────────────────────────────────────────────────────
  section('CHAUFFEUR');
  kv('Naam:', data.driver.full_name);
  const bestuurderspas = data.driver.bestuurderspas_number
    || data.driver.capacity_certificate_number
    || 'N/A';
  kv('Bestuurderskaart:', bestuurderspas);
  if (data.driver.phone) kv('Tel:', data.driver.phone);
  y += 1;
  hline(0.2);

  // ── Voertuig ───────────────────────────────────────────────────────────────
  section('VOERTUIG');
  kv('Nummerplaat:', data.vehicle.plate_number);
  kv('Voertuig:', `${data.vehicle.brand} ${data.vehicle.model}`);
  if (data.vehicle.chiron_vehicle_id) kv('Chiron ID:', data.vehicle.chiron_vehicle_id);
  y += 1;
  hline(0.2);

  // ── Ritgegevens ────────────────────────────────────────────────────────────
  section('RITGEGEVENS');
  kv('Vertrektijd:', fmtTime(data.trip.start_time));
  kv('Aankomsttijd:', fmtTime(data.trip.end_time));
  if (data.trip.passenger_name) kv('Passagier:', data.trip.passenger_name);
  y += 1;

  setFont(7.5, true, GRAY);
  doc.text('Vertrekadres:', MARGIN, y);
  y += 3.5;
  ml(data.trip.start_address);
  setFont(7, false, LIGHT);
  doc.text(`GPS: ${fmtGps(data.trip.start_lat, data.trip.start_lon)}`, MARGIN, y);
  y += 4;

  setFont(7.5, true, GRAY);
  doc.text('Aankomstadres:', MARGIN, y);
  y += 3.5;
  ml(data.trip.end_address);
  setFont(7, false, LIGHT);
  doc.text(`GPS: ${fmtGps(data.trip.end_lat, data.trip.end_lon)}`, MARGIN, y);
  y += 4;

  hline(0.2);

  kv('Afstand:', `${Number(data.trip.distance_km).toFixed(2)} km`);
  kv('Duur:', `${data.trip.duration_minutes} min`);
  if (data.trip.payment_method) kv('Betaalwijze:', data.trip.payment_method);

  hline(0.2);

  // ── BTW & Prijs ────────────────────────────────────────────────────────────
  const vatRate = data.vat_rate ?? 6;
  const totalPrice = Number(data.trip.price);
  const priceExcl = totalPrice / (1 + vatRate / 100);
  const vatAmount = totalPrice - priceExcl;
  const sym = (data.trip.currency ?? 'EUR') === 'EUR' ? '\u20AC' : (data.trip.currency ?? '\u20AC');

  kv('Bedrag excl. BTW:', `${sym}${priceExcl.toFixed(2)}`);
  kv(`BTW (${vatRate}%):`, `${sym}${vatAmount.toFixed(2)}`);

  y += 1;
  hline(0.5, BLACK);

  setFont(12, true, BLACK);
  doc.text('TOTAAL:', MARGIN, y);
  doc.text(`${sym}${totalPrice.toFixed(2)}`, RIGHT, y, { align: 'right' });
  y += 7;

  hline(0.3);

  // ── Chiron transmissie ─────────────────────────────────────────────────────
  section('CHIRON TRANSMISSIE');

  const cLabel = chironLabel(data.chiron.sync_state);
  const cColor = chironColor(data.chiron.sync_state);

  setFont(8, false, GRAY);
  doc.text('Status:', MARGIN, y);
  setFont(8, true, cColor);
  doc.text(cLabel, RIGHT, y, { align: 'right' });
  y += 4;

  if (data.chiron.chiron_trip_id) {
    setFont(8, false, GRAY);
    doc.text('Transmission ID:', MARGIN, y);
    setFont(8, false, DARK);
    doc.text(data.chiron.chiron_trip_id, RIGHT, y, { align: 'right' });
    y += 4;
  }

  y += 1;
  hline(0.3);

  // ── QR code ────────────────────────────────────────────────────────────────
  if (data.qr_code_url) {
    try {
      setFont(7.5, true, DARK);
      doc.text('Bekijk online:', MID, y, { align: 'center' });
      y += 4;
      const qrSize = 28;
      const qrX = (PAGE_W - qrSize) / 2;
      doc.addImage(data.qr_code_url, 'PNG', qrX, y, qrSize, qrSize);
      y += qrSize + 3;
    } catch {
      // QR load failed silently
    }
  }

  // ── Klachteninstantie (Article 34) ─────────────────────────────────────────
  hline(0.2);
  setFont(7.5, true, GRAY);
  doc.text('KLACHTENINSTANTIE', MARGIN, y);
  y += 4;

  setFont(7, false, GRAY);
  const complaintLines = [
    'Vlaamse Overheid',
    'Mobiliteit en Openbare Werken',
    'https://www.vlaanderen.be/taxi',
  ];
  complaintLines.forEach((l) => { doc.text(l, MID, y, { align: 'center' }); y += 3; });

  y += 2;
  hline(0.2);

  // ── Legal footer ───────────────────────────────────────────────────────────
  setFont(6.5, false, GRAY);
  const footerLines = [
    `BTW: ${data.vat_rate}% - tarief vermeld in dit document.`,
    'Digitaal vervoerbewijs - JOUW DRIVER.',
    'Bewaar dit document bij uw ritgegevens.',
  ];
  footerLines.forEach((l) => { doc.text(l, MID, y, { align: 'center' }); y += 3; });

  y += 2;
  setFont(8, true, DARK);
  doc.text('Bedankt voor uw vertrouwen!', MID, y, { align: 'center' });
  y += 6;


  return doc;
}

// ─── Utility exports ──────────────────────────────────────────────────────────

export function getVervoerbewijsBlob(doc: jsPDF): Blob {
  return doc.output('blob');
}

export function getVervoerbewijsArrayBuffer(doc: jsPDF): ArrayBuffer {
  return doc.output('arraybuffer');
}
