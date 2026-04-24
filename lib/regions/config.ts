export type RegionCode = "in" | "us" | "uk" | "eu" | "ae" | "asia";

export type RegionConfig = {
  code: RegionCode;
  name: string;
  slug: string;
  suiteName: string;
  currency: string;
  locale: string;
  dateFormat: string;
  aiPromptPrefix: string;
  landingTitle: string;
  landingSubtitle: string;
};

export const REGION_ORDER: RegionCode[] = ["in", "us", "uk", "eu", "ae", "asia"];

export const REGIONS: Record<RegionCode, RegionConfig> = {
  in: {
    code: "in",
    name: "India",
    slug: "in",
    suiteName: "Klaro CA Suite",
    currency: "₹",
    locale: "en-IN",
    dateFormat: "en-IN",
    aiPromptPrefix: "Context: The user is operating in India. Prefer Indian compliance, terminology, currency, and date context unless the user explicitly asks otherwise.",
    landingTitle: "Klaro for India",
    landingSubtitle: "AI operations platform for Indian service workflows.",
  },
  us: {
    code: "us",
    name: "United States",
    slug: "us",
    suiteName: "Klaro US",
    currency: "$",
    locale: "en-US",
    dateFormat: "en-US",
    aiPromptPrefix: "Context: The user is operating in the United States. Prefer US compliance, terminology, currency, and date context unless the user explicitly asks otherwise.",
    landingTitle: "Klaro for the United States",
    landingSubtitle: "AI operations platform for US service workflows.",
  },
  uk: {
    code: "uk",
    name: "United Kingdom",
    slug: "uk",
    suiteName: "Klaro UK",
    currency: "£",
    locale: "en-GB",
    dateFormat: "en-GB",
    aiPromptPrefix: "Context: The user is operating in the United Kingdom. Prefer UK compliance, terminology, currency, and date context unless the user explicitly asks otherwise.",
    landingTitle: "Klaro for the United Kingdom",
    landingSubtitle: "AI operations platform for UK service workflows.",
  },
  eu: {
    code: "eu",
    name: "European Union",
    slug: "eu",
    suiteName: "Klaro EU",
    currency: "€",
    locale: "en-IE",
    dateFormat: "en-IE",
    aiPromptPrefix: "Context: The user is operating in the European Union. Prefer EU compliance, terminology, currency, and date context unless the user explicitly asks otherwise.",
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
    dateFormat: "en-GB",
    aiPromptPrefix: "Context: The user is operating in the UAE. Prefer UAE compliance, terminology, currency, and date context unless the user explicitly asks otherwise.",
    landingTitle: "Klaro for the UAE",
    landingSubtitle: "AI operations platform for UAE service workflows.",
  },
  asia: {
    code: "asia",
    name: "Asia",
    slug: "asia",
    suiteName: "Klaro Asia",
    currency: "$",
    locale: "en-SG",
    dateFormat: "en-SG",
    aiPromptPrefix: "Context: The user is operating in Asia. Prefer regional business context, currency, and date formatting unless the user explicitly asks otherwise.",
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
