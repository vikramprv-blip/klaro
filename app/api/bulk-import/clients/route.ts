import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rows, organizationId } = body;

    if (!Array.isArray(rows) || !rows.length) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    }

    const results = { imported: 0, failed: 0, errors: [] as string[] };

    for (const row of rows) {
      const name = String(row.name || row.Name || row["Client Name"] || "").trim();
      if (!name) {
        results.failed++;
        results.errors.push(`Skipped row — missing name: ${JSON.stringify(row)}`);
        continue;
      }
      try {
        await prisma.client.create({
          data: {
            name,
            email: String(row.email || row.Email || "").trim() || null,
            phone: String(row.phone || row.Phone || row.Mobile || "").trim() || null,
            gstin: String(row.gstin || row.GSTIN || row.GST || "").trim() || null,
            address: String(row.address || row.Address || "").trim() || null,
            organizationId: organizationId || null,
          },
        });
        results.imported++;
      } catch (e: any) {
        results.failed++;
        results.errors.push(`${name}: ${e.message}`);
      }
    }

    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
