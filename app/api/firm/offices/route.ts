import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function getOrgId() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const org = await prisma.organization.findFirst({ where: { userId: user.id } });
  return org?.id || null;
}

export async function GET() {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const offices = await prisma.branch.findMany({
    where: { orgId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ offices });
}

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, address, city, state, lat, lng, radiusMeters } = body;

  if (!name) return NextResponse.json({ error: "Office name required" }, { status: 400 });

  const office = await prisma.branch.create({
    data: {
      orgId, name,
      address: address || null,
      city: city || null,
      state: state || null,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      radiusMeters: Number(radiusMeters || 200),
      isActive: true,
    },
  });

  return NextResponse.json({ ok: true, office });
}

export async function PATCH(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const office = await prisma.branch.update({
    where: { id },
    data: {
      ...(updates.name ? { name: updates.name } : {}),
      ...(updates.address !== undefined ? { address: updates.address } : {}),
      ...(updates.city !== undefined ? { city: updates.city } : {}),
      ...(updates.state !== undefined ? { state: updates.state } : {}),
      ...(updates.lat !== undefined ? { lat: Number(updates.lat) } : {}),
      ...(updates.lng !== undefined ? { lng: Number(updates.lng) } : {}),
      ...(updates.radiusMeters ? { radiusMeters: Number(updates.radiusMeters) } : {}),
      ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {}),
    },
  });

  return NextResponse.json({ ok: true, office });
}

export async function DELETE(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.branch.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
