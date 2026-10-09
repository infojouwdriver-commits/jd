
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";

// GET - جلب إعدادات Chiron لشركة معينة
export const GET = requestMiddleware(async (request, context) => {
  const { company_id } = parseQueryParams(request);
  
  if (!company_id) {
    return createErrorResponse({
      errorMessage: "معرف الشركة مطلوب",
      status: 400,
    });
  }
  
  const companiesCrud = new CrudOperations("companies", context.token);
  const company = await companiesCrud.findById(company_id);
  
  if (!company) {
    return createErrorResponse({
      errorMessage: "الشركة غير موجودة",
      status: 404,
    });
  }
  
  // إخفاء client_secret في الاستجابة
  const { chiron_test_client_secret, chiron_prod_client_secret, ...safeData } = company;
  
  return createSuccessResponse({
    ...safeData,
    chiron_test_client_secret: chiron_test_client_secret ? '••••••••' : '',
    chiron_prod_client_secret: chiron_prod_client_secret ? '••••••••' : ''
  });
}, true);

// PUT - تحديث إعدادات Chiron
export const PUT = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);
  
  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف الشركة مطلوب",
      status: 400,
    });
  }
  
  const body = await validateRequestBody(request);
  const companiesCrud = new CrudOperations("companies", context.token);
  
  const existing = await companiesCrud.findById(id);
  if (!existing) {
    return createErrorResponse({
      errorMessage: "الشركة غير موجودة",
      status: 404,
    });
  }
  
  // إذا كان client_secret يحتوي على نقاط فقط، لا نقوم بتحديثه
  const updateData: any = {};
  
  if (body.chiron_mode !== undefined) {
    updateData.chiron_mode = body.chiron_mode;
  }
  
  if (body.chiron_test_client_id !== undefined) {
    updateData.chiron_test_client_id = body.chiron_test_client_id;
  }
  
  if (body.chiron_test_client_secret && body.chiron_test_client_secret !== '••••••••') {
    updateData.chiron_test_client_secret = body.chiron_test_client_secret;
  }
  
  if (body.chiron_test_auth_url !== undefined) {
    updateData.chiron_test_auth_url = body.chiron_test_auth_url;
  }
  
  if (body.chiron_test_api_url !== undefined) {
    updateData.chiron_test_api_url = body.chiron_test_api_url;
  }
  
  if (body.chiron_prod_client_id !== undefined) {
    updateData.chiron_prod_client_id = body.chiron_prod_client_id;
  }
  
  if (body.chiron_prod_client_secret && body.chiron_prod_client_secret !== '••••••••') {
    updateData.chiron_prod_client_secret = body.chiron_prod_client_secret;
  }
  
  if (body.chiron_prod_auth_url !== undefined) {
    updateData.chiron_prod_auth_url = body.chiron_prod_auth_url;
  }
  
  if (body.chiron_prod_api_url !== undefined) {
    updateData.chiron_prod_api_url = body.chiron_prod_api_url;
  }
  
  const data = await companiesCrud.update(id, updateData);
  return createSuccessResponse(data);
}, true);
