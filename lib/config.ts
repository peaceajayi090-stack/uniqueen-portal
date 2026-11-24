import { headers } from "next/headers";

// Public values (safe to be in the code). Can still be overridden with environment variables.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uipuggourlutetztcmcf.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpcHVnZ291cmx1dGV0enRjbWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5OTcwNzAsImV4cCI6MjEwOTU3MzA3MH0.hY3VJaOPnPvrC5KjR6Q_Lt28gIrXBopqdi_kdaStnmM";

/** The website's own address, e.g. https://uniqueen-portal.vercel.app — worked out from the visit if not set. */
export async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
