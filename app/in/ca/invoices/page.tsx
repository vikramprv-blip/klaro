"use client"
import { useEffect, useState } from "react"
import SearchableSelect from "@/components/SearchableSelect"

function fmt(n: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [einvoiceModal, setEinvoiceModal] = useState<any>(null)
  const [einvoiceLoading, setEinvoiceLoading] = useState(false)
  const [form, setForm] = useState({
    client_id: "", amount: "", service_type: "Professional Services",
    gst_rate: "18", due_date: "", payment_method: "", notes: ""
  })

  async function load() {
    const [ir, cr, sr] = await Promise.all([
      fetch("/api/invoices").then(r => r.json()),
      fetch("/api/ca/clients").then(r => r.json()),
      fetch("/api/invoices/summary").then(r => r.json()),
    ])
    setInvoices(Array.isArray(ir) ? ir : [])
    setClients(Array.isArray(cr) ? cr : [])
    setSummary(sr || {})
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createInvoice(e: any) {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) return alert("Enter a valid amount")
    setCreating(true)
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: form.client_id || null,
        amount: Number(form.amount),
        service_type: form.service_type,
        gst_rate: Number(form.gst_rate || 18),
        due_date: form.due_date || null,
        payment_method: form.payment_method || null,
        notes: form.notes || null,
      }),
    })
    const data = await res.json()
    setCreating(false)
    if (data.ok) {
      setForm({ client_id: "", amount: "", service_type: "Professional Services", gst_rate: "18", due_date: "", payment_method: "", notes: "" })
      load()
    } else {
      alert(data.error || "Failed to create invoice")
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(status === "paid" ? { paid_date: new Date().toISOString().split("T")[0] } : {}) })
    })
    load()
  }

  async function deleteInvoice(id: string) {
    if (!confirm("Delete this invoice?")) return
    await fetch(`/api/invoices/${id}`, { method: "DELETE" })
    load()
  }

  async function generateEInvoice(inv: any) {
    setEinvoiceLoading(true)
    setEinvoiceModal({ inv, loading: true, qr: null, irn: null })
    const res = await fetch("/api/ca/einvoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoice_id: inv.id })
    })
    const data = await res.json()
    setEinvoiceLoading(false)
    setEinvoiceModal({ inv, loading: false, qr: data.qr, irn: data.irn, qrPayload: data.qrPayload, error: data.error })
  }

  const clientOptions = clients.map(c => ({ value: c.id, label: c.name, sub: c.gstin || c.email || "" }))
  const serviceTypes = ["Professional Services", "GST Filing", "TDS Filing", "ITR Filing", "Audit", "Bookkeeping", "ROC Compliance", "Advisory", "Payroll", "Other"]
  const paymentModes = ["UPI", "Bank Transfer", "Cheque", "Cash", "Online"]

  const filtered = invoices
    .filter(i => statusFilter === "all" || i.status === statusFilter)
    .filter(i => !search || (i.invoice_number || "").toLowerCase().includes(search.toLowerCase()) || (i.ca_clients?.name || "").toLowerCase().includes(search.toLowerCase()))

  const gstAmount = form.amount ? Math.round(Number(form.amount) * Number(form.gst_rate || 18) / 100) : 0
  const totalAmount = form.amount ? Number(form.amount) + gstAmount : 0

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">

      {/* E-Invoice Modal */}
      {einvoiceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">E-Invoice</h2>
                <p className="text-xs text-gray-500">GST E-Invoice with QR Code — as per GSTN mandate</p>
              </div>
              <button onClick={() => setEinvoiceModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {einvoiceModal.loading && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Generating IRN and QR code...</p>
              </div>
            )}

            {einvoiceModal.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {einvoiceModal.error}
              </div>
            )}

            {!einvoiceModal.loading && einvoiceModal.qr && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-green-600 text-lg">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-green-800">IRN Generated Successfully</p>
                    <p className="text-xs text-green-700 font-mono mt-1 break-all">{einvoiceModal.irn}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <p className="text-xs text-gray-500 mb-2 text-center">QR Code</p>
                    <img src={einvoiceModal.qr} alt="E-Invoice QR" className="w-40 h-40 border rounded-lg" />
                    <p className="text-xs text-gray-400 text-center mt-1">Scan to verify</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Invoice Details</p>
                    {[
                      { label: "Invoice No.", value: einvoiceModal.inv.invoice_number },
                      { label: "Seller GSTIN", value: einvoiceModal.qrPayload?.SellerGSTIN || "—" },
                      { label: "Buyer GSTIN", value: einvoiceModal.qrPayload?.BuyerGSTIN || "—" },
                      { label: "Doc Date", value: einvoiceModal.qrPayload?.DocDt || "—" },
                      { label: "Total Value", value: fmt(einvoiceModal.inv.total_amount) },
                      { label: "HSN Code", value: "998211" },
                    ].map(f => (
                      <div key={f.label} className="flex justify-between text-xs">
                        <span className="text-gray-500">{f.label}</span>
                        <span className="font-medium text-gray-900 font-mono">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = einvoiceModal.qr
                      link.download = `einvoice-qr-${einvoiceModal.inv.invoice_number}.png`
                      link.click()
                    }}
                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
                  >
                    ⬇ Download QR
                  </button>
                  <button
                    onClick={() => window.open(`/api/invoices/pdf?id=${einvoiceModal.inv.id}&einvoice=1`, "_blank")}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    🖨 Print with QR
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  QR code contains digitally signed payload per GSTN e-invoice schema. HSN 998211 = Accounting services.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-xs text-gray-400 mt-0.5">E-Invoice with QR code mandatory for turnover &gt; ₹5 Cr. Generate IRN + QR on each invoice.</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/invoices/export" className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Export CSV</a>
          <button onClick={async () => {
            const res = await fetch("/api/invoices/reminders", { method: "POST" })
            const d = await res.json()
            alert(`Overdue found: ${d.overdueFound} | Updated: ${d.remindersQueued}`)
            load()
          }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Queue Overdue Reminders</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total", amount: summary.totalAmount, count: summary.totalInvoices, color: "bg-blue-50 text-blue-700" },
          { label: "Paid", amount: summary.paidAmount, count: summary.paidInvoices, color: "bg-green-50 text-green-700" },
          { label: "Unpaid", amount: summary.unpaidAmount, count: summary.unpaidInvoices, color: "bg-amber-50 text-amber-700" },
          { label: "Overdue", amount: summary.overdueAmount, count: summary.overdueInvoices, color: "bg-red-50 text-red-700" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 border`}>
            <p className="text-xs font-medium mb-1">{s.label}</p>
            <p className="text-xl font-bold">{fmt(s.amount || 0)}</p>
            <p className="text-xs opacity-70">{s.count || 0} invoices</p>
          </div>
        ))}
      </div>

      {/* Create invoice */}
      <form onSubmit={createInvoice} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Create Invoice</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Client (search or select)</label>
            <SearchableSelect
              options={[{ value: "", label: "No client" }, ...clientOptions]}
              value={form.client_id}
              onChange={val => setForm({ ...form, client_id: val })}
              placeholder="Select client..."
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Service Type</label>
            <SearchableSelect
              options={serviceTypes.map(s => ({ value: s, label: s }))}
              value={form.service_type}
              onChange={val => setForm({ ...form, service_type: val })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Amount (₹) *</label>
            <input required type="number" className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. 5000"
              value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">GST Rate (%)</label>
            <SearchableSelect
              options={["0","5","12","18","28"].map(r => ({ value: r, label: `${r}%` }))}
              value={form.gst_rate}
              onChange={val => setForm({ ...form, gst_rate: val })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Due Date</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Payment Mode</label>
            <SearchableSelect
              options={paymentModes.map(p => ({ value: p, label: p }))}
              value={form.payment_method}
              onChange={val => setForm({ ...form, payment_method: val })}
              placeholder="Select mode..."
            />
          </div>
          {form.amount && Number(form.amount) > 0 && (
            <div className="col-span-3 bg-blue-50 rounded-lg px-4 py-3 flex items-center gap-6 text-sm">
              <span className="text-gray-600">Base: <strong>{fmt(Number(form.amount))}</strong></span>
              <span className="text-gray-600">GST ({form.gst_rate}%): <strong>{fmt(gstAmount)}</strong></span>
              <span className="text-gray-900 font-bold text-lg">Total: {fmt(totalAmount)}</span>
            </div>
          )}
        </div>
        <button disabled={creating} className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50">
          {creating ? "Creating..." : "Create Invoice"}
        </button>
      </form>

      {/* Invoice list */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-3">
          <input className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
            placeholder="Search invoice number or client..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="border rounded-lg px-3 py-1.5 text-sm"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {["all","pending","paid","overdue"].map(s => <option key={s} value={s}>{s === "all" ? "All status" : s}</option>)}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
            <tr>{["Invoice No.", "Client", "Service", "Base", "GST", "Total", "Due", "Status", "E-Invoice", "Action"].map(h => (
              <th key={h} className="px-4 py-2 text-left">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">No invoices found</td></tr>}
            {filtered.map(inv => (
              <tr key={inv.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{inv.invoice_number}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{inv.ca_clients?.name || "—"}</p>
                  {inv.ca_clients?.gstin && <p className="text-xs text-gray-400 font-mono">{inv.ca_clients.gstin}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{inv.service_type}</td>
                <td className="px-4 py-3">{fmt(inv.amount)}</td>
                <td className="px-4 py-3 text-gray-500">{fmt(inv.gst_amount)}</td>
                <td className="px-4 py-3 font-semibold">{fmt(inv.total_amount)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{inv.due_date || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    inv.status === "paid" ? "bg-green-50 text-green-700" :
                    inv.status === "overdue" ? "bg-red-50 text-red-700" :
                    "bg-amber-50 text-amber-700"
                  }`}>{inv.status}</span>
                </td>
                <td className="px-4 py-3">
                  {inv.irn ? (
                    <button onClick={() => generateEInvoice(inv)}
                      className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 flex items-center gap-1">
                      ✓ IRN
                    </button>
                  ) : (
                    <button onClick={() => generateEInvoice(inv)}
                      className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded hover:bg-orange-100">
                      Gen QR
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {inv.status === "pending" && (
                      <button onClick={() => updateStatus(inv.id, "paid")}
                        className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">Paid</button>
                    )}
                    <button onClick={() => deleteInvoice(inv.id)}
                      className="text-xs text-red-400 hover:text-red-600">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
