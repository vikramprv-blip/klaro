import WorkStatusColumn from "./work-status-column";

const STATUSES = [
  { key: "PENDING", label: "Pending" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "REVIEW", label: "Review" },
  { key: "FILED", label: "Filed" },
];

export default function WorkboardColumns({
  items,
  onSelectItem,
}: {
  items: any[];
  onSelectItem: (item: any) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {STATUSES.map((status) => (
        <WorkStatusColumn
          key={status.key}
          statusKey={status.key}
          title={status.label}
          items={items.filter((item) => item.status === status.key)}
          onSelectItem={onSelectItem}
        />
      ))}
    </div>
  );
}
