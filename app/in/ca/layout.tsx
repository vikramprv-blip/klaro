"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import SupportChat from "@/components/SupportChat"
import SuiteTopbar from "@/components/layout/suite-topbar"

const NAV = [
  { label: "Overview",     href: "/in/ca",                    icon: "▦" },
  { label: "Clients",      href: "/in/ca/clients",            icon: "◉" },
  { label: "Bulk Import",  href: "/in/ca/bulk-import",        icon: "⬆" },
  { label: "GST",          href: "/in/ca/gst",                icon: "G" },
  { label: "TDS",          href: "/in/ca/tds",                icon: "T" },
  { label: "ITR",          href: "/in/ca/itr",                icon: "I" },
  { label: "Advance Tax",  href: "/in/ca/advance-tax",        icon: "₹" },
  { label: "Challan Gen",  href: "/in/ca/challan",            icon: "C" },
  { label: "Deadlines",    href: "/in/ca/deadlines",          icon: "◷" },
  { label: "ROC",          href: "/in/ca/roc",                icon: "R" },
  { label: "GST Notice",   href: "/in/ca/gst-notice",         icon: "!" },
  { label: "AI Tools",     href: "/in/ca/ai/tax-optimiser",   icon: "✦" },
  { label: "Documents",    href: "/in/ca/documents",          icon: "▣" },
  { label: "Invoices",     href: "/in/ca/invoices",           icon: "◆" },
  { label: "HR",           href: "/in/ca/hr",                 icon: "◈" },
  { label: "Follow-ups",   href: "/in/ca/followups",          icon: "◎" },
  { label: "Client Portal",href: "/in/ca/client-portal",      icon: "⊕" },
  { label: "Form 16",      href: "/in/ca/form16",             icon: "F" },
  { label: "Audit Trail",  href: "/in/ca/audit",              icon: "≡" },
  { label: "Tools",        href: "/in/ca/tools",              icon: "⊞" },
  { label: "Cred Vault",   href: "/in/ca/credentials",        icon: "🔐" },
  { label: "DSC Tracker",  href: "/in/ca/dsc",                icon: "D" },
  { label: "E-Sign",       href: "/in/ca/esign",              icon: "✍" },
{ label: "Forensic Audit",  href: "/in/ca/forensic",    icon: "🔍" },
{ label: "Stat & Int Audit",href: "/in/ca/stat-audit", icon: "📋" },
  { label: "Settings",     href: "/in/ca/settings",           icon: "⚙" },
]

export default function CALayout({ children }: { children: React.ReactNode }) {
  const path = usePathname() || ""
  return (
    <div className="flex flex-col min-h-screen">
      <SuiteTopbar suite="ca" hasCA={true} hasLawyer={true} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-52 border-r border-gray-100 px-3 py-6 flex flex-col gap-0.5 shrink-0 overflow-y-auto">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-3">CA Suite</p>
          {NAV.map(({ label, href, icon }) => {
            const active = path === href || (href !== "/in/ca" && path.startsWith(href))
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  active ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}>
                <span className="text-xs w-4 text-center font-mono leading-none flex-shrink-0">{icon}</span>
                <span>{label}</span>
              </Link>
            )
          })}
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <SupportChat />
    </div>
  )
}
