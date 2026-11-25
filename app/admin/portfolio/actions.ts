"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase";

export async function getPortfolioUploadUrl(fileName: string) {
  const { supabase } = await requireAdmin();
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
  const path = `${Date.now()}-${safe}`;
  const { data, error } = await supabase.storage.from("portfolio").createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message || "Could not prepare upload");
  return { path: data.path, token: data.token };
}

export async function addPortfolioItem(title: string, location: string, category: string, path: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("portfolio_items").insert({ title, location: location || null, category: category || null, image_path: path });
  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}

export async function deletePortfolioItem(formData: FormData) {
  const { supabase: db } = await requireAdmin();
  const id = String(formData.get("id"));
  const { data } = await db.from("portfolio_items").select("image_path").eq("id", id).single();
  if (data) await db.storage.from("portfolio").remove([data.image_path]);
  await db.from("portfolio_items").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}

export async function addTestimonial(formData: FormData) {
  const { supabase } = await requireAdmin();
  const g = (k: string) => String(formData.get(k) || "").trim();
  if (!g("client_name") || !g("quote")) return;
  await supabase.from("testimonials").insert({ client_name: g("client_name"), detail: g("detail") || null, quote: g("quote") });
  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}

export async function deleteTestimonial(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("testimonials").delete().eq("id", String(formData.get("id")));
  revalidatePath("/");
  revalidatePath("/admin/portfolio");
}
