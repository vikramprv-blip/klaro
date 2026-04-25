"use client";

import { useEffect, useState } from "react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/invoices");
    const data = await res.json();
    setInvoices(data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Number</th>
            <th className="p-2">Client</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Due</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-t">
              <td className="p-2">{inv.invoice_number}</td>
              <td className="p-2">{inv.ca_clients?.name || "-"}</td>
              <td className="p-2">₹{inv.total_amount}</td>
              <td className="p-2">
                {inv.status}
                {inv.isOverdue && <span className="text-red-500 ml-2">OVERDUE</span>}
              </td>
              <td className="p-2">
                {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
