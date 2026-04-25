import { prisma } from "@/lib/prisma";

export async function hasActivePlan(email: string) {
  if (!email) return false;

  const rows = await prisma.$queryRaw<Array<{
    payment_status: string;
    expires_at: Date | null;
  }>>`
    SELECT payment_status, expires_at
    FROM public.user_billing
    WHERE email = ${email}
    LIMIT 1
  `;

  if (!rows.length) return false;

  const billing = rows[0];

  return (
    billing.payment_status === "PAID" &&
    billing.expires_at &&
    new Date(billing.expires_at) > new Date()
  );
}
