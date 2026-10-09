
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

export const GET = requestMiddleware(async (request, context) => {
  const { signature_token } = parseQueryParams(request);

  if (!signature_token) {
    return createErrorResponse({
      errorMessage: "رمز التوقيع مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const contractsCrud = new CrudOperations("company_contracts", adminToken);
    const companiesCrud = new CrudOperations("companies", adminToken);
    const signaturesCrud = new CrudOperations("contract_signatures", adminToken);
    
    const contracts = await contractsCrud.findMany({ signature_token });
    if (!contracts || contracts.length === 0) {
      return createErrorResponse({
        errorMessage: "رابط التوقيع غير صالح",
        status: 404,
      });
    }

    const contract = contracts[0];

    // Get company details
    const company = await companiesCrud.findById(contract.company_id);

    // Check if already signed
    const isAlreadySigned = contract.contract_status === 'active';
    let signatureInfo = null;

    if (isAlreadySigned) {
      // Get signature information
      const signatures = await signaturesCrud.findMany(
        { contract_id: contract.id },
        { 
          limit: 1,
          orderBy: {
            column: 'signed_at',
            direction: 'desc'
          }
        }
      );

      if (signatures && signatures.length > 0) {
        signatureInfo = {
          signer_name: signatures[0].signer_name,
          signer_email: signatures[0].signer_email,
          signer_position: signatures[0].signer_position,
          signed_at: signatures[0].signed_at
        };
      }
    }

    // Check if link is expired (only for unsigned contracts)
    const isExpired = !isAlreadySigned && new Date(contract.signature_link_expires_at) < new Date();

    return createSuccessResponse({
      contract: {
        id: contract.id,
        contract_number: contract.contract_number,
        contract_start_date: contract.contract_start_date,
        contract_end_date: contract.contract_end_date,
        monthly_fee: contract.monthly_fee,
        annual_fee: contract.annual_fee,
        contract_html_template: contract.contract_html_template,
        contract_language: contract.contract_language || 'nl',
        contract_status: contract.contract_status
      },
      company: {
        name: company?.name,
        email: company?.email,
        vat_number: company?.vat_number,
        kbo_number: company?.kbo_number
      },
      isAlreadySigned,
      isExpired,
      signatureInfo
    });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل التحقق من رابط التوقيع",
      status: 500,
    });
  }
}, false);
