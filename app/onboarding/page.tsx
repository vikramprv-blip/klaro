"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const [vertical, setVertical] = useState("lawyer");
  const [form, setForm] = useState({
    firm_name: "", admin_name: "", email: "", phone: "",
    address: "", city: "", state: "", pincode: "",
    gst_number: "", bar_council: ""
  });
  const [saving, setSaving] = useState(false);

  const isLawyer = vertical === "lawyer";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token || ""}`
      },
      body: JSON.stringify({ ...form, vertical }),
    });
    setSaving(false);
    if (!res.ok) { alert("Failed to setup workspace"); return; }
    window.location.href = "/post-login";
  }

  const fields = [
    { key: "firm_name",   label: isLawyer ? "Law Firm Name *" : "CA Firm Name *", required: true },
    { key: "admin_name",  label: "Your Name *", required: true },
    { key: "email",       label: "Firm Email" },
    { key: "phone",       label: "Phone" },
    { key: "address",     label: "Address" },
    { key: "city",        label: "City" },
    { key: "state",       label: "State" },
    { key: "pincode",     label: "Pincode" },
    { key: "gst_number",  label: "GST Number" },
    ...(isLawyer ? [{ key: "bar_council", label: "Bar Council Reg. No." }] : []),
  ];

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10 bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 bg-white border rounded-2xl p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Setup your workspace</h1>
          <p className="text-sm text-gray-500 mt-1">Tell us about your firm to get started</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">I am a</label>
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={vertical}
            onChange={e => setVertical(e.target.value)}
          >
            <option value="lawyer">Lawyer / Law Firm</option>
            <option value="ca">CA / Accountant</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {fields.map(f => (
            <div key={f.key} className={f.key === "firm_name" || f.key === "address" ? "col-span-2" : ""}>
              <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={(form as any)[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                required={f.required}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {saving ? "Setting up..." : "Continue →"}
        </button>
      </form>
    </main>
  );
}
