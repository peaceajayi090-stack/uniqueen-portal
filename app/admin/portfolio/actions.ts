"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase";

export async function getPortfolioUploadUrl(fileName: string) {
  await requireAdmin();
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
  const path = `${Date.now()}-${safe}`;
  const { data, error } = await supabaseAdmin().storage.from("portfolio").createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message || "Could not prepare upload");
  return { path: data.path, token: data.token };
}

export async function addPortfolioItem(title: string, location: string, category: string, path: string) {
  await requireAdmin();
  await supabaseAdmin().from("portfolio_items").insert({ title, location: location || null, category: category || null, image_path: path });
  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}

export async function deletePortfolioItem(formData: FormData) {
  await requireAdmin();
  const db = supabaseAdmin();
  const id = String(formData.get("id"));
  const { data } = await db.from("portfolio_items").select("image_path").eq("id", id).single();
  if (data) await db.storage.from("portfolio").remove([data.image_path]);
  await db.from("portfolio_items").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}

export async function addTestimonial(formData: FormData) {
  await requireAdmin();
  const g = (k: string) => String(formData.get(k) || "").trim();
  if (!g("client_name") || !g("quote")) return;
  await supabaseAdmin().from("testimonials").insert({ client_name: g("client_name"), detail: g("detail") || null, quote: g("quote") });
  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}

export async function deleteTestimonial(formData: FormData) {
  await requireAdmin();
  await supabaseAdmin().from("testimonials").delete().eq("id", String(formData.get("id")));
  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}
