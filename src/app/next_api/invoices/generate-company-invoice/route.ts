
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import { PDFGenerator } from '@/lib/pdf-generator';

export const POST = requestMiddleware(async (request, context) => {
  const { id: invoiceId } = parseQueryParams(request);

  if (!invoiceId) {
    return createErrorResponse({
      errorMessage: "معرف الفاتورة مطلوب",
      status: 400,
    });
  }

  const user_id = context.payload?.sub;
  if (!user_id) {
    return createErrorResponse({
      errorMessage: "معرف المستخدم مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    
    // جلب بيانات الفاتورة
    const invoicesCrud = new CrudOperations("invoices", adminToken);
    const invoice = await invoicesCrud.findById(invoiceId);
    
    if (!invoice) {
      return createErrorResponse({
        errorMessage: "الفاتورة غير موجودة",
        status: 404,
      });
    }

    // التحقق من أن الفاتورة تخص المستخدم
    if (invoice.user_id !== parseInt(user_id)) {
      return createErrorResponse({
        errorMessage: "غير مصرح لك بالوصول لهذه الفاتورة",
        status: 403,
      });
    }

    // جلب معلومات الشركة المصدرة (issuer_company_id)
    const companiesCrud = new CrudOperations("companies", adminToken);
    const issuerCompany = await companiesCrud.findById(invoice.issuer_company_id);
    
    if (!issuerCompany) {
      return createErrorResponse({
        errorMessage: "معلومات الشركة المصدرة غير موجودة",
        status: 404,
      });
    }

    // جلب معلومات الشركة العميل (client_company_id) إذا كانت موجودة
    let clientCompany = null;
    if (invoice.client_company_id) {
      clientCompany = await companiesCrud.findById(invoice.client_company_id);
    }

    // تحليل العناصر
    const items = typeof invoice.items === 'string' 
      ? JSON.parse(invoice.items) 
      : invoice.items;

    // توليد PDF
    const pdfData = {
      company: {
        id: issuerCompany.id,
        name: issuerCompany.name,
        kbo_number: issuerCompany.kbo_number,
        address: issuerCompany.address,
        email: issuerCompany.email,
        phone: issuerCompany.phone,
        vat_number: issuerCompany.vat_number,
        client_name: issuerCompany.client_name,
        bank_account_iban: issuerCompany.bank_account_iban || 'BE16973450355674',
        bank_account_bic: issuerCompany.bank_account_bic || 'ARSPBE22',
        bank_account_holder: issuerCompany.bank_account_holder || issuerCompany.client_name || issuerCompany.name
      },
      client: {
        name: clientCompany ? clientCompany.client_name || clientCompany.name : invoice.client_name,
        address: clientCompany ? clientCompany.address : invoice.client_address,
        vat_number: clientCompany ? clientCompany.vat_number : invoice.client_vat,
        email: clientCompany ? clientCompany.email : invoice.client_email,
        phone: clientCompany ? clientCompany.phone : invoice.client_phone
      },
      items: items || [],
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.invoice_date,
      vatRate: invoice.vat_rate,
      totalHtva: invoice.total_htva,
      totalTvac: invoice.total_tvac,
      paymentReference: invoice.payment_reference || invoice.structured_reference
    };

    const pdf = PDFGenerator.generateCompanyInvoice(pdfData);
    const pdfBlob = PDFGenerator.getPDFBlob(pdf);
    
    // تحويل Blob إلى Buffer
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Factuur-${invoice.invoice_number}.pdf"`
      }
    });

  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إنشاء الفاتورة",
      status: 500,
    });
  }
}, true);
