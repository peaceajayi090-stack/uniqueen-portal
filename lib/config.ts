import { headers } from "next/headers";

export { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

/** The website's own address, e.g. https://uniqueen-portal.vercel.app — worked out from the visit if not set. */
export async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
