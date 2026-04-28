import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const MERCHANT = "00000000-0000-0000-0000-000000000001";
export async function GET() {
  const { data } = await sb.from("ca_invoices").select("status, total_amount, amount").eq("merchant_id", MERCHANT);
  const inv = data || [];
  const paid = inv.filter(i => i.status === "paid");
  const unpaid = inv.filter(i => i.status === "pending");
  const overdue = inv.filter(i => i.status === "overdue");
  const sum = (arr: any[]) => arr.reduce((s, i) => s + Number(i.total_amount || 0), 0);
  return NextResponse.json({
    totalInvoices: inv.length,
    totalAmount: sum(inv),
    paidInvoices: paid.length,
    paidAmount: sum(paid),
    unpaidInvoices: unpaid.length,
    unpaidAmount: sum(unpaid),
    overdueInvoices: overdue.length,
    overdueAmount: sum(overdue),
  });
}
