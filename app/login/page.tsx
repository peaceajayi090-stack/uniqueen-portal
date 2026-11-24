import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";

async function logIn(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) redirect("/login?error=missing");
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=wrong");
  redirect("/portal");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="container">
      <div className="auth-box card">
        <h1>Client login</h1>
        <p className="muted">Log in with the email and password Uniqueen Interiors gave you.</p>
        {sp.error && (
          <div className="notice err">
            {sp.error === "wrong"
              ? "That email or password is not correct. Please check and try again, or contact the studio."
              : "Please enter your email and password."}
          </div>
        )}
        <form action={logIn}>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <button className="btn full" type="submit">Log in</button>
        </form>
      </div>
    </main>
  );
}
