import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(n || 0);
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  if (user.email !== process.env.ADMIN_EMAIL) redirect("/in/ca");

  // ---- CORE METRICS ----
  const users = await prisma.$queryRawUnsafe<{ count: number }[]>(`SELECT COUNT(*)::int AS users::int AS count FROM auth.users`);
  const paid = await prisma.$queryRawUnsafe<{ count: number }[]>(`SELECT COUNT(*)::int AS users::int FROM user_billing WHERE payment_status='PAID'`);
  const active = await prisma.$queryRawUnsafe<{ count: number }[]>(`SELECT COUNT(*)::int AS users::int FROM user_billing WHERE status='active'`);

  const revenue = await prisma.$queryRawUnsafe<{ coalesce: number }[]>(`
    SELECT COALESCE(SUM(
      CASE
        WHEN plan='solo' THEN 1999
        WHEN plan='partner' THEN 9999
        WHEN plan='firm' THEN 23598.82
        ELSE 0
      END
    ),0)
    FROM user_billing
    WHERE payment_status='PAID'
  `);

  // ---- PLAN BREAKDOWN ----
  const plans = await prisma.$queryRawUnsafe<{ plan: string; users: number; active: number; revenue: number }[]>(`
    SELECT plan,
      COUNT(*)::int AS users AS users,
      COUNT(*)::int AS users FILTER (WHERE status='active') AS active,
      SUM(
        CASE
          WHEN plan='solo' THEN 1999
          WHEN plan='partner' THEN 9999
          WHEN plan='firm' THEN 23598.82
          ELSE 0
        END
      ) AS revenue
    FROM user_billing
    GROUP BY plan
  `);

  // ---- AI AUDIT ----
  const ai = await prisma.$queryRawUnsafe<{ cost: number, total_calls: number, tokens: number }[]>(`
    SELECT
      COUNT(*)::int AS users AS total_calls,
      COALESCE(SUM(total_tokens),0) AS tokens,
      COALESCE(SUM(estimated_cost),0) AS cost
    FROM ai_audit_events
  `);

  // ---- TOP USERS (AI usage) ----
  const topUsers = await prisma.$queryRawUnsafe<{ user_email: string; calls: number }[]>(`
    SELECT user_email, COUNT(*)::int AS users AS calls
    FROM ai_audit_events
    GROUP BY user_email
    ORDER BY calls DESC
    LIMIT 5
  `);

  // ---- RECENT USERS ----
  const customers = await prisma.$queryRawUnsafe<{ email: string; plan: string; payment_status: string; expires_at: string }[]>(`
    SELECT email, plan, payment_status, expires_at
    FROM user_billing
    ORDER BY expires_at DESC
    LIMIT 10
  `);

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold">Klaro Admin</h1>

      {/* METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card label="Users" value={users[0].count} />
        <Card label="Paid" value={paid[0].count} />
        <Card label="Active" value={active[0].count} />
        <Card label="Revenue" value={formatMoney(revenue[0].coalesce)} />
        <Card label="AI Cost" value={formatMoney(ai[0].cost)} />
      </div>

      {/* PLAN BREAKDOWN */}
      <Section title="Plan Breakdown">
        <Table headers={["Plan", "Users", "Active", "Revenue"]}>
          {plans.map((p: any) => (
            <tr key={p.plan}>
              <td>{p.plan}</td>
              <td>{p.users}</td>
              <td>{p.active}</td>
              <td>{formatMoney(p.revenue)}</td>
            </tr>
          ))}
        </Table>
      </Section>

      {/* AI USAGE */}
      <Section title="AI Usage">
        <div className="grid grid-cols-3 gap-4">
          <Card label="Calls" value={ai[0].total_calls} />
          <Card label="Tokens" value={ai[0].tokens} />
          <Card label="Cost" value={formatMoney(ai[0].cost)} />
        </div>
      </Section>

      {/* TOP USERS */}
      <Section title="Top AI Users">
        <Table headers={["User", "Calls"]}>
          {topUsers.map((u: any) => (
            <tr key={u.user_email}>
              <td>{u.user_email}</td>
              <td>{u.calls}</td>
            </tr>
          ))}
        </Table>
      </Section>

      {/* CUSTOMERS */}
      <Section title="Recent Customers">
        <Table headers={["Email", "Plan", "Payment", "Expiry"]}>
          {customers.map((c: any) => (
            <tr key={c.email}>
              <td>{c.email}</td>
              <td>{c.plan}</td>
              <td>{c.payment_status}</td>
              <td>{new Date(c.expires_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </Table>
      </Section>
    </main>
  );
}

function Card({ label, value }: any) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Table({ headers, children }: any) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-100">
        <tr>{headers.map((h: string) => <th key={h} className="p-2 text-left">{h}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
