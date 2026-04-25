import { NextResponse } from "next/server";
import { hasActivePlan } from "@/lib/billing/check";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || "";

  const allowed = await hasActivePlan(email);

  if (!allowed) {
    return NextResponse.json(
      { error: "Payment required" },
      { status: 402 }
    );
  }

  return NextResponse.json({ ok: true, message: "Access granted" });
}
