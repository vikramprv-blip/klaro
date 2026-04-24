"use client";

import { useState } from "react";

export default function OnboardingPage() {
  const [firm, setFirm] = useState("");
  const [client, setClient] = useState("");
  const [vertical, setVertical] = useState("ca");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firm, client, vertical }),
    });

    if (!res.ok) {
      alert("Failed to setup workspace");
      return;
    }

    window.location.href = "/post-login";
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 border rounded-2xl p-6">
        <h1 className="text-2xl font-semibold">Setup your workspace</h1>

        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Firm name"
          value={firm}
          onChange={(e) => setFirm(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="First client name (e.g. ABC Pvt Ltd)"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          required
        />

        <select
          className="w-full border rounded-lg px-3 py-2"
          value={vertical}
          onChange={(e) => setVertical(e.target.value)}
        >
          <option value="ca">CA / Accountant</option>
          <option value="lawyer">Lawyer</option>
        </select>

        <button className="w-full bg-black text-white py-2 rounded-lg">
          Continue
        </button>
      </form>
    </main>
  );
}
