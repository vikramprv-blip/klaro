import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function csvEscape(value: unknown) {
  const s = String(value ?? "")
  return `"${s.replace(/"/g, '""')}"`
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get("orgId") || "demo-org"

  const employees = await prisma.employee.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" }
  })

  const header = ["Name", "Email", "Phone", "Role", "Department", "Salary", "Status"]
  const rows = employees.map(e => [
    e.name,
    e.email,
    e.phone || "",
    e.role,
    e.department || "",
    e.salary,
    e.status
  ])

  const csv = [header, ...rows]
    .map(row => row.map(csvEscape).join(","))
    .join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=employees.csv"
    }
  })
}
