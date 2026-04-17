"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export default function NewClientPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    gstin: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        companyName: form.companyName.trim() || undefined,
        gstin: form.gstin.trim() || undefined,
      }

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to create client")
      }

      router.push("/clients")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">New Client</h1>
          <p className="text-sm text-neutral-600">
            Create a client so it can be selected from work items.
          </p>
        </div>

        <Link href="/clients" className="rounded-md border px-3 py-2 text-sm">
          Back to Clients
        </Link>
      </div>

      <form onSubmit={onSubmit} className="rounded-xl border p-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Client name</span>
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-md border px-3 py-2"
            placeholder="AIM Holdings LLP"
            required
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
              placeholder="accounts@client.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Phone</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
              placeholder="+91 98765 43210"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Company name</span>
            <input
              value={form.companyName}
              onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
              placeholder="AIM Holdings LLP"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">GSTIN</span>
            <input
              value={form.gstin}
              onChange={(e) => setForm((prev) => ({ ...prev, gstin: e.target.value }))}
              className="w-full rounded-md border px-3 py-2"
              placeholder="22AAAAA0000A1Z5"
            />
          </label>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <Link href="/clients" className="rounded-md border px-4 py-2 text-sm">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create client"}
          </button>
        </div>
      </form>
    </div>
  )
}
