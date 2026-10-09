
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';
import crypto from 'crypto';

export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  const { contract_id } = body;

  if (!contract_id) {
    return createErrorResponse({
      errorMessage: "معرف العقد مطلوب",
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
    const contractsCrud = new CrudOperations("company_contracts", adminToken);
    const companiesCrud = new CrudOperations("companies", adminToken);
    
    const contract = await contractsCrud.findById(contract_id);
    if (!contract) {
      return createErrorResponse({
        errorMessage: "العقد غير موجود",
        status: 404,
      });
    }

    const company = await companiesCrud.findById(contract.company_id);
    if (!company || !company.email) {
      return createErrorResponse({
        errorMessage: "لا يوجد بريد إلكتروني للشركة",
        status: 400,
      });
    }

    const signatureToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await contractsCrud.update(contract_id, {
      signature_token: signatureToken,
      signature_link_sent_at: new Date().toISOString(),
      signature_link_expires_at: expiresAt.toISOString(),
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const signatureLink = `${baseUrl}/sign-contract/${signatureToken}`;

    const contractLanguage = contract.contract_language || 'nl';

    const emailTemplates = {
      nl: {
        subject: `Contract Ondertekening ${contract.contract_number}`,
        title: '🔐 Elektronische Contract Ondertekening',
        subtitle: 'Jaarlijks Abonnementscontract',
        greeting: `Geachte ${company.name},`,
        intro: 'Wij verzoeken u vriendelijk om het jaarlijkse abonnementscontract voor de Taxi Management Systeem diensten te beoordelen en te ondertekenen.',
        contractNumber: 'Contractnummer:',
        startDate: 'Startdatum:',
        endDate: 'Einddatum:',
        monthlyFee: 'Maandelijkse kosten:',
        annualFee: 'Jaarlijkse kosten:',
        buttonText: '📝 Contract Beoordelen en Ondertekenen',
        warningTitle: '⚠️ Belangrijke Opmerking:',
        warningText: 'De ondertekeningslink is slechts 7 dagen geldig. Gelieve zo spoedig mogelijk te ondertekenen.',
        footer: 'Na ondertekening wordt het contract automatisch geactiveerd en zal het systeem maandelijkse facturen genereren en naar u verzenden.',
        thanks: 'Bedankt voor uw vertrouwen',
        autoEmail: 'Deze e-mail is automatisch verzonden'
      },
      fr: {
        subject: `Signature du Contrat ${contract.contract_number}`,
        title: '🔐 Signature Électronique du Contrat',
        subtitle: "Contrat d'Abonnement Annuel",
        greeting: `Cher ${company.name},`,
        intro: "Nous vous demandons de bien vouloir examiner et signer le contrat d'abonnement annuel pour les services du Système de Gestion de Taxi.",
        contractNumber: 'Numéro de contrat:',
        startDate: 'Date de début:',
        endDate: 'Date de fin:',
        monthlyFee: 'Frais mensuels:',
        annualFee: 'Frais annuels:',
        buttonText: '📝 Examiner et Signer le Contrat',
        warningTitle: '⚠️ Remarque Importante:',
        warningText: "Le lien de signature n'est valable que 7 jours. Veuillez signer dès que possible.",
        footer: 'Après signature, le contrat sera automatiquement activé et le système générera et vous enverra des factures mensuelles.',
        thanks: 'Merci pour votre confiance',
        autoEmail: 'Cet e-mail a été envoyé automatiquement'
      }
    };

    const t = emailTemplates[contractLanguage as 'nl' | 'fr'];
    const locale = contractLanguage === 'fr' ? 'fr-BE' : 'nl-BE';

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="${contractLanguage}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t.title}</title>
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
          .header h1 { font-size: 28px; margin-bottom: 10px; }
          .content { padding: 30px; }
          .greeting { font-size: 18px; margin-bottom: 20px; color: #1e293b; }
          .contract-details {
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
          .detail-row:last-child { border-bottom: none; }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            color: white;
            padding: 15px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            color: #92400e;
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
            <h1>${t.title}</h1>
            <p>${t.subtitle}</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              ${t.greeting}
            </div>
            
            <p style="margin-bottom: 20px; color: #475569;">
              ${t.intro}
            </p>
            
            <div class="contract-details">
              <div class="detail-row">
                <span style="color: #64748b;">${t.contractNumber}</span>
                <span style="font-weight: 600;">${contract.contract_number}</span>
              </div>
              <div class="detail-row">
                <span style="color: #64748b;">${t.startDate}</span>
                <span style="font-weight: 600;">${new Date(contract.contract_start_date).toLocaleDateString(locale)}</span>
              </div>
              <div class="detail-row">
                <span style="color: #64748b;">${t.endDate}</span>
                <span style="font-weight: 600;">${new Date(contract.contract_end_date).toLocaleDateString(locale)}</span>
              </div>
              <div class="detail-row">
                <span style="color: #64748b;">${t.monthlyFee}</span>
                <span style="font-weight: 600; color: #2563eb;">€${contract.monthly_fee.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span style="color: #64748b;">${t.annualFee}</span>
                <span style="font-weight: 600; color: #2563eb;">€${contract.annual_fee.toFixed(2)}</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${signatureLink}" class="button">
                ${t.buttonText}
              </a>
            </div>
            
            <div class="warning">
              <strong>${t.warningTitle}</strong><br>
              ${t.warningText}
            </div>
            
            <p style="margin-top: 20px; color: #475569; font-size: 14px;">
              ${t.footer}
            </p>
          </div>
          
          <div class="footer">
            <p>${t.thanks}</p>
            <p>${t.autoEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendContractEmail(company.email, contract.contract_number, t.subject, emailHtml);

    return createSuccessResponse({ 
      sent: true,
      signature_link: signatureLink,
      expires_at: expiresAt.toISOString()
    });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل إرسال رابط التوقيع",
      status: 500,
    });
  }
}, true);

async function sendContractEmail(
  email: string,
  contractNumber: string,
  subject: string,
  htmlContent: string
): Promise<boolean> {
  if (process.env.RESEND_KEY) {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_KEY);
    
    const senderEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const { error } = await resend.emails.send({
      from: senderEmail,
      to: email,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Operation failed");
      throw new Error(`Resend error: ${error.message}`);
    }

    return true;
  }

  const url = `${process.env.NEXT_PUBLIC_ZOER_HOST}/zapi/app/email/send`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Postgrest-API-Key": process.env.POSTGREST_API_KEY || "",
    },
    body: JSON.stringify({
      to: email,
      subject: subject,
      html: htmlContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Operation failed");
    throw new Error(`فشل إرسال البريد الإلكتروني: ${response.status} - ${errorText}`);
  }

  return true;
}
