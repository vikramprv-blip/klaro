"use client";

export default function MarkBlockedButton({ docId }: { docId: string }) {
  async function markBlocked() {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const res = await fetch("/api/us/documents/block", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: docId,
        blocked_by: "client",
        due_date: dueDate.toISOString(),
      }),
    });

    if (!res.ok) {
      alert("Could not mark as blocked");
      return;
    }

    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={markBlocked}
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
    >
      Mark blocked
    </button>
  );
}
