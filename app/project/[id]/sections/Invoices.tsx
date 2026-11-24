import { STUDIO } from "@/lib/brand";
import { naira, date, invoiceTotals } from "@/lib/format";
import { ConfirmButton, PrintButton } from "@/components/Buttons";
import { createInvoice, setInvoiceStatus, recordManualPayment, deleteInvoice } from "../actions";

export default function Invoices({
  projectId,
  invoices,
  isAdmin,
  client,
  project,
}: {
  projectId: string;
  invoices: any[];
  isAdmin: boolean;
  client: any;
  project: any;
}) {
  return (
    <>
      {!invoices.length && <div className="card"><p className="muted">No invoices yet.</p></div>}

      {invoices.map((inv) => {
        const items = [...(inv.invoice_items || [])].sort((a, b) => a.position - b.position);
        const t = invoiceTotals(items, inv.vat_rate, inv.payments || []);
        const pays = (inv.payments || []).filter((p: any) => p.status === "successful");
        const statusClass = inv.status === "Paid" ? "green" : inv.status === "Cancelled" ? "" : "red";
        const canPay = !isAdmin && inv.status === "Unpaid" && t.balance > 0;
        return (
          <div className="card" key={inv.id}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <h3 style={{ marginBottom: 2 }}>Invoice {inv.number}</h3>
                <div className="small muted">
                  Issued {date(inv.issue_date)} · Due {date(inv.due_date)}
                </div>
              </div>
              <div className="row">
                <span className={`pill ${statusClass}`}>{inv.status}</span>
                <PrintButton label="Print" />
              </div>
            </div>

            <div className="grid two small" style={{ margin: "14px 0" }}>
              <div><strong>From</strong><br />{STUDIO.name}<br />{STUDIO.phone}<br />{STUDIO.email}</div>
              <div><strong>Bill to</strong><br />{client?.full_name}<br />{project.name}<br />{project.address}</div>
            </div>

            <div className="table-wrap">
              <table>
                <thead><tr><th>Description</th><th className="num">Qty</th><th className="num">Rate</th><th className="num">Amount</th></tr></thead>
                <tbody>
                  {items.map((it: any) => (
                    <tr key={it.id}>
                      <td>{it.description}</td>
                      <td className="num">{Number(it.qty)}</td>
                      <td className="num">{naira(it.rate)}</td>
                      <td className="num">{naira(Number(it.qty) * Number(it.rate))}</td>
                    </tr>
                  ))}
                  <tr><td colSpan={3} className="num">Subtotal</td><td className="num">{naira(t.subtotal)}</td></tr>
                  {Number(inv.vat_rate) > 0 && <tr><td colSpan={3} className="num">VAT {Number(inv.vat_rate)}%</td><td className="num">{naira(t.vat)}</td></tr>}
                  <tr><td colSpan={3} className="num">Paid</td><td className="num">− {naira(t.paid)}</td></tr>
                  <tr className="total"><td colSpan={3} className="num">Balance due</td><td className="num">{naira(t.balance)}</td></tr>
                </tbody>
              </table>
            </div>

            {inv.notes && <p className="small" style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{inv.notes}</p>}

            {pays.length > 0 && (
              <p className="small muted" style={{ marginTop: 10 }}>
                Payments received:{" "}
                {pays.map((p: any) => `${naira(p.amount)} on ${date(p.paid_at)} (${p.method})`).join("; ")}
              </p>
            )}

            {canPay && (
              <div className="card soft no-print" style={{ marginTop: 14, marginBottom: 0 }}>
                <form action="/api/pay" method="post">
                  <input type="hidden" name="invoice_id" value={inv.id} />
                  <button className="btn full" type="submit">Pay {naira(t.balance)} securely with Flutterwave</button>
                </form>
                <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
                  Card, bank transfer or USSD. Or pay by bank transfer to {STUDIO.bank.accountName}
                  {STUDIO.bank.name && `, ${STUDIO.bank.name}`}
                  {STUDIO.bank.accountNumber && `, ${STUDIO.bank.accountNumber}`} using reference {inv.number}, then send us your receipt.
                </p>
              </div>
            )}

            {isAdmin && (
              <div className="row no-print" style={{ marginTop: 14 }}>
                <form action={setInvoiceStatus} className="row">
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="invoice_id" value={inv.id} />
                  <select name="status" defaultValue={inv.status} style={{ width: "auto" }}>
                    {["Unpaid", "Paid", "Cancelled"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button className="btn small secondary" type="submit">Set status</button>
                </form>
                <form action={recordManualPayment} className="row">
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="invoice_id" value={inv.id} />
                  <input name="amount" placeholder="Transfer amount ₦" style={{ width: 160 }} required />
                  <button className="btn small secondary" type="submit">Record bank transfer</button>
                </form>
                <form action={deleteInvoice}>
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="invoice_id" value={inv.id} />
                  <ConfirmButton message={`Delete invoice ${inv.number}? This cannot be undone.`}>Delete</ConfirmButton>
                </form>
              </div>
            )}
          </div>
        );
      })}

      {isAdmin && (
        <div className="card">
          <h3>Create an invoice</h3>
          <form action={createInvoice}>
            <input type="hidden" name="project_id" value={projectId} />
            <div className="grid three">
              <div className="field"><label>Invoice number</label><input name="number" placeholder="Auto (UQI-YYYY-001)" /></div>
              <div className="field"><label>Due date</label><input type="date" name="due_date" /></div>
              <div className="field"><label>VAT % (0 if not VAT-registered)</label><input name="vat_rate" defaultValue="0" /></div>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Description</th><th style={{ width: 80 }}>Qty</th><th style={{ width: 150 }}>Rate (₦)</th></tr></thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td><input name={`item_${i}_desc`} placeholder={i === 0 ? "e.g. Design fee — booking (50%)" : ""} /></td>
                      <td><input name={`item_${i}_qty`} defaultValue="1" /></td>
                      <td><input name={`item_${i}_rate`} placeholder="0" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label>Notes / terms</label>
              <textarea name="notes" defaultValue="Payment due within 7 days. Work on this stage begins once payment is confirmed." />
            </div>
            <button className="btn" type="submit">Create invoice</button>
          </form>
        </div>
      )}
    </>
  );
}
