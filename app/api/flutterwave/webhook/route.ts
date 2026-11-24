import { NextResponse, type NextRequest } from "next/server";
import { confirmFlutterwaveTransaction } from "@/lib/payments";

// Backup confirmation: Flutterwave calls this even if the client closes their browser after paying.
// Set the URL https://YOUR-SITE/api/flutterwave/webhook and the secret hash in Flutterwave > Settings > Webhooks.
export async function POST(request: NextRequest) {
  const hash = request.headers.get("verif-hash");
  if (!process.env.FLW_SECRET_HASH || hash !== process.env.FLW_SECRET_HASH) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const payload = await request.json().catch(() => null);
  const data = payload?.data;
  if (data?.id && data?.status === "successful") {
    // Never trust the webhook body alone: re-check with Flutterwave before recording.
    await confirmFlutterwaveTransaction(String(data.id));
  }
  return NextResponse.json({ ok: true });
}
