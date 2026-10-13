import {configurePdfFonts} from '../legal/pdf-fonts';
import {structuredPaymentReference} from './payment-reference';

import { jsPDF } from 'jspdf';

interface CompanyInfo {
  id: number;
  name: string;
  kbo_number: string;
  address: string;
  email: string;
  phone: string;
  vat_number: string;
  client_name?: string;
  bank_account_iban?: string;
  bank_account_bic?: string;
  bank_account_holder?: string;
}

interface DriverInfo {
  id: number;
  full_name: string;
  capacity_certificate_number: string;
  phone: string;
}

interface VehicleInfo {
  id: number;
  brand: string;
  model: string;
  plate_number: string;
}

interface TestResult {
  ritnummer: string;
  status: 'success' | 'failed';
  vertrek: boolean;
  aankomst: boolean;
  messageType?: string;
  httpStatus?: number;
  error?: string;
  startAddress?: string;
  endAddress?: string;
  startTime?: string;
  endTime?: string;
  startLat?: number;
  startLon?: number;
  endLat?: number;
  endLon?: number;
}

interface AcceptanceTestReport {
  company: CompanyInfo;
  driver: DriverInfo;
  vehicle: VehicleInfo;
  testDate: string;
  totalMessages: number;
  successCount: number;
  failedCount: number;
  results: TestResult[];
}

interface TripInvoiceData {
  company: CompanyInfo;
  driver: DriverInfo;
  trip: {
    id: number;
    start_time: string;
    end_time: string;
    start_address: string;
    end_address: string;
    distance_km: number;
    duration_minutes: number;
    price: number;
    passenger_name?: string;
    ritnummer?: string;
  };
  invoiceNumber: string;
  // Full ISO datetime string for correct time display
  invoiceDate: string;
  vatRate?: number;
  paymentReference?: string;
  shareUrl?: string;
  qrCodeUrl?: string;
}

interface CompanyInvoiceData {
  company: CompanyInfo;
  client: {
    name: string;
    address?: string;
    vat_number?: string;
    email?: string;
    phone?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  invoiceNumber: string;
  invoiceDate: string;
  vatRate: number;
  totalHtva: number;
  totalTvac: number;
  paymentReference?: string;
}

export class PDFGenerator {
  /**
   * Generate structured payment reference (Belgian OGM format)
   */
  static generateStructuredReference(invoiceNumber: string): string {
    return structuredPaymentReference(invoiceNumber);
  }

  /**
   * Generate EPC QR Code payload for Bancontact payment
   */
  static generateEpcPayload(data: {
    iban: string;
    bic: string;
    accountHolder: string;
    amount: number;
    structuredReference: string;
  }): string {
    return `BCD\n001\n1\nSCT\n${data.bic}\n${data.accountHolder}\n${data.iban}\nEUR${data.amount.toFixed(2)}\n\n\n${data.structuredReference}`.trim();
  }

  private static addLogoWatermark(doc: jsPDF): void {
    try {
      const logoUrl = 'https://cdn.chat2db-ai.com/app/avatar/custom/97bcaa08-5a5e-4ea7-a660-57bb8ef94a40_737955.PNG';
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const logoWidth = 80;
      const logoHeight = 80;
      const x = (pageWidth - logoWidth) / 2;
      const y = (pageHeight - logoHeight) / 2;
      doc.setGState({ opacity: 0.08 });
      doc.addImage(logoUrl, 'PNG', x, y, logoWidth, logoHeight);
      doc.setGState({ opacity: 1.0 });
    } catch (error) {
      console.error("Operation failed");
    }
  }

  private static addHeaderLogo(doc: jsPDF, yPosition: number): number {
    try {
      const logoUrl = 'https://cdn.chat2db-ai.com/app/avatar/custom/97bcaa08-5a5e-4ea7-a660-57bb8ef94a40_737955.PNG';
      const logoWidth = 30;
      const logoHeight = 30;
      doc.addImage(logoUrl, 'PNG', 20, yPosition, logoWidth, logoHeight);
      return yPosition + logoHeight + 5;
    } catch (error) {
      console.error("Operation failed");
      return yPosition;
    }
  }

