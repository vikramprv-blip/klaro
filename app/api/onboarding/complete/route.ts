import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const body = await req.json();
  const { firm, client, vertical } = body;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  await prisma.organization.create({
    data: {
      userId: user.id,
      email: user.email || "",
      vertical,
      plan: "free",
    },
  });

  const createdClient = await prisma.client.create({
    data: {
      name: client || firm || "First Client",
      email: "",
    },
  });

  await prisma.workItem.create({
    data: {
      title: vertical === "ca" ? "File GST return" : "Review case file",
      description: "Auto-created to get you started",
      status: "TODO",
      clientId: createdClient.id,
    },
  });

  return NextResponse.json({ ok: true });
}
