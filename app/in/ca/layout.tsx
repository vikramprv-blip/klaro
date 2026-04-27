"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import SupportChat from "@/components/SupportChat"

const NAV = [
  { label: "Overview",    href: "/in/ca",                    icon: "⊞" },
  { label: "Clients",     href: "/in/ca/clients",            icon: "��" },
  { label: "GST",         href: "/in/ca/gst",               icon: "📋" },
  { label: "TDS",         href: "/in/ca/tds",               icon: "📊" },
  { label: "ITR",         href: "/in/ca/itr",               icon: "🗂" },
  { label: "Advance Tax", href: "/in/ca/advance-tax",        icon: "💰" },
  { label: "Deadlines",   href: "/in/ca/deadlines",          icon: "📅" },
  { label: "AI Tools",    href: "/in/ca/ai/tax-optimiser",   icon: "🤖" },
  { label: "Documents",   href: "/in/ca/documents",          icon: "📁" },
  { label: "Invoices",    href: "/in/ca/invoices",           icon: "🧾" },
  { label: "HR",          href: "/in/ca/hr",                icon: "👥" },
  { label: "Follow-ups",  href: "/in/ca/followups",          icon: "💬" },
  { label: "Settings",    href: "/in/ca/settings",           icon: "⚙" },
]

export default function CALayout({ children }: { children: React.ReactNode }) {
  const path = usePathname() || ""
  return (
    <div className="flex min-h-screen">
      <aside className="w-52 border-r border-gray-100 px-3 py-6 flex flex-col gap-1 shrink-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-3">CA Suite</p>
        {NAV.map(({ label, href, icon }) => {
          const active = path === href || (href !== "/in/ca" && path.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}>
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          )
        })}
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
      <SupportChat />
    </div>
  )
}
