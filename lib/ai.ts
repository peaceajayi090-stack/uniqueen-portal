import { STUDIO, PACKAGES, ADD_ONS, PROCESS, PAYMENT_SCHEDULE, DELIVERABLES, BOQ_SECTIONS } from "./brand";
import { invoiceTotals, naira } from "./format";

export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * The assistant works with any of these keys (add ONE in Vercel → Settings → Environment Variables):
 *  - GEMINI_API_KEY    free, from aistudio.google.com/apikey (no card needed)
 *  - GROQ_API_KEY      free, from console.groq.com/keys (no card needed)
 *  - ANTHROPIC_API_KEY paid, from console.anthropic.com
 */
async function openAiCompatible(url: string, key: string, models: string[], system: string, messages: ChatMessage[]) {
  let lastError = "";
  for (const model of models) {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: "system", content: system }, ...messages] }),
    });
    const json = await res.json().catch(() => null);
    const data = Array.isArray(json) ? json[0] : json;
    if (res.ok) return (data?.choices?.[0]?.message?.content || "").trim();
    lastError = data?.error?.message || String(res.status);
    if (res.status === 429) return "The free AI limit has been reached for now. Please try again in a minute (or tomorrow if the daily limit is used up).";
    if (res.status !== 404 && res.status !== 400) break; // only try the next model name if this one isn't available
  }
  return `The assistant couldn't answer right now (${lastError}). Please try again.`;
}

