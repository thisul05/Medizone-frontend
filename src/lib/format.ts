/**
 * Shared formatters. See docs/UI-STYLE-GUIDE.md section "Content and voice".
 *
 * Store money as a plain number and dates as ISO text; format only when
 * displaying, so sorting and arithmetic stay correct.
 */

/**
 * Money: `Rs. 1,250.00` — prefix, two decimals, comma thousands.
 * KPI tiles may drop the decimals: formatLKR(184250, { decimals: false }).
 */
export function formatLKR(amount: number, options?: { decimals?: boolean }): string {
  const decimals = options?.decimals ?? true;
  const digits = decimals ? 2 : 0;
  const value = amount.toLocaleString("en-LK", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `Rs. ${value}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Date: ISO `2026-11-04` in, `4 Nov 2026` out.
 * A full ISO timestamp (`2026-11-04T09:00:00.000Z`) also works: only the date part is read.
 */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** Month: ISO `2026-11` in, `Nov 2026` out. Used by the payroll month picker. */
export function formatMonth(iso: string): string {
  const [year, month] = iso.split("-").map(Number);
  if (!year || !month) return iso;
  return `${MONTHS[month - 1]} ${year}`;
}

/** Time: 24-hour `19:40` in, `7:40 pm` out. */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const suffix = hours < 12 ? "am" : "pm";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** Phone: `0771234567` in, `077 123 4567` out. */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}
