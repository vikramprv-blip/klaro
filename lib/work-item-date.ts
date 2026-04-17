export function formatDueDate(value?: string | Date | null) {
  if (!value) return "No due date"

  const date = typeof value === "string" ? new Date(value) : value

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function toDateInputValue(value?: string | Date | null) {
  if (!value) return ""

  const date = typeof value === "string" ? new Date(value) : value
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")

  return `${yyyy}-${mm}-${dd}`
}

export function isOverdue(value?: string | Date | null) {
  if (!value) return false

  const date = typeof value === "string" ? new Date(value) : value
  const now = new Date()

  return date.getTime() < now.getTime()
}
