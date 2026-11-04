
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import {companyTariffs, validateCompanyTariffs, PricingValidationError} from '@/lib/company-pricing';
import {createPostgrestClient} from '@/lib/postgrest';
import { NextRequest } from 'next/server';

const handlePricing = requestMiddleware(async (request: NextRequest, context) => {
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

    if (request.method === 'PUT') {
      if (company.archived_at) return createErrorResponse({status:409,errorMessage:'Restore the company before editing tariffs'});
      const body = await validateRequestBody(request);
      const revision=company.tariff_revision ?? 0;
      if (body.revision !== revision) return createErrorResponse({status:409,errorMessage:'Tariffs changed. Reload the page before saving.'});
      const tariffs = validateCompanyTariffs(body.tariffs);
      const existing = companyTariffs(company);
      if (tariffs.length < existing.length) return createErrorResponse({status:400,errorMessage:'Disable obsolete tariffs instead of removing them'});
      // Preserve old clients' T1 pricing columns while new clients use the profile list.
      const {data,error}=await createPostgrestClient(adminToken).from('companies')
        .update({...tariffs[0].settings,tariff_profiles:tariffs,tariff_revision:revision+1})
        .eq('id',id).eq('tariff_revision',revision).is('archived_at',null).select('id').maybeSingle();
      if(error) throw Error('Tariff update unavailable');
      if(!data) return createErrorResponse({status:409,errorMessage:'Tariffs changed. Reload the page before saving.'});
      return createSuccessResponse({id:company.id,name:company.name,tariffs,revision:revision+1});
    }
    return createSuccessResponse({id:company.id,name:company.name,tariffs:companyTariffs(company),revision:company.tariff_revision??0});
  } catch (error: any) {
    if (error instanceof PricingValidationError) return createErrorResponse({status:400,errorMessage:error.message});
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل بيانات التسعيرة",
      status: 500,
    });
  }
}, true);

export const GET = handlePricing;
export const PUT = handlePricing;
