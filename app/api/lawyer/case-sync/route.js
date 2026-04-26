import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function tomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

async function fetchCourtUpdate(matter) {
  return {
    next_hearing_date: matter.next_hearing_date || tomorrowDate(),
    latest_order_summary: "Court sync placeholder. Connect eCourts/Vakeel360 API here.",
    source: "manual_placeholder"
  };
}

async function runCaseSync() {
  const { data: matters, error } = await supabase
    .from("lawyer_matters")
    .select("*")
    .not("cnr_number", "is", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results = [];

  for (const matter of matters || []) {
    const update = await fetchCourtUpdate(matter);
    const oldDate = matter.next_hearing_date;
    const newDate = update.next_hearing_date;
    const changed = oldDate !== newDate;

    await supabase
      .from("lawyer_matters")
      .update({ next_hearing_date: newDate })
      .eq("id", matter.id);

    await supabase.from("lawyer_secure_file_events").insert({
      firm_id: matter.firm_id,
      event_type: changed ? "hearing_date_changed" : "case_sync_checked",
      metadata: {
        matter_id: matter.id,
        cnr_number: matter.cnr_number,
        old_hearing_date: oldDate,
        new_hearing_date: newDate,
        source: update.source,
        latest_order_summary: update.latest_order_summary
      }
    });

    if (changed) {
      await supabase.from("lawyer_action_suggestions").insert({
        firm_id: matter.firm_id,
        matter_id: matter.id,
        suggestion_type: "hearing_change",
        message: `Hearing date changed from ${oldDate || "not set"} to ${newDate}. Prepare brief, notify client, and review billing.`
      });
    }

    results.push({
      matter_id: matter.id,
      cnr_number: matter.cnr_number,
      old_hearing_date: oldDate,
      new_hearing_date: newDate,
      changed
    });
  }

  return NextResponse.json({ synced: results.length, results });
}

export async function POST() {
  return runCaseSync();
}

export async function GET() {
  return runCaseSync();
}
