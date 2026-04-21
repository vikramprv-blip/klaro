"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const AI_SERVICES = [
  { label: "Notice reader",       href: "/in/ca/ai/notice-reader",    icon: "⚠", desc: "Upload any GST/IT notice — AI reads, classifies, drafts reply" },
  { label: "26AS analyser",       href: "/in/ca/ai/form-26as",        icon: "◈", desc: "Upload 26AS — extract TDS credits, flag mismatches" },
  { label: "GSTR-2B reconciler",  href: "/in/ca/ai/gstr2b-recon",     icon: "◎", desc: "Compare GSTR-2B vs purchase register — flag ITC mismatches" },
  { label: "P&L parser",          href: "/in/ca/ai/pl-parser",        icon: "▣", desc: "Upload financials — extract figures, prepare audit checklist" },
  { label: "GST health check",    href: "/in/ca/ai/gst-health",       icon: "◉", desc: "Monthly AI scan of client GST position" },
  { label: "Penalty calculator",  href: "/in/ca/ai/penalty-calc",     icon: "◆", desc: "Real-time penalty + interest for late filings" },
  { label: "Doc chaser",          href: "/in/ca/ai/doc-chaser",       icon: "◇", desc: "AI drafts personalised WhatsApp/email per client" },
  { label: "Tax optimiser",       href: "/in/ca/ai/tax-optimiser",    icon: "◷", desc: "Old vs new regime comparison, deduction suggestions" },
]

export default function CAAILayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-gray-100 px-3 py-6 flex flex-col gap-1 shrink-0">
        <div className="px-3 mb-4">
          <Link href="/in/ca" className="text-xs text-gray-400 hover:text-gray-600">← CA Suite</Link>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-3 mb-1">AI Services</p>
          <p className="text-xs text-gray-300">Powered by Claude</p>
        </div>
        {AI_SERVICES.map(({ label, href, icon }) => {
          const active = path === href
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
    </div>
  )
}
