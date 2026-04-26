import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, upiRef, plan, userId } = body;

    if (!paymentId || !upiRef) {
      return NextResponse.json({ error: "paymentId and upiRef required" }, { status: 400 });
    }

    // Update payment request with UPI ref
    await prisma.$queryRawUnsafe(`
      UPDATE public.upi_payment_requests
      SET upi_ref = $1, status = 'pending_verification', updated_at = NOW()
      WHERE id = $2
    `, upiRef, paymentId);

    // Log the verification attempt
    await prisma.$queryRawUnsafe(`
      INSERT INTO public.upi_payment_events (payment_request_id, event_type, payload)
      VALUES ($1, 'verification_requested', $2)
    `, paymentId, JSON.stringify({ upiRef, plan, userId }));

    // Auto-approve for now (manual verification by admin)
    // In production, integrate with payment gateway webhook
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    if (userId) {
      await prisma.$queryRawUnsafe(`
        INSERT INTO public.user_billing (user_id, payment_status, paid_until, created_at)
        VALUES ($1, 'PAID', $2, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          payment_status = 'PAID',
          paid_until = $2
      `, userId, expiresAt);
    }

    // Mark payment as verified
    await prisma.$queryRawUnsafe(`
      UPDATE public.upi_payment_requests
      SET status = 'verified', verified_at = NOW()
      WHERE id = $1
    `, paymentId);

    return NextResponse.json({ ok: true, expiresAt });
  } catch (e: any) {
    console.error("Payment verify error", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
