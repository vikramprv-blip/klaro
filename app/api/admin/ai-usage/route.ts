import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Document chunks = AI indexed content
    const chunksRes = await prisma.$queryRawUnsafe<{ count: string }[]>(
      `SELECT COUNT(*) as count FROM public.document_chunks`
    ).catch(() => [{ count: "0" }]);

    // Documents uploaded
    const docsRes = await prisma.$queryRawUnsafe<{ count: string }[]>(
      `SELECT COUNT(*) as count FROM public.documents`
    ).catch(() => [{ count: "0" }]);

    // Recent document activity (last 7 days)
    const recentRes = await prisma.$queryRawUnsafe<{ count: string }[]>(
      `SELECT COUNT(*) as count FROM public.documents WHERE created_at > NOW() - INTERVAL '7 days'`
    ).catch(() => [{ count: "0" }]);

    // Top document categories
    const categoriesRes = await prisma.$queryRawUnsafe<{ doc_category: string; count: string }[]>(
      `SELECT doc_category, COUNT(*) as count FROM public.documents GROUP BY doc_category ORDER BY count DESC LIMIT 10`
    ).catch(() => []);

    return NextResponse.json({
      totalChunks: Number(chunksRes[0]?.count || 0),
      totalDocuments: Number(docsRes[0]?.count || 0),
      recentDocuments: Number(recentRes[0]?.count || 0),
      categories: categoriesRes,
      voyageModel: process.env.VOYAGE_EMBED_MODEL || "voyage-3-large",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
