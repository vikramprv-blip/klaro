import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import WorkItemStatusBadge from "./work-item-status-badge";

export default function WorkItemCard({
  item,
  onClick,
}: {
  item: any;
  onClick?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: "work-item",
      item,
      status: item.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue =
    item.dueDate && new Date(item.dueDate).getTime() < Date.now() && item.status !== "FILED";

  return (
    <motion.button
      layout
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={onClick}
      {...attributes}
      {...listeners}
      className={`w-full rounded-3xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isDragging ? "opacity-60 ring-2 ring-black/10" : ""
      }`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-start justify-between gap-3" data-work-item data-id={item.id}>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-900">{item.title}</h3>
          <p className="mt-1 truncate text-xs text-zinc-500">{item.client.name}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <WorkItemStatusBadge status={item.status} />
          {item.priority ? (
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] uppercase text-zinc-600">
              {item.priority}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-600">
        <div className="rounded-2xl bg-zinc-50 px-3 py-2">
          <div className="text-[11px] text-zinc-400">Type</div>
          <div className="mt-1 truncate">{item.filingType}</div>
        </div>

        <div className="rounded-2xl bg-zinc-50 px-3 py-2">
          <div className="text-[11px] text-zinc-400">Period</div>
          <div className="mt-1 truncate">{item.periodLabel || "—"}</div>
        </div>

        <div className={`rounded-2xl px-3 py-2 ${overdue ? "bg-rose-50" : "bg-zinc-50"}`}>
          <div className={`text-[11px] ${overdue ? "text-rose-400" : "text-zinc-400"}`}>Due</div>
          <div className={`mt-1 ${overdue ? "text-rose-700" : ""}`}>{formatDate(item.dueDate)}</div>
        </div>

        <div className="rounded-2xl bg-zinc-50 px-3 py-2">
          <div className="text-[11px] text-zinc-400">Owner</div>
          <div className="mt-1 truncate">{item.owner?.name || "Unassigned"}</div>
        </div>

        <div className="rounded-2xl bg-zinc-50 px-3 py-2">
          <div className="text-[11px] text-zinc-400">Documents</div>
          <div className="mt-1">
            {item.docsUploaded}/{item.docsTotal}
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-50 px-3 py-2">
          <div className="text-[11px] text-zinc-400">Invoice</div>
          <div className="mt-1 truncate">{item.invoice?.status || "—"}</div>
        </div>
      </div>
    </motion.button>
  );
}
