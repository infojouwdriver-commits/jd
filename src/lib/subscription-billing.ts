import {sendInvoiceEmail} from './invoice-email';
import {invoicePaymentUrl} from './invoice-payment-link';
import {closeInvoiceCheckout} from './invoice-checkout';
import { z } from "zod";
import { requestMiddleware, validateRequestBody } from "./api-utils";
import {
  operationsAccess,
  operationFailure,
  pageRange,
} from "./operations-access";
import { createSuccessResponse, createErrorResponse } from "./create-response";
import {
  subscriptionPdf,
  type SubscriptionDocument,
} from "./subscription-document";
import { mailConfiguration } from "./mail-policy";
import {invoicePaymentState} from './invoice-payment-state';
const id = z.number().int().positive(),
  date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expected = z.string().datetime({ offset: true }).nullable();
const profile = z
  .object({
    enabled: z.boolean(),
    net_cents: z.number().int().min(1).max(100000000),
    vat_bps: z.number().int().min(0).max(10000),
    tax_category: z.enum(["S", "Z", "E", "O"]),
    tax_reason: z.string().trim().max(1000).nullable(),
    billing_day: z.number().int().min(1).max(31),
    next_invoice_date: date,
    due_days: z.number().int().min(0).max(90),
    reminder_days: z.number().int().min(1).max(90),
    billing_email: z.string().trim().email().max(254),
    language: z.enum(["ar", "fr", "nl"]),
  })
  .strict();
