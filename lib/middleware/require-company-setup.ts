import { prisma } from "@/lib/prisma";

export async function requireCompanySetup(userId: string) {
  const company = await prisma.companySettings.findUnique({
    where: { userId },
    select: {
      companyName: true,
      email: true,
      phone: true,
      addressLine1: true,
      city: true,
      state: true,
      pincode: true,
    },
  });

  const isComplete =
    company &&
    company.companyName &&
    company.email &&
    company.phone &&
    company.addressLine1 &&
    company.city &&
    company.state &&
    company.pincode;

  return Boolean(isComplete);
}
