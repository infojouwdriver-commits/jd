
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// GET - جلب المصروفات
export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset, company_id } = parseQueryParams(request);
  
  try {
    const adminToken = await generateAdminUserToken();
    const expensesCrud = new CrudOperations("expenses", adminToken);
    
    const filters: Record<string, any> = {};
    if (company_id) {
      filters.company_id = parseInt(company_id);
    }
    
    const expenses = await expensesCrud.findMany(
      filters,
      { 
        limit: limit || 100, 
        offset: offset || 0,
        orderBy: {
          column: 'expense_date',
          direction: 'desc'
        }
      }
    );

    return createSuccessResponse(expenses);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل المصروفات",
      status: 500,
    });
  }
}, true);

// POST - إنشاء مصروف جديد
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  const { company_id, type, amount, expense_date, description, receipt_url } = body;

  if (!company_id || !type || !amount || !expense_date) {
    return createErrorResponse({
      errorMessage: "الشركة والنوع والمبلغ والتاريخ مطلوبة",
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
    const expensesCrud = new CrudOperations("expenses", adminToken);
    
    const newExpense = await expensesCrud.create({
      user_id,
      company_id: parseInt(company_id),
      type,
      amount: parseFloat(amount),
      expense_date,
      description: description || null,
      receipt_url: receipt_url || null
    });

    return createSuccessResponse(newExpense, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إضافة المصروف",
      status: 500,
    });
  }
}, true);

// PUT - تحديث مصروف
export const PUT = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);
  const body = await validateRequestBody(request);

  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف المصروف مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const expensesCrud = new CrudOperations("expenses", adminToken);
    
    const existing = await expensesCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "المصروف غير موجود",
        status: 404,
      });
    }

    const updated = await expensesCrud.update(id, {
      ...body,
      updated_at: new Date().toISOString(),
    });

    return createSuccessResponse(updated);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحديث المصروف",
      status: 500,
    });
  }
}, true);

// DELETE - حذف مصروف
export const DELETE = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف المصروف مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const expensesCrud = new CrudOperations("expenses", adminToken);
    
    const existing = await expensesCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "المصروف غير موجود",
        status: 404,
      });
    }

    await expensesCrud.delete(id);
    return createSuccessResponse({ id });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل حذف المصروف",
      status: 500,
    });
  }
}, true);
