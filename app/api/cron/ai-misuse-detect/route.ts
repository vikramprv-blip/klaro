import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await prisma.$executeRawUnsafe(`SELECT public.detect_ai_misuse();`);
  return NextResponse.json({ success: true });
}
