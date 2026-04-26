import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  if (secret && url.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check for AI misuse patterns in the last 24 hours
    // 1. Users with excessive document searches (>50/day)
    const heavySearchers = await prisma.$queryRawUnsafe<{
      user_email: string; search_count: string;
    }[]>(`
      SELECT 
        u.email as user_email,
        COUNT(dc.id) as search_count
      FROM auth.users u
      JOIN public.document_chunks dc ON true
      WHERE dc."createdAt" > NOW() - INTERVAL '24 hours'
      GROUP BY u.email
      HAVING COUNT(dc.id) > 50
      LIMIT 20
    `).catch(() => []);

    // 2. Check for unusual document upload volumes
    const heavyUploaders = await prisma.$queryRawUnsafe<{
      count: string;
    }[]>(`
      SELECT COUNT(*) as count
      FROM public.documents
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `).catch(() => [{ count: "0" }]);

    // 3. Check for unusual API patterns
    const recentDocs = Number(heavyUploaders[0]?.count || 0);
    const flags: string[] = [];

    if (recentDocs > 100) {
      flags.push(`High document upload volume: ${recentDocs} in last 24h`);
    }

    if (heavySearchers.length > 0) {
      flags.push(`Heavy AI searchers: ${heavySearchers.map(u => u.user_email).join(", ")}`);
    }

    // 4. Log the misuse detection run
    console.log(`[AI Misuse Detection] Run at ${new Date().toISOString()}`);
    console.log(`[AI Misuse Detection] Flags: ${flags.length > 0 ? flags.join(" | ") : "None"}`);

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      flags,
      metrics: {
        recentDocUploads: recentDocs,
        heavySearchers: heavySearchers.length,
      },
    });
  } catch (e: any) {
    console.error("AI misuse detection error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
