import { BOQ_SECTIONS } from "@/lib/brand";
import { naira } from "@/lib/format";
import { ConfirmButton, PrintButton } from "@/components/Buttons";
import { addBoqItem, deleteBoqItem } from "../actions";

export default function Boq({ projectId, items, isAdmin }: { projectId: string; items: any[]; isAdmin: boolean }) {
  const amount = (i: any) => Number(i.qty) * Number(i.rate);
  const grand = items.reduce((s, i) => s + amount(i), 0);
  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3>Bill of Quantities</h3>
          <PrintButton />
        </div>
        {!items.length && <p className="muted">The costing for this project will appear here.</p>}

        {BOQ_SECTIONS.map((section) => {
          const rows = items.filter((i) => i.section === section);
          if (!rows.length) return null;
          const sub = rows.reduce((s, i) => s + amount(i), 0);
          return (
            <div key={section} style={{ marginTop: 18 }}>
              <h3 style={{ fontSize: "1rem" }}>{section}</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Description</th><th>Unit</th><th className="num">Qty</th><th className="num">Rate</th><th className="num">Amount</th>{isAdmin && <th></th>}</tr></thead>
                  <tbody>
                    {rows.map((i) => (
                      <tr key={i.id}>
                        <td>{i.description}{i.spec && <div className="small muted">{i.spec}</div>}</td>
                        <td>{i.unit}</td>
                        <td className="num">{Number(i.qty)}</td>
                        <td className="num">{naira(i.rate)}</td>
                        <td className="num">{naira(amount(i))}</td>
                        {isAdmin && (
                          <td>
                            <form action={deleteBoqItem}>
                              <input type="hidden" name="project_id" value={projectId} />
                              <input type="hidden" name="item_id" value={i.id} />
                              <ConfirmButton message="Delete this line?">×</ConfirmButton>
                            </form>
                          </td>
                        )}
                      </tr>
                    ))}
                    <tr className="total"><td colSpan={4}>Subtotal: {section}</td><td className="num">{naira(sub)}</td>{isAdmin && <td></td>}</tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {items.length > 0 && (
          <div className="stat" style={{ marginTop: 20 }}>
            <div className="label">Project total</div>
            <div className="value">{naira(grand)}</div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="card">
          <h3>Add a BOQ line</h3>
          <form action={addBoqItem}>
            <input type="hidden" name="project_id" value={projectId} />
            <div className="grid three">
              <div className="field">
                <label>Section</label>
                <select name="section">{BOQ_SECTIONS.map((s) => <option key={s}>{s}</option>)}</select>
              </div>
              <div className="field"><label>Description *</label><input name="description" required /></div>
              <div className="field"><label>Specification</label><input name="spec" /></div>
              <div className="field"><label>Unit</label><input name="unit" placeholder="m², no., lot" /></div>
              <div className="field"><label>Qty</label><input name="qty" defaultValue="1" /></div>
              <div className="field"><label>Rate (₦)</label><input name="rate" required /></div>
            </div>
            <button className="btn" type="submit">Add line</button>
          </form>
        </div>
      )}
    </>
  );
}
