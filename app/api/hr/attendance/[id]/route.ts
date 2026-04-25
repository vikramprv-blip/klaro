import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const attendance = await prisma.attendance.findUnique({
    where: { id: params.id },
    include: {
      employee: true
    }
  })

  return NextResponse.json(attendance)
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json()

  const attendance = await prisma.attendance.update({
    where: { id: params.id },
    data: {
      date: body.date ? new Date(body.date) : undefined,
      checkIn: body.checkIn ? new Date(body.checkIn) : undefined,
      checkOut: body.checkOut ? new Date(body.checkOut) : undefined,
      status: body.status,
      notes: body.notes
    }
  })

  return NextResponse.json(attendance)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.attendance.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ success: true })
}
