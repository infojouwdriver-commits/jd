
import { NextRequest } from 'next/server';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { generateAdminUserToken } from '@/lib/auth';
import CrudOperations from '@/lib/crud-operations';

// POST - الموافقة على طلب تسجيل سائق أو رفضه
export const POST = requestMiddleware(async (request: NextRequest, context) => {
  // التحقق من صلاحيات المسؤول
  if (!context.payload?.isAdmin) {
    return createErrorResponse({
      errorMessage: 'Unauthorized',
      status: 403,
    });
  }

  try {
    const body = await validateRequestBody(request);
    const { registration_request_id, action, rejection_reason, review_notes } = body;

    if (!registration_request_id || !action) {
      return createErrorResponse({
        errorMessage: 'registration_request_id and action are required',
        status: 400,
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return createErrorResponse({
        errorMessage: 'action must be approve or reject',
        status: 400,
      });
    }

    const adminToken = await generateAdminUserToken();
    const regRequestsCrud = new CrudOperations('driver_registration_requests', adminToken);

    // جلب طلب التسجيل
    const regRequest = await regRequestsCrud.findById(registration_request_id);
    if (!regRequest) {
      return createErrorResponse({
        errorMessage: 'Registration request not found',
        status: 404,
      });
    }

    const reviewedBy = context.payload?.sub;
    const now = new Date().toISOString();

    if (action === 'approve') {
      // ── تفعيل حساب السائق ─────────────────────────────────────────────
      const driversCrud = new CrudOperations('drivers', adminToken);
      await driversCrud.update(regRequest.driver_id, {
        registration_status: 'approved',
        registration_reviewed_at: now,
        registration_reviewed_by: reviewedBy,
        status: 'active',
        current_vehicle_id: regRequest.vehicle_id,
        updated_at: now,
      });

      // ── تفعيل driver_credentials للدخول إلى بوابة السائق ─────────────
      const credentialsCrud = new CrudOperations('driver_credentials', adminToken);
      const creds = await credentialsCrud.findMany({ driver_id: regRequest.driver_id });
      if (creds && creds.length > 0) {
        await credentialsCrud.update(creds[0].id, {
          is_active: true,
          vehicle_id: regRequest.vehicle_id,
          company_id: regRequest.company_id,
          preferred_language: regRequest.preferred_language,
          updated_at: now,
        });
      }

      // ── تحديث حالة طلب التسجيل ────────────────────────────────────────
      await regRequestsCrud.update(registration_request_id, {
        status: 'approved',
        reviewed_by_user_id: reviewedBy,
        reviewed_at: now,
        review_notes: review_notes || null,
        updated_at: now,
      });

      return createSuccessResponse({
        message: 'Driver approved successfully. Driver portal access activated.',
        driver_id: regRequest.driver_id,
        vehicle_id: regRequest.vehicle_id,
        company_id: regRequest.company_id,
        preferred_language: regRequest.preferred_language,
      });
    } else {
      // ── رفض الطلب ─────────────────────────────────────────────────────
      const driversCrud = new CrudOperations('drivers', adminToken);
      await driversCrud.update(regRequest.driver_id, {
        registration_status: 'rejected',
        registration_reviewed_at: now,
        registration_reviewed_by: reviewedBy,
        registration_rejection_reason: rejection_reason || null,
        status: 'inactive',
        updated_at: now,
      });

      // ── إبقاء driver_credentials معطلة ────────────────────────────────
      const credentialsCrud = new CrudOperations('driver_credentials', adminToken);
      const creds = await credentialsCrud.findMany({ driver_id: regRequest.driver_id });
      if (creds && creds.length > 0) {
        await credentialsCrud.update(creds[0].id, {
          is_active: false,
          updated_at: now,
        });
      }

      // ── تحديث حالة طلب التسجيل ────────────────────────────────────────
      await regRequestsCrud.update(registration_request_id, {
        status: 'rejected',
        rejection_reason: rejection_reason || null,
        reviewed_by_user_id: reviewedBy,
        reviewed_at: now,
        review_notes: review_notes || null,
        updated_at: now,
      });

      return createSuccessResponse({
        message: 'Driver registration rejected.',
        driver_id: regRequest.driver_id,
      });
    }
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || 'Approval action failed',
      status: 500,
    });
  }
}, true);
