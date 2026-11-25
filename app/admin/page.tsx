import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase";
import { STAGES } from "@/lib/brand";
import { naira, date, invoiceTotals } from "@/lib/format";
import AdminNav from "./AdminNav";

async function createClientProject(formData: FormData) {
  "use server";
  const { supabase } = await requireAdmin();
  const g = (k: string) => String(formData.get(k) || "").trim();
  if (!g("full_name") || !g("email") || !g("project_name")) redirect("/admin?error=" + encodeURIComponent("Please fill in the client name, email and project name"));
  const { data: projectId, error } = await supabase.rpc("admin_create_client_project", {
    p_full_name: g("full_name"),
    p_email: g("email").toLowerCase(),
    p_phone: g("phone"),
    p_password: g("password"),
    p_project_name: g("project_name"),
    p_address: g("address"),
  });
  if (error || !projectId) redirect(`/admin?error=${encodeURIComponent(error?.message || "Could not create the project")}`);
  redirect(`/project/${projectId}?msg=created`);
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string; show?: string }>;
}) {
  const sp = await searchParams;
  const { supabase, profile } = await requireAdmin();

  const [{ data: projects }, { data: invoices }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, address, stage, status, created_at, profiles(full_name, email, phone)")
      .order("created_at", { ascending: false }),
    supabase.from("invoices").select("id, project_id, status, vat_rate, invoice_items(qty, rate), payments(amount, status)"),
  ]);

  const q = (sp.q || "").toLowerCase();
  const show = sp.show || "Active";
  const list = (projects || []).filter((p: any) => {
    const hay = `${p.name} ${p.profiles?.full_name || ""} ${p.profiles?.email || ""}`.toLowerCase();
    return (!q || hay.includes(q)) && (show === "All" || p.status === show);
  });

  const owed: Record<string, number> = {};
  let totalOwed = 0;
  let totalPaid = 0;
  (invoices || []).forEach((inv: any) => {
    if (inv.status === "Cancelled") return;
    const t = invoiceTotals(inv.invoice_items || [], inv.vat_rate, inv.payments || []);
    owed[inv.project_id] = (owed[inv.project_id] || 0) + t.balance;
    totalOwed += t.balance;
    totalPaid += t.paid;
  });

  return (
    <main className="container page">
      <AdminNav active="dashboard" />
      <h1>Studio dashboard</h1>
      <p className="muted">Welcome back{profile.full_name ? `, ${profile.full_name}` : ""}. Every client project is below.</p>

      <div className="grid three" style={{ margin: "18px 0" }}>
        <div className="stat"><div className="label">Active projects</div><div className="value">{(projects || []).filter((p: any) => p.status === "Active").length}</div></div>
        <div className="stat"><div className="label">Outstanding invoices</div><div className="value">{naira(totalOwed)}</div></div>
        <div className="stat"><div className="label">Received online</div><div className="value">{naira(totalPaid)}</div></div>
      </div>

      {sp.error && <div className="notice err">Couldn&apos;t create the project: {sp.error}</div>}

      <div className="card">
        <form className="row" method="get">
          <input name="q" defaultValue={sp.q} placeholder="Search client or project" style={{ flex: 2, minWidth: 180 }} />
          <select name="show" defaultValue={show} style={{ flex: 1, minWidth: 130 }}>
            {["Active", "On hold", "Completed", "All"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="btn small" type="submit">Filter</button>
        </form>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead>
              <tr><th>Client</th><th>Project</th><th>Stage</th><th className="num">Owed</th><th>Started</th></tr>
            </thead>
            <tbody>
              {list.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/project/${p.id}`}><strong>{p.profiles?.full_name || "—"}</strong></Link>
                    <div className="small muted">{p.profiles?.phone || p.profiles?.email}</div>
                  </td>
                  <td>{p.name}<div className="small muted">{p.address}</div></td>
                  <td>
                    <span className="pill">{p.stage}</span>
                    <div className="small muted">{STAGES.indexOf(p.stage) + 1} of {STAGES.length}</div>
                  </td>
                  <td className="num">{owed[p.id] ? <span className="pill red">{naira(owed[p.id])}</span> : <span className="pill green">Nil</span>}</td>
                  <td>{date(p.created_at)}</td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={5} className="muted">No projects yet. Add your first client below.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Add a new client project</h2>
        <form action={createClientProject}>
          <div className="grid two">
            <div className="field"><label>Client full name *</label><input name="full_name" required /></div>
            <div className="field"><label>Client email *</label><input name="email" type="email" required /></div>
            <div className="field"><label>Client phone / WhatsApp</label><input name="phone" /></div>
            <div className="field"><label>Project name *</label><input name="project_name" required placeholder="e.g. Adeyemi Residence — Living & Dining" /></div>
          </div>
          <div className="grid two">
            <div className="field"><label>Project address</label><input name="address" /></div>
            <div className="field"><label>Client&apos;s password (new clients, at least 6 characters)</label><input name="password" placeholder="e.g. Uniqueen2026" /></div>
          </div>
          <p className="small muted">
            After creating the project, send the client the website link, their email and this password on WhatsApp.
          </p>
          <button className="btn" type="submit">Create project</button>
        </form>
      </div>
    </main>
  );
}
