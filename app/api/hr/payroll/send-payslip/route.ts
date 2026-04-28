import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function POST(req: Request) {
  const { payrollId } = await req.json();
  const { data: payroll } = await sb.from("Payroll").select("*, Employee(name, phone, email)").eq("id", payrollId).single();
  if (!payroll) return NextResponse.json({ ok: false, error: "Payroll not found" }, { status: 404 });
  return NextResponse.json({ ok: true, message: `Payslip queued for ${payroll.Employee?.name || "employee"}` });
}
