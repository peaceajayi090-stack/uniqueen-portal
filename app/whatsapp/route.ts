import { NextResponse, type NextRequest } from "next/server";

// Printed QR codes point here, so the WhatsApp number can change without reprinting cards.
export function GET(request: NextRequest) {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_STUDIO_PHONE || "2349038646457";
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = "234" + digits.slice(1);
  const text = encodeURIComponent("Hello Uniqueen Interiors, I'd like to enquire about your interior design services.");
  if (digits.length < 10) return NextResponse.redirect(new URL("/packages#book", request.url));
  return NextResponse.redirect(`https://wa.me/${digits}?text=${text}`);
}
