import { NextResponse } from "next/server";
import { getAllRegions } from "@/lib/regions/config";

export async function GET() {
  return NextResponse.json({ regions: getAllRegions() });
}
