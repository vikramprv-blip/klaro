export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()

    const data: Record<string, unknown> = {}

    if (body.name !== undefined) data.name = String(body.name).trim()
    if (body.code !== undefined) data.code = body.code ? String(body.code).trim() : null
    if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null
    if (body.department !== undefined) data.department = body.department ? String(body.department).trim() : null
    if (body.frequency !== undefined) data.frequency = String(body.frequency).toUpperCase()
    if (body.dueDayOfMonth !== undefined) data.dueDayOfMonth = body.dueDayOfMonth ? Number(body.dueDayOfMonth) : null
    if (body.dueMonthOfYear !== undefined) data.dueMonthOfYear = body.dueMonthOfYear ? Number(body.dueMonthOfYear) : null
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)

    const updated = await prisma.serviceTemplate.update({
      where: { id },
      data,
    })

    return NextResponse.json({ template: updated })
  } catch (error) {
    console.error("SERVICE_TEMPLATES_PATCH_ERROR", error)
    return NextResponse.json({ error: "Failed to update service template" }, { status: 500 })
  }
}
