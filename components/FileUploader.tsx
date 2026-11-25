"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/env";
import { getUploadUrl, recordFile } from "@/app/project/[id]/actions";

export default function FileUploader({ projectId, categories, defaultCategory }: { projectId: string; categories: readonly string[]; defaultCategory: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const files = (form.elements.namedItem("files") as HTMLInputElement).files;
    const category = (form.elements.namedItem("category") as HTMLSelectElement).value;
    if (!files || !files.length) return;
    setBusy(true);
    setMsg(null);
    const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 50 * 1024 * 1024) throw new Error(`${file.name} is larger than 50 MB`);
        const { path, token } = await getUploadUrl(projectId, file.name);
        const { error } = await supabase.storage.from("project-files").uploadToSignedUrl(path, token, file);
        if (error) throw new Error(error.message);
        await recordFile(projectId, file.name, path, category, file.size);
      }
      form.reset();
      setMsg(`Uploaded ${files.length} file${files.length > 1 ? "s" : ""}.`);
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
        <div className="field">
          <label>Files (photos, PDFs, drawings, up to 50 MB each)</label>
          <input name="files" type="file" multiple required />
        </div>
        <div className="field">
          <label>Category</label>
          <select name="category" defaultValue={defaultCategory}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <button className="btn" type="submit" disabled={busy}>{busy ? "Uploading…" : "Upload"}</button>
      {msg && <p className="small" style={{ marginTop: 8 }}>{msg}</p>}
    </form>
  );
}
