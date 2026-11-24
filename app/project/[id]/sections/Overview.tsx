import Link from "next/link";
import { STAGES, PROJECT_STATUSES } from "@/lib/brand";
import { naira, date } from "@/lib/format";
import { updateProject, updateClient } from "../actions";

export default function Overview({
  project,
  client,
  isAdmin,
  owed,
  paid,
  latest,
  questionnaireDone,
  orderCount,
}: {
  project: any;
  client: any;
  isAdmin: boolean;
  owed: number;
  paid: number;
  latest: any;
  questionnaireDone: boolean;
  orderCount: number;
}) {
  const base = `/project/${project.id}`;
  return (
    <>
      <div className="grid three" style={{ marginBottom: 18 }}>
        <div className="stat"><div className="label">Stage</div><div className="value">{project.stage}</div></div>
        <div className="stat"><div className="label">Paid so far</div><div className="value">{naira(paid)}</div></div>
        <div className="stat"><div className="label">Balance due</div><div className="value">{naira(owed)}</div></div>
        <div className="stat"><div className="label">Target finish</div><div className="value">{date(project.target_date)}</div></div>
        <div className="stat"><div className="label">Orders</div><div className="value">{orderCount}</div></div>
        <div className="stat"><div className="label">Status</div><div className="value">{project.status}</div></div>
      </div>

      {!isAdmin && (
        <div className="card soft">
          <h3>Your to-do list</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>{questionnaireDone ? "✓ Questionnaire submitted" : <Link href={`${base}?tab=questionnaire`}>Fill in your questionnaire</Link>}</li>
            <li><Link href={`${base}?tab=guide`}>Read the welcome guide</Link></li>
            {owed > 0 && <li><Link href={`${base}?tab=invoices`}>Pay your outstanding invoice ({naira(owed)})</Link></li>}
          </ul>
        </div>
      )}

      {latest && (
        <div className="card">
          <h3>Latest update</h3>
          <div className="update">
            <div className="when">{date(latest.created_at)}</div>
            <strong>{latest.title}</strong>
            {latest.body && <p style={{ whiteSpace: "pre-wrap" }}>{latest.body}</p>}
          </div>
          <Link href={`${base}?tab=updates`} className="small">See all updates →</Link>
        </div>
      )}

      {isAdmin && (
        <>
          <div className="card">
            <h3>Project details</h3>
            <form action={updateProject}>
              <input type="hidden" name="project_id" value={project.id} />
              <div className="grid two">
                <div className="field"><label>Project name</label><input name="name" defaultValue={project.name} required /></div>
                <div className="field"><label>Address</label><input name="address" defaultValue={project.address || ""} /></div>
                <div className="field">
                  <label>Stage (the client sees this)</label>
                  <select name="stage" defaultValue={project.stage}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select name="status" defaultValue={project.status}>{PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                </div>
                <div className="field"><label>Start date</label><input type="date" name="start_date" defaultValue={project.start_date || ""} /></div>
                <div className="field"><label>Target finish</label><input type="date" name="target_date" defaultValue={project.target_date || ""} /></div>
              </div>
              <button className="btn" type="submit">Save project</button>
            </form>
          </div>

          {client && (
            <div className="card">
              <h3>Client</h3>
              <form action={updateClient}>
                <input type="hidden" name="project_id" value={project.id} />
                <input type="hidden" name="client_id" value={client.id} />
                <div className="grid two">
                  <div className="field"><label>Full name</label><input name="full_name" defaultValue={client.full_name || ""} /></div>
                  <div className="field"><label>Phone / WhatsApp</label><input name="phone" defaultValue={client.phone || ""} /></div>
                </div>
                <p className="small muted">Login email: {client.email}</p>
                <button className="btn secondary" type="submit">Save client</button>
              </form>
            </div>
          )}
        </>
      )}
    </>
  );
}
