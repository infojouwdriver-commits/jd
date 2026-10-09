
import { requestMiddleware, parseQueryParams } from "@/lib/api-utils";
import { createErrorResponse } from '@/lib/create-response';
import jsPDF from 'jspdf';
import CrudOperations from '@/lib/crud-operations';
import { generateAdminUserToken } from '@/lib/auth';

export const GET = requestMiddleware(async (request, context) => {
  const { period, platform, start_date, end_date, language } = parseQueryParams(request);
  const user_id = context.payload?.sub;

  if (!user_id) {
    return createErrorResponse({
      errorMessage: "User ID is required",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const driversCrud = new CrudOperations("drivers", adminToken);
    const drivers = await driversCrud.findMany({ user_id: parseInt(user_id) });
    
    if (!drivers || drivers.length === 0) {
      return createErrorResponse({
        errorMessage: "Driver profile not found",
        status: 404,
      });
    }

    const driver = drivers[0];
    const tripsCrud = new CrudOperations("trips", context.token);

    // حساب تواريخ البداية والنهاية
    let startDate: Date;
    let endDate: Date = new Date();

    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
    } else {
      switch (period) {
        case 'daily':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarterly':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'yearly':
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
      }
    }

    const allTrips = await tripsCrud.findMany({ driver_id: driver.id });

    const filteredTrips = allTrips.filter((trip: any) => {
      const tripDate = new Date(trip.start_time);
      const isInDateRange = tripDate >= startDate && tripDate <= endDate;
      const isCompleted = trip.status === 'completed' || trip.status === 'success';
      
      if (platform && platform !== 'all') {
        if (platform === 'INTERNAL') {
          return isInDateRange && isCompleted && trip.ride_type === 'INTERNAL';
        } else {
          return isInDateRange && isCompleted && trip.external_source === platform;
        }
      }
      
      return isInDateRange && isCompleted;
    });

    const totalRevenue = filteredTrips.reduce((sum: number, trip: any) => sum + (trip.price || 0), 0);
    const totalDistance = filteredTrips.reduce((sum: number, trip: any) => sum + (trip.distance_km || 0), 0);

    // إنشاء PDF
    const doc = new jsPDF();
    const isNL = language === 'nl';

    // العنوان
    doc.setFontSize(20);
    doc.text(isNL ? 'Ritten Samenvatting' : 'Résumé des Trajets', 105, 20, { align: 'center' });

    // معلومات الفترة
    doc.setFontSize(12);
    doc.text(`${isNL ? 'Periode' : 'Période'}: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 20, 35);
    doc.text(`${isNL ? 'Chauffeur' : 'Chauffeur'}: ${driver.full_name}`, 20, 45);

    // الإحصائيات
    doc.setFontSize(14);
    doc.text(isNL ? 'Statistieken' : 'Statistiques', 20, 60);
    doc.setFontSize(11);
    doc.text(`${isNL ? 'Totaal ritten' : 'Total trajets'}: ${filteredTrips.length}`, 20, 70);
    doc.text(`${isNL ? 'Totale inkomsten' : 'Revenus totaux'}: €${totalRevenue.toFixed(2)}`, 20, 78);
    doc.text(`${isNL ? 'Totale afstand' : 'Distance totale'}: ${totalDistance.toFixed(2)} km`, 20, 86);
    doc.text(`${isNL ? 'Gemiddelde ritwaarde' : 'Valeur moyenne du trajet'}: €${(totalRevenue / filteredTrips.length || 0).toFixed(2)}`, 20, 94);

    // جدول الرحلات
    let yPos = 110;
    doc.setFontSize(14);
    doc.text(isNL ? 'Ritten Details' : 'Détails des Trajets', 20, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.text(isNL ? 'Datum' : 'Date', 20, yPos);
    doc.text(isNL ? 'Type' : 'Type', 60, yPos);
    doc.text(isNL ? 'Afstand' : 'Distance', 100, yPos);
    doc.text(isNL ? 'Prijs' : 'Prix', 140, yPos);
    yPos += 7;

    filteredTrips.slice(0, 20).forEach((trip: any) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      const date = new Date(trip.start_time).toLocaleDateString();
      const type = trip.ride_type === 'INTERNAL' ? 'Taxi' : trip.external_source;
      const distance = `${(trip.distance_km || 0).toFixed(2)} km`;
      const price = `€${(trip.price || 0).toFixed(2)}`;

      doc.text(date, 20, yPos);
      doc.text(type, 60, yPos);
      doc.text(distance, 100, yPos);
      doc.text(price, 140, yPos);
      yPos += 7;
    });

    if (filteredTrips.length > 20) {
      doc.text(`... ${isNL ? 'en' : 'et'} ${filteredTrips.length - 20} ${isNL ? 'meer ritten' : 'trajets de plus'}`, 20, yPos + 5);
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ritten-samenvatting-${period}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "Failed to generate PDF",
      status: 500,
    });
  }
}, true);
