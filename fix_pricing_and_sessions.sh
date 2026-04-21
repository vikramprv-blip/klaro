#!/bin/bash
REPO=~/klaro-services

echo "=== Fix 1: Pricing ₹299 → ₹499 ==="
python3 << 'PYEOF'
path = "/Users/Vikram/klaro-services/app/pricing/page.tsx"
content = open(path).read()
content = content.replace('price: "₹299"', 'price: "₹499"')
content = content.replace('"₹299"', '"₹499"')
open(path, "w").write(content)
print("Pricing fixed")
PYEOF

echo "=== Fix 2: Session limit middleware ==="
mkdir -p $REPO/app/api/auth/session

cat > $REPO/app/api/auth/session/route.ts << 'ROUTEOF'
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

const PLAN_LIMITS: Record<string, { max_sessions: number; max_clients: number; max_users: number }> = {
  personal:        { max_sessions: 1,  max_clients: 1,    max_users: 1  },
  ca_solo:         { max_sessions: 1,  max_clients: 25,   max_users: 1  },
  ca_practice:     { max_sessions: 10, max_clients: 150,  max_users: 10 },
  ca_firm:         { max_sessions: 50, max_clients: 9999, max_users: 50 },
  lawyer_solo:     { max_sessions: 1,  max_clients: 30,   max_users: 1  },
  lawyer_chamber:  { max_sessions: 10, max_clients: 200,  max_users: 10 },
  lawyer_firm:     { max_sessions: 50, max_clients: 9999, max_users: 50 },
}

// Register a new session — called on login
export async function POST(req: NextRequest) {
  try {
    const { user_id, session_token, device_info } = await req.json()
    if (!user_id || !session_token) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const ip = req.headers.get("x-forwarded-for") ?? "unknown"

    // Get user's plan
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("plan, max_sessions")
      .eq("user_id", user_id)
      .eq("status", "active")
      .single()

    const plan = sub?.plan ?? "personal"
    const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.personal
    const maxSessions = limits.max_sessions

    // Count active sessions (last active within 24h)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: sessions } = await supabaseAdmin
      .from("user_sessions")
      .select("id, session_token, last_active")
      .eq("user_id", user_id)
      .gte("last_active", since)
      .order("last_active", { ascending: false })

    const activeSessions = sessions ?? []

    if (activeSessions.length >= maxSessions) {
      // For solo/personal plans — kick oldest session
      if (maxSessions === 1) {
        await supabaseAdmin
          .from("user_sessions")
          .delete()
          .eq("user_id", user_id)
        // Allow new session (old one kicked)
      } else {
        return NextResponse.json({
          error: "session_limit_reached",
          message: `Your ${plan} plan allows ${maxSessions} concurrent sessions. Please sign out from another device first.`,
          active_count: activeSessions.length,
          max_sessions: maxSessions,
        }, { status: 403 })
      }
    }

    // Register new session
    await supabaseAdmin.from("user_sessions").upsert({
      user_id,
      session_token,
      device_info: device_info ?? "unknown",
      ip_address: ip,
      last_active: new Date().toISOString(),
    }, { onConflict: "session_token" })

    return NextResponse.json({ success: true, plan, limits })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Heartbeat — keep session alive
export async function PATCH(req: NextRequest) {
  try {
    const { session_token } = await req.json()
    await supabaseAdmin
      .from("user_sessions")
      .update({ last_active: new Date().toISOString() })
      .eq("session_token", session_token)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Sign out — remove session
export async function DELETE(req: NextRequest) {
  try {
    const { session_token } = await req.json()
    await supabaseAdmin.from("user_sessions").delete().eq("session_token", session_token)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
ROUTEOF

echo "=== Fix 3: SQL to run in Supabase ==="
cat << 'SQLEOF'
-- PASTE THIS IN SUPABASE SQL EDITOR AND RUN:

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan        text NOT NULL DEFAULT 'personal',
  vertical    text NOT NULL DEFAULT 'individual',
  max_users   int NOT NULL DEFAULT 1,
  max_clients int NOT NULL DEFAULT 1,
  status      text NOT NULL DEFAULT 'active',
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  device_info   text,
  ip_address    text,
  last_active   timestamptz DEFAULT now(),
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_subscription" ON public.subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_sessions" ON public.user_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
SQLEOF

echo "=== Building ==="
cd $REPO && npm run build 2>&1 | tail -5
