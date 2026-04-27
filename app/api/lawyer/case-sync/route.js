import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runCaseSync() {
  const { data: matters, error } = await supabase
    .from("legal_matters")
    .select("*, legal_hearings(*), clients(full_name)")
    .not("cnr_number", "is", null);

  if (error) return { error: error.message };

  const results = [];

  for (const matter of matters || []) {
    const hearings = matter.legal_hearings || [];
    const upcomingHearing = hearings
      .filter(h => h.hearing_date >= new Date().toISOString().split("T")[0])
      .sort((a, b) => new Date(a.hearing_date) - new Date(b.hearing_date))[0];

    // Auto-create hearing_prep action if upcoming hearing exists and no pending action
    if (upcomingHearing) {
      const { data: existing } = await supabase
        .from("action_suggestions")
        .select("id")
        .eq("matter_id", matter.id)
        .eq("type", "hearing_prep")
        .eq("status", "pending");

      if (!existing || existing.length === 0) {
        await supabase.from("action_suggestions").insert({
          firm_id: matter.firm_id || "00000000-0000-0000-0000-000000000001",
          matter_id: matter.id,
          type: "hearing_prep",
          title: `Prepare for hearing: ${matter.title || matter.matter_title}`,
          description: `Upcoming hearing on ${upcomingHearing.hearing_date} at ${upcomingHearing.court_name || upcomingHearing.court || "court"}`,
          priority: "medium",
          due_date: upcomingHearing.hearing_date,
          triggered_by: "case_sync"
        });
      }
    }

    // Auto-create invoice action if no pending invoice
    const { data: existingInvoice } = await supabase
      .from("action_suggestions")
      .select("id")
      .eq("matter_id", matter.id)
      .eq("type", "invoice")
      .eq("status", "pending");

    if (!existingInvoice || existingInvoice.length === 0) {
      await supabase.from("action_suggestions").insert({
        firm_id: matter.firm_id || "00000000-0000-0000-0000-000000000001",
        matter_id: matter.id,
        type: "invoice",
        title: `Send invoice for ${matter.title || matter.matter_title}`,
        description: `Monthly billing for matter ${matter.cnr_number}`,
        priority: "low",
        triggered_by: "case_sync"
      });
    }

    results.push({
      matter_id: matter.id,
      cnr_number: matter.cnr_number,
      title: matter.title || matter.matter_title,
      hearings_count: hearings.length,
      upcoming_hearing: upcomingHearing?.hearing_date || null,
    });
  }

  return { synced: results.length, results };
}

export async function GET() {
  const result = await runCaseSync();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await runCaseSync();
  return NextResponse.json(result);
}
