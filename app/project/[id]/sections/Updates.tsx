import { date } from "@/lib/format";
import { ConfirmButton } from "@/components/Buttons";
import { postUpdate, deleteUpdate, approveUpdate } from "../actions";

export default function Updates({ projectId, updates, isAdmin }: { projectId: string; updates: any[]; isAdmin: boolean }) {
  const waiting = updates.filter((u) => u.needs_approval && !u.approved_at);
  return (
    <>
      {!isAdmin && waiting.length > 0 && (
        <div className="notice err">You have {waiting.length} item{waiting.length > 1 ? "s" : ""} waiting for your approval below.</div>
      )}
      {isAdmin && (
        <div className="card">
          <h3>Post an update for the client</h3>
          <form action={postUpdate}>
            <input type="hidden" name="project_id" value={projectId} />
            <div className="field"><label>Title</label><input name="title" required placeholder="e.g. Concept design ready for approval" /></div>
            <div className="field"><label>Details</label><textarea name="body" placeholder="What happened, what's next, what the client should check (files are in the Files tab)" /></div>
            <div className="field row">
              <input type="checkbox" name="needs_approval" id="needs_approval" style={{ width: "auto" }} />
              <label htmlFor="needs_approval" style={{ margin: 0 }}>Ask the client to approve this (design, quote or purchase)</label>
            </div>
            <button className="btn" type="submit">Post update</button>
          </form>
        </div>
      )}
      <div className="card">
        <h3>Project updates</h3>
        {!updates.length && <p className="muted">No updates yet.</p>}
        {updates.map((u) => (
          <div className="update" key={u.id}>
            <div className="when">{date(u.created_at)}</div>
            <strong>{u.title}</strong>{" "}
            {u.needs_approval &&
              (u.approved_at ? (
                <span className="pill green">Approved {date(u.approved_at)}</span>
              ) : (
                <span className="pill gold">Awaiting approval</span>
              ))}
            {u.body && <p style={{ whiteSpace: "pre-wrap" }}>{u.body}</p>}
            {u.approval_note && <p className="small muted">Client note: {u.approval_note}</p>}
            {!isAdmin && u.needs_approval && !u.approved_at && (
              <form action={approveUpdate} className="card soft" style={{ marginTop: 8 }}>
                <input type="hidden" name="project_id" value={projectId} />
                <input type="hidden" name="update_id" value={u.id} />
                <div className="field"><label>Comment (optional)</label><input name="note" placeholder="Any comments for the studio" /></div>
                <button className="btn small" type="submit">I approve this</button>
                <p className="small muted" style={{ margin: "8px 0 0" }}>Your approval is recorded with today&apos;s date. Have a question first? Message the studio instead.</p>
              </form>
            )}
            {isAdmin && (
              <form action={deleteUpdate}>
                <input type="hidden" name="project_id" value={projectId} />
                <input type="hidden" name="update_id" value={u.id} />
                <ConfirmButton message="Delete this update?">Delete</ConfirmButton>
              </form>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
