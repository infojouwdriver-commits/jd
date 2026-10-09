import {hashString} from "@/lib/server-utils";

import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET - جلب جميع الموزعين (للمسؤول فقط)
export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset } = parseQueryParams(request);
  
  // التحقق من أن المستخدم مسؤول
  if (!context.payload?.isAdmin) {
    return createErrorResponse({
      errorMessage: "غير مصرح لك بالوصول",
      status: 403,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const distributorsCrud = new CrudOperations("distributors", adminToken);
    
    const distributors = await distributorsCrud.findMany(
      {},
      { 
        limit: limit || 50, 
        offset: offset || 0,
        orderBy: {
          column: 'created_at',
          direction: 'desc'
        }
      }
    );

    return createSuccessResponse(distributors);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل الموزعين",
      status: 500,
    });
  }
}, true);

// POST - إنشاء موزع جديد (للمسؤول فقط)
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  // التحقق من أن المستخدم مسؤول
  if (!context.payload?.isAdmin) {
    return createErrorResponse({
      errorMessage: "غير مصرح لك بالوصول",
      status: 403,
    });
  }

  const { email, password, full_name, phone, commission_percentage, notes } = body;

  if (!email || !password || !full_name) {
    return createErrorResponse({
      errorMessage: "البريد الإلكتروني وكلمة المرور والاسم الكامل مطلوبة",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    
    // إنشاء حساب المستخدم
    const usersCrud = new CrudOperations("users", adminToken);
    
    // التحقق من عدم وجود المستخدم
    const existingUsers = await usersCrud.findMany({ email });
    if (existingUsers && existingUsers.length > 0) {
      return createErrorResponse({
        errorMessage: "البريد الإلكتروني مستخدم بالفعل",
        status: 400,
      });
    }
    
    // تشفير كلمة المرور
    const hashedPassword = await hashString(password);
    
    // إنشاء المستخدم من نوع distributor
    const newUser = await usersCrud.create({
      email,
      password: hashedPassword,
      role: 'app20251225073911jaqqaxdfir_v1_user',
      user_type: 'distributor'
    });

    // إنشاء ملف الموزع
    const distributorsCrud = new CrudOperations("distributors", adminToken);
    const newDistributor = await distributorsCrud.create({
      user_id: newUser.id,
      full_name,
      email,
      phone: phone || null,
      commission_percentage: commission_percentage || 0,
      is_active: true,
      notes: notes || null
    });

    return createSuccessResponse(newDistributor, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إنشاء الموزع",
      status: 500,
    });
  }
}, true);

// PUT - تحديث موزع
export const PUT = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  const { id, ...updateData } = body;

  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف الموزع مطلوب",
      status: 400,
    });
  }

  // التحقق من أن المستخدم مسؤول
  if (!context.payload?.isAdmin) {
    return createErrorResponse({
      errorMessage: "غير مصرح لك بالوصول",
      status: 403,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const distributorsCrud = new CrudOperations("distributors", adminToken);
    
    const existing = await distributorsCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "الموزع غير موجود",
        status: 404,
      });
    }

    const updated = await distributorsCrud.update(id, {
      ...updateData,
      updated_at: new Date().toISOString(),
    });

    return createSuccessResponse(updated);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحديث الموزع",
      status: 500,
    });
  }
}, true);

// DELETE - حذف موزع
export const DELETE = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return createErrorResponse({
      errorMessage: "معرف الموزع مطلوب",
      status: 400,
    });
  }

  // التحقق من أن المستخدم مسؤول
  if (!context.payload?.isAdmin) {
    return createErrorResponse({
      errorMessage: "غير مصرح لك بالوصول",
      status: 403,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const distributorsCrud = new CrudOperations("distributors", adminToken);
    
    const existing = await distributorsCrud.findById(id);
    if (!existing) {
      return createErrorResponse({
        errorMessage: "الموزع غير موجود",
        status: 404,
      });
    }

    // حذف حساب المستخدم المرتبط
    const usersCrud = new CrudOperations("users", adminToken);
    await usersCrud.delete(existing.user_id);

    // حذف ملف الموزع
    await distributorsCrud.delete(id);
    
    return createSuccessResponse({ id });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل حذف الموزع",
      status: 500,
    });
  }
}, true);
