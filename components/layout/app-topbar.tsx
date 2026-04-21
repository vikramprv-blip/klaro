import Link from "next/link";
import { Calculator, Scale, Home } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/ca", label: "CA Suite", icon: Calculator },
  { href: "/lawyer", label: "Lawyer Suite", icon: Scale },
];

export default function AppTopbar() {
  return (
    <div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center gap-6 px-6">
        <Link href="/" className="text-sm font-semibold text-gray-900">Klaro</Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link key={href} href={href}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
