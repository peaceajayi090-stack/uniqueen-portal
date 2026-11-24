import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase";
import { STAGES } from "@/lib/brand";
import { naira, invoiceTotals } from "@/lib/format";
import Overview from "./sections/Overview";
import Questionnaire from "./sections/Questionnaire";
import Updates from "./sections/Updates";
import Invoices from "./sections/Invoices";
import Orders from "./sections/Orders";
import Boq from "./sections/Boq";
import WelcomeGuide from "./sections/WelcomeGuide";

const TABS = [
  ["overview", "Overview"],
  ["guide", "Welcome guide"],
  ["questionnaire", "Questionnaire"],
  ["updates", "Updates"],
  ["invoices", "Invoices & payments"],
  ["orders", "Orders"],
  ["boq", "Costing (BOQ)"],
] as const;

const MESSAGES: Record<string, [string, string]> = {
  saved: ["ok", "Saved."],
  submitted: ["ok", "Thank you! Your questionnaire has been sent to Uniqueen Interiors."],
  created: ["ok", "Project created. Send the client the website link, their email and password on WhatsApp."],
  paid: ["ok", "Payment received. Thank you!"],
  payfail: ["err", "The payment was not completed. You have not been charged; please try again."],
  error: ["err", "Something went wrong. Please try again."],
};

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; msg?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const tab = TABS.some(([k]) => k === sp.tab) ? sp.tab! : "overview";
  const { supabase, profile } = await requireUser();
  const isAdmin = profile.role === "admin";

  const { data: project } = await supabase
    .from("projects")
    .select("*, profiles(id, full_name, email, phone)")
    .eq("id", id)
    .single();
  if (!project) notFound();

  const [q, updates, invoices, orders, boq] = await Promise.all([
    supabase.from("questionnaires").select("*").eq("project_id", id).maybeSingle(),
    supabase.from("updates").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("*, invoice_items(*), payments(*)")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("orders").select("*").eq("project_id", id).order("created_at", { ascending: true }),
    supabase.from("boq_items").select("*").eq("project_id", id).order("created_at", { ascending: true }),
  ]);

  const client = (project as any).profiles;
  const invoiceList = (invoices.data || []) as any[];
  let owed = 0;
  let paid = 0;
  invoiceList.forEach((inv) => {
    if (inv.status === "Cancelled") return;
    const t = invoiceTotals(inv.invoice_items, inv.vat_rate, inv.payments);
    owed += t.balance;
    paid += t.paid;
  });
  const stageIndex = STAGES.indexOf(project.stage);
  const msg = sp.msg ? MESSAGES[sp.msg] : undefined;

  return (
    <main className="container page">
      {isAdmin && (
        <p className="small no-print"><Link href="/admin">← All projects</Link></p>
      )}
      <h1>{project.name}</h1>
      <p className="muted">
        {client?.full_name || "Client"} {project.address ? `· ${project.address}` : ""}
      </p>
      <div className="stages" title={`Stage ${stageIndex + 1} of ${STAGES.length}`}>
        {STAGES.map((s, i) => (
          <div key={s} className={i < stageIndex ? "done" : i === stageIndex ? "current" : ""} />
        ))}
      </div>
      <p className="small muted">
        Current stage: <strong>{project.stage}</strong> · Balance due: <strong>{naira(owed)}</strong>
      </p>

      <nav className="tabs">
        {TABS.map(([k, label]) => (
          <Link key={k} href={`/project/${id}?tab=${k}`} className={tab === k ? "active" : ""}>
            {label}
          </Link>
        ))}
      </nav>

      {msg && <div className={`notice ${msg[0]}`}>{msg[1]}</div>}

      {tab === "overview" && (
        <Overview
          project={project}
          client={client}
          isAdmin={isAdmin}
          owed={owed}
          paid={paid}
          latest={(updates.data || [])[0]}
          questionnaireDone={!!q.data?.submitted_at}
          orderCount={(orders.data || []).length}
        />
      )}
      {tab === "guide" && <WelcomeGuide />}
      {tab === "questionnaire" && <Questionnaire projectId={id} row={q.data} isAdmin={isAdmin} />}
      {tab === "updates" && <Updates projectId={id} updates={updates.data || []} isAdmin={isAdmin} />}
      {tab === "invoices" && <Invoices projectId={id} invoices={invoiceList} isAdmin={isAdmin} client={client} project={project} />}
      {tab === "orders" && <Orders projectId={id} orders={orders.data || []} isAdmin={isAdmin} />}
      {tab === "boq" && <Boq projectId={id} items={boq.data || []} isAdmin={isAdmin} />}
    </main>
  );
}
