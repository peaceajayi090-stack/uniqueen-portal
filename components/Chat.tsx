"use client";

import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat({
  scope,
  projectId,
  projects,
  modes,
  intro,
  starters,
}: {
  scope: "studio" | "client";
  projectId?: string;
  projects?: { id: string; label: string }[];
  modes?: { key: string; label: string; starters: string[] }[];
  intro: string;
  starters?: string[];
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState(modes?.[0]?.key || "general");
  const [project, setProject] = useState(projectId || "");
  const endRef = useRef<HTMLDivElement>(null);

  const currentStarters = modes ? modes.find((m) => m.key === mode)?.starters || [] : starters || [];

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scope, mode, projectId: project || null, messages: next }),
      });
      const json = await res.json();
      setMessages([...next, { role: "assistant", content: json.reply || "Sorry, something went wrong." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Sorry, I couldn't connect. Please try again." }]);
    } finally {
      setBusy(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="card">
      {(modes || projects) && (
        <div className="grid two" style={{ marginBottom: 12 }}>
          {modes && (
            <div className="field" style={{ margin: 0 }}>
              <label>What do you need help with?</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                {modes.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </div>
          )}
          {projects && (
            <div className="field" style={{ margin: 0 }}>
              <label>Use data from a project (optional)</label>
              <select value={project} onChange={(e) => setProject(e.target.value)}>
                <option value="">No project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      <div style={{ maxHeight: 480, overflowY: "auto", padding: "4px 2px" }}>
        {!messages.length && <p className="muted">{intro}</p>}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", margin: "8px 0" }}>
            <div
              style={{
                maxWidth: "88%",
                whiteSpace: "pre-wrap",
                padding: "10px 14px",
                borderRadius: 14,
                background: m.role === "user" ? "var(--brown)" : "var(--sand)",
                color: m.role === "user" ? "#fff" : "var(--ink)",
                fontSize: 14,
              }}
            >
              {m.content}
              {m.role === "assistant" && (
                <div style={{ marginTop: 6 }}>
                  <button type="button" className="btn small secondary" onClick={() => navigator.clipboard?.writeText(m.content)}>Copy</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <p className="small muted">Thinking…</p>}
        <div ref={endRef} />
      </div>

      {!messages.length && currentStarters.length > 0 && (
        <div className="row" style={{ margin: "10px 0" }}>
          {currentStarters.map((s) => (
            <button key={s} type="button" className="btn small secondary" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="row"
        style={{ marginTop: 10, flexWrap: "nowrap" }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question…"
          style={{ minHeight: 48, flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
        />
        <button className="btn" type="submit" disabled={busy}>Send</button>
      </form>
      {messages.length > 0 && (
        <button type="button" className="btn small secondary" style={{ marginTop: 8 }} onClick={() => setMessages([])}>New conversation</button>
      )}
    </div>
  );
}
