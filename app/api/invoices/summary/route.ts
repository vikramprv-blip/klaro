import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const MERCHANT = "00000000-0000-0000-0000-000000000001";
export async function GET() {
  const { data } = await supabase.from("ca_invoices").select("status, total_amount").eq("merchant_id", MERCHANT);
  const inv = data || [];
  return NextResponse.json({
    total: inv.length,
    paid: inv.filter(i => i.status === "paid").length,
    pending: inv.filter(i => i.status === "pending").length,
    overdue: inv.filter(i => i.status === "overdue").length,
    total_amount: inv.reduce((s, i) => s + Number(i.total_amount || 0), 0),
    paid_amount: inv.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.total_amount || 0), 0),
  });
}
