import { prisma } from "@/lib/prisma";

export async function getOrganizationByUser(userId: string) {
  return prisma.organization.findFirst({
    where: { userId },
  });
}
