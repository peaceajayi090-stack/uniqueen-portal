import { date } from "@/lib/format";
import { ConfirmButton } from "@/components/Buttons";
import { postUpdate, deleteUpdate } from "../actions";

export default function Updates({ projectId, updates, isAdmin }: { projectId: string; updates: any[]; isAdmin: boolean }) {
  return (
    <>
      {isAdmin && (
        <div className="card">
          <h3>Post an update for the client</h3>
          <form action={postUpdate}>
            <input type="hidden" name="project_id" value={projectId} />
            <div className="field"><label>Title</label><input name="title" required placeholder="e.g. Ceiling works completed" /></div>
            <div className="field"><label>Details</label><textarea name="body" placeholder="What happened, what's next, anything the client needs to approve" /></div>
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
            <strong>{u.title}</strong>
            {u.body && <p style={{ whiteSpace: "pre-wrap" }}>{u.body}</p>}
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
