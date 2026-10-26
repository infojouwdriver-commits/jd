"use client";
import ContractBillingPanel from "./ContractBillingPanel";
import InvoiceDeliveryActions,{invoicePaymentCopy} from "./InvoiceDeliveryActions";
import {subscriptionOfferCopy} from "@/lib/subscription-offer";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api-client";
import { Button,buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { operationsCopy } from "./operations-copy";
import { OperationForm, type OperationField } from "./OperationForm";
import { useOperationData } from "./useOperationData";
interface Doc {
  id: number;
  document_number: string;
  kind: "invoice" | "credit";
  state: string;
  is_test: boolean;
  period_start: string;
  gross_cents: number;
  net_cents: number;
  vat_cents: number;
  vat_bps: number;
  due_date: string | null;
  contract_number?:string|null;
  installment_number?:number|null;
  balance_cents: number | null;
}
interface BillingData {
  payments: {
    request_id: string;
    invoice_id: number;
    amount_cents: number;
    payment_date: string;
    reference: string;
    payment_method: "cash" | "bank_transfer" | "manual" | "stripe";
  }[];
  documents: Doc[];
  payable?:Record<string,string>;
  activation?:{contract_id:number|null;paid_at:string|null}|null;
  entries: {
    entry_id: string;
    entry_date: string;
    reference: string;
    kind: string;
    amount_cents: number;
    running_balance_cents: number;
  }[];
  total: number;
  entry_total: number;
  posted_balance_cents: number;
  overdue_cents: number;
  prepared_count: number;
  profile: Record<string, string | number | boolean> | null;
  settings: Record<string, string | number> | null;
  scheduler: { last_run_at: string | null; failed_count: number } | null;
  mail: {
    id: number;
    document_id: number;
    purpose: string;
    status: string;
    last_result: string;
    scheduled_date: string;
  }[];
  mail_ready: boolean;
  admin: boolean;
}
const cents = (v: unknown) => {
  const s = String(v).trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw Error("Invalid amount");
  const [n, d = ""] = s.split(".");
  return Number(n) * 100 + Number(d.padEnd(2, "0"));
};
export default function BillingPanel({
  companyId,
  admin = false,
  isTest = false,
  archived = false,
}: {
  companyId: number;
  admin?: boolean;
  isTest?: boolean;
  archived?: boolean;
}) {
  const { language } = useLanguage(),
    c = operationsCopy[language],
    base = admin ? "/subscription-billing" : "/company-portal/billing";
  const [showContracts,setShowContracts]=useState(false);
  const offer=subscriptionOfferCopy[language];
  const [scope, setScope] = useState(isTest ? "test" : "live"),
    [offset, setOffset] = useState(0),
    [mode, setMode] = useState<string | null>(null),
    [selected, setSelected] = useState<Doc | null>(null),
    [downloadError, setDownloadError] = useState("");
  const endpoint =
      base +
      "?" +
      new URLSearchParams({
        company_id: String(companyId),
        scope,
        offset: String(offset),
        limit: "25",
      }),
    { data, loading, error, reload } = useOperationData<BillingData>(endpoint);
  const money = (n: number) =>
    new Intl.NumberFormat(language === "ar" ? "ar-BE" : language + "-BE", {
      style: "currency",
      currency: "EUR",
    }).format(Number(n) / 100);
  function open(action: string, d?: Doc) {
    setMode(action);
    setSelected(d || null);
  }
  const p = data?.profile,
    s = data?.settings;
  let fields: OperationField[] = [],
    initial: Record<string, string | boolean> = {};
  if (mode === "profile") {
    fields = [
      { key: "enabled", label: c.enabled, type: "checkbox" },
      { key: "net", label: c.net },
      { key: "vat", label: c.vat },
      {
        key: "tax_category",
        label: c.taxCategory,
        options: ["S", "Z", "E", "O"].map((value) => ({ value, label: value })),
      },
      { key: "tax_reason", label: c.taxReason, optional: true },
      {
        key: "billing_day",
        label: c.billingDay,
        type: "number",
        min: 1,
        max: 31,
      },
      { key: "next_invoice_date", label: c.nextDate },
      { key: "due_days", label: c.dueDays, type: "number", min: 0, max: 90 },
      {
        key: "reminder_days",
        label: c.reminderDays,
        type: "number",
        min: 1,
        max: 90,
      },
      { key: "billing_email", label: c.email, type: "email" },
      {
        key: "language",
        label: c.language,
        options: ["ar", "fr", "nl"].map((value) => ({ value, label: value })),
      },
    ];
    initial = {
      enabled: p?.enabled === true,
      net: p ? String(Number(p.net_cents) / 100) : "",
      vat: p
        ? String(Number(p.vat_bps) / 100)
        : String(Number(s?.default_vat_bps ?? 2100) / 100),
      tax_category: String(p?.tax_category || "S"),
      tax_reason: String(p?.tax_reason || ""),
      billing_day: String(p?.billing_day ?? ""),
      next_invoice_date: String(p?.next_invoice_date || ""),
      due_days: String(p?.due_days ?? ""),
      reminder_days: String(p?.reminder_days ?? ""),
      billing_email: String(p?.billing_email || ""),
      language: String(p?.language || language),
    };
  } else if (mode === "settings") {
    fields = [
      {
        key: "issuer_company_id",
        label: c.issuer,
        type: "number",
        min: 1,
        optional: true,
      },
      { key: "default_vat", label: c.defaultVat },
      { key: "invoice_prefix", label: c.prefix, maxLength: 10 },
      {
        key: "exchange_mode",
        label: c.exchangeMode,
        options: [
          { value: "unconfigured", label: c.unconfigured },
          { value: "external_structured", label: c.external_structured },
        ],
      },
      {
        key: "exchange_provider",
        label: c.provider,
        optional: true,
        maxLength: 120,
      },
    ];
    initial = {
      issuer_company_id: String(s?.issuer_company_id || ""),
      default_vat: String(Number(s?.default_vat_bps ?? 2100) / 100),
      invoice_prefix: String(s?.invoice_prefix || "JDS"),
      exchange_mode: String(s?.exchange_mode || "unconfigured"),
      exchange_provider: String(s?.exchange_provider || ""),
    };
  } else if (mode === "issue")
    fields = [
      { key: "exchange_reference", label: c.exchangeReference, maxLength: 256 },
    ];
  else if (mode === "payment")
    fields = [
      {
        key: "payment_method",
        label: c.paymentMethod,
        options: [
          { value: "cash", label: c.cash },
          { value: "bank_transfer", label: c.bank_transfer },
        ],
      },
      { key: "amount", label: c.amount + " (€)" },
      { key: "payment_date", label: c.paymentDate },
      { key: "reference", label: c.paymentReference, maxLength: 140 },
    ];
  else if (mode === "void") fields = [{ key: "reason", label: c.reason }];
  else if (mode === "credit")
    fields = [
      { key: "net", label: c.net },
      { key: "reason", label: c.reason },
    ];
  if (mode === "payment")
    initial = {
      payment_method: "cash",
      amount: selected?.balance_cents
        ? String(selected.balance_cents / 100)
        : "",
      payment_date: new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Brussels",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
      reference: "",
    };
  const titles: Record<string, string> = {
    demo_issue: c.demoIssue,
    void: c.voidPreparation,
    profile: c.configure,
    settings: c.settings,
    prepare: c.prepare,
    issue: c.issue,
    payment: c.recordPayment,
    credit: c.prepareCredit,
  };
  async function submit(
    v: Record<string, string | boolean>,
    requestId: string,
  ) {
    let payload: Record<string, unknown> = { action: mode };
    if (mode === "profile")
      payload = {
        ...payload,
        expected: p?.updated_at || null,
        data: {
          enabled: v.enabled === true,
          net_cents: cents(v.net),
          vat_bps: cents(v.vat),
          tax_category: v.tax_category,
          tax_reason: v.tax_reason || null,
          billing_day: Number(v.billing_day),
          next_invoice_date: v.next_invoice_date,
          due_days: Number(v.due_days),
          reminder_days: Number(v.reminder_days),
          billing_email: v.billing_email,
          language: v.language,
        },
      };
    else if (mode === "settings")
      payload = {
        ...payload,
        expected: s?.updated_at || null,
        data: {
          issuer_company_id: v.issuer_company_id
            ? Number(v.issuer_company_id)
            : null,
          default_vat_bps: cents(v.default_vat),
          invoice_prefix: v.invoice_prefix,
          exchange_mode: v.exchange_mode,
          exchange_provider: v.exchange_provider || null,
        },
      };
    else if (mode === "void")
      payload = { ...payload, document_id: selected!.id, reason: v.reason };
    else if (mode === "prepare")
      payload = { ...payload, request_id: requestId };
    else if (mode === "demo_issue")
      payload = { ...payload, document_id: selected!.id };
    else if (mode === "issue")
      payload = {
        ...payload,
        document_id: selected!.id,
        exchange_reference: v.exchange_reference,
      };
    else if (mode === "payment")
      payload = {
        ...payload,
        request_id: requestId,
        document_id: selected!.id,
        amount_cents: cents(v.amount),
        payment_date: v.payment_date,
        reference: v.reference,
        payment_method: v.payment_method,
      };
    else if (mode === "credit")
      payload = {
        ...payload,
        request_id: requestId,
        document_id: selected!.id,
        net_cents: cents(v.net),
        reason: v.reason,
      };
    await api.post(base + "?company_id=" + companyId, payload);
    reload();
  }
  async function download(doc: Doc) {
    setDownloadError("");
    try {
      const r = await fetch(
        "/next_api" +
          base +
          "?" +
          new URLSearchParams({
            company_id: String(companyId),
            document_id: String(doc.id),
          }),
        { credentials: "include", signal: AbortSignal.timeout(20000) },
      );
      if (!r.ok || !r.headers.get("Content-Type")?.includes("application/pdf"))
        throw Error();
      const url = URL.createObjectURL(await r.blob()),
        a = document.createElement("a");
      a.href = url;
      a.download = doc.document_number + ".pdf";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setDownloadError(c.error);
    }
  }
  return (
    <section
      className="space-y-5"
      aria-label={c.billing}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{c.billing}</h2>
        <div className="flex flex-wrap gap-2">
          <Select
            value={scope}
            onValueChange={(v) => {
              setScope(v);
              setOffset(0);
            }}
          >
            <SelectTrigger aria-label={c.scope} className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["live", "test", "all"] as const).map((x) => (
                <SelectItem value={x} key={x}>
                  {c[x]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" disabled={loading} onClick={reload}>
            {c.refresh}
          </Button>
        </div>
      </div>
      <Button variant="outline" onClick={()=>setShowContracts(v=>!v)} aria-expanded={showContracts}>{offer.contracts}</Button>
      {showContracts&&<ContractBillingPanel key={companyId} companyId={companyId} admin={admin} linked={!!data?.profile?.contract_id} onChanged={reload}/>}
      {data?.profile?.contract_id&&<p className="rounded-xl border p-4 text-sm">{offer.linked} #{String(data.profile.contract_id)} · {offer.readonly}</p>}
      <p className="rounded-xl border bg-card p-4 text-sm">{invoicePaymentCopy[language].intro}</p>
      <p className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
        {c.noSuspension}
      </p>
      {data?.activation&&!data.activation.paid_at&&<p role="status" className="rounded-xl border border-primary/30 p-4">{invoicePaymentCopy[language].activation}</p>}
      {isTest && <p className="text-sm font-medium">{c.trial}</p>}
      {error && (
        <div role="alert" className="space-y-2 text-destructive">
          <p>{c.error}</p>
          <Button variant="outline" onClick={reload}>
            {c.retry}
          </Button>
        </div>
      )}
      {loading && <p role="status">{c.loading}</p>}
      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [c.posted, money(data.posted_balance_cents)],
              [c.overdue, money(data.overdue_cents)],
              [c.prepared, String(data.prepared_count)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {value}
                </p>
              </div>
            ))}
          </div>
          {isTest && (
            <p className="rounded-xl border p-4 text-sm">{c.demoNotice}</p>
          )}
          {admin && (
            <div className="space-y-3 rounded-2xl border p-4">
              <p className="text-sm text-muted-foreground">{c.readiness}</p>
              <p className="text-sm">
                {data.mail_ready ? c.mailReady : c.mailNotReady} · {c.scheduler}
                : {data.scheduler?.last_run_at || "—"} · {c.exchangeMode}:{" "}
                {data.settings?.exchange_mode === "external_structured"
                  ? String(data.settings.exchange_provider)
                  : c.unconfigured}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => open("settings")}>
                  {c.settings}
                </Button>
                <Button
                  variant="outline"
                  disabled={archived || !!p?.contract_id}
                  onClick={() => open("profile")}
                >
                  {c.configure}
                </Button>
                <Button
                  disabled={archived || !p?.enabled}
                  onClick={() => open("prepare")}
                >
                  {c.prepare}
                </Button>
              </div>
            </div>
          )}
          <h3 className="font-semibold">{c.documents}</h3>
          {downloadError && (
            <p role="alert" className="text-destructive">
              {downloadError}
            </p>
          )}
          <div className="space-y-3">
            {data.documents.map((d) => (
              <article
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4"
              >
                <div>
                  <p className="font-semibold" dir="ltr">
                    {d.document_number}{d.contract_number&&<small className="block font-normal">{d.contract_number} · {d.installment_number}/12</small>}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c[d.kind]} · {d.period_start} · {d.due_date || "—"}
                  </p>
                  <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-muted-foreground">{c.net}</dt>
                      <dd className="tabular-nums">{money(d.net_cents)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        {c.vatAmount} ({Number(d.vat_bps ?? 2100) / 100}%)
                      </dt>
                      <dd className="tabular-nums">
                        {money(d.vat_cents ?? d.gross_cents - d.net_cents)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{c.gross}</dt>
                      <dd className="font-semibold tabular-nums">
                        {money(d.gross_cents)}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {c[d.state as "prepared" | "issued" | "void"] || d.state}
                    </Badge>
                    {d.is_test && <Badge variant="outline">{c.test}</Badge>}
                    {d.state === "issued" && d.kind === "invoice" && (
                      <Badge variant="outline">
                        {Number(d.balance_cents) <= 0
                          ? c.paid
                          : Number(d.balance_cents) < d.gross_cents
                            ? c.partial
                            : c.unpaid}
                      </Badge>
                    )}
                    <span className="text-sm tabular-nums">
                      {money(d.gross_cents)}
                      {d.balance_cents !== null
                        ? " · " + c.balance + ": " + money(d.balance_cents)
                        : ""}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => download(d)}>
                    {c.download}
                  </Button>
                  {!d.is_test&&d.kind==='invoice'&&d.state!=='void'&&admin&&<InvoiceDeliveryActions source="subscription" id={d.id} companyId={companyId} onChanged={reload}/>}
                  {data.payable?.[d.id]&&<a className={buttonVariants()} href={data.payable[d.id]}>{invoicePaymentCopy[language].pay}</a>}
                  {admin && d.state === "prepared" && (
                    <>
                      <Button
                        variant="outline"
                        disabled={
                          !d.is_test &&
                          data.settings?.exchange_mode !== "external_structured"
                        }
                        onClick={() =>
                          open(d.is_test ? "demo_issue" : "issue", d)
                        }
                      >
                        {d.is_test ? c.demoIssue : c.issue}
                      </Button>
                      <Button variant="outline" onClick={() => open("void", d)}>
                        {c.voidPreparation}
                      </Button>
                    </>
                  )}
                  {admin && d.state === "issued" && d.kind === "invoice" && (
                    <>
                      <Button
                        variant="outline"
                        disabled={Number(d.balance_cents) <= 0}
                        onClick={() => open("payment", d)}
                      >
                        {c.recordPayment}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => open("credit", d)}
                      >
                        {c.prepareCredit}
                      </Button>
                    </>
                  )}
                </div>
              </article>
            ))}
            {!data.documents.length && (
              <p className="rounded-xl border border-dashed p-6 text-muted-foreground">
                {c.empty}
              </p>
            )}
          </div>
          {(data.payments || []).length > 0 && (
            <section className="space-y-3">
              <h3 className="font-semibold">{c.receipts}</h3>
              {data.payments.map((receipt) => (
                <div
                  key={receipt.request_id}
                  className="flex flex-wrap justify-between gap-3 rounded-xl border p-4 text-sm"
                >
                  <span>
                    #{receipt.invoice_id} · {receipt.payment_date} ·{" "}
                    {receipt.payment_method==='stripe'?'Stripe':c[receipt.payment_method]}
                  </span>
                  <span className="break-all">{receipt.reference}</span>
                  <strong className="tabular-nums">
                    {money(receipt.amount_cents)}
                  </strong>
                </div>
              ))}
            </section>
          )}
          <h3 className="font-semibold">{c.statement}</h3>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-start text-sm">
              <thead className="bg-muted/40">
                <tr>
                  {[c.date, c.reference, c.amount, c.balance].map((x) => (
                    <th key={x} className="p-3 text-start">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.entries.map((e) => (
                  <tr key={e.entry_id} className="border-t">
                    <td className="whitespace-nowrap p-3">{e.entry_date}</td>
                    <td className="p-3">{e.reference}</td>
                    <td className="whitespace-nowrap p-3 tabular-nums">
                      {money(e.amount_cents)}
                    </td>
                    <td className="whitespace-nowrap p-3 tabular-nums">
                      {money(e.running_balance_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.entries.length && (
              <p className="p-5 text-muted-foreground">{c.empty}</p>
            )}
          </div>
          {admin && data.mail.length > 0 && (
            <details className="rounded-xl border p-4">
              <summary className="cursor-pointer font-semibold">
                {c.delivery}
              </summary>
              <ul className="mt-3 space-y-2 text-sm">
                {data.mail.map((m) => (
                  <li key={m.id}>
                    #{m.document_id} · {m.purpose} · {m.status} ·{" "}
                    {m.last_result || "—"} · {m.scheduled_date}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm">
              {c.documents}: {data.total} · {c.statement}: {data.entry_total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - 25))}
              >
                {c.previous}
              </Button>
              <Button
                variant="outline"
                disabled={offset + 25 >= Math.max(data.total, data.entry_total)}
                onClick={() => setOffset(offset + 25)}
              >
                {c.next}
              </Button>
            </div>
          </div>
        </>
      )}
      {mode && data && (
        <OperationForm
          intentKey={companyId + ":" + mode + ":" + (selected?.id || "")}
          key={mode + String(selected?.id || "")}
          title={titles[mode]}
          description={
            mode === "demo_issue"
              ? c.demoNotice
              : mode === "issue"
                ? c.readiness
                : mode === "prepare"
                  ? c.noSuspension
                  : undefined
          }
          fields={fields}
          initial={initial}
          onSubmit={submit}
          onClose={() => setMode(null)}
          c={c}
        />
      )}
    </section>
  );
}
