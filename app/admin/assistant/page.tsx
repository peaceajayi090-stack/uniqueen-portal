import { requireAdmin } from "@/lib/supabase";
import { STUDIO_MODES } from "@/lib/ai";
import Chat from "@/components/Chat";
import AdminNav from "../AdminNav";

export const metadata = { title: "AI assistant — Uniqueen Interiors" };

export default async function AssistantPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, profiles(full_name)")
    .order("created_at", { ascending: false });

  return (
    <main className="container page">
      <AdminNav active="assistant" />
      <h1>Studio AI assistant</h1>
      <p className="muted">
        Budgets and BOQs, design concepts, social media posts and client replies. Pick a project to let it use that client&apos;s brief, costs and orders.
        Always check figures before sending them to a client.
      </p>
      <Chat
        scope="studio"
        projectId={sp.project}
        projects={(projects || []).map((p: any) => ({ id: p.id, label: `${p.profiles?.full_name || "Client"} — ${p.name}` }))}
        modes={Object.entries(STUDIO_MODES).map(([key, m]) => ({ key, label: m.label, starters: m.starters }))}
        intro="Choose what you need help with, pick a project if it's about a client, then ask."
      />
    </main>
  );
}
