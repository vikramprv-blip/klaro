export type WorkItemViewPreset = {
  id: string
  label: string
  query: {
    q?: string
    status?: string
    priority?: string
    assigneeId?: string
  }
}

export const WORK_ITEM_VIEW_PRESETS: WorkItemViewPreset[] = [
  {
    id: "all",
    label: "All",
    query: {},
  },
  {
    id: "backlog",
    label: "Backlog",
    query: { status: "BACKLOG" },
  },
  {
    id: "todo",
    label: "Todo",
    query: { status: "TODO" },
  },
  {
    id: "in-progress",
    label: "In Progress",
    query: { status: "IN_PROGRESS" },
  },
  {
    id: "done",
    label: "Done",
    query: { status: "DONE" },
  },
  {
    id: "high-priority",
    label: "High Priority",
    query: { priority: "HIGH" },
  },
  {
    id: "urgent",
    label: "Urgent",
    query: { priority: "URGENT" },
  },
]
