import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tasks = await prisma.$queryRaw`
      select *
      from ca_compliance_tasks
      where status = 'pending'
        and due_date <= now() + interval '3 days'
        and (
          last_followed_up_at is null
          or last_followed_up_at < now() - interval '2 days'
        )
      limit 50
    `;

    let count = 0;

    for (const task of tasks as any[]) {
      const message = `Hi ${task.client_name}, reminder to share details for ${task.task_type.toUpperCase()} (${task.period}).`;

      await prisma.$executeRaw`
        insert into ca_client_followups
        (compliance_task_id, client_id, client_name, channel, message, status)
        values
        (${task.id}, ${task.client_id}, ${task.client_name}, 'auto', ${message}, 'drafted')
      `;

      await prisma.$executeRaw`
        update ca_compliance_tasks
        set last_followed_up_at = now()
        where id = ${task.id}
      `;

      count++;
    }

    return NextResponse.json({ ok: true, processed: count });
  } catch (e) {
    console.error("auto followups failed", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
