import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { askClaude, clientSystem, projectContext, studioSystem, type ChatMessage } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ reply: "Please log in again." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  const body = await request.json().catch(() => ({}));
  const messages: ChatMessage[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m: any) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-12)
    .map((m: any) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ reply: "Please type a question." }, { status: 400 });
  }
  while (messages[0]?.role === "assistant") messages.shift();

  const projectId = typeof body.projectId === "string" && body.projectId ? body.projectId : null;
  // Project data is read with the visitor's own permissions, so a client only ever sees their own project
  const context = projectId ? await projectContext(supabase, projectId) : null;

  let system: string;
  if (body.scope === "studio") {
    if (profile?.role !== "admin") return NextResponse.json({ reply: "Not allowed." }, { status: 403 });
    system = studioSystem(String(body.mode || "general"), context);
  } else {
    if (!context) return NextResponse.json({ reply: "I couldn't find your project." }, { status: 404 });
    system = clientSystem(context);
  }

  const reply = await askClaude(system, messages);
  return NextResponse.json({ reply });
}
