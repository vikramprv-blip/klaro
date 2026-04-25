import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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
    const notes = body.notes ? String(body.notes) : null;

    if (!paymentRequestId || !["verified", "failed", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<Array<{ id: string; email: string | null; plan: string }>>`
      UPDATE public.upi_payment_requests
      SET
        status = ${status},
        upi_ref = NULLIF(${upiRef}, ''),
        notes = ${notes},
        verified_at = CASE WHEN ${status} = 'verified' THEN now() ELSE verified_at END
      WHERE id = ${paymentRequestId}::uuid
      RETURNING id, email, plan
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
    }

    await prisma.$queryRaw`
      INSERT INTO public.upi_payment_events (payment_request_id, event_type, payload)
      VALUES (${paymentRequestId}::uuid, ${status}, ${JSON.stringify(body)}::jsonb)
    `;

    return NextResponse.json({ ok: true, payment: rows[0] });
  } catch (err) {
    console.error("UPI webhook error", err);
    return NextResponse.json({ error: "Failed to process UPI webhook" }, { status: 500 });
  }
}
