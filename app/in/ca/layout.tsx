"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV = [
  { label: "Overview",        href: "/in/ca",                      icon: "⊞" },
  { label: "AI services",     href: "/in/ca/ai",                   icon: "✦" },
  { label: "Clients",         href: "/in/ca/clients",              icon: "◉" },
  { label: "Invoices",        href: "/in/ca/invoices",             icon: "₹" },
  { label: "HR",              href: "/in/ca/hr",                   icon: "👥" },
  { label: "  Employees",     href: "/in/ca/hr/employees",         icon: "↳" },
  { label: "  Attendance",    href: "/in/ca/hr/attendance",        icon: "↳" },
  { label: "  Timesheets",    href: "/in/ca/hr/timesheets",        icon: "↳" },
  { label: "  Leave",         href: "/in/ca/hr/leave",             icon: "↳" },
  { label: "  Payroll",       href: "/in/ca/hr/payroll",           icon: "↳" },
  { label: "  Branches",      href: "/in/ca/hr/branches",          icon: "↳" },
  { label: "GST filings",     href: "/in/ca/gst",                  icon: "◈" },
  { label: "TDS compliance",  href: "/in/ca/tds",                  icon: "◇" },
  { label: "ITR tracker",     href: "/in/ca/itr",                  icon: "◎" },
  { label: "Advance tax",     href: "/in/ca/advance-tax",          icon: "◆" },
  { label: "Deadlines",       href: "/in/ca/deadlines",            icon: "◷" },
  { label: "Compliance",      href: "/in/ca/compliance",           icon: "▤" },
  { label: "Documents",       href: "/in/ca/documents",            icon: "▣" },
  { label: "AI Documents",    href: "/in/ca/documents-ai",         icon: "✺" },
  { label: "Bulk Import",     href: "/in/ca/bulk-import",          icon: "⬆" },
  { label: "Bulk Import",     href: "/in/ca/bulk-import",          icon: "⬆" },
]

export default function CALayout({ children }: { children: React.ReactNode }) {
  const path = usePathname() || ""
  return (
    <div className="flex min-h-screen">
      <aside className="w-52 border-r border-gray-100 px-3 py-6 flex flex-col gap-1 shrink-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-3">
          CA Suite
        </p>
        {NAV.map(({ label, href, icon }) => {
          const active = path === href || (href !== "/in/ca" && path.startsWith(href))
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
      <div className="mt-auto pt-4 border-t border-gray-100 px-3 pb-2">
        <Link href="/in/lawyer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-50">
          <span>⚖️</span> Switch to Lawyer Suite
        </Link>
      </div>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
