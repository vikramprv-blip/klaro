"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/workboard", label: "Workboard" },
  { href: "/clients", label: "Clients" },
  { href: "/cashflow", label: "Cashflow" },
]

export default function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="text-lg font-semibold">
          Klaro
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-md px-3 py-2 transition",
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-black",
                ].join(" ")}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
          <Link href="/work-items/new" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
            New Work Item
          </Link>
        
      </div>
    </header>
  )
}
