import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { clientName, taskType, period } = await req.json();

    let message = "";

    if (taskType === "gst") {
      message = `Hi, please share your GST data for ${period} so we can proceed with filing before the due date.`;
    } else if (taskType === "tds") {
      message = `Hi, please share TDS details for ${period} so we can complete the filing on time.`;
    } else if (taskType === "itr") {
      message = `Hi, please share your income documents for ${period} so we can prepare your ITR.`;
    } else {
      message = `Hi, please share the required details for ${period}.`;
    }

    return NextResponse.json({ ok: true, message });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
