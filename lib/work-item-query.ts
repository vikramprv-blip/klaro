export type WorkItemQuery = {
  q?: string
  status?: string
  priority?: string
  assigneeId?: string
}

export function buildWorkItemsQuery(params: WorkItemQuery) {
  const qs = new URLSearchParams()

  if (params.q?.trim()) qs.set("q", params.q.trim())
  if (params.status && params.status !== "all") qs.set("status", params.status)
  if (params.priority && params.priority !== "all") qs.set("priority", params.priority)
  if (params.assigneeId && params.assigneeId !== "all") qs.set("assigneeId", params.assigneeId)

  const query = qs.toString()
  return query ? `/api/work-items?${query}` : "/api/work-items"
}
