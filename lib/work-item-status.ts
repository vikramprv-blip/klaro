export const WORK_ITEM_STATUSES = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "DONE",
] as const

export type WorkItemStatus = (typeof WORK_ITEM_STATUSES)[number]

export function getStatusLabel(status: string) {
  switch (status) {
    case "BACKLOG":
      return "Backlog"
    case "TODO":
      return "Todo"
    case "IN_PROGRESS":
      return "In Progress"
    case "DONE":
      return "Done"
    default:
      return status
  }
}
