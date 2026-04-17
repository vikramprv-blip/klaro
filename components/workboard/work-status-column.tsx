import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import WorkItemCard from "./work-item-card";

export default function WorkStatusColumn({
  title,
  statusKey,
  items,
  onSelectItem,
}: {
  title: string;
  statusKey: string;
  items: any[];
  onSelectItem: (item: any) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: statusKey,
    data: {
      type: "column",
      status: statusKey,
    },
  });

  return (
    <motion.div
      layout
      ref={setNodeRef}
      className={`rounded-3xl border p-4 transition ${
        isOver ? "border-black/30 bg-zinc-100 shadow-sm" : "border-zinc-200 bg-zinc-50/80"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        <span className="rounded-full border bg-white px-2.5 py-1 text-xs text-zinc-500">
          {items.length}
        </span>
      </div>

      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.length ? (
            items.map((item) => (
              <WorkItemCard
                key={item.id}
                item={item}
                onClick={() => onSelectItem(item)}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed bg-white p-4 text-sm text-zinc-400">
              Drop items here
            </div>
          )}
        </div>
      </SortableContext>
    </motion.div>
  );
}
