"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "@/lib/supabase";
import { QUESTION_KEYS } from "@/lib/questionnaire";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const n = (f: FormData, k: string) => Number(String(f.get(k) ?? "0").replace(/[,₦\s]/g, "")) || 0;
const orNull = (v: string) => (v === "" ? null : v);

function back(projectId: string, tab: string, msg?: string) {
  revalidatePath(`/project/${projectId}`);
  redirect(`/project/${projectId}?tab=${tab}${msg ? `&msg=${msg}` : ""}`);
}

// ── Overview ──
export async function updateProject(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "project_id");
  await supabase
    .from("projects")
    .update({
      name: s(formData, "name"),
      address: orNull(s(formData, "address")),
      stage: s(formData, "stage"),
      status: s(formData, "status"),
      start_date: orNull(s(formData, "start_date")),
      target_date: orNull(s(formData, "target_date")),
    })
    .eq("id", id);
  back(id, "overview", "saved");
}

export async function updateClient(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "project_id");
  await supabase
    .from("profiles")
    .update({ full_name: s(formData, "full_name"), phone: orNull(s(formData, "phone")) })
    .eq("id", s(formData, "client_id"));
  back(id, "overview", "saved");
}

// ── Questionnaire (client or studio) ──
export async function saveQuestionnaire(formData: FormData) {
  const { supabase } = await requireUser();
  const id = s(formData, "project_id");
  const answers: Record<string, string> = {};
  QUESTION_KEYS.forEach((k) => (answers[k] = s(formData, `q_${k}`)));
  const submit = formData.get("intent") === "submit";
  const row: Record<string, unknown> = { project_id: id, answers, updated_at: new Date().toISOString() };
  if (submit) row.submitted_at = new Date().toISOString();
  const { error } = await supabase.from("questionnaires").upsert(row);
  if (error) back(id, "questionnaire", "error");
  back(id, "questionnaire", submit ? "submitted" : "saved");
}

// ── Updates ──
export async function postUpdate(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "project_id");
  await supabase.from("updates").insert({ project_id: id, title: s(formData, "title"), body: orNull(s(formData, "body")) });
  back(id, "updates", "saved");
}

export async function deleteUpdate(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "project_id");
  await supabase.from("updates").delete().eq("id", s(formData, "update_id"));
  back(id, "updates");
}

// ── Invoices ──
export async function createInvoice(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "project_id");
  const year = new Date().getFullYear();
  const { count } = await supabase.from("invoices").select("id", { count: "exact", head: true }).like("number", `UQI-${year}-%`);
  const number = s(formData, "number") || `UQI-${year}-${String((count || 0) + 1).padStart(3, "0")}`;

  const { data: inv, error } = await supabase
    .from("invoices")
    .insert({
      project_id: id,
      number,
      due_date: orNull(s(formData, "due_date")),
      vat_rate: n(formData, "vat_rate"),
      notes: orNull(s(formData, "notes")),
    })
    .select("id")
    .single();
  if (error || !inv) back(id, "invoices", "error");

  const items = [];
  for (let i = 0; i < 8; i++) {
    const description = s(formData, `item_${i}_desc`);
    if (!description) continue;
    items.push({ invoice_id: inv!.id, description, qty: n(formData, `item_${i}_qty`) || 1, rate: n(formData, `item_${i}_rate`), position: i });
  }
  if (items.length) await supabase.from("invoice_items").insert(items);
  await supabase.from("updates").insert({
    project_id: id,
    title: `New invoice ${number}`,
    body: "A new invoice is ready in the Invoices section. You can pay it online there.",
  });
  back(id, "invoices", "saved");
}

export async function setInvoiceStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "project_id");
  await supabase.from("invoices").update({ status: s(formData, "status") }).eq("id", s(formData, "invoice_id"));
  back(id, "invoices", "saved");
}

export async function recordManualPayment(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "project_id");
  const invoiceId = s(formData, "invoice_id");
  await supabase.from("payments").insert({
    invoice_id: invoiceId,
    tx_ref: `MANUAL-${Date.now()}`,
    amount: n(formData, "amount"),
    method: "Bank transfer",
    status: "successful",
    paid_at: new Date().toISOString(),
  });
  back(id, "invoices", "saved");
}

export async function deleteInvoice(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "project_id");
  await supabase.from("invoices").delete().eq("id", s(formData, "invoice_id"));
  back(id, "invoices");
}

// ── Orders ──
export async function addOrder(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "project_id");
  await supabase.from("orders").insert({
    project_id: id,
    item: s(formData, "item"),
    room: orNull(s(formData, "room")),
    qty: n(formData, "qty") || 1,
    total: n(formData, "total"),
    paid: n(formData, "paid"),
    status: s(formData, "status") || "Awaiting approval",
    expected_date: orNull(s(formData, "expected_date")),
    notes: orNull(s(formData, "notes")),
  });
  back(id, "orders", "saved");
}

export async function updateOrder(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "project_id");
  await supabase
    .from("orders")
    .update({ status: s(formData, "status"), paid: n(formData, "paid"), expected_date: orNull(s(formData, "expected_date")) })
    .eq("id", s(formData, "order_id"));
  back(id, "orders", "saved");
}

export async function deleteOrder(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "project_id");
  await supabase.from("orders").delete().eq("id", s(formData, "order_id"));
  back(id, "orders");
}

// ── BOQ ──
export async function addBoqItem(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "project_id");
  await supabase.from("boq_items").insert({
    project_id: id,
    section: s(formData, "section"),
    description: s(formData, "description"),
    spec: orNull(s(formData, "spec")),
    unit: orNull(s(formData, "unit")),
    qty: n(formData, "qty") || 1,
    rate: n(formData, "rate"),
  });
  back(id, "boq", "saved");
}

export async function deleteBoqItem(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData, "project_id");
  await supabase.from("boq_items").delete().eq("id", s(formData, "item_id"));
  back(id, "boq");
}
