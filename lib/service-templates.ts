import { prisma } from "@/lib/prisma"

export async function getServiceTemplates() {
  return prisma.serviceTemplate.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  })
}
