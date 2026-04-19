export async function createNotification(input: {
  userId: string
  title: string
  body?: string | null
}) {
  // TEMP: Notification system not implemented in current schema
  console.log("Notification:", input)

  return {
    ok: true,
  }
}
