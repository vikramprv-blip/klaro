"use client";

import { useEffect, useState } from "react";

const fields = [
  ["companyName", "Company / Firm Name", true],
  ["legalName", "Legal Name", false],
  ["gstin", "GSTIN", false],
  ["pan", "PAN", false],
  ["email", "Billing Email", true],
  ["phone", "Phone", true],
  ["whatsappNumber", "WhatsApp Sender Number", false],
  ["addressLine1", "Address Line 1", true],
  ["addressLine2", "Address Line 2", false],
  ["city", "City", true],
  ["state", "State", true],
  ["pincode", "PIN Code", true],
  ["country", "Country", false],
  ["invoicePrefix", "Invoice Prefix", false],
] as const;

export default function CompanySettingsPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/company-settings")
      .then((r) => r.json())
      .then((data) => {
        const settings = data.settings || {};
        setForm({
          companyName: settings.companyName || "",
          legalName: settings.legalName || "",
          gstin: settings.gstin || "",
          pan: settings.pan || "",
          email: settings.email || "",
          phone: settings.phone || "",
          whatsappNumber: settings.whatsappNumber || "",
          addressLine1: settings.addressLine1 || "",
          addressLine2: settings.addressLine2 || "",
          city: settings.city || "",
          state: settings.state || "",
          pincode: settings.pincode || "",
          country: settings.country || "India",
          invoicePrefix: settings.invoicePrefix || "INV",
          invoiceNotes: settings.invoiceNotes || "",
        });
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving...");

    const res = await fetch("/api/company-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setStatus(res.ok ? "Company settings saved." : "Could not save company settings.");
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Company Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          This identity is used for invoice headers, WhatsApp sender details, and compliance records.
        </p>
      </div>

      <form onSubmit={save} className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(([name, label, required]) => (
            <label key={name} className="text-sm font-medium text-gray-700">
              {label}
              {required ? " *" : ""}
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={form[name] || ""}
                required={required}
                onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
              />
            </label>
          ))}
        </div>

        <label className="mt-4 block text-sm font-medium text-gray-700">
          Invoice Notes / Compliance Footer
          <textarea
            className="mt-1 min-h-24 w-full rounded-xl border px-3 py-2"
            value={form.invoiceNotes || ""}
            onChange={(e) => setForm((prev) => ({ ...prev, invoiceNotes: e.target.value }))}
          />
        </label>

        <div className="mt-6 flex items-center gap-4">
          <button className="rounded-xl bg-black px-5 py-2 text-white" type="submit">
            Save Company Settings
          </button>
          <span className="text-sm text-gray-600">{status}</span>
        </div>
      </form>
    </main>
  );
}
