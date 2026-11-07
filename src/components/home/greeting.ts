/** "Good morning" / "Good afternoon" / "Good evening" for the current local time. */
export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
