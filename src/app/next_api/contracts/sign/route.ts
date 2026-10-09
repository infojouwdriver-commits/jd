
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody, getRequestIp } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import { PDFGenerator } from '@/lib/pdf-generator';

export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  const { 
    signature_token,
    signer_name,
    signer_email,
    signer_position,
    signature_data 
  } = body;

  if (!signature_token || !signer_name || !signer_email) {
    return createErrorResponse({
      errorMessage: "جميع الحقول مطلوبة",
      status: 400,
    });
  }

  try {
    const adminToken = await generateAdminUserToken();
    const contractsCrud = new CrudOperations("company_contracts", adminToken);
    const signaturesCrud = new CrudOperations("contract_signatures", adminToken);
    const companiesCrud = new CrudOperations("companies", adminToken);
    const invoicesCrud = new CrudOperations("invoices", adminToken);
    
    // Find contract by signature token
    const contracts = await contractsCrud.findMany({ signature_token });
    if (!contracts || contracts.length === 0) {
      return createErrorResponse({
        errorMessage: "رابط التوقيع غير صالح",
        status: 404,
      });
    }

    const contract = contracts[0];

    // Check if link is expired
    if (new Date(contract.signature_link_expires_at) < new Date()) {
      return createErrorResponse({
        errorMessage: "انتهت صلاحية رابط التوقيع",
        status: 400,
      });
    }

    // Check if already signed
    if (contract.contract_status === 'active') {
      return createErrorResponse({
        errorMessage: "تم توقيع العقد مسبقاً",
        status: 400,
      });
    }

    const signerIp = getRequestIp(request);
    const signerUserAgent = request.headers.get('user-agent') || 'Unknown';
    const signedAt = new Date().toISOString();

    // Create signature record
    await signaturesCrud.create({
      contract_id: contract.id,
      company_id: contract.company_id,
      signer_name,
      signer_email,
      signer_position: signer_position || null,
      signature_data: signature_data || null,
      signature_ip: signerIp,
      signature_user_agent: signerUserAgent,
      signed_at: signedAt,
      signature_method: 'electronic',
      is_verified: true
    });

    // Calculate next invoice date (first day of next month)
    const nextInvoiceDate = new Date();
    nextInvoiceDate.setMonth(nextInvoiceDate.getMonth() + 1);
    nextInvoiceDate.setDate(1);

    // Update contract status to active
    await contractsCrud.update(contract.id, {
      contract_status: 'active',
      signed_at: signedAt,
      signer_ip: signerIp,
      signer_user_agent: signerUserAgent,
      next_invoice_generation_date: nextInvoiceDate.toISOString().split('T')[0],
      last_invoice_generated_at: signedAt,
      updated_at: signedAt
    });

    // Update company subscription status
    const company = await companiesCrud.findById(contract.company_id);
    await companiesCrud.update(contract.company_id, {
      subscription_status: 'active',
      current_contract_id: contract.id,
      next_payment_due_date: nextInvoiceDate.toISOString().split('T')[0],
      updated_at: signedAt
    });

    // إنشاء الفاتورة الأولى فوراً
    const currentDate = new Date();
    const invoiceNumber = `INV-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(contract.company_id).padStart(4, '0')}`;
    
    // توليد رقم مرجعي منظم بلجيكي
    const structuredReference = PDFGenerator.generateStructuredReference(invoiceNumber);

    // حساب تاريخ الاستحقاق (30 يوم من تاريخ الفاتورة)
    const dueDate = new Date(currentDate);
    dueDate.setDate(dueDate.getDate() + 30);

    // إنشاء الفاتورة الشهرية الأولى
    const firstInvoice = await invoicesCrud.create({
      user_id: contract.company_id,
      company_id: contract.company_id,
      invoice_number: invoiceNumber,
      client_name: company?.client_name || company?.name || 'Client',
      client_address: company?.address || null,
      client_vat: company?.vat_number || null,
      client_email: company?.email || null,
      client_phone: company?.phone || null,
      items: JSON.stringify([
        {
          description: `Maandelijks abonnement - ${currentDate.toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })}`,
          quantity: 1,
          unitPrice: parseFloat(contract.monthly_fee),
          total: parseFloat(contract.monthly_fee)
        }
      ]),
      total_htva: parseFloat(contract.monthly_fee) / 1.21,
      vat_rate: 21,
      total_tvac: parseFloat(contract.monthly_fee),
      invoice_date: currentDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      status: 'sent',
      invoice_type: 'subscription',
      invoice_language: 'nl',
      invoice_category: 'company',
      structured_reference: structuredReference,
      bank_account: company?.bank_account_iban || 'BE16973450355674',
      bic_code: company?.bank_account_bic || 'ARSPBE22',
      payment_status: 'pending',
      contract_id: contract.id,
      is_auto_generated: true,
      generation_month: currentDate.getMonth() + 1,
      generation_year: currentDate.getFullYear()
    });

    void 0;

    // إرسال الفاتورة تلقائياً للعميل
    if (company?.email) {
      try {
        await sendInvoiceToClient(firstInvoice, company, adminToken);
        void 0;
      } catch (emailError: any) {
        console.error("Operation failed");
        // لا نوقف العملية إذا فشل الإرسال
      }
    }

    return createSuccessResponse({ 
      success: true,
      contract_id: contract.id,
      first_invoice_id: firstInvoice.id,
      message: 'تم توقيع العقد بنجاح وتفعيل الاشتراك وإنشاء الفاتورة الأولى'
    });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل توقيع العقد",
      status: 500,
    });
  }
}, false);

