import { NextResponse } from "next/server";
import { queueComplianceWhatsappReminders } from "@/lib/whatsapp/queue-compliance-reminders";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);

  if (secret && url.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await queueComplianceWhatsappReminders();

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
