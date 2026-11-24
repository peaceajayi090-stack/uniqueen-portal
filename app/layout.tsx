import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { STUDIO } from "@/lib/brand";
import { supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = {
  title: `${STUDIO.name} — Client Portal`,
  description: STUDIO.tagline,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="topbar">
          <div className="container">
            <Link href="/" className="logo">
              Uniqueen <span>Interiors</span>
            </Link>
            <nav>
              {user ? (
                <>
                  <Link href="/portal">My portal</Link>
                  <form action="/auth/logout" method="post">
                    <button className="btn small secondary" type="submit">Log out</button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="btn small">Client login</Link>
              )}
            </nav>
          </div>
        </header>
        {children}
        <footer>
          <div className="container">
            © {new Date().getFullYear()} {STUDIO.name}
            {STUDIO.phone && <> · {STUDIO.phone}</>}
            {STUDIO.email && <> · {STUDIO.email}</>}
          </div>
        </footer>
      </body>
    </html>
  );
}
