import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendWhatsAppTemplate } from "@/lib/whatsapp/send-template";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);

  if (secret && url.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Number(url.searchParams.get("limit") || 20);

  const pending = await prisma.whatsappOutbox.findMany({
    where: {
      status: "pending",
      attempts: { lt: 3 },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const results = [];

  for (const item of pending) {
    try {
      const payload: any = item.payload || {};
      const sent = await sendWhatsAppTemplate({
        toPhone: item.toPhone,
        templateName: item.templateName,
        templateLang: item.templateLang,
        bodyParams: Array.isArray(payload.bodyParams) ? payload.bodyParams : [],
      });

      await prisma.whatsappOutbox.update({
        where: { id: item.id },
        data: {
          status: "sent",
          sentAt: new Date(),
          lastError: null,
          attempts: { increment: 1 },
        },
      });

      results.push({ id: item.id, status: "sent", response: sent });
    } catch (err: any) {
      await prisma.whatsappOutbox.update({
        where: { id: item.id },
        data: {
          attempts: { increment: 1 },
          lastError: err?.message || String(err),
          status: item.attempts + 1 >= 3 ? "failed" : "pending",
        },
      });

      results.push({ id: item.id, status: "failed", error: err?.message || String(err) });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
  });
}
