export function formatWorkItemNotification(item: any) {
  return `${item.title} is overdue (${item.client?.name || "No client"})`
}
