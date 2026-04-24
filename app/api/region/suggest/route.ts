import { NextRequest, NextResponse } from "next/server";
import { detectRegionFromCountry } from "@/lib/regions/detect";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const headerCountry =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country-code");

  const region = detectRegionFromCountry(headerCountry);

  return NextResponse.json({
    ok: true,
    countryCode: headerCountry || null,
    suggestedRegion: region
      ? {
          code: region.code,
          name: region.name,
          slug: region.slug,
          landingPath: `/${region.slug}`,
        }
      : null,
  });
}
