import { prisma } from "@/lib/prisma"

export async function createNotification(input: {
  userId: string
  title: string
  body?: string | null
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      body: input.body ?? null,
    },
  })
}
