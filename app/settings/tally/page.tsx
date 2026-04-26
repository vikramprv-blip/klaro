"use client"
import { useState } from "react"

export default function TallyPage() {
  const currentYear = new Date().getFullYear()
  const [from, setFrom] = useState(`${currentYear}-04-01`)
  const [to, setTo] = useState(new Date().toISOString().split("T")[0])
  const [downloading, setDownloading] = useState(false)

  function exportTally() {
    setDownloading(true)
    window.location.href = `/api/export/tally?type=invoices&from=${from}&to=${to}`
    setTimeout(() => setDownloading(false), 2000)
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Tally Export</h1>
        <p className="text-sm text-gray-500 mt-1">Export invoices as Tally XML for direct import into Tally Prime or Tally ERP 9</p>
      </div>

      <div className="bg-white border rounded-2xl p-6 space-y-6">
        {/* How it works */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">How to import into Tally</h3>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
            <li>Download the XML file from Klaro</li>
            <li>Open Tally Prime → Gateway of Tally</li>
            <li>Go to Import → Data → select the XML file</li>
            <li>Tally will auto-create ledgers and vouchers</li>
          </ol>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">From Date</label>
            <input type="date" value={from}
              onChange={e => setFrom(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To Date</label>
            <input type="date" value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm" />
          </div>
        </div>

        {/* What's included */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">What's included in the export</h3>
          <div className="space-y-2">
            {[
              ["✅", "Sales vouchers for all invoices"],
              ["✅", "Client ledger masters (Sundry Debtors)"],
              ["✅", "GST breakup (CGST/SGST/IGST)"],
              ["✅", "Invoice number and due date"],
              ["✅", "Party GSTIN for GST compliance"],
              ["⏳", "Payment receipts (coming soon)"],
              ["⏳", "Expense vouchers (coming soon)"],
            ].map(([icon, label]) => (
              <div key={label as string} className="flex items-center gap-2 text-sm text-gray-600">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={exportTally} disabled={downloading}
          className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-40">
          {downloading ? "Preparing download..." : "Download Tally XML"}
        </button>
      </div>
    </main>
  )
}
