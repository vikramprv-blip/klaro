"use client"
import { useEffect, useState } from "react"

export default function ClientPortalPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) { setError("Invalid link — no token provided."); setLoading(false); return; }
    fetch(`/api/ca/client-portal/view?token=${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); setLoading(false) })
      .catch(() => { setError("Failed to load. Please try again."); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500">Loading your portal...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border rounded-2xl p-8 max-w-md text-center shadow-sm">
        <p className="text-4xl mb-4">🔒</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Access Error</h1>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  )

  const { invite, firm, clients, filings } = data

  const statusColor = (s: string) => {
    if (s === "filed" || s === "completed") return "bg-green-50 text-green-700"
    if (s === "in_progress") return "bg-blue-50 text-blue-700"
    if (s === "pending") return "bg-amber-50 text-amber-700"
    return "bg-gray-100 text-gray-600"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{firm?.name}</h1>
            <p className="text-xs text-gray-500">Client Portal — {invite.client_name}</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>{firm?.email}</p>
            <p>{firm?.phone}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Welcome */}
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Welcome, {invite.client_name}</h2>
          <p className="text-sm text-gray-500">Here's the current status of your filings managed by {firm?.name}.</p>
        </div>

        {/* GST Filings */}
        {filings.gst.length > 0 && (
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">GST Filings</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>{["Return Type", "Period", "Due Date", "Filed Date", "Status"].map(h => <th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filings.gst.map((f: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2 font-medium">{f.return_type}</td>
                    <td className="px-4 py-2 text-gray-500">{f.period}</td>
                    <td className="px-4 py-2 text-gray-500">{f.due_date}</td>
                    <td className="px-4 py-2 text-gray-500">{f.filed_date || "—"}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(f.status)}`}>{f.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ITR Filings */}
        {filings.itr.length > 0 && (
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">ITR Filings</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>{["AY", "Form", "Due Date", "Filed Date", "Status", "Refund"].map(h => <th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filings.itr.map((f: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2 font-medium">{f.assessment_year}</td>
                    <td className="px-4 py-2 text-gray-500">{f.itr_form}</td>
                    <td className="px-4 py-2 text-gray-500">{f.due_date}</td>
                    <td className="px-4 py-2 text-gray-500">{f.filed_date || "—"}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(f.status)}`}>{f.status}</span></td>
                    <td className="px-4 py-2 text-green-700">{f.refund_amount > 0 ? `₹${Number(f.refund_amount).toLocaleString("en-IN")}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TDS Filings */}
        {filings.tds.length > 0 && (
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">TDS Filings</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>{["Form", "Quarter", "Due Date", "Filed Date", "Status"].map(h => <th key={h} className="px-4 py-2 text-left">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filings.tds.map((f: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2 font-medium">{f.form_type}</td>
                    <td className="px-4 py-2 text-gray-500">{f.quarter}</td>
                    <td className="px-4 py-2 text-gray-500">{f.due_date}</td>
                    <td className="px-4 py-2 text-gray-500">{f.filed_date || "—"}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(f.status)}`}>{f.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filings.gst.length === 0 && filings.itr.length === 0 && filings.tds.length === 0 && (
          <div className="bg-white border rounded-xl px-5 py-10 text-center text-gray-400">
            <p className="text-2xl mb-2">📋</p>
            <p className="text-sm">No filing records found yet. Your CA will update this as filings are completed.</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          This portal is maintained by {firm?.name} · {firm?.email} · Data updated in real time
        </p>
      </div>
    </div>
  )
}
