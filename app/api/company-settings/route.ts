import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";


async function getCurrentUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("klaro_user_id")?.value || cookieStore.get("user_id")?.value || null;
}

function clean(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { requireCompany } = await import("@/lib/server/require-company");
    await requireCompany(userId);
  } catch (e) {
    return Response.json({ error: "COMPANY_SETUP_REQUIRED" }, { status: 403 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.companySettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  return NextResponse.json({ settings });
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { requireCompany } = await import("@/lib/server/require-company");
    await requireCompany(userId);
  } catch (e) {
    return Response.json({ error: "COMPANY_SETUP_REQUIRED" }, { status: 403 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const companyName = clean(body.companyName);
  if (!companyName) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const settings = await prisma.companySettings.upsert({
    where: { userId },
    update: {
      companyName,
      legalName: clean(body.legalName),
      gstin: clean(body.gstin),
      pan: clean(body.pan),
      email: clean(body.email),
      phone: clean(body.phone),
      whatsappNumber: clean(body.whatsappNumber),
      addressLine1: clean(body.addressLine1),
      addressLine2: clean(body.addressLine2),
      city: clean(body.city),
      state: clean(body.state),
      pincode: clean(body.pincode),
      country: clean(body.country) || "India",
      invoicePrefix: clean(body.invoicePrefix) || "INV",
      invoiceNotes: clean(body.invoiceNotes),
    },
    create: {
      userId,
      companyName,
      legalName: clean(body.legalName),
      gstin: clean(body.gstin),
      pan: clean(body.pan),
      email: clean(body.email),
      phone: clean(body.phone),
      whatsappNumber: clean(body.whatsappNumber),
      addressLine1: clean(body.addressLine1),
      addressLine2: clean(body.addressLine2),
      city: clean(body.city),
      state: clean(body.state),
      pincode: clean(body.pincode),
      country: clean(body.country) || "India",
      invoicePrefix: clean(body.invoicePrefix) || "INV",
      invoiceNotes: clean(body.invoiceNotes),
    },
  });

  return NextResponse.json({ settings });
}
