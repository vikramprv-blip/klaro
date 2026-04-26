import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      employeeId,
      orgId,
      action,
      lat,
      lng,
      branchId,
    } = body;

    if (!employeeId || !action) {
      return NextResponse.json({ error: "employeeId and action required" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance record exists for today
    const existing = await prisma.attendance.findFirst({
      where: { employeeId, date: today },
    });

    // Check geo location against branch if branchId provided
    let isRemote = true;
    if (branchId && lat && lng) {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
      });
      if (branch?.lat && branch?.lng) {
        const dist = getDistanceMeters(lat, lng, branch.lat, branch.lng);
        isRemote = dist > branch.radiusMeters;
      }
    }

    if (action === "in") {
      if (existing?.checkIn) {
        return NextResponse.json({ error: "Already punched in today" }, { status: 400 });
      }

      const record = existing
        ? await prisma.attendance.update({
            where: { id: existing.id },
            data: {
              checkIn: new Date(),
              punchInLat: lat,
              punchInLng: lng,
              branchId,
              isRemote,
              status: "present",
            },
          })
        : await prisma.attendance.create({
            data: {
              employeeId,
              orgId,
              date: today,
              checkIn: new Date(),
              punchInLat: lat,
              punchInLng: lng,
              branchId,
              isRemote,
              status: "present",
            },
          });

      return NextResponse.json({ ok: true, action: "in", record });
    }

    if (action === "out") {
      if (!existing?.checkIn) {
        return NextResponse.json({ error: "Not punched in yet" }, { status: 400 });
      }
      if (existing?.checkOut) {
        return NextResponse.json({ error: "Already punched out today" }, { status: 400 });
      }

      const record = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkOut: new Date(),
          punchOutLat: lat,
          punchOutLng: lng,
        },
      });

      return NextResponse.json({ ok: true, action: "out", record });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error("punch error", e);
    return NextResponse.json({ error: "Failed to record punch" }, { status: 500 });
  }
}

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
