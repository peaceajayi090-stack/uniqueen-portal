import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { STUDIO, PACKAGES, PROCESS } from "@/lib/brand";
import { portfolioImage, PORTFOLIO_PLACEHOLDERS } from "@/lib/portfolio";

export default async function Home() {
  const supabase = await supabaseServer();
  const [{ data: items }, { data: quotes }] = await Promise.all([
    supabase.from("portfolio_items").select("*").order("position").order("created_at", { ascending: false }).limit(9),
    supabase.from("testimonials").select("*").order("created_at", { ascending: false }).limit(3),
  ]);
  const featured = PACKAGES.filter((p) => ["signature", "turnkey", "shortlet"].includes(p.id));

  return (
    <main className="lux">
      <section className="lux-hero">
        <div className="container hero-grid">
          <div>
          <div className="lux-eyebrow">Luxury interior design · Lagos</div>
          <h1 style={{ marginTop: 14 }}>Exceptional interiors, delivered with complete transparency.</h1>
          <hr className="lux-rule" />
          <p>
            {STUDIO.name} designs refined homes, short-lets and workspaces for discerning clients in Lagos and abroad. Every drawing,
            every cost and every update lives in your own private client portal.
          </p>
          <div className="row" style={{ marginTop: 26 }}>
            <Link href="/packages#book" className="btn gold">Book a private consultation</Link>
            <Link href="/packages" className="btn ghost">View packages</Link>
          </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/emblem.svg" alt="Uniqueen Interiors emblem" className="hero-emblem" />
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 10 }}>
        <div className="lux-stats">
          <div><strong>12</strong><span>documents in every full design set</span></div>
          <div><strong>100%</strong><span>itemised costs, no hidden charges</span></div>
          <div><strong>24/7</strong><span>private portal to follow your project</span></div>
          <div><strong>Lagos &amp; abroad</strong><span>managed for you, wherever you are</span></div>
        </div>
      </section>

      <section className="lux-section">
        <div className="container">
          <div className="lux-eyebrow">Portfolio</div>
          <h2 style={{ fontSize: "2rem", marginTop: 10 }}>Selected spaces</h2>
          <hr className="lux-rule" />
          <div className="portfolio">
            {(items?.length ? items : PORTFOLIO_PLACEHOLDERS).map((it: any, i: number) => (
              <figure key={it.id || i}>
                {it.image_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={portfolioImage(it.image_path)} alt={it.title} loading="lazy" />
                ) : (
                  <div className="placeholder">{it.title}</div>
                )}
                <figcaption>
                  <small>{it.location || it.category}</small>
                  {it.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="lux-section">
        <div className="container">
          <div className="lux-eyebrow">Services</div>
          <h2 style={{ fontSize: "2rem", marginTop: 10 }}>How we can work together</h2>
          <hr className="lux-rule" />
          <div className="grid three">
            {featured.map((p) => (
              <div key={p.id} className={`lux-card${"featured" in p && p.featured ? " featured" : ""}`}>
                <h3>{p.name}</h3>
                <div className="lux-price">{p.price}</div>
                <p className="lux-muted small">{p.bestFor}</p>
                <Link href={`/packages?p=${p.id}#book`} className="small">Enquire →</Link>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 18 }}><Link href="/packages">See all packages and add-ons →</Link></p>
        </div>
      </section>

      {!!quotes?.length && (
        <section className="lux-section">
          <div className="container">
            <div className="lux-eyebrow">Client words</div>
            <hr className="lux-rule" />
            <div className="grid three">
              {quotes.map((t: any) => (
                <div key={t.id}>
                  <p className="quote">“{t.quote}”</p>
                  <p className="lux-muted small">— {t.client_name}{t.detail ? `, ${t.detail}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="lux-section">
        <div className="container">
          <div className="lux-eyebrow">The process</div>
          <h2 style={{ fontSize: "2rem", marginTop: 10 }}>From first conversation to final reveal</h2>
          <hr className="lux-rule" />
          <div className="process-grid">
            {PROCESS.map(([t, d], i) => (
              <div key={t}>
                <div className="lux-gold" style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "1.6rem" }}>0{i + 1}</div>
                <h3>{t}</h3>
                <p className="lux-muted small">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lux-section" style={{ textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontSize: "2rem" }}>Let&apos;s create something remarkable.</h2>
          <p className="lux-muted">Private consultations in Lagos or virtually, wherever you are in the world.</p>
          <div className="row" style={{ justifyContent: "center", marginTop: 18 }}>
            <Link href="/packages#book" className="btn gold">Book a consultation</Link>
            <Link href="/login" className="btn ghost">Client login</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
