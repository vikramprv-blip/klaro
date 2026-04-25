"use client";

import { useEffect, useState } from "react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [audit, setAudit] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [reminderCount, setReminderCount] = useState(0);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [form, setForm] = useState({
    client_id: "",
    amount: "",
    service_type: "Professional Services",
    gst_rate: "18",
    due_date: "",
    payment_method: "",
  });

  async function load() {
    const [invRes, clientRes, summaryRes, auditRes, reminderRes, analyticsRes] = await Promise.all([
      fetch("/api/invoices"),
      fetch("/api/ca/clients"),
      fetch("/api/invoices/summary"),
      fetch("/api/invoices/audit"),
      fetch("/api/invoices/reminders/preview"),
      fetch("/api/invoices/analytics"),
    ]);

    setInvoices(await invRes.json());
    setClients(await clientRes.json());
    setSummary(await summaryRes.json());
    const auditData = await auditRes.json();
    setAudit(auditData.audit || []);

    const reminderData = await reminderRes.json();
    setReminders(reminderData.invoices || []);
    setReminderCount(reminderData.count || 0);

    const analyticsData = await analyticsRes.json();
    setAnalytics(analyticsData || []);
  }

  async function createInvoice() {
    await fetch("/api/invoices", {
      method: "POST",
      body: JSON.stringify({
        client_id: form.client_id,
        amount: Number(form.amount),
        service_type: form.service_type,
        gst_rate: Number(form.gst_rate || 18),
        due_date: form.due_date || null,
        payment_method: form.payment_method || null,
      }),
    });

    setForm({
      client_id: "",
      amount: "",
      service_type: "Professional Services",
      gst_rate: "18",
      due_date: "",
      payment_method: "",
    });
    load();
  }

  async function queueReminders() {
    const res = await fetch("/api/invoices/reminders", {
      method: "POST",
    });
    const data = await res.json();
    alert(`Overdue found: ${data.overdueFound}\nReminders queued: ${data.remindersQueued}`);
    load();
  }

  async function markPaid(id: string) {
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "paid",
        paid_date: new Date().toISOString(),
      }),
    });

    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex gap-2">
          <a
            href="/api/invoices/export"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Export CSV
          </a>
          <button
            onClick={queueReminders}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Queue Overdue WhatsApp Reminders
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border rounded p-4">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-xl font-bold">₹{summary.totalAmount}</div>
            <div className="text-xs">{summary.totalInvoices} invoices</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-500">Paid</div>
            <div className="text-xl font-bold">₹{summary.paidAmount}</div>
            <div className="text-xs">{summary.paidInvoices} invoices</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-500">Unpaid</div>
            <div className="text-xl font-bold">₹{summary.unpaidAmount}</div>
            <div className="text-xs">{summary.unpaidInvoices} invoices</div>
          </div>
          <div className="border rounded p-4 bg-red-50">
            <div className="text-sm text-gray-500">Overdue</div>
            <div className="text-xl font-bold">₹{summary.overdueAmount}</div>
            <div className="text-xs">{summary.overdueInvoices} invoices</div>
          </div>
        </div>
      )}

      {analytics.length > 0 && (
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3">Revenue vs Collection</h2>
          <div className="space-y-1 text-sm">
            {analytics.slice(-6).map((a) => (
              <div key={a.month}>
                {a.month} → Invoiced: ₹{a.invoiced} | Collected: ₹{a.collected}
              </div>
            ))}
          </div>
        </div>
      )}

      {reminderCount > 0 && (
        <div className="border rounded p-4 bg-blue-50">
          <h2 className="font-semibold mb-3">
            Upcoming WhatsApp Reminders ({reminderCount})
          </h2>
          <div className="space-y-2">
            {reminders.slice(0,5).map((r) => (
              <div key={r.id} className="text-sm border p-2 rounded">
                {r.invoiceNumber} · {r.clientName} · ₹{r.amount}
                {!r.canSendWhatsApp && (
                  <span className="text-red-500 ml-2">(No phone)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {audit.length > 0 && (
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3">AI Invoice Risk Audit</h2>
          <div className="space-y-2">
            {audit
              .filter((a) => a.riskLevel !== "LOW")
              .slice(0, 5)
              .map((a) => (
                <div key={a.invoiceId} className="border rounded p-3 bg-yellow-50">
                  <div className="font-medium">
                    {a.invoiceNumber} · {a.client} · ₹{a.amount}
                  </div>
                  <div className="text-sm">
                    Risk: {a.riskLevel} · {a.risks.join(", ")}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* CREATE */}
      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-2">Create Invoice</h2>

        <select
          value={form.client_id}
          onChange={(e) => setForm({ ...form, client_id: e.target.value })}
          className="border p-2 mr-2"
        >
          <option value="">Select Client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="border p-2 mr-2"
        />

        <input
          placeholder="Service Type"
          value={form.service_type}
          onChange={(e) => setForm({ ...form, service_type: e.target.value })}
          className="border p-2 mr-2"
        />

        <input
          placeholder="GST %"
          value={form.gst_rate}
          onChange={(e) => setForm({ ...form, gst_rate: e.target.value })}
          className="border p-2 mr-2 w-24"
        />

        <input
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          className="border p-2 mr-2"
        />

        <select
          value={form.payment_method}
          onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
          className="border p-2 mr-2"
        >
          <option value="">Payment Mode</option>
          <option value="upi">UPI</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
          <option value="cheque">Cheque</option>
        </select>

        <button
          onClick={createInvoice}
          className="bg-black text-white px-4 py-2"
        >
          Create
        </button>
      </div>

      {/* LIST */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Number</th>
            <th className="p-2">Client</th>
            <th className="p-2">Service</th>
            <th className="p-2">Base</th>
            <th className="p-2">GST</th>
            <th className="p-2">Total</th>
            <th className="p-2">Status</th>
            <th className="p-2">Due</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr
              key={inv.id}
              className={`border-t ${
                inv.isOverdue ? "bg-red-50" : ""
              }`}
            >
              <td className="p-2">{inv.invoice_number}</td>
              <td className="p-2">{inv.ca_clients?.name || "-"}</td>
              <td className="p-2">{inv.service_type || "-"}</td>
              <td className="p-2">₹{inv.amount}</td>
              <td className="p-2">₹{inv.gst_amount}</td>
              <td className="p-2">₹{inv.total_amount}</td>
              <td className="p-2">{inv.status}</td>
              <td className="p-2">
                {inv.due_date
                  ? new Date(inv.due_date).toLocaleDateString()
                  : "-"}
              </td>
              <td className="p-2">
                {inv.status !== "paid" && (
                  <button
                    onClick={() => markPaid(inv.id)}
                    className="bg-green-600 text-white px-3 py-1"
                  >
                    Mark Paid
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
