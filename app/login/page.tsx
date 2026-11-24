import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import { siteUrl } from "@/lib/config";

async function sendLoginLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) redirect("/login?error=email");
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${await siteUrl()}/auth/callback`,
      shouldCreateUser: false, // only invited clients (and you) can log in
    },
  });
  if (error) redirect("/login?error=send");
  redirect("/login?sent=1");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="container">
      <div className="auth-box card">
        <h1>Client login</h1>
        <p className="muted">Enter the email address the studio has on file. We&apos;ll email you a secure login link; no password needed.</p>
        {sp.sent && <div className="notice ok">Check your inbox (and spam folder) for your login link.</div>}
        {sp.error && (
          <div className="notice err">
            {sp.error === "send"
              ? "We couldn't send a link to that email. Make sure it's the address Uniqueen Interiors invited."
              : "Something went wrong. Please try again."}
          </div>
        )}
        <form action={sendLoginLink}>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <button className="btn full" type="submit">Email me a login link</button>
        </form>
      </div>
    </main>
  );
}
