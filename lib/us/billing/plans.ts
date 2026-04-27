export type UsPlan = "FREE" | "PRO" | "FIRM";

export const US_PLANS: Record<
  UsPlan,
  {
    name: string;
    storageLimitMb: number;
    monthlyPriceUsd: number;
  }
> = {
  FREE: {
    name: "Free",
    storageLimitMb: 1024,
    monthlyPriceUsd: 0,
  },
  PRO: {
    name: "Pro",
    storageLimitMb: 10240,
    monthlyPriceUsd: 29,
  },
  FIRM: {
    name: "Firm",
    storageLimitMb: 102400,
    monthlyPriceUsd: 99,
  },
};

export function getUsPlan(plan?: string | null): UsPlan {
  if (plan === "PRO" || plan === "FIRM" || plan === "FREE") return plan;
  return "FREE";
}

export function getUsStorageLimitMb(plan?: string | null) {
  return US_PLANS[getUsPlan(plan)].storageLimitMb;
}
