import Link from "next/link";

export default function AdminNav({ active }: { active: "dashboard" | "leads" | "assistant" }) {
  const items = [
    ["dashboard", "/admin", "Projects"],
    ["leads", "/admin/leads", "Leads"],
    ["assistant", "/admin/assistant", "AI assistant"],
  ] as const;
  return (
    <nav className="tabs" style={{ marginTop: 0 }}>
      {items.map(([k, href, label]) => (
        <Link key={k} href={href} className={active === k ? "active" : ""}>{label}</Link>
      ))}
    </nav>
  );
}
