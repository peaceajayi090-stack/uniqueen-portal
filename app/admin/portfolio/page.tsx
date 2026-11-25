import { requireAdmin } from "@/lib/supabase";
import { portfolioImage } from "@/lib/portfolio";
import PortfolioUploader from "@/components/PortfolioUploader";
import { ConfirmButton } from "@/components/Buttons";
import { addTestimonial, deletePortfolioItem, deleteTestimonial } from "./actions";
import AdminNav from "../AdminNav";

export default async function PortfolioAdmin() {
  const { supabase } = await requireAdmin();
  const [{ data: items }, { data: quotes }] = await Promise.all([
    supabase.from("portfolio_items").select("*").order("created_at", { ascending: false }),
    supabase.from("testimonials").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <main className="container page">
      <AdminNav active="portfolio" />
      <h1>Portfolio &amp; reviews</h1>
      <p className="muted">Photos and client quotes added here appear on your public home page straight away.</p>

      <div className="card">
        <h3>Add a project photo</h3>
        <PortfolioUploader />
      </div>

      <div className="card">
        <h3>Portfolio ({items?.length || 0})</h3>
        {!items?.length && <p className="muted">No photos yet. Your home page shows elegant placeholders until you add some.</p>}
        <div className="grid three">
          {(items || []).map((it: any) => (
            <div key={it.id} className="stat" style={{ padding: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portfolioImage(it.image_path)} alt={it.title} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 6 }} />
              <div className="small" style={{ marginTop: 6 }}><strong>{it.title}</strong></div>
              <div className="small muted">{[it.location, it.category].filter(Boolean).join(" · ")}</div>
              <form action={deletePortfolioItem} style={{ marginTop: 6 }}>
                <input type="hidden" name="id" value={it.id} />
                <ConfirmButton message={`Remove "${it.title}" from your portfolio?`}>Remove</ConfirmButton>
              </form>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Client testimonials</h3>
        <form action={addTestimonial}>
          <div className="grid two">
            <div className="field"><label>Client name *</label><input name="client_name" required placeholder="e.g. Mrs. A. Okafor" /></div>
            <div className="field"><label>Detail</label><input name="detail" placeholder="e.g. 4-bedroom home, Ikoyi" /></div>
          </div>
          <div className="field"><label>Their words *</label><textarea name="quote" required placeholder="Use the client's exact words, with their permission" /></div>
          <button className="btn secondary" type="submit">Add testimonial</button>
        </form>
        {(quotes || []).map((t: any) => (
          <div key={t.id} className="update" style={{ marginTop: 14 }}>
            <p style={{ margin: 0 }}>“{t.quote}”</p>
            <p className="small muted" style={{ margin: "4px 0" }}>— {t.client_name}{t.detail ? `, ${t.detail}` : ""}</p>
            <form action={deleteTestimonial}>
              <input type="hidden" name="id" value={t.id} />
              <ConfirmButton message="Delete this testimonial?">Delete</ConfirmButton>
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}
