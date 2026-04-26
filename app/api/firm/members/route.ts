import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await prisma.organization.findFirst({ where: { userId: user.id } });
  if (!org) return NextResponse.json({ members: [] });

  const employees = await prisma.employee.findMany({
    where: { orgId: org.id },
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, department: true, status: true,
      createdAt: true, branch: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ members: employees, orgId: org.id });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await prisma.organization.findFirst({ where: { userId: user.id } });
  if (!org) return NextResponse.json({ error: "No organization found" }, { status: 404 });

  const body = await req.json();
  const { name, email, phone, role, department } = body;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }

  const member = await prisma.employee.create({
    data: {
      name, email,
      phone: phone || null,
      role: role || "Staff",
      department: department || null,
      status: "active",
      orgId: org.id,
    },
  });

  await prisma.leaveBalance.create({
    data: {
      orgId: org.id,
      employeeId: member.id,
      casual: 12, sick: 12, earned: 15, holiday: 10,
      casualUsed: 0, sickUsed: 0, earnedUsed: 0,
      year: new Date().getFullYear(),
    },
  });

  return NextResponse.json({ ok: true, member });
}

export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, role, department, status } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const member = await prisma.employee.update({
    where: { id },
    data: {
      ...(role ? { role } : {}),
      ...(department ? { department } : {}),
      ...(status ? { status } : {}),
    },
  });

  return NextResponse.json({ ok: true, member });
}

export async function DELETE(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.employee.update({ where: { id }, data: { status: "inactive" } });
  return NextResponse.json({ ok: true });
}
