// Customer account business rules as pure functions. Reuses Module 4 and Module 5 rules
// (order totals, loyalty points, dates) so every module calculates the same numbers.
import { addDays, calculateLoyaltyPoints, daysBetween, isValidEmail, isValidSriLankanMobile } from "@/lib/customers";
import { PAY_LABELS, customerStatusLabel, isFinished, orderCode, orderTotals } from "@/lib/orders";
import type {
  AccountPayment, AccountSeed, AddressInput, LoyaltyEntry, PaymentStatus, RefillReminder, RefillStatus,
} from "@/types/account";
import type { Order } from "@/types/orders";

/** Refills due within this many days are "due soon". */
export const DUE_SOON_DAYS = 7;

/** Local date as ISO "YYYY-MM-DD". Call from effects, event handlers or store snapshots, never during server render. */
export function todayISO(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/* ---------- Orders ---------- */

/** Delivered or collected. */
export function isCompletedOrder(order: Order): boolean {
  const label = customerStatusLabel(order);
  return label === "Delivered" || label === "Collected";
}

export function orderStatusTone(order: Order): "success" | "info" | "transit" | "neutral" {
  if (isCompletedOrder(order)) return "success";
  if (order.status === "out_for_delivery") return "transit";
  if (isFinished(order.status)) return "neutral";
  return "info";
}

/** "Vidafast nutrition powder 400 g + 2 more". */
export function orderSummary(order: Order): string {
  const [first, ...rest] = order.items;
  if (!first) return "No items";
  return rest.length ? `${first.name} + ${rest.length} more` : first.name;
}

/** Subtotal less the regular-customer discount. Delivery fees do not earn points. */
export function eligibleAmount(order: Order): number {
  const { subtotal, discount } = orderTotals(order);
  return subtotal - discount;
}

/* ---------- Payments ---------- */

/** "ord-15" -> "PAY-0015". */
export function paymentId(orderId: string): string {
  const n = orderId.replace(/\D/g, "");
  return `PAY-${n.padStart(4, "0")}`;
}

function paymentStatus(order: Order): PaymentStatus {
  if (order.paymentState === "paid") return "paid";
  if (order.payMethod === "cod") return "due_on_delivery";
  if (order.payMethod === "pay_at_counter" || order.payMethod === "cash") return "pay_at_counter";
  return "awaiting";
}

/** When the money was received: at checkout for card and bank transfer, otherwise at the last status step. */
function paymentDate(order: Order): string {
  if (order.paymentState !== "paid" || order.payMethod === "card" || order.payMethod === "bank_transfer") return order.receivedAt;
  return order.history[order.history.length - 1]?.at ?? order.receivedAt;
}

export function paymentForOrder(order: Order): AccountPayment {
  const totals = orderTotals(order);
  return {
    id: paymentId(order.id),
    orderId: order.id,
    date: paymentDate(order),
    method: PAY_LABELS[order.payMethod],
    status: paymentStatus(order),
    subtotal: totals.subtotal,
    discount: totals.discount,
    discountPercent: order.discountPercent,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
  };
}

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: "success" | "warning" | "transit" }> = {
  paid: { label: "Paid", tone: "success" },
  due_on_delivery: { label: "Due on delivery", tone: "transit" },
  pay_at_counter: { label: "Pay at counter", tone: "warning" },
  awaiting: { label: "Awaiting payment", tone: "warning" },
};

/* ---------- Loyalty ---------- */

/**
 * The points ledger, oldest first, with a running balance.
 * Paid orders earn 1 point per Rs. 100 of eligible purchases (after the regular-customer discount).
 */
