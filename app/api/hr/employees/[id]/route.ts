import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const employee = await prisma.employee.findUnique({
    where: { id: params.id }
  })

  return NextResponse.json(employee)
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json()

  const employee = await prisma.employee.update({
    where: { id: params.id },
    data: body
  })

  return NextResponse.json(employee)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.employee.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ success: true })
}
