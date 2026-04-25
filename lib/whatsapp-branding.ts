import { prisma } from "@/lib/prisma";

export async function getWhatsAppSender(userId: string) {
  const company = await prisma.companySettings.findUnique({
    where: { userId },
    select: { whatsappNumber: true },
  });

  return company?.whatsappNumber || "";
}