export function buildLoyaltyLedger(seed: AccountSeed, orders: Order[]): LoyaltyEntry[] {
  type Row = Omit<LoyaltyEntry, "balance">;
  const rows: Row[] = [];
  if (seed.openingPoints && seed.openingPoints.points > 0) {
    rows.push({ id: "LP-open", date: seed.openingPoints.date, reference: "Opening balance", description: "Balance carried over from your paper loyalty card", earned: seed.openingPoints.points, redeemed: 0 });
  }
  for (const order of orders) {
    if (order.paymentState !== "paid") continue;
    const points = calculateLoyaltyPoints(eligibleAmount(order));
    if (points <= 0) continue;
    rows.push({ id: `LP-${order.id}`, date: paymentDate(order).slice(0, 10), orderId: order.id, description: `Points earned on order ${orderCode(order.id)}`, earned: points, redeemed: 0 });
  }
  for (const r of seed.redemptions) {
    rows.push({ id: r.id, date: r.date, reference: "In store", description: r.description, earned: 0, redeemed: r.points });
  }
  rows.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  let balance = 0;
  return rows.map((row) => {
    balance += row.earned - row.redeemed;
    return { ...row, balance };
  });
}

export function loyaltyTotals(ledger: LoyaltyEntry[]) {
  const earned = ledger.reduce((s, e) => s + e.earned, 0);
  const redeemed = ledger.reduce((s, e) => s + e.redeemed, 0);
  return { earned, redeemed, balance: earned - redeemed };
}

/* ---------- Refill reminders ---------- */

export function refillStatus(daysRemaining: number): RefillStatus {
  if (daysRemaining < 0) return "overdue";
  if (daysRemaining <= DUE_SOON_DAYS) return "due_soon";
  return "upcoming";
}

/** Estimated refill date = purchase date + days supply, compared with today. */
export function buildRefillReminders(seed: AccountSeed, today: string): RefillReminder[] {
  return seed.refills
    .map(({ daysAgo, ...rest }) => {
      const purchaseDate = addDays(today, -daysAgo);
      const refillDate = addDays(purchaseDate, rest.daysSupply);
      const daysRemaining = daysBetween(today, refillDate);
      return { ...rest, purchaseDate, refillDate, daysRemaining, status: refillStatus(daysRemaining) };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export const REFILL_STATUS: Record<RefillStatus, { label: string; tone: "danger" | "warning" | "info" }> = {
  overdue: { label: "Refill overdue", tone: "danger" },
  due_soon: { label: "Due soon", tone: "warning" },
  upcoming: { label: "Upcoming", tone: "info" },
};

/** "In 4 days", "Today", "2 days overdue". */
export function describeDaysRemaining(days: number): string {
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  if (days > 1) return `${days} days left`;
  return days === -1 ? "1 day overdue" : `${Math.abs(days)} days overdue`;
}

/* ---------- Validation ---------- */

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export function validateProfile(input: { name: string; email: string; phone: string }): FieldErrors<"name" | "email" | "phone"> {
  const e: FieldErrors<"name" | "email" | "phone"> = {};
  if (input.name.trim().length < 3) e.name = "Enter your full name (at least 3 characters).";
  if (!input.email.trim()) e.email = "Enter your email address.";
  else if (!isValidEmail(input.email)) e.email = "Enter a valid email address, like name@example.com.";
  if (!input.phone.trim()) e.phone = "Enter your mobile number.";
  else if (!isValidSriLankanMobile(input.phone)) e.phone = "Enter a Sri Lankan mobile number, like 077 123 4567.";
  return e;
}

export function validateAddress(input: AddressInput): FieldErrors<keyof AddressInput> {
  const e: FieldErrors<keyof AddressInput> = {};
  if (input.fullName.trim().length < 3) e.fullName = "Enter the recipient's full name.";
  if (!input.phone.trim()) e.phone = "Enter a mobile number.";
  else if (!isValidSriLankanMobile(input.phone)) e.phone = "Enter a Sri Lankan mobile number, like 077 123 4567.";
  if (input.addressLine.trim().length < 5) e.addressLine = "Enter the house number and street.";
  if (!input.city.trim()) e.city = "Enter the city or town.";
  if (!input.district) e.district = "Choose a district.";
  if (!input.postalCode.trim()) e.postalCode = "Enter the postal code.";
  else if (!/^\d{5}$/.test(input.postalCode.trim())) e.postalCode = "Postal codes have 5 digits, like 10300.";
  return e;
}
