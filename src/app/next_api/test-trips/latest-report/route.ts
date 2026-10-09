
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

/**
 * GET - جلب آخر تقرير اختبار للسائق
 * السائق يمكنه فقط عرض وتحميل آخر تقرير، لا يمكنه إنشاء تقارير جديدة
 */
export const GET = requestMiddleware(async (request, context) => {
  const user_id = context.payload?.sub;

  if (!user_id) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    
    // جلب معلومات السائق
    const driversCrud = new CrudOperations("drivers", adminToken);
    const drivers = await driversCrud.findMany({ user_id: parseInt(user_id) });
    
    if (!drivers || drivers.length === 0) {
      return createErrorResponse({
        errorMessage: "لم يتم العثور على معلومات السائق",
        status: 404,
      });
    }

    const driver = drivers[0];

    // جلب آخر تقرير اختبار للسائق
    const reportsCrud = new CrudOperations("acceptance_test_reports", adminToken);
    const reports = await reportsCrud.findMany(
      { driver_id: driver.id },
      {
        limit: 1,
        offset: 0,
        orderBy: {
          column: 'created_at',
          direction: 'desc'
        }
      }
    );

    if (!reports || reports.length === 0) {
      return createSuccessResponse({
        hasReport: false,
        message: "لا يوجد تقرير اختبار متاح. يرجى الاتصال بالمسؤول لإنشاء تقرير جديد."
      });
    }

    const latestReport = reports[0];

    // جلب تفاصيل الرحلات التجريبية المرتبطة بالتقرير
    const testTripsCrud = new CrudOperations("test_trips", adminToken);
    const testTrips = await testTripsCrud.findMany(
      { 
        company_id: driver.company_id,
        driver_id: driver.id
      },
      {
        limit: 10,
        offset: 0,
        orderBy: {
          column: 'test_sequence_number',
          direction: 'asc'
        }
      }
    );

    // تحويل الرحلات التجريبية إلى نتائج
    const results = testTrips.map((trip: any) => ({
      ritnummer: trip.ritnummer,
      status: trip.sync_status === 'success' ? 'success' : 'failed',
      vertrek: trip.message_type.toLowerCase() === 'vertrek',
      aankomst: trip.message_type.toLowerCase() === 'aankomst',
      error: trip.error_message,
      startAddress: trip.start_address,
      endAddress: trip.end_address,
      startTime: trip.start_time,
      endTime: trip.end_time,
      startLat: trip.start_lat ? parseFloat(trip.start_lat) : undefined,
      startLon: trip.start_lon ? parseFloat(trip.start_lon) : undefined,
      endLat: trip.end_lat ? parseFloat(trip.end_lat) : undefined,
      endLon: trip.end_lon ? parseFloat(trip.end_lon) : undefined
    }));

    return createSuccessResponse({
      hasReport: true,
      report: {
        id: latestReport.id,
        reportDate: latestReport.report_date,
        totalMessages: latestReport.total_messages,
        successCount: latestReport.success_count,
        failedCount: latestReport.failed_count,
        reportStatus: latestReport.report_status,
        reportPdfUrl: latestReport.report_pdf_url,
        submittedToMunicipality: latestReport.submitted_to_municipality,
        submissionDate: latestReport.submission_date,
        notes: latestReport.notes,
        createdAt: latestReport.created_at
      },
      results: results
    });

  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل تقرير الاختبار",
      status: 500,
    });
  }
}, true);
