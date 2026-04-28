import { isOverLimit } from "@/lib/usage/check-usage";

export function shouldShowUpgradeLock(currentCount: number, plan?: string | null) {
  if (plan === "pro") return false;
  return isOverLimit(currentCount, plan);
}
