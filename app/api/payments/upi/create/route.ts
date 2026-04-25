import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const PLAN_PRICES: Record<string, number> = {
  trial: 0,
  starter: 99900,
  pro: 249900,
  business: 499900,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const plan = String(body.plan || "starter").trim().toLowerCase();
    const userId = body.userId ? String(body.userId) : null;
    const amountPaise = Number(body.amountPaise || PLAN_PRICES[plan] || PLAN_PRICES.starter);

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!Number.isFinite(amountPaise) || amountPaise < 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO public.upi_payment_requests (user_id, email, plan, amount_paise, status)
      VALUES (${userId}, ${email}, ${plan}, ${Math.round(amountPaise)}, 'pending')
      RETURNING id
    `;

    const id = rows[0].id;
    const upiId = process.env.KLARO_UPI_ID || "klaro@upi";
    const payee = encodeURIComponent(process.env.KLARO_UPI_NAME || "Klaro Services");
    const note = encodeURIComponent(`Klaro ${plan} ${id}`);
    const amount = (Math.round(amountPaise) / 100).toFixed(2);
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${payee}&am=${amount}&cu=INR&tn=${note}`;

    await prisma.$queryRaw`
      INSERT INTO public.upi_payment_events (payment_request_id, event_type, payload)
      VALUES (${id}::uuid, 'created', ${JSON.stringify({ email, plan, amountPaise, upiUrl })}::jsonb)
    `;

    return NextResponse.json({ id, status: "pending", amount, currency: "INR", upiId, upiUrl });
  } catch (err) {
    console.error("UPI create error", err);
    return NextResponse.json({ error: "Failed to create UPI payment request" }, { status: 500 });
  }
}
