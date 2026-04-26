import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runCaseSync() {
  const { data: matters, error } = await supabase
    .from("lawyer_matters")
    .select("*")
    .not("cnr_number", "is", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results = [];

  for (const matter of matters || []) {
    const oldDate = matter.next_hearing_date;
    const newDate = matter.next_hearing_date;
    const changed = false;

    const { data: existingInvoice } = await supabase
      .from("lawyer_action_suggestions")
      .select("id")
      .eq("matter_id", matter.id)
      .eq("suggestion_type", "invoice")
      .eq("status", "pending");

    let invoice_created = false;

    if (!existingInvoice || existingInvoice.length === 0) {
      const { error: invoiceError } = await supabase
        .from("lawyer_action_suggestions")
        .insert({
          firm_id: matter.firm_id,
          matter_id: matter.id,
          suggestion_type: "invoice",
          message: `Send invoice for ${matter.title}`,
          status: "pending"
        });

      if (!invoiceError) invoice_created = true;
    }

    await supabase.from("lawyer_secure_file_events").insert({
      firm_id: matter.firm_id,
      event_type: "case_sync_checked",
      metadata: {
        matter_id: matter.id,
        cnr_number: matter.cnr_number,
        old_hearing_date: oldDate,
        new_hearing_date: newDate
      }
    });

    results.push({
      matter_id: matter.id,
      cnr_number: matter.cnr_number,
      old_hearing_date: oldDate,
      new_hearing_date: newDate,
      changed,
      invoice_created
    });
  }

  return NextResponse.json({ synced: results.length, results });
}

export async function GET() {
  return runCaseSync();
}

export async function POST() {
  return runCaseSync();
}
