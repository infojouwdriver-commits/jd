
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import { PDFGenerator } from '@/lib/pdf-generator';

// GET - جلب الفواتير (باستثناء فواتير الرحلات)
export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset, company_id } = parseQueryParams(request);
  
  try {
    const adminToken = await generateAdminUserToken();
    const invoicesCrud = new CrudOperations("invoices", adminToken);
    
    const filters: Record<string, any> = {
      invoice_category: 'company' // فقط فواتير الشركات، وليس فواتير الرحلات
    };
    
    if (company_id) {
      filters.company_id = parseInt(company_id);
    }
    
    const invoices = await invoicesCrud.findMany(
      filters,
      { 
        limit: limit || 100, 
        offset: offset || 0,
        orderBy: {
          column: 'invoice_date',
          direction: 'desc'
        }
      }
    );

    const parsedInvoices = invoices.map((invoice: any) => ({
      ...invoice,
      items: typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items
    }));

    return createSuccessResponse(parsedInvoices);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل الفواتير",
      status: 500,
    });
  }
}, true);

// POST - إنشاء فاتورة جديدة
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  const { 
    company_id, 
    issuer_company_id,
    client_company_id,
    invoice_number, 
    client_name, 
    client_address, 
    client_vat,
    client_email,
    client_phone,
    items,
    total_htva,
    vat_rate,
    total_tvac,
    invoice_date,
    due_date,
    status,
    invoice_type,
    recurrence_period,
    next_invoice_date,
    invoice_category,
    payment_status,
    contract_id,
    is_auto_generated,
    generation_month,
    generation_year
  } = body;

  if (!invoice_number || !client_name || !total_htva || !total_tvac || !invoice_date) {
    return createErrorResponse({
      errorMessage: "جميع الحقول الأساسية مطلوبة",
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
    const invoicesCrud = new CrudOperations("invoices", adminToken);
    
    // استخدام issuer_company_id كمعرف الشركة المصدرة (شركة المستخدم)
    const finalIssuerCompanyId = issuer_company_id || company_id;
    
    if (!finalIssuerCompanyId) {
      return createErrorResponse({
        errorMessage: "معرف الشركة المصدرة مطلوب",
        status: 400,
      });
    }
    
    // جلب معلومات الشركة المصدرة للحصول على معلومات البنك
    const companiesCrud = new CrudOperations("companies", adminToken);
    const issuerCompany = await companiesCrud.findById(parseInt(finalIssuerCompanyId));
    
    if (!issuerCompany) {
      return createErrorResponse({
        errorMessage: "الشركة المصدرة غير موجودة",
        status: 404,
      });
    }
    
    // توليد رقم مرجعي منظم بلجيكي (OGM)
    const structuredReference = PDFGenerator.generateStructuredReference(invoice_number);
    
    const newInvoice = await invoicesCrud.create({
      user_id,
      company_id: parseInt(finalIssuerCompanyId),
      issuer_company_id: parseInt(finalIssuerCompanyId),
      client_company_id: client_company_id ? parseInt(client_company_id) : null,
      invoice_number,
      client_name,
      client_address: client_address || null,
      client_vat: client_vat || null,
      client_email: client_email || null,
      client_phone: client_phone || null,
      items: JSON.stringify(items || []),
      total_htva: parseFloat(total_htva),
      vat_rate: vat_rate ? parseFloat(vat_rate) : (invoice_category === 'trip' ? 6 : 21),
      total_tvac: parseFloat(total_tvac),
      invoice_date,
      due_date: due_date || null,
      status: status || 'draft',
      invoice_type: invoice_type || 'one_time',
      recurrence_period: recurrence_period || null,
      next_invoice_date: next_invoice_date || null,
      invoice_language: 'nl',
      invoice_category: invoice_category || 'company',
      structured_reference: structuredReference,
      bank_account: issuerCompany?.bank_account_iban || 'BE16973450355674',
      bic_code: issuerCompany?.bank_account_bic || 'ARSPBE22',
      payment_status: payment_status || 'pending',
      contract_id: contract_id || null,
      is_auto_generated: is_auto_generated || false,
      generation_month: generation_month || null,
      generation_year: generation_year || null
    });

    return createSuccessResponse(newInvoice, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إنشاء الفاتورة",
      status: 500,
    });
  }
}, true);

// PUT - تحديث فاتورة
export const PUT = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);
  const body = await validateRequestBody(request);

  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف الفاتورة مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const invoicesCrud = new CrudOperations("invoices", adminToken);
    const editHistoryCrud = new CrudOperations("invoice_edit_history", adminToken);
    
    const existing = await invoicesCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "الفاتورة غير موجودة",
        status: 404,
      });
    }

    if (body.items && typeof body.items !== 'string') {
      body.items = JSON.stringify(body.items);
    }

    // Log edit history for important fields
    const user_id = context.payload?.sub;
    const fieldsToTrack = ['total_htva', 'total_tvac', 'status', 'payment_status', 'client_name', 'client_email'];
    
    for (const field of fieldsToTrack) {
      if (body[field] !== undefined && body[field] !== existing[field]) {
        await editHistoryCrud.create({
          invoice_id: parseInt(id),
          edited_by_user_id: user_id,
          field_name: field,
          old_value: String(existing[field] || ''),
          new_value: String(body[field] || ''),
          edit_reason: body.edit_reason || 'تعديل يدوي'
        });
      }
    }

    // إزالة edit_reason من البيانات المرسلة للتحديث
    const { edit_reason, ...updateData } = body;

    const updated = await invoicesCrud.update(id, {
      ...updateData,
      updated_at: new Date().toISOString(),
    });

    return createSuccessResponse(updated);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحديث الفاتورة",
      status: 500,
    });
  }
}, true);

// DELETE - حذف فاتورة
export const DELETE = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف الفاتورة مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const invoicesCrud = new CrudOperations("invoices", adminToken);
    
    const existing = await invoicesCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "الفاتورة غير موجودة",
        status: 404,
      });
    }

    await invoicesCrud.delete(id);
    return createSuccessResponse({ id });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل حذف الفاتورة",
      status: 500,
    });
  }
}, true);
