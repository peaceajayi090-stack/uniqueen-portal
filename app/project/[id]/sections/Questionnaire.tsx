import { QUESTIONNAIRE } from "@/lib/questionnaire";
import { date } from "@/lib/format";
import { PrintButton } from "@/components/Buttons";
import { saveQuestionnaire } from "../actions";

export default function Questionnaire({ projectId, row, isAdmin }: { projectId: string; row: any; isAdmin: boolean }) {
  const answers: Record<string, string> = row?.answers || {};
  return (
    <form action={saveQuestionnaire}>
      <input type="hidden" name="project_id" value={projectId} />
      <div className="card soft row" style={{ justifyContent: "space-between" }}>
        <div>
          <strong>Client questionnaire</strong>
          <div className="small muted">
            {row?.submitted_at
              ? `Submitted ${date(row.submitted_at)}${row.updated_at ? ` · last edited ${date(row.updated_at)}` : ""}`
              : isAdmin
              ? "The client has not submitted this yet. You can fill it in for them."
              : "Answer as fully as you can. Save a draft at any time and come back later."}
          </div>
        </div>
        <PrintButton />
      </div>

      {QUESTIONNAIRE.map((section) => (
        <div className="card" key={section.title}>
          <h3>{section.title}</h3>
          <div className="grid two">
            {section.questions.map((q) => {
              const name = `q_${q.key}`;
              const value = answers[q.key] || "";
              return (
                <div className="field" key={q.key} style={q.type === "textarea" ? { gridColumn: "1 / -1" } : undefined}>
                  <label htmlFor={name}>{q.label}</label>
                  {q.type === "textarea" ? (
                    <textarea id={name} name={name} defaultValue={value} />
                  ) : q.type === "select" ? (
                    <select id={name} name={name} defaultValue={value}>
                      <option value="">Choose…</option>
                      {q.options!.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input id={name} name={name} defaultValue={value} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="row no-print">
        <button className="btn secondary" type="submit" name="intent" value="draft">Save draft</button>
        <button className="btn" type="submit" name="intent" value="submit">{row?.submitted_at ? "Save changes" : "Submit questionnaire"}</button>
      </div>
    </form>
  );
}
