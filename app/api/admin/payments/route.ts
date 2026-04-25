import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const secret = req.headers.get("x-klaro-admin-secret");
    if (!process.env.KLARO_ADMIN_SECRET || secret !== process.env.KLARO_ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payments = await prisma.$queryRaw`
      SELECT id, email, plan, amount_paise, upi_ref, status, notes, created_at, verified_at, expires_at
      FROM public.upi_payment_requests
      ORDER BY created_at DESC
      LIMIT 100
    `;

    return NextResponse.json({ payments });
  } catch (err) {
    console.error("Admin payments error", err);
    return NextResponse.json({ error: "Failed to load payments" }, { status: 500 });
  }
}
