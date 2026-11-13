// Module 5 helpers: formatting and the business rules for loyalty, feedback and refill reminders.
// Pure functions only, so other modules can reuse them.

import type {
  Customer,
  CustomerFeedback,
  DiscountPercent,
  LoyaltyTransaction,
  PrescriptionStatus,
  Purchase,
  PurchaseItem,
  Rating,
  RefillReminder,
  ReminderStatus,
  StoredPrescription,
} from "@/types/customers";

/**
 * Fallback "today", used only while rendering on the server. In the browser the module
 * uses the real local date (getTodayISO), so reminder statuses follow the calendar.
 */
export const PROTOTYPE_TODAY = "2026-11-13";

/** Today's date in the browser's time zone (Sri Lanka for staff), as "YYYY-MM-DD". */
export function getTodayISO(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** "cus-01" -> "CUS-001", the display format used on screen. Internal ids never change. */
export function formatCustomerId(id: string): string {
  const match = /^cus-(\d+)$/i.exec(id);
  return match ? `CUS-${match[1].padStart(3, "0")}` : id.toUpperCase();
}

/** Name or phone search used by every list in the module. Phone digits may include spaces. */
export function matchesCustomerSearch(customer: Pick<Customer, "name" | "phone">, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const digits = normalizePhone(q);
  return customer.name.toLowerCase().includes(q) || (digits.length >= 3 && customer.phone.includes(digits));
}

/** Reminders show for refills due within this many days. */
export const REMINDER_WINDOW_DAYS = 7;

/** Refills more than this many days late are treated as stopped medicines and hidden. */
export const REMINDER_LAPSE_DAYS = 14;

/* ---------- Formatting (follows the Medizone design system) ---------- */

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** `Rs. 1,250.00`, or `Rs. 1,250` with decimals: 0. */
export function formatLKR(amount: number, opts?: { decimals?: 0 | 2 }): string {
  const decimals = opts?.decimals ?? 2;
  const sign = amount < 0 ? "-" : "";
  const [whole, fraction] = Math.abs(amount).toFixed(decimals).split(".");
  return `${sign}Rs. ${groupThousands(whole)}${fraction ? `.${fraction}` : ""}`;
}

export function formatNumber(n: number): string {
  const sign = n < 0 ? "-" : "";
  return sign + groupThousands(String(Math.abs(Math.round(n))));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseISODate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

/** `04 Nov 2026`, as in the design. Dates are handled in UTC so server and browser always agree. */
export function formatDate(iso: string): string {
  const d = parseISODate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatMonth(isoMonth: string): string {
  const [y, m] = isoMonth.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

/** `077 123 4567` */
export function formatPhone(phone: string): string {
  const d = normalizePhone(phone);
  if (d.length !== 10) return phone;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

export function normalizePhone(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("94") && d.length === 11) d = `0${d.slice(2)}`;
  return d;
}

/** Sri Lankan mobile numbers: 07X XXX XXXX (also accepts +94 7X…). */
export function isValidSriLankanMobile(phone: string): boolean {
  return /^07\d{8}$/.test(normalizePhone(phone));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ---------- Dates ---------- */

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / 86_400_000);
}

/** "Today", "in 3 days", "2 days ago". */
export function describeDaysFromToday(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`;
}

/* ---------- Discounts and loyalty ---------- */

/** Business rule: earn 1 loyalty point for every LKR 100 spent. */
export function calculateLoyaltyPoints(purchaseTotal: number): number {
  if (!Number.isFinite(purchaseTotal) || purchaseTotal <= 0) return 0;
  return Math.floor(purchaseTotal / 100);
}

export function discountForCustomer(customer: Pick<Customer, "isRegular" | "discountPercent">): DiscountPercent {
  return customer.isRegular ? customer.discountPercent : 0;
}

/**
 * Totals for one bill. The regular-customer discount comes off first; loyalty points are
 * then earned on the amount paid. The discount and the points are separate benefits.
 */
export function calculatePurchaseTotals(items: PurchaseItem[], discountPercent: DiscountPercent) {
  const subtotal = round2(items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0));
  const discountAmount = round2((subtotal * discountPercent) / 100);
  const total = round2(subtotal - discountAmount);
  return { subtotal, discountAmount, total, pointsEarned: calculateLoyaltyPoints(total) };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function loyaltySummary(transactions: LoyaltyTransaction[]) {
  let earned = 0;
  let redeemed = 0;
  let adjusted = 0;
  for (const t of transactions) {
    if (t.type === "earned") earned += t.points;
    else if (t.type === "redeemed") redeemed += Math.abs(t.points);
    else adjusted += t.points;
  }
  return { earned, redeemed, adjusted, balance: earned + adjusted - redeemed };
}

/* ---------- Feedback ---------- */

export const RATING_LABELS: Record<Rating, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

export function averageRating(feedback: Pick<CustomerFeedback, "rating">[]): number {
  if (feedback.length === 0) return 0;
  return feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
}

/** Average to one decimal, e.g. "4.2". */
export function formatRating(value: number): string {
  return value.toFixed(1);
}

export function ratingDistribution(feedback: Pick<CustomerFeedback, "rating">[]) {
  const counts: Record<Rating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const f of feedback) counts[f.rating] += 1;
  return ([5, 4, 3, 2, 1] as Rating[]).map((rating) => ({
    rating,
    count: counts[rating],
    /** One decimal place, e.g. 66.7. */
    percent: feedback.length ? Math.round((counts[rating] / feedback.length) * 1000) / 10 : 0,
  }));
}

/** Low ratings are 1 or 2 stars everywhere in the module. */
export function isLowRating(rating: number): boolean {
  return rating <= 2;
}

/* ---------- Prescriptions ---------- */

export function prescriptionStatus(p: StoredPrescription, today = PROTOTYPE_TODAY): PrescriptionStatus {
  return daysBetween(today, p.validUntil) >= 0 ? "active" : "expired";
}

/* ---------- Refill reminders (rule-based prediction) ---------- */

/** Rule: expected refill date = purchase date + days of supply. */
export function expectedRefillDate(purchaseDate: string, daysSupply: number): string {
  return addDays(purchaseDate, daysSupply);
}

export function reminderStatus(daysUntilRefill: number, sentOn?: string): ReminderStatus {
  if (sentOn) return "sent";
  if (daysUntilRefill < 0) return "overdue";
  if (daysUntilRefill <= REMINDER_WINDOW_DAYS) return "due_soon";
  return "upcoming";
}

/**
 * One reminder per customer and medicine, from the latest purchase of that medicine
 * that has a days-of-supply value.
 */
export function buildRefillReminders(
  purchases: Purchase[],
  sent: Record<string, string>,
  today = PROTOTYPE_TODAY,
): RefillReminder[] {
  const latest = new Map<string, { purchase: Purchase; item: PurchaseItem; index: number }>();
  for (const purchase of purchases) {
    purchase.items.forEach((item, index) => {
      if (!item.daysSupply) return;
      const key = `${purchase.customerId}|${item.medicine}`;
      const current = latest.get(key);
      if (!current || current.purchase.date < purchase.date) latest.set(key, { purchase, item, index });
    });
  }

  const reminders: RefillReminder[] = [];
  for (const { purchase, item, index } of latest.values()) {
    const daysSupply = item.daysSupply as number;
    const refillDate = expectedRefillDate(purchase.date, daysSupply);
    const daysUntilRefill = daysBetween(today, refillDate);
    if (daysUntilRefill < -REMINDER_LAPSE_DAYS) continue;
    const id = `rem-${purchase.id}-${index + 1}`;
    reminders.push({
      id,
      customerId: purchase.customerId,
      purchaseId: purchase.id,
      medicine: item.medicine,
      purchaseDate: purchase.date,
      daysSupply,
      expectedRefillDate: refillDate,
      daysUntilRefill,
      status: reminderStatus(daysUntilRefill, sent[id]),
      sentOn: sent[id],
    });
  }
  return reminders.sort((a, b) => a.daysUntilRefill - b.daysUntilRefill);
}

/** The personalised reminder text a pharmacist would send. Shown as a preview only; nothing is sent. */
export function buildReminderMessage(
  customer: Pick<Customer, "name">,
  reminder: Pick<RefillReminder, "medicine" | "expectedRefillDate" | "daysUntilRefill">,
): string {
  const firstName = customer.name.split(" ")[0];
  const date = formatDate(reminder.expectedRefillDate);
  const when =
    reminder.daysUntilRefill < 0
      ? `was expected to run out on ${date}`
      : reminder.daysUntilRefill === 0
        ? `is expected to run out today, ${date}`
        : `is expected to run out on ${date}`;
  return (
    `Hi ${firstName}, your ${reminder.medicine} supply ${when}. ` +
    "Please check your remaining medicine and arrange your next refill through Medizone.lk. " +
    "If your prescription has changed, contact your pharmacist. — Medizone Pharmacy"
  );
}
