import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const email = String(formData.get("email") || "").trim();
  const days = Number(formData.get("days") || 30);

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Find the user in auth.users
  const targetUser = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `SELECT id FROM auth.users WHERE email = $1 LIMIT 1`, email
  );

  if (!targetUser.length) {
    return NextResponse.json({ error: `User ${email} not found` }, { status: 404 });
  }

  const userId = targetUser[0].id;
  const paidUntil = new Date();
  paidUntil.setDate(paidUntil.getDate() + days);

  // Upsert billing record
  await prisma.$queryRawUnsafe(`
    INSERT INTO public.user_billing (user_id, payment_status, paid_until, trial_ends_at, created_at)
    VALUES ($1, 'PAID', $2, $2, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      payment_status = 'PAID',
      paid_until = $2
  `, userId, paidUntil);

  // Redirect back to admin with success message
  return NextResponse.redirect(
    new URL(`/admin?granted=${email}&days=${days}`, req.url)
  );
}
