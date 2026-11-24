export const naira = (n: number | string | null | undefined) =>
  "₦" + Number(n || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 });

export const date = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export type InvoiceItem = { qty: number | string; rate: number | string };

export function invoiceTotals(items: InvoiceItem[], vatRate: number | string, payments: { amount: number | string; status: string }[]) {
  const subtotal = items.reduce((s, i) => s + Number(i.qty) * Number(i.rate), 0);
  const vat = Math.round(subtotal * Number(vatRate || 0)) / 100;
  const total = subtotal + vat;
  const paid = payments.filter((p) => p.status === "successful").reduce((s, p) => s + Number(p.amount), 0);
  return { subtotal, vat, total, paid, balance: Math.max(0, Math.round((total - paid) * 100) / 100) };
}