  /**
   * Generate acceptance test report PDF (Dutch)
   */
  static generateAcceptanceTestReport(data: AcceptanceTestReport): jsPDF {
    const doc = new jsPDF();
    configurePdfFonts(doc);

    this.addLogoWatermark(doc);

    const primaryColor = [212, 175, 55] as const;
    const successColor = [34, 197, 94] as const;
    const errorColor = [239, 68, 68] as const;
    const grayColor = [107, 114, 128] as const;

    let yPosition = 20;

    yPosition = this.addHeaderLogo(doc, yPosition);

    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text('Chiron Acceptatietest Rapport', 105, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(...grayColor);
    doc.text('Brussels Gewest - Vlaanderen MOW', 105, yPosition, { align: 'center' });

    yPosition += 15;

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);

    yPosition += 10;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Bedrijfsinformatie', 20, yPosition);

    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);

    const companyInfo = [
      `Bedrijfsnaam: ${data.company.name}`,
      `KBO-nummer: ${data.company.kbo_number || 'N/A'}`,
      `BTW-nummer: ${data.company.vat_number || 'N/A'}`,
      `Adres: ${data.company.address || 'N/A'}`,
      `E-mail: ${data.company.email || 'N/A'}`,
      `Telefoon: ${data.company.phone || 'N/A'}`
    ];

