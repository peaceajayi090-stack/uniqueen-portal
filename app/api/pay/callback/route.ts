import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { confirmFlutterwaveTransaction } from "@/lib/payments";

// Flutterwave sends the client back here after checkout: ?status=...&tx_ref=...&transaction_id=...
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const txRef = url.searchParams.get("tx_ref");
  const transactionId = url.searchParams.get("transaction_id");

  if ((status === "successful" || status === "completed") && transactionId) {
    const result = await confirmFlutterwaveTransaction(transactionId);
    if (result.ok && result.projectId) {
      return NextResponse.redirect(new URL(`/project/${result.projectId}?tab=invoices&msg=paid`, url.origin));
    }
  }

  // Cancelled or failed: find the project to send them back to
  if (txRef) {
    const db = supabaseAdmin();
    const { data } = await db.from("payments").select("id, status, invoices(project_id)").eq("tx_ref", txRef).single();
    if (data) {
      if (data.status === "pending") await db.from("payments").update({ status: "failed" }).eq("id", data.id);
      const projectId = (data as any).invoices?.project_id;
      if (projectId) return NextResponse.redirect(new URL(`/project/${projectId}?tab=invoices&msg=payfail`, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/portal", url.origin));
}