export async function askClaude(system: string, messages: ChatMessage[]) {
  if (process.env.GEMINI_API_KEY) {
    const models = [process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-3.5-flash", "gemini-2.5-flash"].filter(Boolean) as string[];
    return openAiCompatible("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", process.env.GEMINI_API_KEY, models, system, messages);
  }
  if (process.env.GROQ_API_KEY) {
    const models = [process.env.GROQ_MODEL, "openai/gpt-oss-120b", "llama-3.3-70b-versatile"].filter(Boolean) as string[];
    return openAiCompatible("https://api.groq.com/openai/v1/chat/completions", process.env.GROQ_API_KEY, models, system, messages);
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return "The AI assistant isn't switched on yet. Add a free GEMINI_API_KEY (from aistudio.google.com/apikey) in Vercel → Settings → Environment Variables, then redeploy.";
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 2000, system, messages }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) return `The assistant couldn't answer right now (${json?.error?.message || res.status}). Please try again.`;
  return (json?.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n").trim();
}

export const STUDIO_KNOWLEDGE = `
STUDIO: ${STUDIO.name}, an interior design studio in Nigeria. Prices in Naira (₦).
Contact: ${[STUDIO.phone, STUDIO.email].filter(Boolean).join(" · ") || "via the portal"}.
PACKAGES:
${PACKAGES.map((p) => `- ${p.name} (${p.price}) — best for ${p.bestFor}. Includes: ${p.includes.join("; ")}`).join("\n")}
ADD-ONS: ${ADD_ONS.map(([a, b]) => `${a} ${b}`).join("; ")}
PROCESS: ${PROCESS.map(([t, d], i) => `${i + 1}. ${t}: ${d}`).join(" ")}
PAYMENT SCHEDULE: ${PAYMENT_SCHEDULE.map(([a, b, c]) => `${a}: ${b} (${c})`).join("; ")}
DELIVERABLES (full design): ${DELIVERABLES.join(", ")}
BOQ SECTIONS: ${BOQ_SECTIONS.join(", ")}
TERMS: quotes valid 14 days; changes after approval are variations; supplier deposits are non-refundable; one round of concept revisions included.
OFFICE HOURS: Mon–Fri 9am–5pm, Sat 10am–2pm.`;

/** A plain-text summary of one project, read with the caller's own permissions. */
export async function projectContext(supabase: any, projectId: string) {
  const [{ data: p }, { data: q }, { data: updates }, { data: invoices }, { data: orders }, { data: boq }, { data: files }] = await Promise.all([
    supabase.from("projects").select("*, profiles(full_name)").eq("id", projectId).single(),
    supabase.from("questionnaires").select("answers, submitted_at").eq("project_id", projectId).maybeSingle(),
    supabase.from("updates").select("title, body, created_at, needs_approval, approved_at").eq("project_id", projectId).order("created_at", { ascending: false }).limit(10),
    supabase.from("invoices").select("number, status, due_date, vat_rate, invoice_items(description, qty, rate), payments(amount, status)").eq("project_id", projectId),
    supabase.from("orders").select("item, room, qty, total, paid, status, expected_date").eq("project_id", projectId),
    supabase.from("boq_items").select("section, description, unit, qty, rate").eq("project_id", projectId),
    supabase.from("project_files").select("name, category").eq("project_id", projectId),
  ]);
  if (!p) return null;
  const lines: string[] = [];
  lines.push(`PROJECT: ${p.name}${p.address ? `, ${p.address}` : ""}. Client: ${p.profiles?.full_name || "—"}. Stage: ${p.stage}. Status: ${p.status}. Start: ${p.start_date || "—"}. Target finish: ${p.target_date || "not set"}.`);
  const a = q?.answers || {};
  const filled = Object.entries(a).filter(([, v]) => v);
  lines.push(`QUESTIONNAIRE (${q?.submitted_at ? "submitted" : "not submitted"}): ${filled.map(([k, v]) => `${k}: ${v}`).join("; ") || "no answers yet"}`);
  lines.push(`RECENT UPDATES: ${(updates || []).map((u: any) => `[${u.created_at?.slice(0, 10)}] ${u.title}${u.needs_approval ? (u.approved_at ? " (approved)" : " (awaiting client approval)") : ""}${u.body ? ` — ${u.body}` : ""}`).join(" | ") || "none"}`);
  lines.push(`INVOICES: ${(invoices || []).map((i: any) => { const t = invoiceTotals(i.invoice_items || [], i.vat_rate, i.payments || []); return `${i.number}: ${i.status}, total ${naira(t.total)}, paid ${naira(t.paid)}, balance ${naira(t.balance)}, due ${i.due_date || "—"}`; }).join(" | ") || "none"}`);
  lines.push(`ORDERS: ${(orders || []).map((o: any) => `${o.item} (${o.room || "—"}) ×${o.qty}: ${naira(o.total)}, paid ${naira(o.paid)}, ${o.status}, expected ${o.expected_date || "—"}`).join(" | ") || "none"}`);
  const boqTotal = (boq || []).reduce((s: number, b: any) => s + Number(b.qty) * Number(b.rate), 0);
  lines.push(`BOQ (${(boq || []).length} lines, total ${naira(boqTotal)}): ${(boq || []).map((b: any) => `${b.section} — ${b.description}: ${b.qty} ${b.unit || ""} × ${naira(b.rate)}`).join(" | ") || "none"}`);
  lines.push(`FILES: ${(files || []).map((f: any) => `${f.name} (${f.category})`).join(", ") || "none"}`);
  return lines.join("\n");
}

export const STUDIO_MODES: Record<string, { label: string; prompt: string; starters: string[] }> = {
  general: {
    label: "General help",
    prompt: "Help with anything in running the studio: planning, pricing, client communication, contracts, operations.",
    starters: ["What should I focus on this week?", "Write a short contract scope for a Signature Design project"],
  },
  budget: {
    label: "Budget & BOQ",
    prompt:
      "Act as a quantity surveyor for Nigerian interiors. Build budgets and BOQs in Naira, grouped by the studio's BOQ sections, as a table: Section | Description | Unit | Qty | Rate (₦) | Amount (₦), then subtotals, 10% contingency and grand total. Use realistic current Nigerian market rates and say clearly they are estimates to confirm with suppliers. Show your arithmetic correctly.",
    starters: ["Draft a BOQ for a 4m × 5m living room, mid-range finish", "Fit a 3-bedroom flat into a ₦8m budget"],
  },
  design: {
    label: "Design concepts",
    prompt:
      "Act as a senior interior designer. Give design concepts: style direction, colour palette (with hex codes), materials, furniture layout ideas with dimensions, lighting plan, and a moodboard brief. Design for Nigerian conditions (heat, power cuts, dust, local materials and artisans).",
    starters: ["Concept for a warm modern living room with a TV wall", "3 palette options for a master bedroom"],
  },
  social: {
    label: "Social media",
    prompt:
      "Act as the studio's social media manager for Instagram, TikTok and WhatsApp status. Write ready-to-post captions with hooks, hashtags and calls to action that point to the Packages page; plan content calendars; script short videos. Tone: warm, confident, Nigerian audience. Never invent client names or results.",
    starters: ["Plan next week's 4 posts", "Write a reel script for a before-and-after reveal"],
  },
  reply: {
    label: "Client replies",
    prompt:
      "Draft messages to clients and leads (WhatsApp or email): polite, clear, professional, short. Handle price objections, delays, payment reminders and follow-ups using the studio's packages and terms.",
    starters: ["A lead says ₦450k is too expensive — reply", "Polite reminder for an overdue invoice"],
  },
};

export function studioSystem(mode: string, context: string | null) {
  const m = STUDIO_MODES[mode] || STUDIO_MODES.general;
  return `You are the AI assistant for ${STUDIO.name}, working for the studio owner (admin). ${m.prompt}
Be practical and specific. Use short sections, tables where useful, and Naira. If you need a key fact (sizes, budget), make a sensible assumption and state it.
${STUDIO_KNOWLEDGE}
${context ? `\nSELECTED PROJECT DATA:\n${context}` : "\nNo specific project selected."}`;
}

export function clientSystem(context: string) {
  return `You are "Uniqueen Assistant", the friendly customer-support helper inside a client's project portal at ${STUDIO.name}.
Answer the client's questions about THEIR project, invoices, orders, the process, packages and how to use the portal (tabs: Overview, Welcome guide, Questionnaire, Updates, Files, Invoices & payments, Orders, Costing).
Rules:
- Use only the facts below. Never invent prices, dates, delivery times or promises. If something isn't in the data, say you don't have that detail and suggest contacting the studio${STUDIO.phone ? ` on ${STUDIO.phone}` : ""}${STUDIO.email ? ` or ${STUDIO.email}` : ""}.
- You cannot change anything, approve anything, or take payments; explain where in the portal the client can do it.
- Keep answers short (under 120 words), warm and clear. Use the client's first name if known.
- For complaints or anything sensitive, apologise briefly and direct them to the studio.
${STUDIO_KNOWLEDGE}

THIS CLIENT'S PROJECT:
${context}`;
}
