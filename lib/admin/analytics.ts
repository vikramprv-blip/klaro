import { prisma } from "@/lib/prisma";

/* =========================
   TYPES
========================= */

export type MetricCount = { count: number };
export type Revenue = { coalesce: number };

export type PlanRow = {
  plan: string;
  users: number;
  active: number;
  revenue: number;
};

export type AIStats = {
  total_calls: number;
  tokens: number;
  cost: number;
};

export type TopUser = {
  user_email: string;
  calls: number;
};

export type Customer = {
  email: string;
  plan: string;
  payment_status: string;
  expires_at: string;
};

/* =========================
   METRICS
========================= */

export async function getMetrics() {
  const users = await prisma.$queryRawUnsafe<MetricCount[]>(`
    SELECT COUNT(*)::int AS count FROM auth.users
  `);

  const paid = await prisma.$queryRawUnsafe<MetricCount[]>(`
    SELECT COUNT(*)::int AS count
    FROM public.user_billing
    WHERE payment_status = 'PAID'
  `);

  const active = await prisma.$queryRawUnsafe<MetricCount[]>(`
    SELECT COUNT(*)::int AS count
    FROM public.user_billing
    WHERE status = 'active'
  `);

  const revenue = await prisma.$queryRawUnsafe<Revenue[]>(`
    SELECT COALESCE(SUM(amount),0)::int AS coalesce
    FROM public.payment_events
    WHERE status = 'success'
  `);

  return {
    users: users[0]?.count || 0,
    paid: paid[0]?.count || 0,
    active: active[0]?.count || 0,
    revenue: revenue[0]?.coalesce || 0,
  };
}

/* =========================
   PLAN BREAKDOWN
========================= */

export async function getPlanBreakdown(): Promise<PlanRow[]> {
  return prisma.$queryRawUnsafe<PlanRow[]>(`
    SELECT
      plan,
      COUNT(*)::int AS users,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)::int AS active,
      COALESCE(SUM(amount),0)::int AS revenue
    FROM public.user_billing
    LEFT JOIN public.payment_events
      ON user_billing.user_id = payment_events.user_id
    GROUP BY plan
    ORDER BY users DESC
  `);
}

/* =========================
   AI USAGE
========================= */

export async function getAIStats(): Promise<AIStats> {
  const result = await prisma.$queryRawUnsafe<AIStats[]>(`
    SELECT
      COUNT(*)::int AS total_calls,
      COALESCE(SUM(tokens_used),0)::int AS tokens,
      COALESCE(SUM(cost),0)::int AS cost
    FROM ai_audit_events
  `);

  return result[0] || { total_calls: 0, tokens: 0, cost: 0 };
}

/* =========================
   TOP USERS
========================= */

export async function getTopUsers(): Promise<TopUser[]> {
  return prisma.$queryRawUnsafe<TopUser[]>(`
    SELECT
      user_email,
      COUNT(*)::int AS calls
    FROM ai_audit_events
    GROUP BY user_email
    ORDER BY calls DESC
    LIMIT 5
  `);
}

/* =========================
   RECENT CUSTOMERS
========================= */

export async function getRecentCustomers(): Promise<Customer[]> {
  return prisma.$queryRawUnsafe<Customer[]>(`
    SELECT
      email,
      plan,
      payment_status,
      expires_at
    FROM public.user_billing
    ORDER BY expires_at DESC
    LIMIT 10
  `);
}

/* =========================
   AI COST ALERTS
========================= */

export async function getAICostAlerts() {
  return prisma.$queryRawUnsafe<{
    user_email: string;
    total_cost: number;
  }[]>(`
    SELECT
      user_email,
      COALESCE(SUM(cost),0)::int AS total_cost
    FROM ai_audit_events
    GROUP BY user_email
    HAVING SUM(cost) > 1000
    ORDER BY total_cost DESC
  `);
}
