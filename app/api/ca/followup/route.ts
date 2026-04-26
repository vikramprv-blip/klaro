import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const complianceTaskId = body?.complianceTaskId || null;
    const clientId = body?.clientId || null;
    const clientName = body?.clientName || "Client";
    const taskType = body?.taskType || "task";
    const period = body?.period || "the current period";
    let message = "";
    if (taskType === "gst") {
      message = `Hi ${clientName}, please share your GST purchase and sales data for ${period} so we can proceed with filing before the due date.`;
    } else if (taskType === "tds") {
      message = `Hi ${clientName}, please share TDS challans, deduction details, and payment information for ${period} so we can complete the filing on time.`;
    } else if (taskType === "itr") {
      message = `Hi ${clientName}, please share your income documents, Form 16, bank statements, investment proofs, and tax details for ${period} so we can prepare your ITR.`;
    } else {
      message = `Hi ${clientName}, please share the required details for ${period} so we can complete this work on time.`;
    }
    await prisma.$queryRawUnsafe(
      `INSERT INTO ca_client_followups
       (compliance_task_id, client_id, client_name, channel, message, status)
       VALUES ($1::uuid, $2, $3, 'manual', $4, 'drafted')`,
      complianceTaskId, clientId, clientName, message
    );
    await prisma.$queryRawUnsafe(
      `UPDATE ca_compliance_tasks SET last_followed_up_at = now() WHERE id::text = $1`,
      complianceTaskId
    );
    return NextResponse.json({ ok: true, message });
  } catch (e) {
    console.error("POST /api/ca/followup failed:", e);
    return NextResponse.json({ ok: false, error: "Failed to generate follow-up" }, { status: 500 });
  }
}
