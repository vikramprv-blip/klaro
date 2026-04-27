import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

const LIMITATION_PERIODS: Record<string, { days: number; act: string }> = {
  "Contract breach": { days: 3 * 365, act: "Limitation Act 1963 — Art. 55" },
  "Recovery of money": { days: 3 * 365, act: "Limitation Act 1963 — Art. 37" },
  "Cheque bounce (Sec 138 NI Act)": { days: 30, act: "NI Act — 30 days from cause" },
  "Consumer complaint": { days: 2 * 365, act: "Consumer Protection Act 2019" },
  "Motor accident claim": { days: 6 * 30, act: "MV Act — 6 months" },
  "Property dispute": { days: 12 * 365, act: "Limitation Act 1963 — Art. 65" },
  "Tort / negligence": { days: 3 * 365, act: "Limitation Act 1963 — Art. 75" },
  "Service matter": { days: 3 * 365, act: "Limitation Act 1963" },
  "IBC (NCLT)": { days: 3 * 365, act: "IBC 2016 — Sec 238A" },
  "RERA complaint": { days: 5 * 365, act: "RERA 2016" },
  "Writ petition": { days: 0, act: "No fixed limit — laches applies" },
  "Custom": { days: 365, act: "Custom" },
};

export async function GET() {
  const { data, error } = await supabase
    .from("limitation_periods")
    .select("*, legal_matters(matter_title, client_name)")
    .eq("firm_id", FIRM)
    .order("expiry_date", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ records: data || [], presets: LIMITATION_PERIODS });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { matter_id, cause_of_action, incident_date, limitation_days, notes } = body;
  const { data, error } = await supabase
    .from("limitation_periods")
    .insert([{ firm_id: FIRM, matter_id, cause_of_action, incident_date, limitation_days: limitation_days || 365, notes }])
    .select("*, legal_matters(matter_title, client_name)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const { error } = await supabase.from("limitation_periods").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
