import {randomBytes} from "node:crypto";

import CrudOperations from '@/lib/crud-operations';
import { createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import { PDFGenerator } from '@/lib/pdf-generator';
import {
  generateVervoerbewijs,
  getVervoerbewijsArrayBuffer,
  type VervoerbewijsData,
} from '@/legal/vervoerbewijs';

export const POST = requestMiddleware(async (request, context) => {
  const { id: tripId } = parseQueryParams(request);

  if (!tripId) {
    return createErrorResponse({ errorMessage: 'Trip ID is required', status: 400 });
  }

  const user_id = context.payload?.sub;
  if (!user_id) {
    return createErrorResponse({ errorMessage: 'User ID is required', status: 400 });
  }

  try {
    const adminToken = await generateAdminUserToken();

    // ── Fetch trip ──────────────────────────────────────────────────────────
    const tripsCrud = new CrudOperations('trips', adminToken);
    const trip = await tripsCrud.findById(tripId);

    if (!trip) {
      return createErrorResponse({ errorMessage: 'Trip not found', status: 404 });
    }

    if (trip.user_id !== parseInt(user_id)) {
      return createErrorResponse({ errorMessage: 'Unauthorized', status: 403 });
    }

    // ── Fetch related records ───────────────────────────────────────────────
    const companiesCrud = new CrudOperations('companies', adminToken);
    const company = await companiesCrud.findById(trip.company_id);
    if (!company) {
      return createErrorResponse({ errorMessage: 'Company not found', status: 404 });
    }

    const driversCrud = new CrudOperations('drivers', adminToken);
    const driver = await driversCrud.findById(trip.driver_id);
    if (!driver) {
      return createErrorResponse({ errorMessage: 'Driver not found', status: 404 });
    }

    let vehicle: any = null;
    if (trip.vehicle_id) {
      const vehiclesCrud = new CrudOperations('vehicles', adminToken);
      vehicle = await vehiclesCrud.findById(trip.vehicle_id);
    }

    // ── Build share / QR URLs ───────────────────────────────────────────────
    const invoiceNumber = `TRIP-${trip.id}-${Date.now()}`;
    const shareToken = randomBytes(32).toString('base64url');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com';
    const shareUrl = `${appUrl}/invoice/${shareToken}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;

    // ── Resolve Belgian legal fields ────────────────────────────────────────
    const ritnummer = trip?.ritnummer || `TRIP-${trip.id}`;
    const invoiceDatetime = trip.start_time || trip.end_time || new Date().toISOString();

    const vehiclePlateNumber = vehicle?.plate_number || 'N/A';
    const dienstnummer =
      driver?.bestuurderspas_number ||
      driver?.capacity_certificate_number ||
      null;
    const identificatiecode = vehicle?.chiron_vehicle_id || null;

    let toegepastTarief: string;
    if (trip?.toegepast_tarief) {
      toegepastTarief = trip.toegepast_tarief;
    } else if (trip?.is_airport_trip) {
      toegepastTarief = 'Tarief 3';
    } else if (trip?.is_night_trip) {
      toegepastTarief = 'Tarief 2';
    } else {
      toegepastTarief = 'Tarief 1';
    }

    const meterbedrag = trip?.price ? Number(trip.price) : null;

    // ── Build VervoerbewijsData ─────────────────────────────────────────────
    const vervoerbewijsData: VervoerbewijsData = {
      company: {
        name: company.name || 'JOUW DRIVER',
        address: company.address || '',
        vat_number: company.vat_number || '',
        kbo_number: company.kbo_number || '',
        phone: company.phone || '',
        email: company.email || '',
      },
      driver: {
        full_name: driver.full_name || 'Chauffeur',
        bestuurderspas_number: driver.bestuurderspas_number || '',
        capacity_certificate_number: driver.capacity_certificate_number || '',
        phone: driver.phone || '',
      },
      vehicle: {
        brand: vehicle?.brand || '',
        model: vehicle?.model || '',
        plate_number: vehiclePlateNumber,
        chiron_vehicle_id: vehicle?.chiron_vehicle_id || '',
      },
      trip: {
        ritnummer,
        trip_uuid: trip.trip_uuid || '',
        start_time: trip.start_time || new Date().toISOString(),
        end_time: trip.end_time || new Date().toISOString(),
        start_address: trip.start_address || 'Onbekend',
        end_address: trip.end_address || 'Onbekend',
        start_lat: trip.start_lat ?? trip.vertrek_lat ?? null,
        start_lon: trip.start_lon ?? trip.vertrek_lon ?? null,
        end_lat: trip.end_lat ?? trip.aankomst_lat ?? null,
        end_lon: trip.end_lon ?? trip.aankomst_lon ?? null,
        distance_km: Number(trip.distance_km || 0),
        duration_minutes: trip.duration_minutes || 0,
        price: Number(trip.price || 0),
        passenger_name: trip.passenger_name || null,
        payment_method: trip.payment_method || null,
        currency: trip.currency || 'EUR',
      },
      chiron: {
        sync_state: trip.chiron_sync_state || 'created',
        chiron_trip_id: trip.chiron_trip_id || null,
      },
      document_number: invoiceNumber,
      document_date: invoiceDatetime,
      vat_rate: 6,
      qr_code_url: qrCodeUrl,
    };

    // ── Generate PDF using new isolated module ──────────────────────────────
    const pdfDoc = generateVervoerbewijs(vervoerbewijsData);
    const arrayBuffer = getVervoerbewijsArrayBuffer(pdfDoc);
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      throw new Error('Failed to generate Vervoerbewijs PDF');
    }

    // ── Persist invoice record ──────────────────────────────────────────────
    try {
      const paymentReference = PDFGenerator['generateStructuredReference'](invoiceNumber);
      const tripStartDate = new Date(invoiceDatetime);
      const tripTimeString = tripStartDate.toTimeString().substring(0, 8);

      const invoicesCrud = new CrudOperations('invoices', adminToken);
      const newInvoice = await invoicesCrud.create({
        user_id: parseInt(user_id),
        company_id: company.id,
        issuer_company_id: company.id,
        trip_id: trip.id,
        invoice_number: invoiceNumber,
        client_name: trip.passenger_name || 'Klant',
        client_address: trip.end_address || '',
        total_htva: Number(((Number(trip.price) || 0) / 1.06).toFixed(2)),
        vat_rate: 6,
        total_tvac: Number((Number(trip.price) || 0).toFixed(2)),
        invoice_date: new Date().toISOString().split('T')[0],
        status: 'sent',
        payment_status: 'pending',
        invoice_type: 'one_time',
        invoice_category: 'trip',
        invoice_language: 'nl',
        items: JSON.stringify([{
          description: `Vervoer van ${trip.start_address} naar ${trip.end_address}`,
          quantity: 1,
          unitPrice: Number(((Number(trip.price) || 0) / 1.06).toFixed(2)),
          total: Number(((Number(trip.price) || 0) / 1.06).toFixed(2)),
        }]),
        structured_reference: paymentReference,
        bank_account: company.bank_account_iban || '',
        bic_code: company.bank_account_bic || '',
        trip_datetime: invoiceDatetime,
        trip_time: tripTimeString,
        vehicle_plate_number: vehiclePlateNumber,
        dienstnummer,
        identificatiecode,
        toegepast_tarief: toegepastTarief,
        meterbedrag,
        ritnummer,
      });

      const shareLinksCrud = new CrudOperations('invoice_share_links', adminToken);
      await shareLinksCrud.create({
        invoice_id: newInvoice.id,
        share_token: shareToken,
        qr_code_url: qrCodeUrl,
        view_count: 0,
        is_active: true,
      });
    } catch (dbError) {
      console.error("Operation failed");
    }

    // ── Return PDF response ─────────────────────────────────────────────────
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Vervoerbewijs-${trip.id}.pdf"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
        'X-Share-URL': shareUrl,
        'X-QR-Code-URL': qrCodeUrl,
      },
    });

  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || 'Failed to generate Vervoerbewijs',
      status: 500,
    });
  }
}, true);
