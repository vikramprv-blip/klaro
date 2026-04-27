"use client"
import { useState } from "react"

const LEXIS_LINKS = [
  { label: "Search Indian Case Law", url: "https://www.lexisnexis.co.in/en-in/products/lexis-india.page", desc: "Supreme Court, High Courts, Tribunals" },
  { label: "Lexis+ AI Assistant", url: "https://www.lexisnexis.com/en-in/products/lexis-plus-ai", desc: "AI-powered legal research and drafting" },
  { label: "GST & Tax Regulations", url: "https://www.lexisnexis.co.in", desc: "Tax law research database" },
]

const CASEMINE_LINKS = [
  { label: "CaseMine Search", url: "https://www.casemine.com", desc: "Free Indian case law search" },
  { label: "Indian Kanoon", url: "https://indiankanoon.org", desc: "Free Supreme Court & High Court judgments" },
]

export default function ResearchPage() {
  const [query, setQuery] = useState("")
  const [cnr, setCnr] = useState("")

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Legal Research</h1>
        <p className="text-sm text-gray-500 mt-1">Search case law, statutes and legal databases</p>
      </div>

      {/* Quick search */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Quick Search</h2>
        <div className="flex gap-3">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            placeholder="Search case law, statutes, sections..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <a href={`https://indiankanoon.org/search/?formInput=${encodeURIComponent(query)}`} target="_blank" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700">Search Indian Kanoon</a>
          <a href={`https://www.casemine.com/search/in?q=${encodeURIComponent(query)}`} target="_blank" className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Search CaseMine</a>
        </div>
      </div>

      {/* LexisNexis */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">LexisNexis India</h2>
            <p className="text-xs text-gray-500 mt-0.5">Premium legal research — India's most comprehensive case law and statute database</p>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">Premium</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {LEXIS_LINKS.map(l => (
            <a key={l.label} href={l.url} target="_blank"
              className="border border-gray-100 rounded-lg p-3 hover:border-blue-200 hover:bg-blue-50 transition-all group">
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{l.label} ↗</p>
              <p className="text-xs text-gray-500 mt-1">{l.desc}</p>
            </a>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Note:</span> LexisNexis requires a separate subscription. Contact LexisNexis India at <span className="font-medium">lexisnexis.co.in</span> for pricing. Many law firms already have access — check with your firm admin.
          </p>
        </div>
      </div>

      {/* Free resources */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Free Resources</h2>
        <div className="grid grid-cols-2 gap-3">
          {CASEMINE_LINKS.map(l => (
            <a key={l.label} href={l.url} target="_blank"
              className="border border-gray-100 rounded-lg p-3 hover:border-gray-300 hover:bg-gray-50 transition-all group">
              <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">{l.label} ↗</p>
              <p className="text-xs text-gray-500 mt-1">{l.desc}</p>
            </a>
          ))}
          <a href="https://main.sci.gov.in" target="_blank"
            className="border border-gray-100 rounded-lg p-3 hover:border-gray-300 hover:bg-gray-50 transition-all group">
            <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Supreme Court of India ↗</p>
            <p className="text-xs text-gray-500 mt-1">Official SCI judgment database</p>
          </a>
          <a href="https://ecourts.gov.in" target="_blank"
            className="border border-gray-100 rounded-lg p-3 hover:border-gray-300 hover:bg-gray-50 transition-all group">
            <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">eCourts Portal ↗</p>
            <p className="text-xs text-gray-500 mt-1">Case status, cause lists, orders</p>
          </a>
        </div>
      </div>

      {/* eCourts CNR lookup */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">eCourts CNR Lookup</h2>
        <div className="flex gap-3">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono"
            placeholder="Enter CNR number e.g. DLHC010001232024"
            value={cnr}
            onChange={e => setCnr(e.target.value.toUpperCase())}
          />
          <a href="https://services.ecourts.gov.in/ecourtindia_v6/" target="_blank" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700">Open eCourts</a>
        </div>
        <p className="text-xs text-gray-400 mt-2">Tip: Save the CNR on the matter page to enable automatic hearing sync</p>
      </div>
    </div>
  )
}
