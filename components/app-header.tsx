"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/in/ca",     label: "CA Suite" },
  { href: "/in/lawyer", label: "Lawyer Suite" },
  { href: "/pricing", label: "Pricing" },
  { href: "/guide",  label: "Guide" },
]

export default function AppHeader() {
  const pathname = usePathname()
  const path = pathname || ""
  
  // Hide header on landing page — it has its own nav
  if (path === "/" || path === "/in") return null

  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-base font-semibold text-gray-900">Klaro</Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label }) => {
            const active = path.startsWith(href)
            return (
              <Link key={href} href={href}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  active ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}>
                {label}
              </Link>
            )
          })}
        </nav>
        <Link href="/signup" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          Get started free
        </Link>
      </div>
    </header>
  )
}