const command = z.discriminatedUnion("action", [
  z.object({action:z.literal("send"),document_id:id,request_id:z.string().uuid()}).strict(),
  z.object({ action: z.literal("demo_issue"), document_id: id }).strict(),
  z
    .object({
      action: z.literal("void"),
      document_id: id,
      reason: z.string().trim().min(1).max(1000),
    })
    .strict(),
  z.object({ action: z.literal("profile"), expected, data: profile }).strict(),
  z
    .object({
      action: z.literal("settings"),
      expected,
      data: z
        .object({
          issuer_company_id: id.nullable(),
          default_vat_bps: z.number().int().min(0).max(10000),
          invoice_prefix: z.string().regex(/^[A-Z][A-Z0-9-]{1,9}$/),
          exchange_mode: z.enum(["unconfigured", "external_structured"]),
          exchange_provider: z.string().trim().max(120).nullable(),
        })
        .strict(),
    })
    .strict(),
  z
    .object({ action: z.literal("prepare"), request_id: z.string().uuid() })
    .strict(),
  z
    .object({
      action: z.literal("issue"),
      document_id: id,
      exchange_reference: z.string().trim().min(1).max(256),
    })
    .strict(),
  z
    .object({
      action: z.literal("payment"),
      request_id: z.string().uuid(),
      document_id: id,
      amount_cents: z.number().int().min(1).max(100000000),
      payment_date: date,
      reference: z.string().trim().min(1).max(140),
      payment_method: z.enum(["cash", "bank_transfer"]),
    })
    .strict(),
  z
    .object({
      action: z.literal("credit"),
      request_id: z.string().uuid(),
      document_id: id,
      net_cents: z.number().int().min(1).max(100000000),
      reason: z.string().trim().min(1).max(1000),
    })
    .strict(),
]);
export const billingGET = requestMiddleware(async (request, context) => {
  try {
    const { client, companyId, admin } = await operationsAccess(
      request,
      context,
      "billing",
    );
    const documentId = request.nextUrl.searchParams.get("document_id");
    if (documentId) {
      const n = Number(documentId);
      if (!Number.isSafeInteger(n) || n < 1)
        return createErrorResponse({
          status: 400,
          errorMessage: "Document required",
        });
      const doc = await client
        .from("subscription_documents")
        .select("*")
        .eq("company_id", companyId)
        .eq("id", n)
        .maybeSingle();
      if (doc.error) throw doc.error;
      if (!doc.data)
        return createErrorResponse({
          status: 404,
          errorMessage: "Document missing",
        });
      const bytes = subscriptionPdf(doc.data as SubscriptionDocument,await invoicePaymentState(client,doc.data,'subscription'));
      return new Response(new Uint8Array(bytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${doc.data.document_number}.pdf"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    const { offset, limit } = pageRange(request),
      scope = request.nextUrl.searchParams.get("scope") || "live";
    const documentIds = admin
      ? await client
          .from("subscription_documents")
          .select("id")
          .eq("company_id", companyId)
          .order("id", { ascending: false })
          .range(offset, offset + limit - 1)
      : { data: [], error: null };
    if (documentIds.error) throw documentIds.error;
    const [statement, profile, settings, scheduler, queue] = await Promise.all([
      client.rpc("security_subscription_statement", {
        p_company: companyId,
        p_scope: scope,
        p_limit: limit,
        p_offset: offset,
      }),
      client
        .from("subscription_billing_profiles")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle(),
      admin
        ? client
            .from("subscription_billing_settings")
            .select("*")
            .eq("id", 1)
            .single()
        : Promise.resolve({ data: null, error: null }),
      admin
        ? client
            .from("subscription_scheduler_state")
            .select("*")
            .eq("id", 1)
            .single()
        : Promise.resolve({ data: null, error: null }),
      admin
        ? client
            .from("subscription_mail_queue")
            .select(
              "id,document_id,purpose,status,last_result,scheduled_date,completed_at,mail_delivery_id",
            )
            .in("document_id", documentIds.data?.map((x) => x.id) || [])
            .order("id", { ascending: false })
            .limit(100)
        : Promise.resolve({ data: [], error: null }),
    ]);
    for (const r of [statement, profile, settings, scheduler, queue])
      if (r.error) throw r.error;
    const deliveryIds = (queue.data || [])
      .map((x) => x.mail_delivery_id)
      .filter(Boolean);
    const deliveries =
      admin && deliveryIds.length
        ? await client
            .from("mail_deliveries")
            .select("id,status,delivered_at")
            .in("id", deliveryIds)
        : { data: [], error: null };
    if (deliveries.error) throw deliveries.error;
    const mail = (queue.data || []).map((job) => {
      const proof = deliveries.data?.find((d) => d.id === job.mail_delivery_id);
      return {
        ...job,
        queue_status: job.status,
        status: proof?.status || job.status,
        delivered_at: proof?.delivered_at || null,
      };
    });
    const ids = (statement.data?.documents || []).map(
      (d: { id: number }) => d.id,
    );
    const payments = ids.length
      ? await client
          .from("subscription_payments")
          .select(
            "request_id,invoice_id,amount_cents,payment_date,reference,payment_method",
          )
          .eq("company_id", companyId)
          .in("invoice_id", ids)
          .order("created_at", { ascending: false })
          .limit(250)
      : { data: [], error: null };
    if (payments.error) throw payments.error;
    const activation=await client.from('invoice_service_activation').select('contract_id,paid_at').eq('company_id',companyId).maybeSingle();if(activation.error)throw activation.error;
    const payable:Record<string,string>={};
    for(const d of statement.data?.documents||[]){if(d.state==='issued'&&!d.is_test&&d.kind==='invoice'&&Number(d.balance_cents)>0){const payment=await invoicePaymentState(client,d,'subscription');if(payment.collection==='bank')payable[d.id]=invoicePaymentUrl('subscription',d,new URL(process.env.APP_ORIGIN||'http://localhost:3000').origin,process.env.JWT_SECRET||'');}}
    return createSuccessResponse({
      ...statement.data,
      payable,
      activation:activation.data,
      payments: payments.data,
      profile: profile.data,
      settings: settings.data,
      scheduler: scheduler.data,
      mail,
      mail_ready: admin ? mailConfiguration(process.env).ready : undefined,
      admin,
    });
  } catch (error) {
    return operationFailure(error);
  }
}, true);
export const billingPOST = requestMiddleware(async (request, context) => {
  try {
    const { client, companyId, actor, admin } = await operationsAccess(
      request,
      context,
      "billing",
    );
    if (!admin)
      return createErrorResponse({
        status: 403,
        errorMessage: "Administrator required",
      });
    const parsed = command.safeParse(await validateRequestBody(request));
    if (!parsed.success)
      return createErrorResponse({
        status: 400,
        errorMessage: "Invalid billing details",
      });
    const v = parsed.data;
    if ("document_id" in v) {
      const doc = await client
        .from("subscription_documents")
        .select("id")
        .eq("id", v.document_id)
        .eq("company_id", companyId)
        .maybeSingle();
      if (doc.error) throw doc.error;
      if (!doc.data)
        return createErrorResponse({
          status: 404,
          errorMessage: "Document missing",
        });
    }
    if(v.action==='send'){const sent=await sendInvoiceEmail(client,'subscription',v.document_id,actor,'invoice:subscription:'+v.document_id+':'+v.request_id);return createSuccessResponse(sent);}
    if(v.action==='payment')await closeInvoiceCheckout(client,'subscription',v.document_id);
    const rpc =
      v.action === "demo_issue"
        ? [
            "security_issue_subscription_demo",
            { p_document: v.document_id, p_actor: actor },
          ]
        : v.action === "void"
          ? [
              "security_void_subscription_preparation",
              { p_document: v.document_id, p_actor: actor, p_reason: v.reason },
            ]
          : v.action === "profile"
            ? [
                "security_save_subscription_profile",
                {
                  p_company: companyId,
                  p_actor: actor,
                  p_expected: v.expected,
                  p_data: v.data,
                },
              ]
            : v.action === "settings"
              ? [
                  "security_save_subscription_settings",
                  { p_actor: actor, p_expected: v.expected, p_data: v.data },
                ]
              : v.action === "prepare"
                ? [
                    "security_prepare_subscription_invoice",
                    {
                      p_company: companyId,
                      p_actor: actor,
                      p_request: v.request_id,
                    },
                  ]
                : v.action === "issue"
                  ? [
                      "security_issue_subscription_document",
                      {
                        p_document: v.document_id,
                        p_actor: actor,
                        p_exchange_reference: v.exchange_reference,
                      },
                    ]
                  : v.action === "payment"
                    ? [
                        "security_record_subscription_payment_v2",
                        {
                          p_request: v.request_id,
                          p_invoice: v.document_id,
                          p_actor: actor,
                          p_amount: v.amount_cents,
                          p_date: v.payment_date,
                          p_reference: v.reference,
                          p_method: v.payment_method,
                        },
                      ]
                    : [
                        "security_prepare_subscription_credit",
                        {
                          p_original: v.document_id,
                          p_actor: actor,
                          p_request: v.request_id,
                          p_net: v.net_cents,
                          p_reason: v.reason,
                        },
                      ];
    const result = await client.rpc(
      rpc[0] as string,
      rpc[1] as Record<string, unknown>,
    );
    if (result.error) throw result.error;
    return createSuccessResponse(result.data);
  } catch (error) {
    return operationFailure(error);
  }
}, true);
