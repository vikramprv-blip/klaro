import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

const today = new Date().toISOString().split("T")[0];
const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
function daysFromNow(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split("T")[0];
}

export async function GET() {
  const [matters, hearings, evidence, billing, timesheets, employees, tasks, limitations, notices] = await Promise.all([
    sb.from("legal_matters").select("id, matter_title, client_name, status, matter_type, created_at, next_date").eq("firm_id", FIRM),
    sb.from("legal_hearings").select("id, hearing_date, court_name, purpose, matter_id, legal_matters(client_name, matter_title)").eq("firm_id", FIRM).order("hearing_date"),
    sb.from("evidence_files").select("id, file_name, created_at, matter_id, status").eq("firm_id", FIRM).order("created_at", { ascending: false }).limit(20),
    sb.from("legal_billing").select("id, amount, status, created_at, legal_matters(client_name)").eq("firm_id", FIRM).order("created_at", { ascending: false }).limit(30),
    sb.from("TimeEntry").select("id, employeeId, clientName, hours, date, ratePerHour, status").eq("orgId", "demo-org").order("date", { ascending: false }).limit(50),
    sb.from("Employee").select("id, name, role").eq("orgId", "demo-org"),
    sb.from("lawyer_tasks").select("id, title, status, due_date, priority, legal_matters(client_name)").eq("firm_id", FIRM).order("due_date").limit(30),
    sb.from("limitation_periods").select("id, client_name, matter_type, limitation_date, days_remaining").eq("firm_id", FIRM).order("limitation_date").limit(20),
    sb.from("legal_notices").select("id, client_name, notice_type, created_at, status").eq("firm_id", FIRM).order("created_at", { ascending: false }).limit(20),
  ]);

  const allMatters = matters.data || [];
  const allHearings = hearings.data || [];
  const allEvidence = evidence.data || [];
  const allBilling = billing.data || [];
  const allTimesheets = timesheets.data || [];
  const allEmployees = employees.data || [];
  const allTasks = tasks.data || [];
  const allLimitations = limitations.data || [];
  const allNotices = notices.data || [];

  // KPIs
  const totalMatters = allMatters.length;
  const activeMatters = allMatters.filter(m => m.status === "active").length;
  const newMattersThisMonth = allMatters.filter(m => m.created_at?.split("T")[0] >= thisMonthStart).length;

  const todayHearings = allHearings.filter(h => h.hearing_date === today);
  const weekHearings = allHearings.filter(h => h.hearing_date >= today && h.hearing_date <= daysFromNow(7));
  const pastHearingsNoOutcome = allHearings.filter(h => h.hearing_date < today && !h.purpose?.includes("outcome"));

  const billingTotal = allBilling.reduce((s, b) => s + Number(b.amount || 0), 0);
  const billingPaid = allBilling.filter(b => b.status === "paid").reduce((s, b) => s + Number(b.amount || 0), 0);
  const billingPending = allBilling.filter(b => b.status === "pending").length;

  const totalHoursThisMonth = allTimesheets
    .filter(t => t.date >= thisMonthStart)
    .reduce((s, t) => s + Number(t.hours || 0), 0);
  const unbilledAmount = allTimesheets
    .filter(t => t.status === "unbilled")
    .reduce((s, t) => s + (Number(t.hours || 0) * Number(t.ratePerHour || 0)), 0);

  const overdueTasks = allTasks.filter(t => t.status !== "done" && t.due_date < today);
  const urgentTasks = allTasks.filter(t => t.status !== "done" && t.priority === "high");

  const criticalLimitations = allLimitations.filter(l => Number(l.days_remaining) <= 30);
  const expiredLimitations = allLimitations.filter(l => Number(l.days_remaining) < 0);

  // Alerts
  const alerts: any[] = [];
  if (todayHearings.length > 0) alerts.push({ type: "info", icon: "⚖", title: `${todayHearings.length} hearing${todayHearings.length > 1 ? "s" : ""} today`, link: "/in/lawyer/hearings", count: todayHearings.length });
  if (overdueTasks.length > 0) alerts.push({ type: "error", icon: "!", title: `${overdueTasks.length} task${overdueTasks.length > 1 ? "s" : ""} overdue`, link: "/in/lawyer/tasks", count: overdueTasks.length });
  if (criticalLimitations.length > 0) alerts.push({ type: "error", icon: "⏰", title: `${criticalLimitations.length} limitation period${criticalLimitations.length > 1 ? "s" : ""} critical (≤30 days)`, link: "/in/lawyer/limitation", count: criticalLimitations.length });
  if (expiredLimitations.length > 0) alerts.push({ type: "error", icon: "⛔", title: `${expiredLimitations.length} limitation period${expiredLimitations.length > 1 ? "s" : ""} expired`, link: "/in/lawyer/limitation", count: expiredLimitations.length });
  if (billingPending > 0) alerts.push({ type: "warning", icon: "₹", title: `${billingPending} billing record${billingPending > 1 ? "s" : ""} unpaid`, link: "/in/lawyer/billing", count: billingPending });
  if (unbilledAmount > 0) alerts.push({ type: "info", icon: "⏱", title: `₹${Math.round(unbilledAmount).toLocaleString("en-IN")} in unbilled timesheet hours`, link: "/in/lawyer/hr/timesheets", count: 0 });
  if (weekHearings.length > 0) alerts.push({ type: "warning", icon: "📅", title: `${weekHearings.length} hearing${weekHearings.length > 1 ? "s" : ""} this week`, link: "/in/lawyer/hearings", count: weekHearings.length });

  // Activity
  const activity = [
    ...allMatters.slice(0, 5).map(m => ({ time: m.created_at, text: `Matter opened: ${m.client_name} — ${m.matter_title}`, type: "matter" })),
    ...allHearings.slice(0, 5).map(h => ({ time: h.hearing_date, text: `Hearing: ${(h as any).legal_matters?.client_name} on ${h.hearing_date} at ${h.court_name || "court"}`, type: "hearing" })),
    ...allEvidence.slice(0, 5).map(e => ({ time: e.created_at, text: `Evidence uploaded: ${e.file_name}`, type: "evidence" })),
    ...allNotices.slice(0, 3).map(n => ({ time: n.created_at, text: `Notice: ${n.client_name} — ${n.notice_type}`, type: "notice" })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);

  // Timesheet by employee
  const timesheetByEmployee = allEmployees.map(emp => {
    const entries = allTimesheets.filter(t => t.employeeId === emp.id && t.date >= thisMonthStart);
    return {
      id: emp.id, name: emp.name, role: emp.role,
      hoursThisMonth: entries.reduce((s, t) => s + Number(t.hours || 0), 0),
      entries: entries.length,
      lastEntry: entries[0]?.date || null,
    };
  });

  return NextResponse.json({
    kpi: {
      totalMatters, activeMatters, newMattersThisMonth,
      todayHearings: todayHearings.length, weekHearings: weekHearings.length,
      billingTotal, billingPaid, billingPending,
      totalHoursThisMonth, unbilledAmount,
      overdueTasks: overdueTasks.length, urgentTasks: urgentTasks.length,
      criticalLimitations: criticalLimitations.length, expiredLimitations: expiredLimitations.length,
      totalEmployees: allEmployees.length, totalEvidence: allEvidence.length,
    },
    alerts,
    activity,
    timesheetByEmployee,
    todayHearings,
    weekHearings: weekHearings.slice(0, 8),
    overdueTasks: overdueTasks.slice(0, 8),
    criticalLimitations: criticalLimitations.slice(0, 5),
    recentMatters: allMatters.slice(0, 6),
  });
}