async function sendInvoiceToClient(invoice: any, company: any, adminToken: string): Promise<void> {
  try {
    // توليد PDF للفاتورة
    const items = typeof invoice.items === 'string' 
      ? JSON.parse(invoice.items) 
      : invoice.items;

    const pdfData = {
      company: {
        id: company.id,
        name: company.name,
        kbo_number: company.kbo_number,
        address: company.address,
        email: company.email,
        phone: company.phone,
        vat_number: company.vat_number,
        client_name: company.client_name,
        bank_account_iban: invoice.bank_account || company.bank_account_iban || 'BE16973450355674',
        bank_account_bic: invoice.bic_code || company.bank_account_bic || 'ARSPBE22',
        bank_account_holder: company.bank_account_holder || company.name
      },
      client: {
        name: invoice.client_name,
        address: invoice.client_address,
        vat_number: invoice.client_vat,
        email: invoice.client_email,
        phone: invoice.client_phone
      },
      items: items || [],
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.invoice_date,
      vatRate: invoice.vat_rate,
      totalHtva: invoice.total_htva,
      totalTvac: invoice.total_tvac,
      paymentReference: invoice.structured_reference
    };

    const pdf = PDFGenerator.generateCompanyInvoice(pdfData);
    const pdfBlob = PDFGenerator.getPDFBlob(pdf);
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    const vatAmount = invoice.total_tvac - invoice.total_htva;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html dir="ltr" lang="nl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factuur ${invoice.invoice_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: #f3f4f6;
            color: #333;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1e293b;
          }
          .invoice-details {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            color: #64748b;
            font-weight: 500;
          }
          .detail-value {
            color: #1e293b;
            font-weight: 600;
          }
          .total-section {
            background: #eff6ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }
          .total-final {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            padding-top: 15px;
            border-top: 2px solid #cbd5e1;
            margin-top: 10px;
          }
          .company-info {
            background: #f1f5f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-size: 14px;
            color: #475569;
          }
          .company-info p {
            margin: 5px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #94a3b8;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Nieuwe Factuur</h1>
            <p>${invoice.invoice_number}</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Geachte ${invoice.client_name},
            </div>
            
            <p style="margin-bottom: 20px; color: #475569;">
              Hartelijk dank voor uw vertrouwen. Hierbij ontvangt u de factuur als bijlage.
            </p>
            
            <div class="invoice-details">
              <div class="detail-row">
                <span class="detail-label">Factuurnummer:</span>
                <span class="detail-value">${invoice.invoice_number}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Factuurdatum:</span>
                <span class="detail-value">${new Date(invoice.invoice_date).toLocaleDateString('nl-BE')}</span>
              </div>
              ${invoice.client_vat ? `
              <div class="detail-row">
                <span class="detail-label">BTW-nummer:</span>
                <span class="detail-value">${invoice.client_vat}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="total-section">
              <div class="total-row">
                <span>Bedrag excl. BTW:</span>
                <span>€${invoice.total_htva.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>BTW (${invoice.vat_rate}%):</span>
                <span>€${vatAmount.toFixed(2)}</span>
              </div>
              <div class="total-row total-final">
                <span>Totaal bedrag:</span>
                <span>€${invoice.total_tvac.toFixed(2)}</span>
              </div>
            </div>
            
            ${company ? `
            <div class="company-info">
              <p><strong>${company.name}</strong></p>
              ${company.address ? `<p>${company.address}</p>` : ''}
              ${company.vat_number ? `<p>BTW-nummer: ${company.vat_number}</p>` : ''}
              ${company.kbo_number ? `<p>KBO-nummer: ${company.kbo_number}</p>` : ''}
              ${company.email ? `<p>E-mail: ${company.email}</p>` : ''}
              ${company.phone ? `<p>Telefoon: ${company.phone}</p>` : ''}
            </div>
            ` : ''}
            
            <p style="margin-top: 20px; color: #475569;">
              De factuur is als PDF-bestand bijgevoegd aan deze e-mail.
            </p>
            
            <p style="margin-top: 10px; color: #475569;">
              Voor vragen kunt u contact met ons opnemen.
            </p>
          </div>
          
          <div class="footer">
            <p>Bedankt voor uw vertrouwen</p>
            <p>Deze factuur is elektronisch verzonden</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // إرسال البريد الإلكتروني
    if (process.env.RESEND_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_KEY);
      
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: company.email,
        subject: `Factuur ${invoice.invoice_number}`,
        html: emailHtml,
        attachments: [
          {
            filename: `Factuur-${invoice.invoice_number}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
    } else {
      const url = `${process.env.NEXT_PUBLIC_ZOER_HOST}/zapi/app/email/send`;

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Postgrest-API-Key": process.env.POSTGREST_API_KEY || "",
        },
        body: JSON.stringify({
          to: company.email,
          subject: `Factuur ${invoice.invoice_number}`,
          html: emailHtml,
          attachments: [
            {
              filename: `Factuur-${invoice.invoice_number}.pdf`,
              content: pdfBuffer.toString('base64'),
              encoding: 'base64',
              contentType: 'application/pdf'
            },
          ],
        }),
      });
    }

    // تحديث حالة الفاتورة
    const invoicesCrud = new CrudOperations("invoices", adminToken);
    await invoicesCrud.update(invoice.id, {
      sent_at: new Date().toISOString(),
      send_attempts: 1,
      updated_at: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Operation failed");
    throw error;
  }
}
