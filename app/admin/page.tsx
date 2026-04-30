import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  if (!["vikramprv@gmail.com","siddharthcha@hotmail.com"].includes(user.email||"")) redirect("/in/lawyer");

  // ── Users ──────────────────────────────────────────────
  const { data: allUsers } = await supabase.auth.admin.listUsers();
  const totalUsers = allUsers?.users?.length || 0;
  const confirmedUsers = allUsers?.users?.filter(u => u.email_confirmed_at).length || 0;
  const unconfirmedUsers = totalUsers - confirmedUsers;
  const recentSignups = [...(allUsers?.users || [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 15);

  // ── Firms ──────────────────────────────────────────────
  const { data: firms } = await supabase.from("firms").select("*").order("created_at", { ascending: false });
  const totalFirms = firms?.length || 0;

  // ── Billing ────────────────────────────────────────────
  const { data: billing } = await supabase.from("firm_billing").select("*, firms(name, email, slug)").order("created_at", { ascending: false });
  const paidFirms = billing?.filter(b => b.plan !== "free" && b.status === "active").length || 0;
  const freeFirms = totalFirms - paidFirms;
  const totalRevenue = billing?.reduce((sum, b) => sum + Number(b.amount_inr || 0), 0) || 0;

  // ── Firm Members ───────────────────────────────────────
  const { data: members } = await supabase.from("firm_members").select("*, firms(name)").order("created_at", { ascending: false });

  // ── AI Usage ───────────────────────────────────────────
  const { data: aiLogs } = await supabase.from("ai_usage_log").select("*").order("created_at", { ascending: false }).limit(100);
  const totalAiCalls = aiLogs?.length || 0;
  const totalTokens = aiLogs?.reduce((sum, l) => sum + (l.tokens_used || 0), 0) || 0;
  const totalAiCost = aiLogs?.reduce((sum, l) => sum + Number(l.cost_inr || 0), 0) || 0;
  const aiByFeature: Record<string, number> = {};
  aiLogs?.forEach(l => { aiByFeature[l.feature] = (aiByFeature[l.feature] || 0) + 1; });

  // ── Actions ────────────────────────────────────────────
  const { data: actions } = await supabase.from("action_suggestions").select("status").limit(200);
  const pendingActions = actions?.filter(a => a.status === "pending").length || 0;
  const resolvedActions = actions?.filter(a => a.status === "resolved").length || 0;

  // ── Hearings ───────────────────────────────────────────
  const { data: hearings } = await supabase.from("legal_hearings").select("hearing_date").limit(200);
  const upcomingHearings = hearings?.filter(h => h.hearing_date && new Date(h.hearing_date) >= new Date()).length || 0;

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Klaro Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Logged in as {user.email}</p>
        </div>
        <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-medium">🔒 Admin Only</span>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: "Total Users",     value: totalUsers,       bg: "bg-blue-50",    text: "text-blue-700" },
          { label: "Confirmed",       value: confirmedUsers,   bg: "bg-green-50",   text: "text-green-700" },
          { label: "Unconfirmed",     value: unconfirmedUsers, bg: "bg-yellow-50",  text: "text-yellow-700" },
          { label: "Total Firms",     value: totalFirms,       bg: "bg-purple-50",  text: "text-purple-700" },
          { label: "Paid Firms",      value: paidFirms,        bg: "bg-emerald-50", text: "text-emerald-700" },
          { label: "Free Firms",      value: freeFirms,        bg: "bg-gray-100",   text: "text-gray-600" },
          { label: "Est. Revenue",    value: fmt(totalRevenue),bg: "bg-orange-50",  text: "text-orange-700" },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className={`${bg} rounded-2xl border border-white shadow-sm p-4`}>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${text}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Product Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "AI Calls (all time)", value: totalAiCalls,    icon: "🤖" },
          { label: "Pending Actions",     value: pendingActions,  icon: "⚡" },
          { label: "Upcoming Hearings",   value: upcomingHearings,icon: "⚖️" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4">
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Signups */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4">Recent Signups</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentSignups.map((u, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.email}</p>
                  <p className="text-xs text-gray-400">{timeAgo(u.created_at)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.email_confirmed_at ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                  {u.email_confirmed_at ? "✓ confirmed" : "pending"}
                </span>
              </div>
            ))}
            {recentSignups.length === 0 && <p className="text-gray-400 text-sm">No signups yet</p>}
          </div>
        </div>

        {/* Firms + Billing */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4">Firms & Plans</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {firms?.map((f, i) => {
              const fb = billing?.find(b => b.firm_id === f.id);
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{f.name}</p>
                    <p className="text-xs text-gray-400">{f.email || f.slug}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fb?.plan !== "free" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {fb?.plan || "free"}
                    </span>
                    {fb?.amount_inr > 0 && <p className="text-xs text-gray-500 mt-0.5">{fmt(fb.amount_inr)}</p>}
                  </div>
                </div>
              );
            })}
            {!firms?.length && <p className="text-gray-400 text-sm">No firms yet</p>}
          </div>
        </div>

        {/* AI Usage by Feature */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-1">AI Usage Breakdown</h2>
          <div className="flex gap-6 mb-4">
            <div><p className="text-xs text-gray-500">Total Tokens</p><p className="text-xl font-bold">{totalTokens.toLocaleString()}</p></div>
            <div><p className="text-xs text-gray-500">Est. Cost</p><p className="text-xl font-bold">{fmt(totalAiCost)}</p></div>
          </div>
          {Object.keys(aiByFeature).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(aiByFeature).sort((a,b) => b[1]-a[1]).map(([feature, count]) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">{feature}</span>
                      <span className="text-gray-500">{count} calls</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-1.5 bg-gray-900 rounded-full" style={{ width: `${Math.min(100, (count / totalAiCalls) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No AI calls logged yet</p>
          )}
        </div>

        {/* User → Firm Mapping */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4">Active Members</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {members?.map((m, i) => {
              const authUser = allUsers?.users?.find(u => u.id === m.user_id);
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{authUser?.email || m.user_id.slice(0,8)+"..."}</p>
                    <p className="text-xs text-gray-400">{(m.firms as any)?.name || "Unknown firm"}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{m.role}</span>
                </div>
              );
            })}
            {!members?.length && <p className="text-gray-400 text-sm">No members yet</p>}
          </div>
        </div>
      </div>

      {/* Grant Free Access */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-1">Grant Free Access</h2>
        <p className="text-sm text-gray-500 mb-4">Manually upgrade a firm's plan</p>
        <form action="/api/admin/grant-access" method="POST" className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Firm Slug or Email</label>
            <input name="email" type="text" required placeholder="demo or user@firm.com"
              className="border rounded-xl px-3 py-2 text-sm w-64" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Plan</label>
            <select name="plan" className="border rounded-xl px-3 py-2 text-sm">
              <option value="free">Free</option>
              <option value="solo">Solo (₹999)</option>
              <option value="team">Team (₹2499)</option>
              <option value="pro">Pro (₹4999)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Duration</label>
            <select name="days" className="border rounded-xl px-3 py-2 text-sm">
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium">
            Grant Access
          </button>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "🤖 AI Audit Log", href: "/admin/ai-audit" },
            { label: "🔄 Generate Compliance Tasks", href: "/api/ca/compliance/generate" },
            { label: "🤖 Run AI Misuse Detection",   href: "/api/cron/ai-misuse-detect" },
            { label: "📨 Run Auto Follow-ups",        href: "/api/cron/auto-followups" },
            { label: "⚖️ Sync All Cases",             href: "/api/lawyer/case-sync" },
            { label: "📊 View Hearings",              href: "/in/lawyer/hearings" },
          ].map(({ label, href }) => (
            <a key={href} href={href} target="_blank"
              className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50 transition-colors">
              {label}
            </a>
          ))}
        </div>
      </div>

    </main>
  );
}
