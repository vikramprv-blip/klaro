export function getPlanLimit(plan?: string | null) {
  if (plan === "pro") return Number(process.env.NEXT_PUBLIC_PRO_DOC_LIMIT || 9999);
  return Number(process.env.NEXT_PUBLIC_STARTER_DOC_LIMIT || 25);
}

export function isOverLimit(currentCount: number, plan?: string | null) {
  return currentCount >= getPlanLimit(plan);
}
