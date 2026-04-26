import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchCourtUpdate(matter) {
  return {
    next_hearing_date: matter.next_hearing_date,
    latest_order_summary: "Court sync placeholder. Connect eCourts/Vakeel360 API here.",
    source: "manual_placeholder"
  };
}

export async function POST() {
  const { data: matters, error } = await supabase
    .from("lawyer_matters")
    .select("*")
    .not("cnr_number", "is", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results = [];

  for (const matter of matters || []) {
    const update = await fetchCourtUpdate(matter);

    await supabase
      .from("lawyer_matters")
      .update({
        next_hearing_date: update.next_hearing_date
      })
      .eq("id", matter.id);

    await supabase.from("lawyer_secure_file_events").insert({
      firm_id: matter.firm_id,
      event_type: "case_sync_checked",
      metadata: {
        matter_id: matter.id,
        cnr_number: matter.cnr_number,
        source: update.source,
        latest_order_summary: update.latest_order_summary
      }
    });

    results.push({
      matter_id: matter.id,
      cnr_number: matter.cnr_number,
      status: "checked"
    });
  }

  return NextResponse.json({ synced: results.length, results });
}
