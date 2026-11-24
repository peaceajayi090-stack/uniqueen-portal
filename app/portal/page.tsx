import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase";

export default async function Portal() {
  const { supabase, profile } = await requireUser();
  if (profile.role === "admin") redirect("/admin");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, stage, status")
    .order("created_at", { ascending: false });

  if (projects && projects.length === 1) redirect(`/project/${projects[0].id}`);

  return (
    <main className="container page">
      <h1>Welcome{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
      {!projects?.length ? (
        <div className="card">
          <p>Your project hasn&apos;t been set up yet. Uniqueen Interiors will add it shortly.</p>
        </div>
      ) : (
        <div className="grid two">
          {projects.map((p) => (
            <Link key={p.id} href={`/project/${p.id}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
              <h3>{p.name}</h3>
              <span className="pill">{p.stage}</span> <span className="pill gold">{p.status}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
