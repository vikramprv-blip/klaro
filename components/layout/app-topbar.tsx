import Link from "next/link";
import { LayoutGrid, BriefcaseBusiness, Users, Wallet } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/workboard", label: "Workboard", icon: BriefcaseBusiness },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/cashflow", label: "Cashflow", icon: Wallet },
];

export default function AppTopbar() {
  return (
    <div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="flex items-center gap-2 overflow-x-auto px-6 py-3">
        <Link
          href="/dashboard"
          className="mr-3 shrink-0 text-sm font-semibold tracking-tight text-zinc-900"
        >
          Klaro
        </Link>

        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
