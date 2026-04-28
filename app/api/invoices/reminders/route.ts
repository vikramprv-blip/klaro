import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const MERCHANT = "00000000-0000-0000-0000-000000000001";
export async function POST() {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase.from("ca_invoices").select("*, ca_clients(name, email)").eq("merchant_id", MERCHANT).eq("status", "pending").lt("due_date", today);
  const overdue = data || [];
  // Update status to overdue
  for (const inv of overdue) {
    await supabase.from("ca_invoices").update({ status: "overdue" }).eq("id", inv.id);
  }
  return NextResponse.json({ overdueFound: overdue.length, remindersQueued: overdue.length });
}
