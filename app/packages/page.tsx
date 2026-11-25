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
    <main className="lux">
      <section className="lux-hero" style={{ padding: "80px 0 60px" }}>
        <div className="container">
          <div className="lux-eyebrow">Services &amp; investment</div>
          <h1 style={{ marginTop: 14 }}>Packages &amp; pricing</h1>
          <hr className="lux-rule" />
          <p>Clear, fixed design fees. Furniture and works are quoted separately in an itemised Bill of Quantities, and every project includes your own private client portal.</p>
          <a href="#book" className="btn gold" style={{ marginTop: 18 }}>Book a private consultation</a>
        </div>
      </section>

      <section className="container lux-section">
        <div className="grid two" style={{ gap: 18 }}>
          {PACKAGES.map((p) => (
            <div key={p.id} className={`lux-card${"featured" in p && p.featured ? " featured" : ""}`}>
              {"featured" in p && p.featured && <div className="lux-eyebrow" style={{ marginBottom: 8 }}>Most requested</div>}
              <h2>{p.name}</h2>
              <div className="lux-price">{p.price}</div>
              <p className="lux-muted small">{p.bestFor}</p>
              <ul>
                {p.includes.map((i) => <li key={i}>{i}</li>)}
              </ul>
              <a href={`/packages?p=${p.id}#book`} className="btn ghost small">Enquire about {p.name}</a>
            </div>
          ))}
        </div>

        <div className="lux-card" style={{ marginTop: 18 }}>
          <h3>Add-ons</h3>
          <div className="table-wrap">
            <table>
              <tbody>
                {ADD_ONS.map(([a, b]) => <tr key={a}><td>{a}</td><td className="num">{b}</td></tr>)}
              </tbody>
            </table>
          </div>
          <p className="small lux-muted" style={{ marginTop: 10 }}>
            Design fees are paid 50% at booking, 30% at concept approval and 20% before final drawings. Furniture and works are quoted separately in an itemised BOQ.
          </p>
        </div>

        <div className="lux-card" id="book" style={{ marginTop: 18 }}>
          <div className="lux-eyebrow">Private consultation</div>
          <h2 style={{ marginTop: 8 }}>Book a Clarity Session</h2>
          <p className="lux-muted">Tell us about your space. We&apos;ll contact you within 24 working hours to confirm a date.</p>
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
                <div className="field"><label>City / area</label><input name="location" placeholder="e.g. Ikoyi, Lekki, London" /></div>
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
              <button className="btn gold" type="submit">Send booking request</button>
            </form>
          )}
          {STUDIO.phone && <p className="small muted" style={{ marginTop: 12 }}>Prefer WhatsApp? Message us on {STUDIO.phone}.</p>}
        </div>
      </section>
    </main>
  );
}
