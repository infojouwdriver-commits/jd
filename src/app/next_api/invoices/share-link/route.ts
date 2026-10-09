import {randomBytes} from "node:crypto";

import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

// POST - إنشاء رابط مشاركة للفاتورة
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  const { invoice_id } = body;

  if (!invoice_id) {
    return createErrorResponse({
      errorMessage: "معرف الفاتورة مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const invoicesCrud = new CrudOperations("invoices", adminToken);
    const shareLinksCrud = new CrudOperations("invoice_share_links", adminToken);
    
    // التحقق من وجود الفاتورة
    const invoice = await invoicesCrud.findById(invoice_id);
    if (!invoice) {
      return createErrorResponse({
        errorMessage: "الفاتورة غير موجودة",
        status: 404,
      });
    }

    // التحقق من وجود رابط مشاركة سابق
    const existingLinks = await shareLinksCrud.findMany({ invoice_id: parseInt(invoice_id) });
    
    if (existingLinks && existingLinks.length > 0) {
      // إرجاع الرابط الموجود
      const existingLink = existingLinks[0];
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com'}/invoice/${existingLink.share_token}`;
      
      return createSuccessResponse({
        share_token: existingLink.share_token,
        share_url: shareUrl,
        qr_code_url: existingLink.qr_code_url
      });
    }

    // توليد رمز فريد للرابط
    const shareToken = randomBytes(32).toString('base64url');
    
    // إنشاء رابط المشاركة
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com'}/invoice/${shareToken}`;
    
    // توليد QR Code باستخدام API مجاني
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;
    
    // حفظ رابط المشاركة في قاعدة البيانات
    const shareLink = await shareLinksCrud.create({
      invoice_id: parseInt(invoice_id),
      share_token: shareToken,
      qr_code_url: qrCodeUrl,
      view_count: 0,
      is_active: true
    });

    return createSuccessResponse({
      share_token: shareLink.share_token,
      share_url: shareUrl,
      qr_code_url: qrCodeUrl
    }, 201);
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إنشاء رابط المشاركة",
      status: 500,
    });
  }
}, true);

// GET - جلب معلومات رابط المشاركة (باستخدام query parameter)
export const GET = requestMiddleware(async (request, context) => {
  const searchParams = request.nextUrl.searchParams;
  const invoice_id = searchParams.get("invoice_id");

  if (!invoice_id) {
    return createErrorResponse({
      errorMessage: "معرف الفاتورة مطلوب",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const shareLinksCrud = new CrudOperations("invoice_share_links", adminToken);
    
    const shareLinks = await shareLinksCrud.findMany({ invoice_id: parseInt(invoice_id) });
    
    if (!shareLinks || shareLinks.length === 0) {
      return createErrorResponse({
        errorMessage: "لا يوجد رابط مشاركة لهذه الفاتورة",
        status: 404,
      });
    }

    const shareLink = shareLinks[0];
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com'}/invoice/${shareLink.share_token}`;

    return createSuccessResponse({
      share_token: shareLink.share_token,
      share_url: shareUrl,
      qr_code_url: shareLink.qr_code_url,
      view_count: shareLink.view_count,
      last_viewed_at: shareLink.last_viewed_at
    });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل تحميل رابط المشاركة",
      status: 500,
    });
  }
}, true);
