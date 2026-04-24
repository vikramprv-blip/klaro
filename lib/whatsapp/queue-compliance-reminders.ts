import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function pickColumn(columns: string[], options: string[]) {
  return options.find((c) => columns.includes(c));
}

export async function queueComplianceWhatsappReminders() {
  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;

  if (!adminPhone) {
    throw new Error("Missing ADMIN_WHATSAPP_NUMBER");
  }

  const tables: any[] = await prisma.$queryRawUnsafe(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND lower(table_name) LIKE '%compliance%'
      AND lower(table_name) LIKE '%task%'
    ORDER BY table_name
    LIMIT 1
  `);

  if (!tables.length) {
    return { queued: 0, reason: "No compliance task table found" };
  }

  const tableName = tables[0].table_name;

  const columnRows: any[] = await prisma.$queryRawUnsafe(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
    `,
    tableName
  );

  const columns = columnRows.map((r) => r.column_name);

  const idCol = pickColumn(columns, ["id"]);
  const titleCol = pickColumn(columns, ["title", "name", "task", "description"]);
  const dueCol = pickColumn(columns, ["dueDate", "due_date", "deadline", "dueAt", "due_at"]);
  const statusCol = pickColumn(columns, ["status", "state"]);

  if (!idCol || !dueCol) {
    return { queued: 0, reason: "Compliance table missing id/due date columns", tableName, columns };
  }

  const titleSql = titleCol ? `"${titleCol}"::text` : `'Compliance task'`;
  const statusFilter = statusCol
    ? `AND COALESCE(lower("${statusCol}"::text), '') NOT IN ('done','completed','complete','closed','cancelled','archived')`
    : "";

  const tasks: any[] = await prisma.$queryRawUnsafe(`
    SELECT
      "${idCol}"::text AS id,
      ${titleSql} AS title,
      "${dueCol}" AS due_date
    FROM public."${tableName}"
    WHERE "${dueCol}" IS NOT NULL
      AND "${dueCol}" <= NOW() + INTERVAL '7 days'
      ${statusFilter}
    ORDER BY "${dueCol}" ASC
    LIMIT 25
  `);

  let queued = 0;

  for (const task of tasks) {
    const exists: any[] = await prisma.$queryRawUnsafe(
      `
      SELECT id
      FROM public."WhatsappOutbox"
      WHERE "templateName" = 'compliance_reminder'
        AND payload->>'complianceTaskId' = $1
        AND "createdAt" > NOW() - INTERVAL '24 hours'
      LIMIT 1
      `,
      task.id
    );

    if (exists.length) continue;

    await prisma.whatsappOutbox.create({
      data: {
        toPhone: adminPhone,
        templateName: "compliance_reminder",
        templateLang: "en",
        payload: {
          complianceTaskId: task.id,
          bodyParams: [
            "Klaro compliance reminder",
            `Task: ${task.title || "Compliance task"}`,
            `Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString("en-IN") : "Not set"}`,
          ],
        },
      },
    });

    queued++;
  }

  return { queued, checked: tasks.length, tableName };
}
