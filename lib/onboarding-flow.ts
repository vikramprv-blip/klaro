import { prisma } from "@/lib/prisma";

export async function isFirmUser(userId: string) {
  const org = await prisma.organization.findFirst({
    where: { userId },
    select: { plan: true },
  });

  return ["partner", "firm"].includes(String(org?.plan || "").toLowerCase());
}
