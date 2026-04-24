import { NextRequest, NextResponse } from "next/server";
import { getRegionConfigByCode } from "@/lib/db/region-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getRegionFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0]?.toLowerCase();
  if (["in", "us", "uk", "eu", "ae", "asia"].includes(first)) return first;
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const pathname = String(body?.pathname || req.headers.get("x-klaro-pathname") || "");
  const regionCode = getRegionFromPath(pathname);
  const regionConfig = await getRegionConfigByCode(regionCode);

  const originalMessages = Array.isArray(body?.messages) ? body.messages : [];
  const aiPromptPrefix = regionConfig?.ai_prompt_prefix || "";

  const messages =
    aiPromptPrefix
      ? [
          {
            role: "system",
            content: aiPromptPrefix,
          },
          ...originalMessages,
        ]
      : originalMessages;

  return NextResponse.json({
    ok: true,
    regionCode,
    messages,
  });
}
