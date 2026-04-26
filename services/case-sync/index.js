import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fetchCaseUpdates(cnr) {
  // placeholder for eCourts / Vakeel360 API
  return {
    next_hearing_date: new Date(Date.now() + 86400000).toISOString(),
    status: "updated"
  };
}

async function run() {
  const { data: matters } = await supabase.from("lawyer_matters").select("*").not("cnr_number","is",null);

  for (const matter of matters) {
    const update = await fetchCaseUpdates(matter.cnr_number);

    if (!update) continue;

    await supabase.from("lawyer_matters").update({
      next_hearing_date: update.next_hearing_date
    }).eq("id", matter.id);

    await supabase.from("lawyer_hr_tasks").insert({
      firm_id: matter.firm_id,
      matter_id: matter.id,
      task_type: "hearing_prep",
      title: "Prepare for upcoming hearing",
      due_date: update.next_hearing_date
    });

    await supabase.from("lawyer_audit_logs").insert({
      firm_id: matter.firm_id,
      action: "case_auto_updated",
      entity_type: "matter",
      entity_id: matter.id
    });

    await supabase.from("lawyer_action_suggestions").insert({
      firm_id: matter.firm_id,
      matter_id: matter.id,
      suggestion_type: "invoice",
      message: "Hearing updated. Send invoice to client?"
    });

    console.log("Updated matter:", matter.id);
  }
}

run();

async function logSecureEvent({ firm_id, evidence_id, actor_id, event_type }) {
  await supabase.from("lawyer_secure_file_events").insert({
    firm_id,
    evidence_id,
    actor_id,
    event_type,
    metadata: { timestamp: new Date().toISOString() }
  });
}
