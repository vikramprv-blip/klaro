import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const PLAN_DAYS: Record<string, number> = {
  starter: 30,
  pro: 30,
  business: 30,
};

export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-klaro-admin-secret");
    if (!process.env.KLARO_ADMIN_SECRET || secret !== process.env.KLARO_ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const paymentRequestId = String(body.paymentRequestId || body.id || "");
    const upiRef = String(body.upiRef || body.utr || "").trim();
    const status = String(body.status || "verified").toLowerCase();

    if (!paymentRequestId || !["verified", "failed", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<Array<{ id: string; email: string; plan: string }>>`
      UPDATE public.upi_payment_requests
      SET
        status = ${status},
        upi_ref = NULLIF(${upiRef}, ''),
        verified_at = CASE WHEN ${status} = 'verified' THEN now() ELSE verified_at END
      WHERE id = ${paymentRequestId}::uuid
      RETURNING id, email, plan
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
    }

    const payment = rows[0];

    if (status === "verified") {
      const days = PLAN_DAYS[payment.plan] || 30;

      await prisma.$queryRaw`
        INSERT INTO public.user_billing (email, plan, status, started_at, expires_at)
        VALUES (${payment.email}, ${payment.plan}, 'active', now(), now() + (${days} || ' days')::interval)
        ON CONFLICT (email)
        DO UPDATE SET
          plan = EXCLUDED.plan,
          status = 'active',
          started_at = now(),
          expires_at = now() + (${days} || ' days')::interval,
          updated_at = now()
      `;
    }

    return NextResponse.json({ ok: true, payment });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
