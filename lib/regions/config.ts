export type RegionCode = "in" | "us" | "uk" | "eu" | "ae" | "asia";

export type RegionConfig = {
  code: RegionCode;
  name: string;
  slug: string;
  suiteName: string;
  currency: string;
  locale: string;
  landingTitle: string;
  landingSubtitle: string;
};

export const REGION_ORDER: RegionCode[] = ["in", "us", "uk", "eu", "ae", "asia"];

export const REGIONS: Record<RegionCode, RegionConfig> = {
  in: {
    code: "in",
    name: "India",
    slug: "in",
    suiteName: "Klaro India",
    currency: "INR",
    locale: "en-IN",
    landingTitle: "Klaro for India",
    landingSubtitle: "AI operations platform for Indian service workflows.",
  },
  us: {
    code: "us",
    name: "United States",
    slug: "us",
    suiteName: "Klaro United States",
    currency: "USD",
    locale: "en-US",
    landingTitle: "Klaro for the United States",
    landingSubtitle: "AI operations platform for US service workflows.",
  },
  uk: {
    code: "uk",
    name: "United Kingdom",
    slug: "uk",
    suiteName: "Klaro United Kingdom",
    currency: "GBP",
    locale: "en-GB",
    landingTitle: "Klaro for the United Kingdom",
    landingSubtitle: "AI operations platform for UK service workflows.",
  },
  eu: {
    code: "eu",
    name: "European Union",
    slug: "eu",
    suiteName: "Klaro European Union",
    currency: "EUR",
    locale: "en-EU",
    landingTitle: "Klaro for the European Union",
    landingSubtitle: "AI operations platform for EU service workflows.",
  },
  ae: {
    code: "ae",
    name: "UAE",
    slug: "ae",
    suiteName: "Klaro UAE",
    currency: "AED",
    locale: "en-AE",
    landingTitle: "Klaro for the UAE",
    landingSubtitle: "AI operations platform for UAE service workflows.",
  },
  asia: {
    code: "asia",
    name: "Asia",
    slug: "asia",
    suiteName: "Klaro Asia",
    currency: "USD",
    locale: "en-SG",
    landingTitle: "Klaro for Asia",
    landingSubtitle: "AI operations platform for Asia expansion markets.",
  },
};

export function getRegion(code?: string | null): RegionConfig | null {
  if (!code) return null;
  const normalized = code.toLowerCase() as RegionCode;
  return REGIONS[normalized] ?? null;
}

export function getAllRegions(): RegionConfig[] {
  return REGION_ORDER.map((code) => REGIONS[code]);
}
