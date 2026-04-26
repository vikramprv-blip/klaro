"use client"
import { useEffect, useState } from "react"

const GST_RATES = ["0", "5", "12", "18", "28"]
const PAYMENT_TERMS = ["Due on receipt", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60"]
const CURRENCIES = ["INR", "USD", "GBP", "AED", "SGD"]

export default function InvoiceSettingsPage() {
  const [form, setForm] = useState({
    invoicePrefix: "INV",
    invoiceNotes: "",
    gstRate: "18",
    paymentTerms: "Net 30",
    currency: "INR",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountName: "",
    upiId: "",
    showLogo: true,
    showSignature: true,
    showBankDetails: true,
    showUpi: true,
    footerText: "Thank you for your business.",
  })
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/company-settings")
      .then(r => r.json())
      .then(data => {
        const s = data.settings || {}
        setForm(f => ({
          ...f,
          invoicePrefix: s.invoicePrefix || "INV",
          invoiceNotes: s.invoiceNotes || "",
        }))
        setLoading(false)
      })
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setStatus("Saving...")
    const res = await fetch("/api/company-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoicePrefix: form.invoicePrefix,
        invoiceNotes: form.footerText,
      }),
    })
    setStatus(res.ok ? "Invoice settings saved." : "Could not save.")
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading...</div>

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Invoice & Print Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure how invoices look and what details they include</p>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Numbering */}
        <div className="border rounded-2xl p-5 bg-white">
          <h2 className="font-semibold mb-4">Invoice Numbering</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm font-medium text-gray-700">
              Invoice Prefix
              <input className="mt-1 w-full border rounded-xl px-3 py-2"
                value={form.invoicePrefix}
                onChange={e => setForm(f => ({ ...f, invoicePrefix: e.target.value }))} />
              <span className="text-xs text-gray-400 mt-1 block">e.g. INV → INV-0001</span>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Currency
              <select className="mt-1 w-full border rounded-xl px-3 py-2"
                value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Default GST Rate (%)
              <select className="mt-1 w-full border rounded-xl px-3 py-2"
                value={form.gstRate}
                onChange={e => setForm(f => ({ ...f, gstRate: e.target.value }))}>
                {GST_RATES.map(r => <option key={r}>{r}%</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Payment Terms
              <select className="mt-1 w-full border rounded-xl px-3 py-2"
                value={form.paymentTerms}
                onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))}>
                {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>
        </div>

        {/* Bank Details */}
        <div className="border rounded-2xl p-5 bg-white">
          <h2 className="font-semibold mb-4">Bank Details for Invoice</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm font-medium text-gray-700">
              Bank Name
              <input className="mt-1 w-full border rounded-xl px-3 py-2"
                placeholder="e.g. HDFC Bank"
                value={form.bankName}
                onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Account Name
              <input className="mt-1 w-full border rounded-xl px-3 py-2"
                placeholder="e.g. ABC & Associates"
                value={form.accountName}
                onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Account Number
              <input className="mt-1 w-full border rounded-xl px-3 py-2"
                placeholder="1234567890"
                value={form.accountNumber}
                onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} />
            </label>
            <label className="text-sm font-medium text-gray-700">
              IFSC Code
              <input className="mt-1 w-full border rounded-xl px-3 py-2"
                placeholder="HDFC0001234"
                value={form.ifscCode}
                onChange={e => setForm(f => ({ ...f, ifscCode: e.target.value }))} />
            </label>
            <label className="text-sm font-medium text-gray-700 col-span-2">
              UPI ID
              <input className="mt-1 w-full border rounded-xl px-3 py-2"
                placeholder="yourfirm@upi"
                value={form.upiId}
                onChange={e => setForm(f => ({ ...f, upiId: e.target.value }))} />
            </label>
          </div>
        </div>

        {/* Print Options */}
        <div className="border rounded-2xl p-5 bg-white">
          <h2 className="font-semibold mb-4">Print / PDF Options</h2>
          <div className="space-y-3">
            {[
              { key: "showLogo", label: "Show company logo on invoice" },
              { key: "showSignature", label: "Show signature line" },
              { key: "showBankDetails", label: "Show bank details" },
              { key: "showUpi", label: "Show UPI QR code" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border rounded-2xl p-5 bg-white">
          <h2 className="font-semibold mb-4">Invoice Footer Text</h2>
          <textarea
            className="w-full border rounded-xl px-3 py-2 text-sm min-h-20 resize-none"
            placeholder="Thank you for your business. All amounts in INR."
            value={form.footerText}
            onChange={e => setForm(f => ({ ...f, footerText: e.target.value }))} />
        </div>

        <div className="flex items-center gap-4">
          <button type="submit"
            className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-medium">
            Save Invoice Settings
          </button>
          <span className="text-sm text-gray-500">{status}</span>
        </div>
      </form>
    </main>
  )
}
