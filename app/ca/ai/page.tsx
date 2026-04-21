"use client"
import Link from "next/link"

const SERVICES = [
  { label: "Notice reader",      href: "/ca/ai/notice-reader",   color: "bg-red-50 text-red-800",    badge: "urgent", desc: "Upload any GST/IT/TDS notice PDF — AI reads it, classifies type, extracts deadline, drafts your reply" },
  { label: "26AS analyser",      href: "/ca/ai/form-26as",       color: "bg-blue-50 text-blue-800",  badge: "high",   desc: "Upload Form 26AS — AI extracts all TDS credits, flags mismatches with declared income" },
  { label: "GSTR-2B reconciler", href: "/ca/ai/gstr2b-recon",   color: "bg-purple-50 text-purple-800", badge: "high", desc: "Paste GSTR-2B summary vs purchase register — AI flags missing invoices and ITC mismatches" },
  { label: "P&L / balance sheet parser", href: "/ca/ai/pl-parser", color: "bg-teal-50 text-teal-800", badge: "high", desc: "Upload financial statements — AI extracts key figures, spots anomalies, pre-fills audit checklist" },
  { label: "GST health check",   href: "/ca/ai/gst-health",     color: "bg-green-50 text-green-800", badge: "new",   desc: "Describe client's GST position — AI generates a monthly health report with recommendations" },
  { label: "Penalty calculator", href: "/ca/ai/penalty-calc",   color: "bg-amber-50 text-amber-800", badge: "tool",  desc: "Enter filing details — AI calculates exact penalty + interest under relevant sections" },
  { label: "Smart doc chaser",   href: "/ca/ai/doc-chaser",     color: "bg-orange-50 text-orange-800", badge: "new", desc: "Enter what's missing per client — AI drafts personalised WhatsApp/email to chase documents" },
  { label: "Tax optimiser",      href: "/ca/ai/tax-optimiser",  color: "bg-indigo-50 text-indigo-800", badge: "new", desc: "Enter client income details — AI compares old vs new regime and suggests optimal deductions" },
]

const BADGE_STYLES: Record<string,string> = {
  urgent: "bg-red-100 text-red-700",
  high:   "bg-amber-100 text-amber-700",
  new:    "bg-green-100 text-green-700",
  tool:   "bg-gray-100 text-gray-600",
}

export default function CAAIOverviewPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-medium text-gray-900">AI Services</h1>
          <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">Powered by Claude</span>
        </div>
        <p className="text-sm text-gray-400">AI tools that do the heavy lifting — notice analysis, reconciliation, document chasing, tax optimisation.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SERVICES.map(({ label, href, color, badge, desc }) => (
          <Link key={href} href={href}
            className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all group">
            <div className="flex items-start justify-between mb-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${color}`}>{label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_STYLES[badge]}`}>{badge}</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">{desc}</p>
            <p className="text-xs text-blue-500 mt-3 group-hover:underline">Open →</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
