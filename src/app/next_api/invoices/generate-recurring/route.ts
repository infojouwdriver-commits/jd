
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware } from "@/lib/api-utils";
import { generateAdminUserToken } from '@/lib/auth';

export const POST = requestMiddleware(async (request, context) => {
  try {
    const adminToken = await generateAdminUserToken();
    const invoicesCrud = new CrudOperations("invoices", adminToken);
    
    const today = new Date().toISOString().split('T')[0];
    
    const dueInvoices = await invoicesCrud.findMany(
      {},
      { 
        limit: 1000,
        offset: 0
      }
    );

    const recurringInvoices = dueInvoices.filter((inv: any) => 
      inv.invoice_type === 'subscription' && 
      inv.next_invoice_date && 
      inv.next_invoice_date <= today &&
      inv.status !== 'cancelled'
    );

    const generatedInvoices = [];

    for (const invoice of recurringInvoices) {
      try {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const newInvoiceNumber = `INV-${year}${month}-${random}`;

        let nextDate = new Date(invoice.next_invoice_date);
        if (invoice.recurrence_period === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (invoice.recurrence_period === 'quarterly') {
          nextDate.setMonth(nextDate.getMonth() + 3);
        } else if (invoice.recurrence_period === 'yearly') {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }

        const newInvoice = await invoicesCrud.create({
          user_id: invoice.user_id,
          company_id: invoice.company_id,
          invoice_number: newInvoiceNumber,
          client_name: invoice.client_name,
          client_address: invoice.client_address,
          client_vat: invoice.client_vat,
          client_email: invoice.client_email,
          client_phone: invoice.client_phone,
          items: invoice.items,
          total_htva: invoice.total_htva,
          vat_rate: invoice.vat_rate,
          total_tvac: invoice.total_tvac,
          invoice_date: today,
          status: 'draft',
          invoice_type: 'subscription',
          recurrence_period: invoice.recurrence_period,
          next_invoice_date: nextDate.toISOString().split('T')[0],
          parent_invoice_id: invoice.id
        });

        await invoicesCrud.update(invoice.id, {
          next_invoice_date: nextDate.toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        });

        generatedInvoices.push(newInvoice);
      } catch (error: any) {
        console.error("Operation failed");
      }
    }

    return createSuccessResponse({
      generated: generatedInvoices.length,
      invoices: generatedInvoices
    });
  } catch (error: any) {
    console.error("Operation failed");
    return createErrorResponse({
      errorMessage: error.message || "فشل توليد الفواتير المتكررة",
      status: 500,
    });
  }
}, true);
