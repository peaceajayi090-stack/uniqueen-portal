import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { PACKAGES, ADD_ONS, STUDIO } from "@/lib/brand";

export const metadata = { title: "Packages & pricing — Uniqueen Interiors" };

async function bookConsultation(formData: FormData) {
  "use server";
  const g = (k: string) => String(formData.get(k) || "").trim();
  if (g("website")) redirect("/packages?sent=1"); // spam trap: humans never fill this hidden box
  const name = g("name");
  const phone = g("phone");
  if (!name || (!phone && !g("email"))) redirect("/packages?error=1#book");
  const { error } = await supabaseAdmin().from("leads").insert({
    name,
    email: g("email") || null,
    phone: phone || null,
    package: g("package") || null,
    location: g("location") || null,
    preferred_date: g("preferred_date") || null,
    message: g("message") || null,
  });
  if (error) redirect("/packages?error=save#book");
  redirect("/packages?sent=1#book");
}

export default async function PackagesPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string; p?: string }> }) {
  const sp = await searchParams;
  return (
    <main>
      <section className="hero" style={{ padding: "56px 0 48px" }}>
        <div className="container">
          <h1>Packages &amp; pricing</h1>
          <p>Clear, fixed prices. Design fees are kept separate from furniture and works, and every project comes with your own client portal.</p>
          <a href="#book" className="btn">Book a Clarity Session</a>
        </div>
      </section>

      <section className="container page">
        <div className="grid two">
          {PACKAGES.map((p) => (
            <div key={p.id} className="card" style={"featured" in p && p.featured ? { borderColor: "var(--gold)", borderWidth: 2 } : undefined}>
              {"featured" in p && p.featured && <span className="pill gold">Most popular</span>}
              <h2 style={{ marginTop: 8 }}>{p.name}</h2>
              <p className="muted small">{p.bestFor}</p>
              <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>{p.price}</p>
              <ul style={{ paddingLeft: 18 }}>
                {p.includes.map((i) => <li key={i}>{i}</li>)}
              </ul>
              <a href={`/packages?p=${p.id}#book`} className="btn secondary small">Choose {p.name}</a>
            </div>
          ))}
        </div>

        <div className="card soft">
          <h3>Add-ons</h3>
          <div className="table-wrap">
            <table>
              <tbody>
                {ADD_ONS.map(([a, b]) => <tr key={a}><td>{a}</td><td className="num">{b}</td></tr>)}
              </tbody>
            </table>
          </div>
          <p className="small muted" style={{ marginTop: 10 }}>
            Design fees are paid 50% at booking, 30% at concept approval and 20% before final drawings. Furniture and works are quoted separately in an itemised BOQ.
          </p>
        </div>

        <div className="card" id="book">
          <h2>Book a Clarity Session</h2>
          <p className="muted">Tell us about your space. We&apos;ll contact you within 24 working hours to confirm a date.</p>
          {sp.sent && <div className="notice ok">Thank you! We&apos;ve received your request and will be in touch shortly.</div>}
          {sp.error && (
            <div className="notice err">
              {sp.error === "save" ? "Sorry, we couldn't save your request. Please message us on WhatsApp instead." : "Please add your name and a phone number or email."}
            </div>
          )}
          {!sp.sent && (
            <form action={bookConsultation}>
              <input name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -9999 }} aria-hidden="true" />
              <div className="grid two">
                <div className="field"><label>Your name *</label><input name="name" required /></div>
                <div className="field"><label>Phone / WhatsApp *</label><input name="phone" type="tel" /></div>
                <div className="field"><label>Email</label><input name="email" type="email" /></div>
                <div className="field"><label>City / area</label><input name="location" placeholder="e.g. Osogbo, Lekki" /></div>
                <div className="field">
                  <label>Package you&apos;re interested in</label>
                  <select name="package" defaultValue={PACKAGES.find((p) => p.id === sp.p)?.name || ""}>
                    <option value="">Not sure yet</option>
                    {PACKAGES.map((p) => <option key={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="field"><label>Preferred date</label><input name="preferred_date" type="date" /></div>
              </div>
              <div className="field"><label>Tell us about your space</label><textarea name="message" placeholder="Rooms, rough budget, timeline, style you like…" /></div>
              <button className="btn" type="submit">Send booking request</button>
            </form>
          )}
          {STUDIO.phone && <p className="small muted" style={{ marginTop: 12 }}>Prefer WhatsApp? Message us on {STUDIO.phone}.</p>}
        </div>
      </section>
    </main>
  );
}
