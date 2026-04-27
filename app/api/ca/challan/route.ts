import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

const INSTALMENTS = [
  { instalment: 1, due_day: 15, due_month: 6,  percentage: 15, label: "1st Instalment (15 Jun)" },
  { instalment: 2, due_day: 15, due_month: 9,  percentage: 45, label: "2nd Instalment (15 Sep)" },
  { instalment: 3, due_day: 15, due_month: 12, percentage: 75, label: "3rd Instalment (15 Dec)" },
  { instalment: 4, due_day: 15, due_month: 3,  percentage: 100, label: "4th Instalment (15 Mar)" },
];

export async function GET() {
  const { data, error } = await supabase
    .from("advance_tax_challans")
    .select("*")
    .eq("firm_id", FIRM)
    .order("due_date", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ challans: data || [], instalments: INSTALMENTS });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { client_name, pan, assessment_year, estimated_tax } = body;
  const year = parseInt(assessment_year.split("-")[0]);

  // Generate all 4 instalments
  const records = INSTALMENTS.map(inst => {
    const month = inst.due_month;
    const due_year = month <= 3 ? year : year - 1;
    const amount = Math.ceil((Number(estimated_tax) * inst.percentage) / 100);
    return {
      firm_id: FIRM, client_name, pan, assessment_year,
      instalment: inst.instalment,
      due_date: `${due_year}-${String(month).padStart(2, "0")}-${inst.due_day}`,
      amount, status: "pending"
    };
  });

  // Calculate incremental amounts
  let prev = 0;
  const incremental = records.map(r => {
    const inc = r.amount - prev;
    prev = r.amount;
    return { ...r, amount: inc };
  });

  const { data, error } = await supabase.from("advance_tax_challans").insert(incremental).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const { id, status, paid_amount, challan_number, bsr_code, paid_date } = await req.json();
  const { data, error } = await supabase
    .from("advance_tax_challans")
    .update({ status, paid_amount, challan_number, bsr_code, paid_date })
    .eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
