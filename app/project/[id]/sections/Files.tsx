import { supabaseAdmin } from "@/lib/supabase";
import { FILE_CATEGORIES } from "@/lib/brand";
import { date } from "@/lib/format";
import FileUploader from "@/components/FileUploader";
import { ConfirmButton } from "@/components/Buttons";
import { deleteFile } from "../actions";

const isImage = (n: string) => /\.(png|jpe?g|webp|gif)$/i.test(n);
const size = (b: number | null) => (!b ? "" : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`);

export default async function Files({ projectId, files, isAdmin }: { projectId: string; files: any[]; isAdmin: boolean }) {
  // Private links that work for 1 hour
  const urls: Record<string, string> = {};
  if (files.length) {
    const { data } = await supabaseAdmin().storage.from("project-files").createSignedUrls(files.map((f) => f.path), 3600);
    (data || []).forEach((d) => { if (d.path && d.signedUrl) urls[d.path] = d.signedUrl; });
  }
  const groups = FILE_CATEGORIES.filter((c) => files.some((f) => f.category === c));

  return (
    <>
      <div className="card">
        <h3>{isAdmin ? "Upload drawings, renders, moodboards or receipts" : "Send us photos or documents"}</h3>
        <FileUploader projectId={projectId} categories={FILE_CATEGORIES} defaultCategory={isAdmin ? "Drawings" : "Site photos"} />
      </div>

      {!files.length && <div className="card"><p className="muted">No files yet.</p></div>}

      {groups.map((cat) => (
        <div className="card" key={cat}>
          <h3>{cat}</h3>
          <div className="grid three">
            {files.filter((f) => f.category === cat).map((f) => (
              <div key={f.id} className="stat" style={{ padding: 10 }}>
                {isImage(f.name) && urls[f.path] && (
                  <a href={urls[f.path]} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={urls[f.path]} alt={f.name} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />
                  </a>
                )}
                <div className="small" style={{ marginTop: 6, wordBreak: "break-word" }}>
                  {urls[f.path] ? <a href={urls[f.path]} target="_blank" rel="noreferrer">{f.name}</a> : f.name}
                </div>
                <div className="small muted">{date(f.created_at)} · {size(f.size_bytes)}</div>
                {isAdmin && (
                  <form action={deleteFile} style={{ marginTop: 6 }}>
                    <input type="hidden" name="project_id" value={projectId} />
                    <input type="hidden" name="file_id" value={f.id} />
                    <ConfirmButton message={`Delete ${f.name}?`}>Delete</ConfirmButton>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
