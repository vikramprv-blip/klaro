import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ ok: true, message: "Auto-followups cron placeholder" }); }
export async function POST() { return NextResponse.json({ ok: true, queued: 0 }); }
