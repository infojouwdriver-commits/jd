
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - جلب توقيعات عقد معين
export const GET = requestMiddleware(async (request, context) => {
  const { contract_id } = parseQueryParams(request);
  
  if (!contract_id) {
    return createErrorResponse({
      errorMessage: "معرف العقد مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const signaturesCrud = new CrudOperations("contract_signatures", adminToken);
    
    const signatures = await signaturesCrud.findMany(
      { contract_id: parseInt(contract_id) },
      { 
        orderBy: {
          column: 'signed_at',
          direction: 'desc'
        }
      }
    );

    return createSuccessResponse(signatures);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل التوقيعات",
      status: 500,
    });
  }
}, true);
