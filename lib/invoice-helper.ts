import { prisma } from "@/lib/prisma";

export async function getCompanyDetails(userId: string) {
  const company = await prisma.companySettings.findUnique({
    where: { userId },
    select: {
      companyName: true,
      gstin: true,
      whatsappNumber: true,
    },
  });

  return company;
}
