import Link from "next/link";
import { STUDIO, PROCESS } from "@/lib/brand";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>{STUDIO.name}</h1>
          <p>{STUDIO.tagline}. Follow your project, fill in your brief, see your invoices and pay online, all in one place.</p>
          <div className="row">
            <Link href="/packages" className="btn">See packages &amp; book</Link>
            <Link href="/login" className="btn" style={{ background: "transparent", color: "#fff", border: "1px solid #fff" }}>Client login</Link>
          </div>
        </div>
      </section>

      <section className="container page">
        <h2>What you can do in your portal</h2>
        <div className="grid three" style={{ marginTop: 16 }}>
          {[
            ["Fill in your brief", "Tell us about your space, style and budget in the client questionnaire."],
            ["Follow progress", "See which stage your project is in and read every update from the studio."],
            ["Pay invoices", "View each invoice and pay securely by card, transfer or USSD through Flutterwave."],
            ["Track orders", "See every furniture and décor order, its status and expected delivery."],
            ["See your costing", "Review the Bill of Quantities for your project, section by section."],
            ["Know the process", "Read our welcome guide: stages, timelines and payment schedule."],
          ].map(([t, d]) => (
            <div className="card feature" key={t}>
              <h3>{t}</h3>
              <p className="muted">{d}</p>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 30 }}>How we work</h2>
        <ol>
          {PROCESS.map(([t, d]) => (
            <li key={t} style={{ marginBottom: 8 }}>
              <strong>{t}:</strong> <span className="muted">{d}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
