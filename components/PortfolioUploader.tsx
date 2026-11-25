"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/env";
import { addPortfolioItem, getPortfolioUploadUrl } from "@/app/admin/portfolio/actions";

export default function PortfolioUploader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const file = (f.elements.namedItem("image") as HTMLInputElement).files?.[0];
    const title = (f.elements.namedItem("title") as HTMLInputElement).value.trim();
    const location = (f.elements.namedItem("location") as HTMLInputElement).value.trim();
    const category = (f.elements.namedItem("category") as HTMLSelectElement).value;
    if (!file || !title) return;
    if (!file.type.startsWith("image/")) return setMsg("Please choose a photo (JPG, PNG or WebP).");
    if (file.size > 20 * 1024 * 1024) return setMsg("Photo is larger than 20 MB.");
    setBusy(true);
    setMsg(null);
    try {
      const { path, token } = await getPortfolioUploadUrl(file.name);
      const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { error } = await supabase.storage.from("portfolio").uploadToSignedUrl(path, token, file);
      if (error) throw new Error(error.message);
      await addPortfolioItem(title, location, category, path);
      f.reset();
      setMsg("Added to your portfolio.");
      router.refresh();
    } catch (err: any) {
      setMsg(`Upload failed: ${err?.message || "please try again"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid two">
        <div className="field"><label>Photo *</label><input name="image" type="file" accept="image/*" required /></div>
        <div className="field"><label>Title *</label><input name="title" required placeholder="e.g. Warm modern living room" /></div>
        <div className="field"><label>Location</label><input name="location" placeholder="e.g. Lekki Phase 1, Lagos" /></div>
        <div className="field">
          <label>Type</label>
          <select name="category">
            {["Residential", "Short-let", "Office", "Hospitality", "Retail"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <button className="btn" type="submit" disabled={busy}>{busy ? "Uploading…" : "Add to portfolio"}</button>
      {msg && <p className="small" style={{ marginTop: 8 }}>{msg}</p>}
    </form>
  );
}
