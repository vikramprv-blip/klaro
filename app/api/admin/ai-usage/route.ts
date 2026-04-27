import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || 100);
  const feature = searchParams.get("feature");

  let query = supabase
    .from("ai_usage_log")
    .select("*, firms(name, slug)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (feature) query = query.eq("feature", feature);

  const { data: logs } = await query;

  // Aggregates
  const { data: allLogs } = await supabase
    .from("ai_usage_log")
    .select("feature, model, tokens_used, cost_inr, created_at");

  const totalCalls = allLogs?.length || 0;
  const totalTokens = allLogs?.reduce((s, l) => s + (l.tokens_used || 0), 0) || 0;
  const totalCost = allLogs?.reduce((s, l) => s + Number(l.cost_inr || 0), 0) || 0;

  const byFeature: Record<string, { calls: number; tokens: number; cost: number }> = {};
  allLogs?.forEach(l => {
    if (!byFeature[l.feature]) byFeature[l.feature] = { calls: 0, tokens: 0, cost: 0 };
    byFeature[l.feature].calls++;
    byFeature[l.feature].tokens += l.tokens_used || 0;
    byFeature[l.feature].cost += Number(l.cost_inr || 0);
  });

  // Last 7 days by day
  const byDay: Record<string, number> = {};
  allLogs?.forEach(l => {
    const day = l.created_at?.slice(0, 10);
    if (day) byDay[day] = (byDay[day] || 0) + 1;
  });

  return NextResponse.json({
    logs: logs || [],
    totalCalls,
    totalTokens,
    totalCost,
    byFeature,
    byDay,
    voyageModel: process.env.VOYAGE_EMBED_MODEL || "voyage-3-large",
  });
}
