import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';
import { saveCompanyAccount } from '@/lib/company-account';
import { messageId } from '@/lib/message-access';

// Preserve individual administrator resets through the canonical account path.
export const PUT = requestMiddleware(async (request, context) => {
 if (!context.payload?.isAdmin) return createErrorResponse({errorMessage:'Admin access required',status:403});
 const body = await validateRequestBody(request);
 const id = messageId(body.company_id);
 if (typeof body.password !== 'string' || !body.password) return createErrorResponse({errorMessage:'Password required',status:400});
 const token = await generateAdminUserToken();
 const company = await new CrudOperations('companies',token).findById(id);
 if (!company) return createErrorResponse({errorMessage:'Company not found',status:404});
 return createSuccessResponse(await saveCompanyAccount(token,id,{email:company.email},body.password));
}, true);
export const POST = requestMiddleware(async () => createErrorResponse({errorMessage:'عيّن كلمة مرور مستقلة من تعديل كل شركة',status:409}), true);