    companyInfo.forEach(line => {
      doc.text(line, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Chauffeursinformatie', 20, yPosition);

    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);

    const driverInfo = [
      `Naam: ${data.driver.full_name}`,
      `Capaciteitsbewijs: ${data.driver.capacity_certificate_number}`,
      `Telefoon: ${data.driver.phone || 'N/A'}`
    ];

    driverInfo.forEach(line => {
      doc.text(line, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Voertuiginformatie', 20, yPosition);

    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);

    const vehicleInfo = [
      `Merk: ${data.vehicle.brand}`,
      `Model: ${data.vehicle.model}`,
      `Nummerplaat: ${data.vehicle.plate_number}`
    ];

    vehicleInfo.forEach(line => {
      doc.text(line, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Testinformatie', 20, yPosition);

    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);

    const testDate = new Date(data.testDate);
    const formattedDate = testDate.toLocaleDateString('nl-BE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    doc.text(`Testdatum: ${formattedDate}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Testomgeving: TEST (Acceptatie)`, 25, yPosition);

    yPosition += 10;

    doc.setDrawColor(...primaryColor);
    doc.line(20, yPosition, 190, yPosition);

    yPosition += 10;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Testresultaten Samenvatting', 20, yPosition);

    yPosition += 10;

    const boxWidth = 50;
    const boxHeight = 25;
    const boxSpacing = 10;
    const startX = 20;

    doc.setFillColor(240, 240, 240);
    doc.rect(startX, yPosition, boxWidth, boxHeight, 'F');
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text(data.totalMessages.toString(), startX + boxWidth / 2, yPosition + 12, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('Totaal Berichten', startX + boxWidth / 2, yPosition + 20, { align: 'center' });

    doc.setFillColor(220, 252, 231);
    doc.rect(startX + boxWidth + boxSpacing, yPosition, boxWidth, boxHeight, 'F');
    doc.setFontSize(20);
    doc.setTextColor(...successColor);
    doc.text(data.successCount.toString(), startX + boxWidth + boxSpacing + boxWidth / 2, yPosition + 12, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('Geslaagd', startX + boxWidth + boxSpacing + boxWidth / 2, yPosition + 20, { align: 'center' });

    doc.setFillColor(254, 226, 226);
    doc.rect(startX + (boxWidth + boxSpacing) * 2, yPosition, boxWidth, boxHeight, 'F');
    doc.setFontSize(20);
    doc.setTextColor(...errorColor);
    doc.text(data.failedCount.toString(), startX + (boxWidth + boxSpacing) * 2 + boxWidth / 2, yPosition + 12, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('Mislukt', startX + (boxWidth + boxSpacing) * 2 + boxWidth / 2, yPosition + 20, { align: 'center' });

    yPosition += boxHeight + 15;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Gedetailleerde Testresultaten', 20, yPosition);

    yPosition += 10;

    data.results.forEach((result, index) => {
      if (yPosition > 250) {
        doc.addPage();
        this.addLogoWatermark(doc);
        yPosition = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Rit ${index + 1}:`, 20, yPosition);
      yPosition += 7;

      doc.setFontSize(9);
      doc.setTextColor(...grayColor);

      const ritnummerText = result.ritnummer.length > 50
        ? result.ritnummer.substring(0, 47) + '...'
        : result.ritnummer;
      doc.text(`Ritnummer: ${ritnummerText}`, 25, yPosition);
      yPosition += 5;

      if (result.startTime) {
        const startTime = new Date(result.startTime);
        doc.text(`Vertrektijd: ${startTime.toLocaleString('nl-BE')}`, 25, yPosition);
        yPosition += 5;
      }

      if (result.endTime) {
        const endTime = new Date(result.endTime);
        doc.text(`Aankomsttijd: ${endTime.toLocaleString('nl-BE')}`, 25, yPosition);
        yPosition += 5;
      }

      if (result.startAddress) {
        const startAddressLines = doc.splitTextToSize(`Van: ${result.startAddress}`, 160);
        doc.text(startAddressLines, 25, yPosition);
        yPosition += startAddressLines.length * 5;

        if (result.startLat !== undefined && result.startLon !== undefined) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`Coördinaten: ${result.startLat.toFixed(6)}, ${result.startLon.toFixed(6)}`, 25, yPosition);
          yPosition += 4;
          doc.setFontSize(9);
          doc.setTextColor(...grayColor);
        }
      }

      if (result.endAddress) {
        const endAddressLines = doc.splitTextToSize(`Naar: ${result.endAddress}`, 160);
        doc.text(endAddressLines, 25, yPosition);
        yPosition += endAddressLines.length * 5;

        if (result.endLat !== undefined && result.endLon !== undefined) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`Coördinaten: ${result.endLat.toFixed(6)}, ${result.endLon.toFixed(6)}`, 25, yPosition);
          yPosition += 4;
          doc.setFontSize(9);
          doc.setTextColor(...grayColor);
        }
      }

      if (result.messageType === 'vertrek' || result.messageType === 'aankomst') {
        doc.text(`Bericht: ${result.messageType.toUpperCase()}`, 25, yPosition);
        yPosition += 5;
        if (Number.isInteger(result.httpStatus)) { doc.text(`HTTP: ${result.httpStatus}`, 25, yPosition); yPosition += 5; }
      } else {
        doc.text(`VERTREK: ${result.vertrek ? '✓ Geslaagd' : '✗ Mislukt'}`, 25, yPosition);
        yPosition += 5;
        doc.text(`AANKOMST: ${result.aankomst ? '✓ Geslaagd' : '✗ Mislukt'}`, 25, yPosition);
        yPosition += 5;
      }

      if (result.status === 'success') {
        doc.setTextColor(...successColor);
        doc.text('Status: Geslaagd', 25, yPosition);
      } else {
        doc.setTextColor(...errorColor);
        doc.text('Status: Mislukt', 25, yPosition);
        if (result.error) {
          yPosition += 5;
          doc.setFontSize(8);
          const errorLines = doc.splitTextToSize(`Fout: ${result.error}`, 160);
          doc.text(errorLines, 25, yPosition);
          yPosition += errorLines.length * 4;
        }
      }

      yPosition += 10;

      doc.setDrawColor(...grayColor);
      doc.setLineWidth(0.2);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;
    });

    yPosition += 5;

    if (yPosition > 250) {
      doc.addPage();
      this.addLogoWatermark(doc);
      yPosition = 20;
    }

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);

    yPosition += 10;

    doc.setFontSize(12);
    if (data.failedCount === 0) {
      doc.setTextColor(...successColor);
      doc.text('✓ Acceptatietest Geslaagd', 20, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.setTextColor(...grayColor);
      doc.text('Alle 10 berichten (5 VERTREK + 5 AANKOMST) zijn succesvol verzonden.', 20, yPosition);
      yPosition += 6;
      doc.text('Dit rapport kan worden ingediend bij de gemeente voor goedkeuring.', 20, yPosition);
    } else {
      doc.setTextColor(...errorColor);
      doc.text('✗ Acceptatietest Mislukt', 20, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.setTextColor(...grayColor);
      doc.text(`${data.failedCount} van de 10 berichten zijn mislukt.`, 20, yPosition);
      yPosition += 6;
      doc.text('Controleer de fouten en voer de test opnieuw uit.', 20, yPosition);
    }

    yPosition += 15;

    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('Opmerking: Dit rapport is automatisch gegenereerd door het Jouw Driver Taxi Management Systeem.', 20, yPosition);
    yPosition += 5;
    doc.text('Voor vragen of ondersteuning, neem contact op met uw systeembeheerder.', 20, yPosition);

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.text(`Pagina ${i} van ${pageCount}`, 105, 290, { align: 'center' });
      doc.text(`Gegenereerd op: ${new Date().toLocaleDateString('nl-BE')}`, 190, 290, { align: 'right' });
    }

    return doc;
  }

  /**
   * Generate trip invoice PDF (80mm thermal printer format)
   * Fixes: shows company email, correct trip time (not 00:00)
   */
  static generateTripInvoice(data: TripInvoiceData): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 297]
    });
    configurePdfFonts(doc);

    const pageWidth = 80;
    let y = 5;
    const margin = 5;
    const contentWidth = pageWidth - (margin * 2);

    const darkColor = [0, 0, 0] as const;
    const grayColor = [100, 100, 100] as const;

    // Company name header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    const companyName = data.company.name || 'TAXI';
    doc.text(companyName, pageWidth / 2, y, { align: 'center' });
    y += 6;

    // Company info
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);

    if (data.company.address) {
      const addressLines = doc.splitTextToSize(data.company.address, contentWidth);
      addressLines.forEach((line: string) => {
        doc.text(line, pageWidth / 2, y, { align: 'center' });
        y += 3;
      });
    }

    if (data.company.vat_number) {
      doc.text(`BTW: ${data.company.vat_number}`, pageWidth / 2, y, { align: 'center' });
      y += 3;
    }

    if (data.company.phone) {
      doc.text(`Tel: ${data.company.phone}`, pageWidth / 2, y, { align: 'center' });
      y += 3;
    }

    // Company email - shown below phone number
    if (data.company.email) {
      doc.text(`Email: ${data.company.email}`, pageWidth / 2, y, { align: 'center' });
      y += 3;
    }

    y += 2;

    // Separator
    doc.setLineWidth(0.3);
    doc.setDrawColor(...grayColor);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;

    // Invoice title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('TAXIRIT FACTUUR', pageWidth / 2, y, { align: 'center' });
    y += 5;

    // Invoice number and date/time
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text(`Nr: ${data.invoiceNumber}`, pageWidth / 2, y, { align: 'center' });
    y += 3;

    // Parse the full ISO datetime to show correct date AND time
    const invoiceDateObj = new Date(data.invoiceDate);
    const formattedInvoiceDateTime = invoiceDateObj.toLocaleDateString('nl-BE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) + ' ' + invoiceDateObj.toLocaleTimeString('nl-BE', {
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.text(formattedInvoiceDateTime, pageWidth / 2, y, { align: 'center' });
    y += 4;

    // Separator
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;

    // Trip details section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('RITGEGEVENS', margin, y);
    y += 4;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);

    if (data.trip.ritnummer) {
      doc.text(`Ritnr: ${data.trip.ritnummer}`, margin, y);
      y += 3.5;
    }

    doc.text(`Chauffeur: ${data.driver.full_name}`, margin, y);
    y += 3.5;

    if (data.trip.passenger_name) {
      doc.text(`Passagier: ${data.trip.passenger_name}`, margin, y);
      y += 3.5;
    }

    y += 1;

    // Trip start time - use actual trip start_time for correct time display
    const startTime = new Date(data.trip.start_time);
    doc.text(
      `Start: ${startTime.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}`,
      margin,
      y
    );
    y += 3.5;

    // Trip end time - use actual trip end_time for correct time display
    const endTime = new Date(data.trip.end_time);
    doc.text(
      `Einde: ${endTime.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}`,
      margin,
      y
    );
    y += 4;

    // Start address
    doc.setFont('helvetica', 'bold');
    doc.text('Van:', margin, y);
    y += 3;
    doc.setFont('helvetica', 'normal');
    const startAddressLines = doc.splitTextToSize(data.trip.start_address, contentWidth);
    startAddressLines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 3;
    });
    y += 1;

    // End address
    doc.setFont('helvetica', 'bold');
    doc.text('Naar:', margin, y);
    y += 3;
    doc.setFont('helvetica', 'normal');
    const endAddressLines = doc.splitTextToSize(data.trip.end_address, contentWidth);
    endAddressLines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 3;
    });
    y += 2;

    // Separator
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;

    // Distance and duration
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    doc.text('Afstand:', margin, y);
    doc.text(`${data.trip.distance_km.toFixed(2)} km`, pageWidth - margin, y, { align: 'right' });
    y += 3.5;

    doc.text('Duur:', margin, y);
    doc.text(`${data.trip.duration_minutes} min`, pageWidth - margin, y, { align: 'right' });
    y += 4;

    // Separator
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;

    // VAT calculation
    const vatRate = data.vatRate || 6;
    const priceExclVat = data.trip.price / (1 + vatRate / 100);
    const vatAmount = data.trip.price - priceExclVat;

    doc.setFontSize(8);
    doc.text('Bedrag excl. BTW:', margin, y);
    doc.text(`€${priceExclVat.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    y += 3.5;

    doc.text(`BTW (${vatRate}%):`, margin, y);
    doc.text(`€${vatAmount.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    y += 4;

    // Thick separator
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    // Total amount
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('TOTAAL:', margin, y);
    doc.text(`€${data.trip.price.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    y += 6;

    // Separator
    doc.setLineWidth(0.3);
    doc.setDrawColor(...grayColor);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    // QR Code
    if (data.qrCodeUrl) {
      try {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('Bekijk factuur online:', pageWidth / 2, y, { align: 'center' });
        y += 4;

        const qrSize = 30;
        const qrX = (pageWidth - qrSize) / 2;
        doc.addImage(data.qrCodeUrl, 'PNG', qrX, y, qrSize, qrSize);
        y += qrSize + 3;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayColor);
        doc.text('Scan QR code voor factuurdetails', pageWidth / 2, y, { align: 'center' });
        y += 5;
      } catch (error) {
        console.error("Operation failed");
      }
    }

    // Legal note
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    const legalNote = 'Taxirit onderworpen aan 6% BTW volgens Belgische wetgeving.';
    const legalLines = doc.splitTextToSize(legalNote, contentWidth);
    legalLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, y, { align: 'center' });
      y += 2.5;
    });

    y += 2;

    // Thank you
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('Bedankt voor uw vertrouwen!', pageWidth / 2, y, { align: 'center' });
    y += 4;

    // Footer
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text('Automatisch gegenereerd - Geldig zonder handtekening', pageWidth / 2, y, { align: 'center' });

    return doc;
  }

  /**
   * Generate company invoice PDF (Dutch, 21% VAT)
   */
  static generateCompanyInvoice(data: CompanyInvoiceData): jsPDF {
    const doc = new jsPDF();
    configurePdfFonts(doc);

    this.addLogoWatermark(doc);

    const primaryColor = [212, 175, 55] as const;
    const grayColor = [107, 114, 128] as const;
    const darkColor = [15, 23, 42] as const;

    let yPosition = 20;

    yPosition = this.addHeaderLogo(doc, yPosition);

    doc.setFontSize(28);
    doc.setTextColor(...primaryColor);
    doc.text('FACTUUR', 60, yPosition);

    yPosition += 5;
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text(`Factuurnummer: ${data.invoiceNumber}`, 60, yPosition);

    const invoiceDate = new Date(data.invoiceDate);
    const formattedDate = invoiceDate.toLocaleDateString('nl-BE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Datum: ${formattedDate}`, 190, yPosition - 5, { align: 'right' });

    yPosition += 15;

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);

    yPosition += 10;

    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.text('Van:', 20, yPosition);

    yPosition += 7;
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);

    const companyDisplayName = 'JOUW DRIVER';

    const companyLines = [
      companyDisplayName,
      data.company.address || '',
      `BTW: ${data.company.vat_number || 'N/A'}`,
      `KBO: ${data.company.kbo_number || 'N/A'}`,
      `Tel: ${data.company.phone || 'N/A'}`,
      `Email: ${data.company.email || 'N/A'}`
    ].filter(line => line);

    companyLines.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += 5;
    });

    let clientYPosition = 57;
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.text('Aan:', 120, clientYPosition);

    clientYPosition += 7;
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);

    const clientLines = [
      data.client.name,
      data.client.address || '',
      data.client.vat_number ? `BTW: ${data.client.vat_number}` : '',
      data.client.email || '',
      data.client.phone || ''
    ].filter(line => line);

    clientLines.forEach(line => {
      doc.text(line, 120, clientYPosition);
      clientYPosition += 5;
    });

    yPosition = Math.max(yPosition, clientYPosition) + 10;

    doc.setFontSize(14);
    doc.setTextColor(...darkColor);
    doc.text('Artikelen', 20, yPosition);

    yPosition += 10;

    doc.setFillColor(245, 247, 250);
    doc.rect(20, yPosition, 170, 8, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    doc.text('Omschrijving', 25, yPosition + 5);
    doc.text('Aantal', 110, yPosition + 5, { align: 'center' });
    doc.text('Prijs', 140, yPosition + 5, { align: 'right' });
    doc.text('Totaal', 170, yPosition + 5, { align: 'right' });

    yPosition += 8;

    data.items.forEach((item, index) => {
      if (yPosition > 250) {
        doc.addPage();
        this.addLogoWatermark(doc);
        yPosition = 20;
      }

      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(20, yPosition, 170, 7, 'F');
      }

      doc.setFontSize(9);
      doc.setTextColor(...grayColor);

      const descLines = doc.splitTextToSize(item.description, 75);
      doc.text(descLines, 25, yPosition + 5);
      doc.text(item.quantity.toString(), 110, yPosition + 5, { align: 'center' });
      doc.text(`€${item.unitPrice.toFixed(2)}`, 140, yPosition + 5, { align: 'right' });
      doc.text(`€${item.total.toFixed(2)}`, 170, yPosition + 5, { align: 'right' });

      yPosition += 7;
    });

    yPosition += 10;

    doc.setFontSize(14);
    doc.setTextColor(...darkColor);
    doc.text('Totalen', 20, yPosition);

    yPosition += 10;

    const vatAmount = data.totalTvac - data.totalHtva;

    doc.setFillColor(245, 247, 250);
    doc.rect(20, yPosition, 170, 8, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    doc.text('Omschrijving', 25, yPosition + 5);
    doc.text('Bedrag', 160, yPosition + 5, { align: 'right' });

    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text('Subtotaal (excl. BTW)', 25, yPosition + 5);
    doc.text(`€${data.totalHtva.toFixed(2)}`, 160, yPosition + 5, { align: 'right' });

    yPosition += 7;

    doc.text(`BTW (${data.vatRate}%)`, 25, yPosition + 5);
    doc.text(`€${vatAmount.toFixed(2)}`, 160, yPosition + 5, { align: 'right' });

    yPosition += 10;

    doc.setDrawColor(...grayColor);
    doc.setLineWidth(0.3);
    doc.line(20, yPosition, 190, yPosition);

    yPosition += 7;

    doc.setFillColor(...primaryColor);
    doc.rect(20, yPosition, 170, 12, 'F');

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('Totaal te betalen (incl. BTW)', 25, yPosition + 8);
    doc.setFontSize(14);
    doc.text(`€${data.totalTvac.toFixed(2)}`, 160, yPosition + 8, { align: 'right' });

    yPosition += 20;

    const iban = data.company.bank_account_iban || 'BE16973450355674';
    const bic = data.company.bank_account_bic || 'ARSPBE22';
    const accountHolder = data.company.bank_account_holder || companyDisplayName;

    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.text('Betalingsinformatie', 20, yPosition);

    yPosition += 7;
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);

    const reference = data.paymentReference || this.generateStructuredReference(data.invoiceNumber);

    doc.text(`IBAN: ${iban}`, 20, yPosition);
    yPosition += 5;
    doc.text(`BIC: ${bic}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Rekeninghouder: ${accountHolder}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Betalingsreferentie: ${reference}`, 20, yPosition);

    yPosition += 15;

    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('Gelieve het bedrag over te maken binnen 30 dagen.', 20, yPosition);
    yPosition += 5;
    doc.text('Bedankt voor uw vertrouwen in onze diensten.', 20, yPosition);
    yPosition += 5;
    doc.text('Deze factuur is automatisch gegenereerd en geldig zonder handtekening.', 20, yPosition);

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.text(`Pagina ${i} van ${pageCount}`, 105, 290, { align: 'center' });
      doc.text(`Factuur gegenereerd op: ${new Date().toLocaleDateString('nl-BE')}`, 190, 290, { align: 'right' });
    }

    return doc;
  }

  static downloadPDF(doc: jsPDF, filename: string): void {
    doc.save(filename);
  }

  static printPDF(doc: jsPDF): void {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  static getPDFBlob(doc: jsPDF): Blob {
    return doc.output('blob');
  }

  static getPDFDataURL(doc: jsPDF): string {
    return doc.output('dataurlstring');
  }
}
