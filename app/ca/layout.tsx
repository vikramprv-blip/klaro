"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV = [
  { label: "Overview",        href: "/ca",             icon: "⊞" },
  { label: "Clients",         href: "/ca/clients",     icon: "◉" },
  { label: "GST filings",     href: "/ca/gst",         icon: "◈" },
  { label: "TDS compliance",  href: "/ca/tds",         icon: "◇" },
  { label: "ITR tracker",     href: "/ca/itr",         icon: "◎" },
  { label: "Advance tax",     href: "/ca/advance-tax", icon: "◆" },
  { label: "Deadlines",       href: "/ca/deadlines",   icon: "◷" },
  { label: "Documents",       href: "/ca/documents",   icon: "▣" },
]

export default function CALayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <div className="flex min-h-screen">
      <aside className="w-52 border-r border-gray-100 px-3 py-6 flex flex-col gap-1 shrink-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-3">
          CA Suite
        </p>
        {NAV.map(({ label, href, icon }) => {
          const active = path === href || (href !== "/ca" && path.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          )
        })}
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
