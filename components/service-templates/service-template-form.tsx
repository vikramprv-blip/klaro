"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const frequencies = ["ONCE", "MONTHLY", "QUARTERLY", "YEARLY"] as const

export default function ServiceTemplateForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    department: "Compliance",
    frequency: "MONTHLY",
    dueDayOfMonth: "11",
    dueMonthOfYear: "",
    isActive: true,
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/service-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        dueDayOfMonth: form.dueDayOfMonth ? Number(form.dueDayOfMonth) : null,
        dueMonthOfYear: form.dueMonthOfYear ? Number(form.dueMonthOfYear) : null,
      }),
    })

    setLoading(false)

    if (res.ok) {
      setForm({
        name: "",
        code: "",
        description: "",
        department: "Compliance",
        frequency: "MONTHLY",
        dueDayOfMonth: "11",
        dueMonthOfYear: "",
        isActive: true,
      })
      router.refresh()
      return
    }

    alert("Failed to create template")
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
      <div className="text-lg font-semibold">New Service Template</div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="rounded-xl border px-3 py-2"
          placeholder="Template name"
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
        />
        <input
          className="rounded-xl border px-3 py-2"
          placeholder="Code (optional)"
          value={form.code}
          onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
        />
        <input
          className="rounded-xl border px-3 py-2"
          placeholder="Department"
          value={form.department}
          onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))}
        />
        <select
          className="rounded-xl border px-3 py-2"
          value={form.frequency}
          onChange={(e) => setForm((s) => ({ ...s, frequency: e.target.value }))}
        >
          {frequencies.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <input
          className="rounded-xl border px-3 py-2 md:col-span-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
        />
        <input
          className="rounded-xl border px-3 py-2"
          placeholder="Due day of month"
          value={form.dueDayOfMonth}
          onChange={(e) => setForm((s) => ({ ...s, dueDayOfMonth: e.target.value }))}
        />
        <input
          className="rounded-xl border px-3 py-2"
          placeholder="Due month of year"
          value={form.dueMonthOfYear}
          onChange={(e) => setForm((s) => ({ ...s, dueMonthOfYear: e.target.value }))}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Template"}
      </button>
    </form>
  )
}
