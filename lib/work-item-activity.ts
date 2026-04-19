type LogArgs = {
  workItemId: string
  type: string
  message: string
  meta?: Record<string, unknown>
}

export async function logWorkItemActivity({
  workItemId,
  type,
  message,
  meta,
}: LogArgs) {
  try {
    console.log("Work item activity:", {
      workItemId,
      type,
      message,
      meta: meta ?? null,
    })
  } catch (error) {
    console.error("Failed to log work item activity", error)
  }
}
