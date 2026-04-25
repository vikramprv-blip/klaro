export async function logHRAudit(event: {
  type: string
  message: string
  orgId?: string
  meta?: any
}) {
  console.log("[HR_AUDIT]", {
    type: event.type,
    message: event.message,
    orgId: event.orgId || null,
    meta: event.meta || {},
  })
}
