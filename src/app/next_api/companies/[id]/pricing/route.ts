
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const GET = requestMiddleware(async (request: NextRequest, context) => {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/');
  const id = segments[segments.indexOf('companies') + 1];

  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف الشركة مطلوب",
      status: 400,
    });
  }

  if (!context.payload?.isAdmin) {
    return createErrorResponse({
      errorMessage: "غير مصرح لك بالوصول",
      status: 403,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const companiesCrud = new CrudOperations("companies", adminToken);
    
    const company = await companiesCrud.findById(id);
    
    if (!company) {
      return createErrorResponse({
        errorMessage: "الشركة غير موجودة",
        status: 404,
      });
    }

    return createSuccessResponse(company);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل بيانات التسعيرة",
      status: 500,
    });
  }
}, true);
