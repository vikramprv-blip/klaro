import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n || 0);
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  if (user.email !== process.env.ADMIN_EMAIL) redirect("/in/ca");

  // Total users
  const usersRes = await prisma.$queryRawUnsafe<{ count: string }[]>(
    `SELECT COUNT(*) as count FROM auth.users`
  );
  const totalUsers = Number(usersRes[0]?.count || 0);

  // Paid users
  const paidRes = await prisma.$queryRawUnsafe<{ count: string }[]>(
    `SELECT COUNT(*) as count FROM public.user_billing WHERE payment_status = 'PAID'`
  );
  const paidUsers = Number(paidRes[0]?.count || 0);

  // Free users
  const freeUsers = totalUsers - paidUsers;

  // Revenue estimate
  const revenueRes = await prisma.$queryRawUnsafe<{ total: string }[]>(`
    SELECT COALESCE(SUM(
      CASE
        WHEN payment_status = 'PAID' THEN 999
        ELSE 0
      END
    ), 0) as total
    FROM public.user_billing
  `);
  const revenue = Number(revenueRes[0]?.total || 0);

  // Recent signups
  const recentUsers = await prisma.$queryRawUnsafe<{
    email: string; created_at: string;
  }[]>(`
    SELECT email, created_at
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 10
  `);

  // User billing details
  const billingUsers = await prisma.$queryRawUnsafe<{
    user_id: string; payment_status: string; paid_until: string; created_at: string;
  }[]>(`
    SELECT user_id, payment_status, paid_until, created_at
    FROM public.user_billing
    ORDER BY created_at DESC
    LIMIT 20
  `);

  // Organization count
  const orgsRes = await prisma.$queryRawUnsafe<{ count: string }[]>(
    `SELECT COUNT(*) as count FROM public."Organization"`
  );
  const totalOrgs = Number(orgsRes[0]?.count || 0);

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Klaro Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Only accessible to {process.env.ADMIN_EMAIL}</p>
        </div>
        <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-medium">
          🔒 Admin Only
        </span>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Users", value: totalUsers, color: "blue" },
          { label: "Paid Users", value: paidUsers, color: "green" },
          { label: "Free Users", value: freeUsers, color: "gray" },
          { label: "Organisations", value: totalOrgs, color: "purple" },
          { label: "Est. Revenue", value: fmt(revenue), color: "emerald" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border shadow-sm p-5">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Free Access Grant */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-1">Grant Free Access</h2>
        <p className="text-sm text-gray-500 mb-4">Give a user free paid access for 30, 60, or 90 days</p>
        <FreeAccessForm />
      </div>

      {/* Recent Signups */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-4">Recent Signups</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">Email</th>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">Signed Up</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recentUsers.map((u, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 text-gray-400">
                  {new Date(u.created_at).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Billing Status */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-4">Billing Overview</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">User ID</th>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">Status</th>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">Paid Until</th>
              <th className="px-4 py-2 text-left text-gray-500 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {billingUsers.map((u, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-400">
                  {u.user_id.slice(0, 8)}...
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.payment_status === "PAID"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {u.payment_status}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {u.paid_until
                    ? new Date(u.paid_until).toLocaleDateString("en-IN")
                    : "—"}
                </td>
                <td className="px-4 py-2 text-gray-400">
                  {new Date(u.created_at).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Usage */}
      <AIUsageSection />

      {/* Quick Links */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/api/ca/compliance/generate" target="_blank"
            className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50">
            🔄 Generate Compliance Tasks
          </a>
          <a href="/api/cron/ai-misuse-detect" target="_blank"
            className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50">
            🤖 Run AI Misuse Detection
          </a>
          <a href="/api/cron/auto-followups" target="_blank"
            className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50">
            📨 Run Auto Follow-ups
          </a>
        </div>
      </div>
    </main>
  );
}

async function AIUsageSection() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : "http://localhost:3000"}/api/admin/ai-usage`, {
      cache: "no-store",
      headers: { "Cookie": "" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-4">AI Usage — Voyage AI</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="border rounded-xl p-4">
            <p className="text-xs text-gray-500">Total Documents</p>
            <p className="text-2xl font-bold">{data.totalDocuments}</p>
          </div>
          <div className="border rounded-xl p-4">
            <p className="text-xs text-gray-500">Indexed Chunks</p>
            <p className="text-2xl font-bold">{data.totalChunks}</p>
          </div>
          <div className="border rounded-xl p-4">
            <p className="text-xs text-gray-500">Last 7 Days</p>
            <p className="text-2xl font-bold">{data.recentDocuments}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">Model: {data.voyageModel}</p>
      </div>
    );
  } catch {
    return null;
  }
}

function FreeAccessForm() {
  return (
    <form action="/api/admin/grant-access" method="POST" className="flex gap-3 items-end flex-wrap">
      <div>
        <label className="text-xs text-gray-500 block mb-1">User Email</label>
        <input name="email" type="email" required
          className="border rounded-xl px-3 py-2 text-sm w-64"
          placeholder="user@example.com" />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Duration</label>
        <select name="days" className="border rounded-xl px-3 py-2 text-sm">
          <option value="30">30 days</option>
          <option value="60">60 days</option>
          <option value="90">90 days</option>
        </select>
      </div>
      <button type="submit"
        className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium">
        Grant Access
      </button>
    </form>
  );
}
