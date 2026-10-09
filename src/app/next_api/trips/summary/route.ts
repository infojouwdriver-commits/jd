
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

export const GET = requestMiddleware(async (request, context) => {
  const { period, platform, start_date, end_date } = parseQueryParams(request);
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

    // حساب تواريخ البداية والنهاية بناءً على الفترة
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

    // جلب جميع الرحلات للسائق
    const allTrips = await tripsCrud.findMany({ driver_id: driver.id });

    // تصفية الرحلات حسب التاريخ والمنصة
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

    // حساب الإحصائيات
    const totalTrips = filteredTrips.length;
    const totalRevenue = filteredTrips.reduce((sum: number, trip: any) => sum + (trip.price || 0), 0);
    const totalDistance = filteredTrips.reduce((sum: number, trip: any) => sum + (trip.distance_km || 0), 0);
    const totalDuration = filteredTrips.reduce((sum: number, trip: any) => sum + (trip.duration_minutes || 0), 0);

    // حساب المعلومات الضريبية
    let cashAmount = 0;
    let cardAmount = 0;
    let bankTransferAmount = 0;
    let bancontactAmount = 0;
    
    // حساب الضريبة (6% للرحلات العادية، 21% للشركات)
    let taxRate6Amount = 0;
    let taxRate21Amount = 0;
    let totalBeforeTax = 0;
    let totalAfterTax = 0;

    filteredTrips.forEach((trip: any) => {
      const price = trip.price || 0;
      
      // تصنيف حسب طريقة الدفع
      switch (trip.payment_method?.toLowerCase()) {
        case 'cash':
          cashAmount += price;
          break;
        case 'card':
          cardAmount += price;
          break;
        case 'bank_transfer':
          bankTransferAmount += price;
          break;
        case 'bancontact':
          bancontactAmount += price;
          break;
        default:
          cashAmount += price; // افتراضياً نقدي
      }

      // حساب الضريبة (معظم رحلات التاكسي 6%)
      // السعر المعروض يشمل الضريبة، نحتاج لحساب المبلغ قبل الضريبة
      const taxRate = 0.06; // 6% للرحلات العادية
      const priceBeforeTax = price / (1 + taxRate);
      const taxAmount = price - priceBeforeTax;
      
      totalBeforeTax += priceBeforeTax;
      totalAfterTax += price;
      taxRate6Amount += taxAmount;
    });

    const totalTaxAmount = taxRate6Amount + taxRate21Amount;

    // تصنيف حسب المنصة
    const platformStats = {
      INTERNAL: { count: 0, revenue: 0 },
      BOLT: { count: 0, revenue: 0 },
      UBER: { count: 0, revenue: 0 },
      HEETCH: { count: 0, revenue: 0 }
    };

    filteredTrips.forEach((trip: any) => {
      if (trip.ride_type === 'INTERNAL') {
        platformStats.INTERNAL.count++;
        platformStats.INTERNAL.revenue += trip.price || 0;
      } else if (trip.external_source) {
        const source = trip.external_source as keyof typeof platformStats;
        if (platformStats[source]) {
          platformStats[source].count++;
          platformStats[source].revenue += trip.price || 0;
        }
      }
    });

    // تصنيف حسب طريقة الدفع
    const paymentMethodStats: Record<string, { count: number; revenue: number }> = {};
    filteredTrips.forEach((trip: any) => {
      const method = trip.payment_method || 'cash';
      if (!paymentMethodStats[method]) {
        paymentMethodStats[method] = { count: 0, revenue: 0 };
      }
      paymentMethodStats[method].count++;
      paymentMethodStats[method].revenue += trip.price || 0;
    });

    // إحصائيات يومية للرسم البياني
    const dailyStats: Record<string, { trips: number; revenue: number }> = {};
    filteredTrips.forEach((trip: any) => {
      const date = new Date(trip.start_time).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { trips: 0, revenue: 0 };
      }
      dailyStats[date].trips++;
      dailyStats[date].revenue += trip.price || 0;
    });

    const summary = {
      period,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      total_trips: totalTrips,
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      total_distance: parseFloat(totalDistance.toFixed(2)),
      total_duration: totalDuration,
      average_trip_value: totalTrips > 0 ? parseFloat((totalRevenue / totalTrips).toFixed(2)) : 0,
      average_distance: totalTrips > 0 ? parseFloat((totalDistance / totalTrips).toFixed(2)) : 0,
      
      // معلومات الدفع
      cash_amount: parseFloat(cashAmount.toFixed(2)),
      card_amount: parseFloat(cardAmount.toFixed(2)),
      bank_transfer_amount: parseFloat(bankTransferAmount.toFixed(2)),
      bancontact_amount: parseFloat(bancontactAmount.toFixed(2)),
      
      // معلومات الضريبة
      total_tax_amount: parseFloat(totalTaxAmount.toFixed(2)),
      tax_rate_6_amount: parseFloat(taxRate6Amount.toFixed(2)),
      tax_rate_21_amount: parseFloat(taxRate21Amount.toFixed(2)),
      total_before_tax: parseFloat(totalBeforeTax.toFixed(2)),
      total_after_tax: parseFloat(totalAfterTax.toFixed(2)),
      
      platform_stats: platformStats,
      payment_method_stats: paymentMethodStats,
      daily_stats: dailyStats,
      trips: filteredTrips
    };

    return createSuccessResponse(summary);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "Failed to generate summary",
      status: 500,
    });
  }
}, true);
