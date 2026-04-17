export function formatDate(date?: string | Date | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
