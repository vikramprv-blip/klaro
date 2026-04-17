"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/utils";
import WorkItemStatusBadge from "./work-item-status-badge";

function labelForStatus(status: string) {
  if (status === "IN_PROGRESS") return "In Progress";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

const DOC_STATUS_ORDER = ["MISSING", "UPLOADED", "VERIFIED"] as const;

export default function WorkItemDrawer({
  item,
  open,
  onClose,
  users,
  onUpdated,
  onToast,
}: {
  item: any | null;
  open: boolean;
  onClose: () => void;
  users: any[];
  onUpdated: (item: any) => void;
  onToast?: (title: string, description?: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState("");

  const nextStatuses = useMemo(() => {
    if (!item) return [];
    const map: Record<string, string[]> = {
      PENDING: ["IN_PROGRESS"],
      IN_PROGRESS: ["REVIEW"],
      REVIEW: ["IN_PROGRESS", "FILED"],
      FILED: [],
    };
    return map[item.status] || [];
  }, [item]);

  if (!open || !item) return null;

  async function moveStatus(status: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/work-items/${item.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onUpdated(data.item);
      onToast?.("Status updated", `Moved to ${labelForStatus(status)}`);
    } catch {
      onToast?.("Update failed", "Could not update status");
    } finally {
      setBusy(false);
    }
  }

  async function assignOwner(userId: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/work-items/${item.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: "OWNER" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onUpdated(data.item);
      const user = users.find((u) => u.id === userId);
      onToast?.("Owner assigned", user ? `Assigned to ${user.name}` : undefined);
    } catch {
      onToast?.("Assignment failed", "Could not assign owner");
    } finally {
      setBusy(false);
    }
  }

  async function updateDocumentStatus(docId: string, currentStatus: string) {
    const currentIndex = DOC_STATUS_ORDER.indexOf(currentStatus as any);
    const nextStatus =
      DOC_STATUS_ORDER[(currentIndex + 1) % DOC_STATUS_ORDER.length] || "MISSING";

    setBusy(true);
    try {
      const res = await fetch(`/api/work-items/${item.id}/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onUpdated(data.item);
      onToast?.("Document updated", `Marked as ${nextStatus}`);
    } catch {
      onToast?.("Document update failed", "Could not update document");
    } finally {
      setBusy(false);
    }
  }

  async function triggerInvoice() {
    setBusy(true);
    try {
      const res = await fetch(`/api/work-items/${item.id}/invoice-trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: invoiceAmount ? Number(invoiceAmount) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onUpdated(data.item);
      onToast?.("Invoice ready", "Draft invoice created or updated");
    } catch {
      onToast?.("Invoice failed", "Could not trigger invoice");
    } finally {
      setBusy(false);
    }
  }

  const owner =
    item.assignments?.find((a: any) => a.role === "OWNER" && !a.unassignedAt)?.user ||
    item.owner ||
    null;

  const docsTotal = item.documents?.length ?? item.docsTotal ?? 0;
  const docsUploaded =
    item.documents?.filter((d: any) => d.status === "UPLOADED" || d.status === "VERIFIED")
      .length ?? item.docsUploaded ?? 0;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ x: 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 32, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b p-5">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{item.title}</h2>
                <p className="truncate text-sm text-zinc-500">{item.client?.name}</p>
              </div>
              <button onClick={onClose} className="rounded-2xl border px-3 py-2 text-sm">
                Close
              </button>
            </div>

            <div className="space-y-6 p-5">
              <section className="rounded-3xl border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">Overview</h3>
                  <div className="flex items-center gap-2">
                    <WorkItemStatusBadge status={item.status} />
                    {item.client?.id ? (
                      <Link
                        href={`/clients/${item.client.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View client
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-zinc-600">
                  <div className="rounded-2xl bg-zinc-50 p-3">
                    <div className="text-xs text-zinc-400">Type</div>
                    <div className="mt-1">{item.filingType}</div>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 p-3">
                    <div className="text-xs text-zinc-400">Period</div>
                    <div className="mt-1">{item.periodLabel || "—"}</div>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 p-3">
                    <div className="text-xs text-zinc-400">Due</div>
                    <div className="mt-1">{formatDate(item.dueDate)}</div>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 p-3">
                    <div className="text-xs text-zinc-400">Priority</div>
                    <div className="mt-1">{item.priority || "—"}</div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border p-4">
                <h3 className="mb-3 text-sm font-semibold">Assignment</h3>
                <div className="space-y-3">
                  <div className="text-sm text-zinc-600">
                    Current owner: <span className="font-medium text-zinc-900">{owner?.name || "Unassigned"}</span>
                  </div>

                  <select
                    className="w-full rounded-2xl border px-3 py-2 text-sm"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) assignOwner(e.target.value);
                    }}
                    disabled={busy}
                  >
                    <option value="">Assign owner</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="rounded-3xl border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Documents</h3>
                  <div className="text-sm text-zinc-600">
                    {docsUploaded}/{docsTotal} ready
                  </div>
                </div>

                <div className="space-y-2">
                  {(item.documents || []).length ? (
                    item.documents.map((doc: any) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => updateDocumentStatus(doc.id, doc.status)}
                        disabled={busy}
                        className="flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-sm hover:bg-zinc-50 disabled:opacity-50"
                      >
                        <span>{doc.name}</span>
                        <span className="text-zinc-500">{doc.status}</span>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed px-3 py-3 text-sm text-zinc-400">
                      No documents added yet
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs text-zinc-500">
                  Click any document to cycle status: MISSING → UPLOADED → VERIFIED
                </p>
              </section>

              <section className="rounded-3xl border p-4">
                <h3 className="mb-3 text-sm font-semibold">Move Status</h3>
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.length ? (
                    nextStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => moveStatus(status)}
                        disabled={busy}
                        className="rounded-2xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                      >
                        Move to {labelForStatus(status)}
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-zinc-500">No further actions available</div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border p-4">
                <h3 className="mb-3 text-sm font-semibold">Invoice</h3>

                {item.invoice ? (
                  <div className="space-y-2 text-sm text-zinc-600">
                    <div className="flex justify-between">
                      <span>Status</span>
                      <span>{item.invoice.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount</span>
                      <span>{item.invoice.amount ?? "—"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">Not triggered</div>
                )}

                {item.status === "FILED" ? (
                  <div className="mt-4 space-y-3">
                    <input
                      type="number"
                      placeholder="Invoice amount"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      className="w-full rounded-2xl border px-3 py-2 text-sm"
                    />
                    <button
                      onClick={triggerInvoice}
                      disabled={busy}
                      className="rounded-2xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {item.invoice ? "Update Invoice Draft" : "Trigger Invoice"}
                    </button>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-zinc-500">
                    Invoice becomes available after the work item is moved to FILED.
                  </p>
                )}
              </section>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
