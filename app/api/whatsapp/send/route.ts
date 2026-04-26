import { NextRequest, NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/twilio";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json({ error: "phone and message required" }, { status: 400 });
    }

    const result = await sendWhatsApp(phone, message);
    if (result.ok) {
      return NextResponse.json({ ok: true, sid: result.sid });
    }
    return NextResponse.json({ error: result.error }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
