type Props = {
  q: string
  status: string
  priority: string
  assigneeId: string
  onClear: () => void
}

export function WorkItemActiveFilters({
  q,
  status,
  priority,
  assigneeId,
  onClear,
}: Props) {
  const active = [
    q && `Search: ${q}`,
    status !== "all" && `Status: ${status}`,
    priority !== "all" && `Priority: ${priority}`,
    assigneeId !== "all" && "Assignee filter",
  ].filter(Boolean)

  if (active.length === 0) return null

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {active.map((item, i) => (
        <span key={i} className="rounded-md border px-2 py-1 text-xs">
          {item}
        </span>
      ))}
      <button onClick={onClear} className="text-xs underline opacity-70">
        Clear all
      </button>
    </div>
  )
}
