import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString();
}
function daysFromNow(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split("T")[0];
}
const today = new Date().toISOString().split("T")[0];
const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

export async function GET() {
  const [
    clients, gst, tds, itr, invoices, timesheets,
    employees, payroll, deadlines, dscRecords, esign, followups, roc
  ] = await Promise.all([
    sb.from("ca_clients").select("id, name, created_at, status, services, entity_type"),
    sb.from("gst_filings").select("id, client_name, period, status, due_date, filed_date").order("due_date").limit(100),
    sb.from("tds_filings").select("id, client_name, period, status, due_date, filed_date").order("due_date").limit(100),
    sb.from("itr_filings").select("id, client_name, assessment_year, status, due_date, filed_date").order("due_date").limit(100),
    sb.from("ca_invoices").select("id, invoice_number, total_amount, status, due_date, created_at, ca_clients(name)").eq("merchant_id", FIRM).order("created_at", { ascending: false }).limit(50),
    sb.from("TimeEntry").select("id, employeeId, clientName, hours, date, status, ratePerHour").eq("orgId", "demo-org").order("date", { ascending: false }).limit(50),
    sb.from("Employee").select("id, name, role, department, status").eq("orgId", "demo-org"),
    sb.from("Payroll").select("id, employeeId, month, netPay, status").eq("orgId", "demo-org").order("createdAt", { ascending: false }).limit(20),
    sb.from("compliance_deadlines").select("*").order("due_date").limit(30),
    sb.from("dsc_records").select("id, client_name, holder_name, expiry_date, status").eq("firm_id", FIRM),
    sb.from("esign_requests").select("id, document_name, signer_name, status, created_at").eq("firm_id", FIRM).order("created_at", { ascending: false }).limit(20),
    sb.from("followup_log").select("id, client_name, task_type, message, created_at").order("created_at", { ascending: false }).limit(20),
    sb.from("roc_filings").select("id, company_name, filing_type, status, due_date").order("due_date").limit(20),
  ]);

  const allClients = clients.data || [];
  const allGst = gst.data || [];
  const allTds = tds.data || [];
  const allItr = itr.data || [];
  const allInvoices = invoices.data || [];
  const allTimesheets = timesheets.data || [];
  const allEmployees = employees.data || [];
  const allPayroll = payroll.data || [];
  const allDeadlines = deadlines.data || [];
  const allDsc = dscRecords.data || [];
  const allEsign = esign.data || [];
  const allFollowups = followups.data || [];
  const allRoc = roc.data || [];

  // ── KPI METRICS ──────────────────────────────────────────────
  const totalClients = allClients.length;
  const newClientsThisMonth = allClients.filter(c => c.created_at >= thisMonthStart).length;
  const newClientsToday = allClients.filter(c => c.created_at >= daysAgo(1)).length;

  const gstFiled = allGst.filter(g => g.status === "filed").length;
  const gstPending = allGst.filter(g => g.status === "pending").length;
  const gstOverdue = allGst.filter(g => g.status === "pending" && g.due_date < today).length;

  const tdsFiled = allTds.filter(t => t.status === "filed").length;
  const tdsPending = allTds.filter(t => t.status === "pending").length;
  const tdsOverdue = allTds.filter(t => t.status === "pending" && t.due_date < today).length;

  const itrFiled = allItr.filter(i => i.status === "filed").length;
  const itrPending = allItr.filter(i => i.status === "pending").length;
  const itrOverdue = allItr.filter(i => i.status === "pending" && i.due_date < today).length;

  const invoiceTotal = allInvoices.reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const invoicePaid = allInvoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const invoiceOverdue = allInvoices.filter(i => i.status === "overdue").length;
  const invoicePending = allInvoices.filter(i => i.status === "pending").length;

  const totalHoursThisMonth = allTimesheets
    .filter(t => t.date >= thisMonthStart.split("T")[0])
    .reduce((s, t) => s + Number(t.hours || 0), 0);
  const unbilledAmount = allTimesheets
    .filter(t => t.status === "unbilled")
    .reduce((s, t) => s + (Number(t.hours || 0) * Number(t.ratePerHour || 0)), 0);

  const payrollPending = allPayroll.filter(p => p.status === "pending").length;

  // DSC expiring soon
  const dscExpiring30 = allDsc.filter(d => {
    const days = Math.ceil((new Date(d.expiry_date).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 30;
  });
  const dscExpired = allDsc.filter(d => new Date(d.expiry_date) < new Date());

  // Upcoming deadlines (next 7 days)
  const upcomingDeadlines = allDeadlines.filter(d => d.due_date >= today && d.due_date <= daysFromNow(7));
  const overdueDeadlines = allDeadlines.filter(d => d.due_date < today && d.status !== "done");

  // ROC
  const rocOverdue = allRoc.filter(r => r.status !== "filed" && r.due_date < today);

  // ── ALERTS / NOTIFICATIONS ─────────────────────────────────
  const alerts: any[] = [];

  if (gstOverdue > 0) alerts.push({ type: "error", icon: "G", title: `${gstOverdue} GST filing${gstOverdue > 1 ? "s" : ""} overdue`, link: "/in/ca/gst", count: gstOverdue });
  if (tdsOverdue > 0) alerts.push({ type: "error", icon: "T", title: `${tdsOverdue} TDS filing${tdsOverdue > 1 ? "s" : ""} overdue`, link: "/in/ca/tds", count: tdsOverdue });
  if (itrOverdue > 0) alerts.push({ type: "error", icon: "I", title: `${itrOverdue} ITR filing${itrOverdue > 1 ? "s" : ""} overdue`, link: "/in/ca/itr", count: itrOverdue });
  if (invoiceOverdue > 0) alerts.push({ type: "warning", icon: "₹", title: `${invoiceOverdue} invoice${invoiceOverdue > 1 ? "s" : ""} overdue`, link: "/in/ca/invoices", count: invoiceOverdue });
  if (dscExpired.length > 0) alerts.push({ type: "error", icon: "D", title: `${dscExpired.length} DSC expired`, link: "/in/ca/dsc", count: dscExpired.length });
  if (dscExpiring30.length > 0) alerts.push({ type: "warning", icon: "D", title: `${dscExpiring30.length} DSC expiring in 30 days`, link: "/in/ca/dsc", count: dscExpiring30.length });
  if (rocOverdue.length > 0) alerts.push({ type: "error", icon: "R", title: `${rocOverdue.length} ROC filing${rocOverdue.length > 1 ? "s" : ""} overdue`, link: "/in/ca/roc", count: rocOverdue.length });
  if (payrollPending > 0) alerts.push({ type: "info", icon: "P", title: `${payrollPending} payroll record${payrollPending > 1 ? "s" : ""} pending payment`, link: "/in/ca/hr/payroll", count: payrollPending });
  if (unbilledAmount > 0) alerts.push({ type: "info", icon: "⏱", title: `₹${Math.round(unbilledAmount).toLocaleString("en-IN")} in unbilled timesheets`, link: "/in/ca/hr/timesheets", count: 0 });
  if (upcomingDeadlines.length > 0) alerts.push({ type: "warning", icon: "!", title: `${upcomingDeadlines.length} deadline${upcomingDeadlines.length > 1 ? "s" : ""} in next 7 days`, link: "/in/ca/deadlines", count: upcomingDeadlines.length });

  // ── ACTIVITY FEED ─────────────────────────────────────────
  const activity: any[] = [
    ...allInvoices.slice(0, 5).map(i => ({ time: i.created_at, text: `Invoice ${i.invoice_number} created — ${(i as any).ca_clients?.name || "client"} — ₹${Number(i.total_amount || 0).toLocaleString("en-IN")}`, type: "invoice" })),
    ...allClients.slice(0, 5).map(c => ({ time: c.created_at, text: `Client added: ${c.name} (${c.entity_type || "—"})`, type: "client" })),
    ...allTimesheets.slice(0, 5).map(t => ({ time: t.date, text: `${t.hours}h logged${t.clientName ? ` for ${t.clientName}` : ""}`, type: "timesheet" })),
    ...allEsign.slice(0, 3).map(e => ({ time: e.created_at, text: `E-sign ${e.status}: ${e.document_name} — ${e.signer_name}`, type: "esign" })),
    ...allFollowups.slice(0, 3).map(f => ({ time: f.created_at, text: `Follow-up: ${f.client_name} — ${f.task_type}`, type: "followup" })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);

  // ── TEAM TIMESHEET SUMMARY ──────────────────────────────────
  const timesheetByEmployee = allEmployees.map(emp => {
    const entries = allTimesheets.filter(t => t.employeeId === emp.id && t.date >= thisMonthStart.split("T")[0]);
    return {
      id: emp.id, name: emp.name, role: emp.role,
      hoursThisMonth: entries.reduce((s, t) => s + Number(t.hours || 0), 0),
      entries: entries.length,
      lastEntry: entries[0]?.date || null,
    };
  });

  // ── FILING STATUS SUMMARY (for bar chart) ──────────────────
  const filingStats = {
    gst: { filed: gstFiled, pending: gstPending, overdue: gstOverdue },
    tds: { filed: tdsFiled, pending: tdsPending, overdue: tdsOverdue },
    itr: { filed: itrFiled, pending: itrPending, overdue: itrOverdue },
    roc: { filed: allRoc.filter(r => r.status === "filed").length, pending: allRoc.filter(r => r.status !== "filed").length, overdue: rocOverdue.length },
  };

  return NextResponse.json({
    kpi: {
      totalClients, newClientsThisMonth, newClientsToday,
      gstFiled, gstPending, gstOverdue,
      tdsFiled, tdsPending, tdsOverdue,
      itrFiled, itrPending, itrOverdue,
      invoiceTotal, invoicePaid, invoiceOverdue, invoicePending,
      totalHoursThisMonth, unbilledAmount,
      payrollPending, totalEmployees: allEmployees.length,
      dscExpiring: dscExpiring30.length, dscExpired: dscExpired.length,
      upcomingDeadlines: upcomingDeadlines.length, overdueDeadlines: overdueDeadlines.length,
    },
    alerts,
    activity,
    timesheetByEmployee,
    filingStats,
    upcomingDeadlines,
    overdueDeadlines: overdueDeadlines.slice(0, 10),
    recentInvoices: allInvoices.slice(0, 8),
    dscExpiring: dscExpiring30.slice(0, 5),
  });
}
