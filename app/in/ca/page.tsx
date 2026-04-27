"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function CADashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ clients: 0, gst: 0, tds: 0, itr: 0, overdue: 0, ai_calls: 0 })

  useEffect(() => {
    async function load() {
      try {
        const [cr] = await Promise.all([
          fetch("/api/ca/stats").then(r => r.json()),
        ])
        if (cr && !cr.error) setStats(s => ({ ...s, ...cr }))
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const QUICK_LINKS = [
    { label: "Add Client", href: "/in/ca/clients", icon: "◉", color: "bg-blue-50 text-blue-700" },
    { label: "GST Filing", href: "/in/ca/gst", icon: "G", color: "bg-green-50 text-green-700" },
    { label: "TDS", href: "/in/ca/tds", icon: "T", color: "bg-purple-50 text-purple-700" },
    { label: "ITR", href: "/in/ca/itr", icon: "I", color: "bg-orange-50 text-orange-700" },
    { label: "AI Tools", href: "/in/ca/ai/tax-optimiser", icon: "✦", color: "bg-amber-50 text-amber-700" },
    { label: "Deadlines", href: "/in/ca/deadlines", icon: "◷", color: "bg-red-50 text-red-700" },
    { label: "ROC", href: "/in/ca/roc", icon: "R", color: "bg-indigo-50 text-indigo-700" },
    { label: "GST Notice", href: "/in/ca/gst-notice", icon: "!", color: "bg-rose-50 text-rose-700" },
    { label: "Challan Gen", href: "/in/ca/challan", icon: "C", color: "bg-teal-50 text-teal-700" },
    { label: "Client Portal", href: "/in/ca/client-portal", icon: "⊕", color: "bg-cyan-50 text-cyan-700" },
    { label: "Form 16", href: "/in/ca/form16", icon: "F", color: "bg-gray-100 text-gray-700" },
    { label: "Audit Trail", href: "/in/ca/audit", icon: "≡", color: "bg-slate-50 text-slate-700" },
  ]

  const AI_TOOLS = [
    { label: "Tax Optimiser", href: "/in/ca/ai/tax-optimiser", desc: "Old vs new regime comparison" },
    { label: "GST Health Check", href: "/in/ca/ai/gst-health", desc: "GSTR compliance analysis" },
    { label: "GSTR-2B Recon", href: "/in/ca/ai/gstr2b-recon", desc: "ITC mismatch detection" },
    { label: "Notice Reader", href: "/in/ca/ai/notice-reader", desc: "AI notice analysis + response" },
    { label: "P&L Parser", href: "/in/ca/ai/pl-parser", desc: "Upload P&L for analysis" },
    { label: "Penalty Calculator", href: "/in/ca/ai/penalty-calc", desc: "Late fee + interest calc" },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CA Suite</h1>
        <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {[
          { label: "Clients", value: stats.clients || "—", href: "/in/ca/clients", color: "bg-blue-50 text-blue-700 border-blue-100" },
          { label: "GST Filings", value: stats.gst || "—", href: "/in/ca/gst", color: "bg-green-50 text-green-700 border-green-100" },
          { label: "TDS Filings", value: stats.tds || "—", href: "/in/ca/tds", color: "bg-purple-50 text-purple-700 border-purple-100" },
          { label: "ITR Filings", value: stats.itr || "—", href: "/in/ca/itr", color: "bg-orange-50 text-orange-700 border-orange-100" },
          { label: "Overdue", value: stats.overdue || "—", href: "/in/ca/deadlines", color: "bg-red-50 text-red-700 border-red-100" },
          { label: "AI Calls", value: stats.ai_calls || "—", href: "/in/ca/ai/tax-optimiser", color: "bg-amber-50 text-amber-700 border-amber-100" },
        ].map(s => (
          <Link key={s.label} href={s.href}
            className={`${s.color} border rounded-xl p-4 hover:opacity-80 transition-opacity`}>
            <p className="text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{loading ? "—" : s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {/* AI Tools */}
          <div className="bg-white border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">🤖 AI Tools</h2>
              <Link href="/in/ca/ai/tax-optimiser" className="text-xs text-blue-500 hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {AI_TOOLS.map(t => (
                <Link key={t.label} href={t.href}
                  className="border border-gray-100 rounded-lg p-3 hover:border-gray-300 hover:shadow-sm transition-all group">
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-black mb-1">{t.label}</p>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming deadlines placeholder */}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">📅 Upcoming Deadlines</h2>
              <Link href="/in/ca/deadlines" className="text-xs text-blue-500 hover:underline">View all →</Link>
            </div>
            <div className="px-4 py-4 space-y-3">
              {[
                { label: "GSTR-3B (April 2026)", date: "20 May 2026", days: Math.ceil((new Date("2026-05-20").getTime() - Date.now()) / 86400000), type: "GST" },
                { label: "TDS Q4 FY 2025-26", date: "31 May 2026", days: Math.ceil((new Date("2026-05-31").getTime() - Date.now()) / 86400000), type: "TDS" },
                { label: "ITR Filing (Non-audit)", date: "31 Jul 2026", days: Math.ceil((new Date("2026-07-31").getTime() - Date.now()) / 86400000), type: "ITR" },
                { label: "Advance Tax 1st Instalment", date: "15 Jun 2026", days: Math.ceil((new Date("2026-06-15").getTime() - Date.now()) / 86400000), type: "Advance Tax" },
              ].map(d => (
                <div key={d.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${d.type === "GST" ? "bg-green-50 text-green-700" : d.type === "TDS" ? "bg-purple-50 text-purple-700" : d.type === "ITR" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}>{d.type}</span>
                    <p className="text-sm text-gray-900">{d.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{d.date}</p>
                    <span className={`text-xs font-medium ${d.days <= 7 ? "text-red-600" : d.days <= 30 ? "text-amber-600" : "text-green-600"}`}>{d.days} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick links + resources */}
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_LINKS.map(l => (
                <Link key={l.label} href={l.href}
                  className={`${l.color} rounded-lg p-2.5 text-center hover:opacity-80 transition-opacity`}>
                  <p className="text-base font-mono mb-1">{l.icon}</p>
                  <p className="text-xs font-medium leading-tight">{l.label}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Resources</h2>
            {[
              { label: "GST Portal", url: "https://www.gst.gov.in", desc: "GSTN official portal" },
              { label: "Income Tax Portal", url: "https://eportal.incometax.gov.in", desc: "ITR filing + refund status" },
              { label: "MCA Portal", url: "https://www.mca.gov.in", desc: "ROC filings + company search" },
              { label: "TDS Portal", url: "https://www.tdscpc.gov.in", desc: "Traces + TDS reconciliation" },
            ].map(r => (
              <a key={r.label} href={r.url} target="_blank"
                className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
                <div>
                  <p className="text-xs font-medium text-gray-900">{r.label} ↗</p>
                  <p className="text-xs text-gray-500">{r.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
