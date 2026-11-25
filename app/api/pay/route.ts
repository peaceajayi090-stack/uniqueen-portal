import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";
import { invoiceTotals } from "@/lib/format";
import { createFlutterwaveCheckout } from "@/lib/payments";

// Client presses "Pay" → we create a pending payment and send them to Flutterwave's checkout.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const invoiceId = String(form.get("invoice_id") || "");
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  // Read through the client's own permissions: they can only load their own invoice.
  const { data: inv } = await supabase
    .from("invoices")
    .select("*, invoice_items(qty, rate), payments(amount, status), projects(id, name)")
    .eq("id", invoiceId)
    .single();
  if (!inv || inv.status !== "Unpaid") return NextResponse.redirect(new URL("/portal", request.url), { status: 303 });

  const projectId = (inv as any).projects.id as string;
  const t = invoiceTotals(inv.invoice_items || [], inv.vat_rate, inv.payments || []);
  if (t.balance <= 0) {
    return NextResponse.redirect(new URL(`/project/${projectId}?tab=invoices`, request.url), { status: 303 });
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, phone, email").eq("id", user.id).single();
  const txRef = `UQI-${inv.number}-${Date.now()}`;

  await supabase.from("payments").insert({
    invoice_id: inv.id,
    tx_ref: txRef,
    amount: t.balance,
    status: "pending",
  });

  try {
    const link = await createFlutterwaveCheckout({
      txRef,
      amount: t.balance,
      customer: { email: profile?.email || user.email!, name: profile?.full_name || "Client", phone: profile?.phone },
      title: "Uniqueen Interiors",
      description: `Invoice ${inv.number} — ${(inv as any).projects.name}`,
    });
    return NextResponse.redirect(link, { status: 303 });
  } catch {
    try { await supabaseAdmin().from("payments").update({ status: "failed" }).eq("tx_ref", txRef); } catch {}
    return NextResponse.redirect(new URL(`/project/${projectId}?tab=invoices&msg=payfail`, request.url), { status: 303 });
  }
}
