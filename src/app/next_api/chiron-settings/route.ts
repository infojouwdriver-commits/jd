import {chironDestination,ChironError} from '@/lib/chiron-protocol';

import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";

// GET - جلب إعدادات Chiron لشركة معينة
export const GET = requestMiddleware(async (request, context) => {
  if(!context.payload?.isAdmin)return createErrorResponse({errorMessage:'Admin access required',status:403});
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
    transmissionEnabled: process.env.CHIRON_TRANSMISSION_ENABLED === 'true',
    productionEnabled: process.env.CHIRON_PRODUCTION_ENABLED === 'true',
    testCredentialsConfigured: !!company.chiron_test_client_id && !!chiron_test_client_secret,
    productionCredentialsConfigured: !!company.chiron_prod_client_id && !!chiron_prod_client_secret,
    // Metadata survives secret stripping; never return even a masked credential field.
    testKeyConfigured: !!chiron_test_client_secret,
    productionKeyConfigured: !!chiron_prod_client_secret
  });
}, true);

// PUT - تحديث إعدادات Chiron
export const PUT = requestMiddleware(async (request, context) => {
  if(!context.payload?.isAdmin)return createErrorResponse({errorMessage:'Admin access required',status:403});
  const { id } = parseQueryParams(request);
  
  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف الشركة مطلوب",
      status: 400,
    });
  }
  
  const body = await validateRequestBody(request);
  if(body.chiron_mode !== undefined && !['TEST','PRODUCTION'].includes(body.chiron_mode))return createErrorResponse({errorMessage:'اختر بيئة TEST أو PRODUCTION',status:400});
  try {
    for(const [mode,prefix] of [['TEST','chiron_test_'],['PRODUCTION','chiron_prod_']] as const){
      for(const [field,kind] of [['auth_url','auth'],['api_url','trip']] as const)if(body[prefix+field])chironDestination(body[prefix+field],mode,kind);
      const secret=body[prefix+'client_secret'];if(secret && secret!=='••••••••' && (typeof secret!=='string'||secret.length>4096))return createErrorResponse({errorMessage:'Client Secret غير صالح',status:400});
      const clientId=body[prefix+'client_id'];if(clientId!==undefined&&(typeof clientId!=='string'||clientId.length>512))return createErrorResponse({errorMessage:'Client ID غير صالح',status:400});
    }
  } catch(error){if(error instanceof ChironError)return createErrorResponse({errorMessage:error.message,status:400});throw error;}
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
