import { supabaseAdmin } from "./supabase";
import { invoiceTotals } from "./format";

const FLW_API = "https://api.flutterwave.com/v3";

/** Starts a Flutterwave Standard checkout and returns the hosted payment link. */
export async function createFlutterwaveCheckout(opts: {
  txRef: string;
  amount: number;
  customer: { email: string; name: string; phone?: string | null };
  title: string;
  description: string;
}) {
  const res = await fetch(`${FLW_API}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: opts.txRef,
      amount: opts.amount,
      currency: "NGN",
      redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/pay/callback`,
      customer: {
        email: opts.customer.email,
        name: opts.customer.name,
        phonenumber: opts.customer.phone || undefined,
      },
      customizations: { title: opts.title, description: opts.description },
    }),
  });
  const json = await res.json();
  if (!res.ok || json.status !== "success") {
    throw new Error(json.message || "Could not start Flutterwave payment");
  }
  return json.data.link as string;
}

/**
 * Asks Flutterwave whether a transaction really succeeded, then records it.
 * Safe to call more than once for the same transaction (redirect + webhook).
 * Returns the invoice's project id when the payment is confirmed.
 */
export async function confirmFlutterwaveTransaction(transactionId: string) {
  const res = await fetch(`${FLW_API}/transactions/${encodeURIComponent(transactionId)}/verify`, {
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || json.status !== "success") return { ok: false as const, reason: "verify_failed" };

  const tx = json.data;
  const db = supabaseAdmin();
  const { data: payment } = await db
    .from("payments")
    .select("*, invoices(id, project_id)")
    .eq("tx_ref", tx.tx_ref)
    .single();
  if (!payment) return { ok: false as const, reason: "unknown_reference" };

  const projectId = (payment as any).invoices?.project_id as string | undefined;

  if (payment.status === "successful") return { ok: true as const, projectId };

  const valid =
    tx.status === "successful" && tx.currency === "NGN" && Number(tx.amount) >= Number(payment.amount);

  if (!valid) {
    await db.from("payments").update({ status: "failed", flw_transaction_id: String(tx.id) }).eq("id", payment.id);
    return { ok: false as const, reason: "not_successful", projectId };
  }

  await db
    .from("payments")
    .update({ status: "successful", flw_transaction_id: String(tx.id), paid_at: new Date().toISOString() })
    .eq("id", payment.id);

  // Mark the invoice Paid once everything is covered
  const [{ data: invoice }, { data: items }, { data: pays }] = await Promise.all([
    db.from("invoices").select("*").eq("id", payment.invoice_id).single(),
    db.from("invoice_items").select("qty, rate").eq("invoice_id", payment.invoice_id),
    db.from("payments").select("amount, status").eq("invoice_id", payment.invoice_id),
  ]);
  if (invoice) {
    const t = invoiceTotals(items || [], invoice.vat_rate, pays || []);
    if (t.balance <= 0) await db.from("invoices").update({ status: "Paid" }).eq("id", invoice.id);
  }
  return { ok: true as const, projectId };
}
