import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export async function requirePaidUser(userId: string) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      paymentStatus: true,
      paidUntil: true,
      trialEndsAt: true,
    },
  })

  const now = new Date()

  const hasPaidAccess =
    user?.paymentStatus === "PAID" &&
    (!user.paidUntil || user.paidUntil > now)

  const hasTrialAccess =
    user?.paymentStatus === "TRIAL" &&
    !!user.trialEndsAt &&
    user.trialEndsAt > now

  if (!hasPaidAccess && !hasTrialAccess) {
    redirect("/billing")
  }

  return user
}
