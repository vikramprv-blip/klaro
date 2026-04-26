import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ payment_status: string; paid_until: Date | null }>>(
      `SELECT payment_status, paid_until FROM public.user_billing
       JOIN auth.users ON auth.users.id = public.user_billing.user_id
       WHERE auth.users.email = $1 LIMIT 1`,
      email
    );

    if (!rows.length) {
      return NextResponse.json({ plan: "free", status: "inactive" });
    }

    const billing = rows[0];
    const isActive =
      billing.payment_status === "PAID" &&
      billing.paid_until &&
      new Date(billing.paid_until) > new Date();

    return NextResponse.json({
      plan: billing.payment_status,
      status: isActive ? "active" : "expired",
      expires_at: billing.paid_until,
    });
  } catch (e) {
    return NextResponse.json({ plan: "free", status: "inactive" });
  }
}
