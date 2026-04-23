import { getRegion, type RegionCode } from "@/lib/regions/config";

const COUNTRY_TO_REGION: Record<string, RegionCode> = {
  IN: "in",
  US: "us",
  GB: "uk",
  UK: "uk",
  AE: "ae",
  SG: "asia",
  TH: "asia",
  VN: "asia",
  FR: "eu",
  DE: "eu",
  IT: "eu",
  ES: "eu",
  NL: "eu",
  BE: "eu",
  IE: "eu",
  PT: "eu",
  AT: "eu",
  FI: "eu",
  SE: "eu",
  DK: "eu",
  PL: "eu",
  CZ: "eu",
  HU: "eu",
  RO: "eu",
  GR: "eu",
};

export function detectRegionFromCountry(countryCode?: string | null) {
  if (!countryCode) return null;
  const code = COUNTRY_TO_REGION[countryCode.toUpperCase()];
  return getRegion(code);
}
