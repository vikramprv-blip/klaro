import { prisma } from "@/lib/prisma"

export async function matchFollowupOwner(owner: string | null | undefined) {
  if (!owner || !owner.trim()) {
    return { assignedToId: null, matchedUser: null, confidence: "none" as const }
  }

  const q = owner.trim().toLowerCase()

  const users = await prisma.users.findMany({
    select: {
      id: true,
      email: true,
    },
    orderBy: {
      created_at: "asc",
    },
  })

  const exact = users.find((user) => {
    const email = user.email?.trim().toLowerCase()
    return email === q
  })

  if (exact) {
    return {
      assignedToId: exact.id,
      matchedUser: {
        id: exact.id,
        name: null,
        email: exact.email,
      },
      confidence: "high" as const,
    }
  }

  const partial = users.find((user) => {
    const email = user.email?.trim().toLowerCase() || ""
    return email.includes(q) || q.includes(email)
  })

  if (partial) {
    return {
      assignedToId: partial.id,
      matchedUser: {
        id: partial.id,
        name: null,
        email: partial.email,
      },
      confidence: "medium" as const,
    }
  }

  return { assignedToId: null, matchedUser: null, confidence: "none" as const }
}
