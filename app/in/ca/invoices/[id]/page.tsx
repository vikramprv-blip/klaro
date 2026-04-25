"use client";

import { useEffect, useState } from "react";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { id } = await params;
      const res = await fetch(`/api/invoices/${id}`);
      setInvoice(await res.json());
    }
    load();
  }, [params]);

  if (!invoice) return <div className="p-6">Loading invoice...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold">Invoice</h1>
          <p className="text-gray-500">{invoice.invoice_number}</p>
        </div>
        <button onClick={() => window.print()} className="bg-black text-white px-4 py-2 rounded">
          Print / Save PDF
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold">Bill To</h2>
          <p>{invoice.ca_clients?.name || "Unknown Client"}</p>
          <p>{invoice.ca_clients?.email || ""}</p>
          <p>{invoice.ca_clients?.gstin ? `GSTIN: ${invoice.ca_clients.gstin}` : ""}</p>
        </div>

        <div className="text-right">
          <p>Status: <b>{invoice.status}</b></p>
          <p>Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "-"}</p>
          <p>Paid: {invoice.paid_date ? new Date(invoice.paid_date).toLocaleDateString() : "-"}</p>
        </div>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Service</th>
            <th className="p-3 text-right">Amount</th>
            <th className="p-3 text-right">GST</th>
            <th className="p-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-3">{invoice.service_type || "Professional Services"}</td>
            <td className="p-3 text-right">₹{invoice.amount}</td>
            <td className="p-3 text-right">₹{invoice.gst_amount}</td>
            <td className="p-3 text-right font-bold">₹{invoice.total_amount}</td>
          </tr>
        </tbody>
      </table>

      {invoice.notes && (
        <div>
          <h2 className="font-semibold">Notes</h2>
          <p>{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
