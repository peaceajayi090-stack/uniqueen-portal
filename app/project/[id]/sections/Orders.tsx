import { ORDER_STATUSES } from "@/lib/brand";
import { naira, date } from "@/lib/format";
import { ConfirmButton } from "@/components/Buttons";
import { addOrder, updateOrder, deleteOrder } from "../actions";

const pillFor = (s: string) =>
  s === "Installed" || s === "Delivered" ? "green" : s === "Delayed" ? "red" : s === "Awaiting approval" ? "gold" : "";

export default function Orders({ projectId, orders, isAdmin }: { projectId: string; orders: any[]; isAdmin: boolean }) {
  const total = orders.reduce((s, o) => s + Number(o.total), 0);
  const paid = orders.reduce((s, o) => s + Number(o.paid), 0);
  return (
    <>
      <div className="grid three" style={{ marginBottom: 18 }}>
        <div className="stat"><div className="label">Total order value</div><div className="value">{naira(total)}</div></div>
        <div className="stat"><div className="label">Paid so far</div><div className="value">{naira(paid)}</div></div>
        <div className="stat"><div className="label">Balance</div><div className="value">{naira(total - paid)}</div></div>
      </div>

      <div className="card">
        <h3>Furniture, finishes and décor orders</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Room</th><th className="num">Qty</th><th className="num">Total</th><th className="num">Paid</th><th>Status</th><th>Expected</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.item}{o.notes && <div className="small muted">{o.notes}</div>}</td>
                  <td>{o.room}</td>
                  <td className="num">{Number(o.qty)}</td>
                  <td className="num">{naira(o.total)}</td>
                  <td className="num">
                    {isAdmin ? (
                      <form action={updateOrder} className="row" style={{ justifyContent: "flex-end" }}>
                        <input type="hidden" name="project_id" value={projectId} />
                        <input type="hidden" name="order_id" value={o.id} />
                        <input name="paid" defaultValue={Number(o.paid)} style={{ width: 110 }} />
                        <select name="status" defaultValue={o.status} style={{ width: 150 }}>
                          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <input type="date" name="expected_date" defaultValue={o.expected_date || ""} style={{ width: 150 }} />
                        <button className="btn small secondary" type="submit">Save</button>
                      </form>
                    ) : (
                      naira(o.paid)
                    )}
                  </td>
                  <td><span className={`pill ${pillFor(o.status)}`}>{o.status}</span></td>
                  <td>
                    {date(o.expected_date)}
                    {isAdmin && (
                      <form action={deleteOrder} style={{ marginTop: 6 }}>
                        <input type="hidden" name="project_id" value={projectId} />
                        <input type="hidden" name="order_id" value={o.id} />
                        <ConfirmButton message={`Delete order "${o.item}"?`}>Delete</ConfirmButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {!orders.length && <tr><td colSpan={7} className="muted">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin && (
        <div className="card">
          <h3>Add an order</h3>
          <form action={addOrder}>
            <input type="hidden" name="project_id" value={projectId} />
            <div className="grid three">
              <div className="field"><label>Item *</label><input name="item" required placeholder="e.g. 3-seater sofa" /></div>
              <div className="field"><label>Room</label><input name="room" placeholder="Living room" /></div>
              <div className="field"><label>Qty</label><input name="qty" defaultValue="1" /></div>
              <div className="field"><label>Total (₦)</label><input name="total" required /></div>
              <div className="field"><label>Paid (₦)</label><input name="paid" defaultValue="0" /></div>
              <div className="field">
                <label>Status</label>
                <select name="status">{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
              </div>
              <div className="field"><label>Expected delivery</label><input type="date" name="expected_date" /></div>
            </div>
            <div className="field"><label>Notes</label><input name="notes" placeholder="Finish, size, supplier notes" /></div>
            <button className="btn" type="submit">Add order</button>
          </form>
        </div>
      )}
    </>
  );
}
