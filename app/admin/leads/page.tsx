import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase";
import { LEAD_STATUSES } from "@/lib/brand";
import { date } from "@/lib/format";
import AdminNav from "../AdminNav";

async function updateLead(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  await supabase
    .from("leads")
    .update({ status: String(formData.get("status")), notes: String(formData.get("notes") || "") || null })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/leads");
}

const pill = (s: string) => (s === "New" ? "gold" : s === "Won" || s === "Booked" ? "green" : s === "Lost" ? "red" : "");

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: leads } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  const show = sp.show || "Open";
  const list = (leads || []).filter((l: any) => (show === "All" ? true : show === "Open" ? !["Won", "Lost"].includes(l.status) : l.status === show));
  const count = (s: string) => (leads || []).filter((l: any) => l.status === s).length;

  return (
    <main className="container page">
      <AdminNav active="leads" />
      <h1>Leads</h1>
      <p className="muted">Booking requests from your Packages page. Share it: <strong>/packages</strong></p>
      <div className="grid three" style={{ margin: "16px 0" }}>
        <div className="stat"><div className="label">New</div><div className="value">{count("New")}</div></div>
        <div className="stat"><div className="label">Booked</div><div className="value">{count("Booked")}</div></div>
        <div className="stat"><div className="label">Won</div><div className="value">{count("Won")}</div></div>
      </div>
      <form className="row" method="get" style={{ marginBottom: 14 }}>
        <select name="show" defaultValue={show} style={{ width: "auto" }}>
          {["Open", "All", ...LEAD_STATUSES].map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn small" type="submit">Show</button>
      </form>
      {!list.length && <div className="card"><p className="muted">No leads here yet.</p></div>}
      {list.map((l: any) => (
        <div className="card" key={l.id}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <h3 style={{ marginBottom: 2 }}>{l.name}</h3>
              <div className="small muted">{date(l.created_at)} · {l.location || "No location"} · {l.package || "Package not chosen"}</div>
            </div>
            <span className={`pill ${pill(l.status)}`}>{l.status}</span>
          </div>
          <p className="small" style={{ marginTop: 8 }}>
            {l.phone && <><a href={`https://wa.me/${l.phone.replace(/[^0-9]/g, "").replace(/^0/, "234")}`}>WhatsApp {l.phone}</a> · </>}
            {l.email && <a href={`mailto:${l.email}`}>{l.email}</a>}
            {l.preferred_date && <> · Preferred date {date(l.preferred_date)}</>}
          </p>
          {l.message && <p style={{ whiteSpace: "pre-wrap" }}>{l.message}</p>}
          <form action={updateLead} className="grid two">
            <input type="hidden" name="id" value={l.id} />
            <div className="field" style={{ margin: 0 }}>
              <select name="status" defaultValue={l.status}>{LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
            <div className="field" style={{ margin: 0 }}><input name="notes" defaultValue={l.notes || ""} placeholder="Notes (e.g. called, sending proposal)" /></div>
            <button className="btn small secondary" type="submit">Save</button>
          </form>
        </div>
      ))}
    </main>
  );
}
