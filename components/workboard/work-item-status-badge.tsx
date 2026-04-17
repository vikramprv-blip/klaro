export default function WorkItemStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
    REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
    FILED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const label =
    status === "IN_PROGRESS"
      ? "In Progress"
      : status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[status] || "bg-zinc-50 text-zinc-700 border-zinc-200"}`}
    >
      {label}
    </span>
  );
}
