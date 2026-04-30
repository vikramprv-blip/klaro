export const MASTER_ADMINS = [
  "vikramprv@gmail.com",
  "siddharthcha@hotmail.com",
]

export function isMasterAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return MASTER_ADMINS.includes(email.toLowerCase())
}
