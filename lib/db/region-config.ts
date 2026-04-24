import { prisma } from "@/lib/prisma";
import { getRegion } from "@/lib/regions/config";

export async function getRegionConfigByCode(code?: string | null) {
  if (!code) return null;

  try {
    const row = await prisma.$queryRawUnsafe<any[]>(
      `select code, name, slug, suite_name, currency_symbol, locale, date_format, ai_prompt_prefix, landing_title, landing_subtitle
       from region_configs
       where code = $1
       limit 1`,
      code.toLowerCase()
    );

    if (Array.isArray(row) && row[0]) {
      return row[0];
    }
  } catch (_error) {}

  return getRegion(code);
}
