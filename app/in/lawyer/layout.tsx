"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import SupportChat from "@/components/SupportChat"

const NAV = [
  { label: "Overview",  href: "/in/lawyer",             icon: "⊞" },
  { label: "Matters",   href: "/in/lawyer/matters",     icon: "◉" },
  { label: "Hearings",  href: "/in/lawyer/hearings",    icon: "◷" },
  { label: "Evidence",  href: "/in/lawyer/evidence",    icon: "🔐" },
  { label: "Tasks",     href: "/in/lawyer/tasks",       icon: "◈" },
  { label: "Drafts",    href: "/in/lawyer/drafts",      icon: "▣" },
  { label: "Documents", href: "/in/lawyer/documents",   icon: "◎" },
  { label: "Billing",   href: "/in/lawyer/billing",     icon: "◆" },
  { label: "HR",        href: "/in/lawyer/hr",          icon: "👥" },
  { label: "Settings",  href: "/in/lawyer/settings",    icon: "⚙" },
]

export default function LawyerLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname() || ""
  return (
    <div className="flex min-h-screen">
      <aside className="w-52 border-r border-gray-100 px-3 py-6 flex flex-col gap-1 shrink-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-3">Lawyer Suite</p>
        {NAV.map(({ label, href, icon }) => {
          const active = path === href || (href !== "/in/lawyer" && path.startsWith(href))
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
