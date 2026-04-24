"use client";

import { useEffect, useState } from "react";

type Invoice = {
  id: string;
  number: string;
  amount: number;
  status: string;
  dueDate?: string | null;
  clientId?: string | null;
  createdAt: string;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);

  async function loadInvoices() {
    const res = await fetch("/api/invoices", { cache: "no-store" });
    const data = await res.json();
    setInvoices(Array.isArray(data) ? data : []);
  }

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), status }),
    });

    setAmount("");
    setStatus("draft");
    await loadInvoices();
    setLoading(false);
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Invoices</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and track client invoices for Klaro.
          </p>
        </div>

        <form
          onSubmit={createInvoice}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <input
              className="rounded-xl border px-4 py-3 text-sm"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              type="number"
            />

            <select
              className="rounded-xl border px-4 py-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>

            <button
              disabled={loading}
              className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create invoice"}
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t">
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {invoice.number}
                  </td>
                  <td className="px-5 py-4">₹{invoice.amount}</td>
                  <td className="px-5 py-4 capitalize">{invoice.status}</td>
                  <td className="px-5 py-4 text-gray-500">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {invoices.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-500">
                    No invoices yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
