import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tasks = await prisma.$queryRaw`
      select
        id,
        client_id,
        client_name,
        client_phone,
        task_type,
        title,
        description,
        period,
        due_date,
        status,
        priority,
        source,
        created_at,
        updated_at,
        last_followed_up_at
      from ca_compliance_tasks
      order by due_date asc, client_name asc
      limit 500
    `;

    return NextResponse.json({ ok: true, tasks });
  } catch (error) {
    console.error("GET /api/ca/compliance/tasks failed:", error);
    return NextResponse.json({ ok: false, tasks: [] }, { status: 200 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = String(body?.id || "");
    const status = String(body?.status || "");

    if (!id || !status) {
      return NextResponse.json({ ok: false, error: "id and status are required" }, { status: 400 });
    }

    await prisma.$executeRaw`
      update ca_compliance_tasks
      set status = ${status}, updated_at = now()
last_followed_up_at,
      where id::text = ${id}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/ca/compliance/tasks failed:", error);
    return NextResponse.json({ ok: false, error: "Failed to update task" }, { status: 500 });
  }
}
