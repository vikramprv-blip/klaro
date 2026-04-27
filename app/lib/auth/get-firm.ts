export function getFirmIdFromUser(user: any) {
  return user?.user_metadata?.firm_id || null
}
