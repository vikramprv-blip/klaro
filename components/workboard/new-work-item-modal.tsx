"use client";

import { useState  } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  clients: any[];
  users: any[];
  onCreated: (item: any) => void;
};

export default function NewWorkItemModal({
  open,
  onClose,
  clients,
  users,
  onCreated,
}: Props) {
  const [form, setForm] = useState({
    title: "",
    filingType: "",
    periodLabel: "",
    dueDate: "",
    priority: "medium",
    clientId: "",
    createdById: users[0]?.id || "",
  });
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/work-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate
            ? new Date(form.dueDate).toISOString()
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      onCreated({
        ...data.item,
        owner: null,
        docsTotal: 0,
        docsUploaded: 0,
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Could not create work item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">New Work Item</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            required
            placeholder="Title"
            className="w-full rounded-xl border px-3 py-2"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />

          <input
            required
            placeholder="Filing Type"
            className="w-full rounded-xl border px-3 py-2"
            value={form.filingType}
            onChange={(e) =>
              setForm((p) => ({ ...p, filingType: e.target.value }))
            }
          />

          <input
            placeholder="Period Label"
            className="w-full rounded-xl border px-3 py-2"
            value={form.periodLabel}
            onChange={(e) =>
              setForm((p) => ({ ...p, periodLabel: e.target.value }))
            }
          />

          <input
            type="date"
            className="w-full rounded-xl border px-3 py-2"
            value={form.dueDate}
            onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
          />

          <select
            required
            className="w-full rounded-xl border px-3 py-2"
            value={form.clientId}
            onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}
          >
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-black px-4 py-2 text-sm text-white"
            >
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
