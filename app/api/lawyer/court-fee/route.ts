import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const FIRM = "00000000-0000-0000-0000-000000000001";

// Court fee calculation rules by state and court type
function calculateCourtFee(state: string, court_type: string, suit_type: string, claim_amount: number): { court_fee: number; process_fee: number; notes: string } {
  let court_fee = 0;
  let process_fee = 200;
  let notes = "";

  // Supreme Court
  if (court_type === "Supreme Court") {
    court_fee = suit_type === "SLP" ? 2500 : suit_type === "Writ" ? 500 : 3000;
    process_fee = 500;
    notes = "Supreme Court fees as per Supreme Court Rules 2013";
    return { court_fee, process_fee, notes };
  }

  // High Courts (approximate — varies by state)
  if (court_type === "High Court") {
    if (suit_type === "Writ") { court_fee = 500; notes = "Writ petition fee"; }
    else if (suit_type === "Appeal") { court_fee = Math.min(Math.ceil(claim_amount * 0.005), 75000); notes = "5‰ of claim, max ₹75,000"; }
    else if (suit_type === "Revision") { court_fee = 400; }
    else { court_fee = Math.min(Math.ceil(claim_amount * 0.01), 100000); notes = "1% of claim, varies by state"; }
    process_fee = 300;
    return { court_fee, process_fee, notes };
  }

  // District / Civil Courts — state-wise
  const a = claim_amount;
  switch (state) {
    case "Maharashtra":
      if (a <= 500) court_fee = 50;
      else if (a <= 1000) court_fee = 60;
      else if (a <= 5000) court_fee = 80;
      else if (a <= 10000) court_fee = 100;
      else if (a <= 50000) court_fee = Math.ceil(a * 0.02);
      else if (a <= 100000) court_fee = Math.ceil(a * 0.025);
      else if (a <= 500000) court_fee = Math.ceil(a * 0.03);
      else court_fee = Math.min(Math.ceil(a * 0.035), 75000);
      notes = "Maharashtra Court Fees Act 1959";
      break;
    case "Delhi":
      if (a <= 1000) court_fee = 50;
      else if (a <= 5000) court_fee = Math.ceil(a * 0.04);
      else if (a <= 50000) court_fee = Math.ceil(a * 0.05);
      else if (a <= 100000) court_fee = Math.ceil(a * 0.04);
      else court_fee = Math.min(Math.ceil(a * 0.03), 75000);
      notes = "Delhi Court Fees Act";
      break;
    case "Karnataka":
      if (a <= 200) court_fee = 20;
      else if (a <= 1000) court_fee = 40;
      else if (a <= 5000) court_fee = Math.ceil(a * 0.02);
      else if (a <= 50000) court_fee = Math.ceil(a * 0.025);
      else court_fee = Math.min(Math.ceil(a * 0.03), 100000);
      notes = "Karnataka Court Fees Act 1958";
      break;
    case "Tamil Nadu":
      if (a <= 1000) court_fee = 50;
      else if (a <= 5000) court_fee = Math.ceil(a * 0.03);
      else if (a <= 100000) court_fee = Math.ceil(a * 0.04);
      else court_fee = Math.min(Math.ceil(a * 0.05), 150000);
      notes = "Tamil Nadu Court Fees Act";
      break;
    case "Uttar Pradesh":
      if (a <= 1000) court_fee = 40;
      else if (a <= 5000) court_fee = Math.ceil(a * 0.025);
      else if (a <= 50000) court_fee = Math.ceil(a * 0.03);
      else court_fee = Math.min(Math.ceil(a * 0.035), 100000);
      notes = "UP Court Fees Act";
      break;
    case "Gujarat":
      if (a <= 1000) court_fee = 50;
      else if (a <= 50000) court_fee = Math.ceil(a * 0.025);
      else court_fee = Math.min(Math.ceil(a * 0.03), 75000);
      notes = "Bombay Court Fees Act (Gujarat)";
      break;
    case "Rajasthan":
      if (a <= 1000) court_fee = 30;
      else if (a <= 50000) court_fee = Math.ceil(a * 0.02);
      else court_fee = Math.min(Math.ceil(a * 0.025), 75000);
      notes = "Rajasthan Court Fees Act";
      break;
    default:
      // Generic fallback
      if (a <= 1000) court_fee = 50;
      else if (a <= 50000) court_fee = Math.ceil(a * 0.025);
      else court_fee = Math.min(Math.ceil(a * 0.03), 100000);
      notes = "Approximate — verify with state-specific court fee schedule";
  }

  // Suit type adjustments
  if (suit_type === "Injunction") { court_fee = Math.max(court_fee, 200); }
  if (suit_type === "Declaration") { court_fee = Math.max(court_fee * 0.5, 200); }
  if (suit_type === "Probate") { court_fee = Math.ceil(a * 0.02); }

  return { court_fee: Math.ceil(court_fee), process_fee, notes };
}

export async function GET() {
  const { data, error } = await supabase
    .from("court_fee_calculations")
    .select("*, legal_matters(matter_title, client_name)")
    .eq("firm_id", FIRM)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ calculations: data || [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { matter_id, court_type, state, suit_type, claim_amount, advocate_fee, notes } = body;

  const { court_fee, process_fee, notes: calc_notes } = calculateCourtFee(state, court_type, suit_type, Number(claim_amount));
  const adv_fee = Number(advocate_fee) || 0;
  const total_fee = court_fee + process_fee + adv_fee;

  const { data, error } = await supabase
    .from("court_fee_calculations")
    .insert([{ firm_id: FIRM, matter_id, court_type, state, suit_type, claim_amount, court_fee, process_fee, advocate_fee: adv_fee, total_fee, notes: notes || calc_notes }])
    .select("*, legal_matters(matter_title, client_name)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ...data, calc_notes });
}
