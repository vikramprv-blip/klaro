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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (body.confirm !== "DELETE MY ACCOUNT") {
    return NextResponse.json({ error: "Confirmation text does not match" }, { status: 400 });
  }

  try {
    const org = await prisma.organization.findFirst({ where: { userId: user.id } });

    if (org) {
      // Delete in order to avoid FK violations
      await prisma.timeEntry.deleteMany({ where: { orgId: org.id } });
      await prisma.leaveRequest.deleteMany({ where: { orgId: org.id } });
      await prisma.leaveBalance.deleteMany({ where: { orgId: org.id } });
      await prisma.attendance.deleteMany({ where: { orgId: org.id } });
      await prisma.employee.deleteMany({ where: { orgId: org.id } });
      await prisma.branch.deleteMany({ where: { orgId: org.id } });
      await prisma.workItem.deleteMany({ where: { organizationId: org.id } });
      await prisma.client.deleteMany({ where: { organizationId: org.id } });
      await prisma.organization.delete({ where: { id: org.id } });
    }

    await prisma.companySettings.deleteMany({ where: { userId: user.id } });
    await prisma.user_billing.deleteMany({ where: { user_id: user.id as any } });

    // Sign out
    await supabase.auth.signOut();

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
