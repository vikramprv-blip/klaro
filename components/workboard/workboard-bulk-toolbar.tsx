"use client"

type UserOption = {
  id: string
  name: string | null
  email: string | null
}

type Props = {
  selectedCount: number
  assignees: UserOption[]
  onClear: () => void
  onBulkStatus: (value: string) => void
  onBulkPriority: (value: string) => void
  onBulkAssignee: (value: string) => void
  onBulkArchive: () => void
}

export function WorkboardBulkToolbar({
  selectedCount,
  assignees,
  onClear,
  onBulkStatus,
  onBulkPriority,
  onBulkAssignee,
  onBulkArchive,
}: Props) {
  if (selectedCount === 0) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-3">
      <div className="mr-2 text-sm font-medium">{selectedCount} selected</div>

      <select
        defaultValue=""
        onChange={(e) => {
          if (!e.target.value) return
          onBulkStatus(e.target.value)
          e.currentTarget.value = ""
        }}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        <option value="">Change status</option>
        <option value="BACKLOG">Backlog</option>
        <option value="TODO">Todo</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>

      <select
        defaultValue=""
        onChange={(e) => {
          if (!e.target.value) return
          onBulkPriority(e.target.value)
          e.currentTarget.value = ""
        }}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        <option value="">Change priority</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>

      <select
        defaultValue=""
        onChange={(e) => {
          if (!e.target.value) return
          onBulkAssignee(e.target.value)
          e.currentTarget.value = ""
        }}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        <option value="">Assign to</option>
        <option value="__unassign__">Unassign</option>
        {assignees.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name || user.email || "Unknown"}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onBulkArchive}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        Archive selected
      </button>

      <button
        type="button"
        onClick={onClear}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        Clear
      </button>
    </div>
  )
}
