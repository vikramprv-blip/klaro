import { prisma } from "@/lib/prisma";

export type CompanyIdentity = {
  companyName: string;
  legalName: string | null;
  gstin: string | null;
  pan: string | null;
  email: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  invoicePrefix: string;
  invoiceNotes: string | null;
};

export async function getCompanyIdentity(userId: string): Promise<CompanyIdentity | null> {
  return prisma.companySettings.findUnique({
    where: { userId },
    select: {
      companyName: true,
      legalName: true,
      gstin: true,
      pan: true,
      email: true,
      phone: true,
      whatsappNumber: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      pincode: true,
      country: true,
      invoicePrefix: true,
      invoiceNotes: true,
    },
  });
}

export async function isCompanySetupComplete(userId: string) {
  const company = await getCompanyIdentity(userId);

  return Boolean(
    company?.companyName &&
      company?.email &&
      company?.phone &&
      company?.addressLine1 &&
      company?.city &&
      company?.state &&
      company?.pincode
  );
}
