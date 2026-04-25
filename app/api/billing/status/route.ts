import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const rows = await prisma.$queryRaw<Array<{ plan: string; status: string; expires_at: Date }>>`
    SELECT plan, status, expires_at
    FROM public.user_billing
    WHERE email = ${email}
    LIMIT 1
  `;

  if (!rows.length) {
    return NextResponse.json({ plan: "free", status: "inactive" });
  }

  const billing = rows[0];

  const isActive =
    billing.status === "active" &&
    billing.expires_at &&
    new Date(billing.expires_at) > new Date();

  return NextResponse.json({
    plan: billing.plan,
    status: isActive ? "active" : "expired",
    expires_at: billing.expires_at,
  });
}
