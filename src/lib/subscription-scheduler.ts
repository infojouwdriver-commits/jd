import { randomUUID } from "node:crypto";
import { generateAdminUserToken } from "./auth";
import { createPostgrestClient } from "./postgrest";
import {deliverInvoiceEmail} from './invoice-email';
import type {SubscriptionDocument} from './subscription-document';
export async function subscriptionTick() {
  const client = createPostgrestClient(await generateAdminUserToken());
  const tick = await client.rpc("security_subscription_tick");
  if (tick.error) throw Error("Subscription scheduler unavailable");
  const emailed=await client.rpc('security_invoice_email_tick');if(emailed.error)throw Error('Invoice email scheduler unavailable');
  for (let i = 0; i < 5; i++) {
    const lease = randomUUID(),
      claimed = await client.rpc("security_claim_subscription_mail", {
        p_lease: lease,
      });
    if (claimed.error) throw Error("Subscription queue unavailable");
    if (!claimed.data) break;
    const job = claimed.data as {
        id: number;
        event_key: string;
        purpose:'subscription_invoice'|'subscription_credit'|'subscription_reminder';
        document: SubscriptionDocument;
        balance_cents: number;
      },
      d = job.document;
    const result = await deliverInvoiceEmail(client,'subscription',d,'subscription:'+job.event_key,job.purpose);
    const finished = await client.rpc("security_finish_subscription_mail", {
      p_id: job.id,
      p_lease: lease,
      p_status: result.status,
      p_delivery: result.delivery_id || null,
    });
    if (finished.error) throw Error("Subscription result unavailable");
  }
}
export function startSubscriptionScheduler() {
  const key = globalThis as typeof globalThis & {
    jdSubscriptionTimer?: ReturnType<typeof setTimeout>;
  };
  if (key.jdSubscriptionTimer) return;
  const run = async () => {
    try {
      await subscriptionTick();
    } catch {
      console.error("Subscription scheduler temporarily unavailable");
    } finally {
      key.jdSubscriptionTimer = setTimeout(run, 60000);
      key.jdSubscriptionTimer.unref();
    }
  };
  key.jdSubscriptionTimer = setTimeout(run, 15000);
  key.jdSubscriptionTimer.unref();
}
