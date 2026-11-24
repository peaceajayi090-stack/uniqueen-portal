import { STUDIO, PROCESS, PAYMENT_SCHEDULE, DELIVERABLES } from "@/lib/brand";
import { PrintButton } from "@/components/Buttons";

export default function WelcomeGuide() {
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2>Welcome to {STUDIO.name}</h2>
        <PrintButton />
      </div>
      <p>
        Thank you for choosing us to design your space. This guide explains how we work, what you will receive and how payments
        are structured. Everything for your project lives in this portal.
      </p>

      <h3 style={{ marginTop: 20 }}>Our process</h3>
      <ol>
        {PROCESS.map(([t, d]) => (
          <li key={t} style={{ marginBottom: 6 }}><strong>{t}:</strong> {d}</li>
        ))}
      </ol>

      <h3 style={{ marginTop: 20 }}>Typical timeline</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Project size</th><th>Design (weeks)</th><th>Procurement + installation (weeks)</th><th>Total (weeks)</th></tr></thead>
          <tbody>
            <tr><td>Single room</td><td>2–3</td><td>4–7</td><td>6–10</td></tr>
            <tr><td>2–3 bedroom apartment</td><td>4–6</td><td>8–12</td><td>12–18</td></tr>
            <tr><td>Full house or office floor</td><td>6–8</td><td>12–20</td><td>18–28</td></tr>
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: 20 }}>What you receive</h3>
      <ol className="grid two" style={{ paddingLeft: 18, gap: 4 }}>
        {DELIVERABLES.map((d) => <li key={d}>{d}</li>)}
      </ol>

      <h3 style={{ marginTop: 20 }}>Payment schedule</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Stage</th><th>Payment</th><th>When it is due</th></tr></thead>
          <tbody>
            {PAYMENT_SCHEDULE.map(([a, b, c]) => <tr key={a}><td>{a}</td><td>{b}</td><td>{c}</td></tr>)}
          </tbody>
        </table>
      </div>
      <ul className="small muted" style={{ marginTop: 10 }}>
        <li>Pay online from the Invoices section, or by bank transfer to the account on your invoice.</li>
        <li>Work on each stage begins once its payment is confirmed.</li>
        <li>Changes after approval are billed as variations. Supplier prices hold for 14 days.</li>
      </ul>

      <h3 style={{ marginTop: 20 }}>Communication</h3>
      <ul>
        <li>Every update is posted in the Updates section of this portal.</li>
        <li>Office hours: Monday–Friday 9am–5pm, Saturday 10am–2pm.</li>
        <li>Every drawing and purchase is approved by you in writing before we proceed.</li>
        <li>Please reply to approval requests within 3 working days.</li>
      </ul>
      {(STUDIO.phone || STUDIO.email) && (
        <p className="muted">Contact: {[STUDIO.phone, STUDIO.email].filter(Boolean).join(" · ")}</p>
      )}
    </div>
  );
}
