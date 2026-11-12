// Module 4 business rules as small pure functions, so they can be tested and explained.
import { branchName } from "@/data/branches";
import { formatLKR } from "@/lib/format";
import type { Order, OrderItem, OrderStatus, RepeatEvery, WhenToTake } from "@/types/orders";

/** "Today" in the prototype, the same date Module 5 uses. */
export const TODAY = "2026-11-06";

/** "ord-01" -> "ORD-01". */
export const orderCode = (id: string) => id.toUpperCase();

/**
 * The next status. It moves one step at a time and never goes back.
 * Collected at a branch: received -> preparing -> ready -> collected.
 * Delivered:             received -> preparing -> ready -> out_for_delivery.
 */
export function nextStatus(order: Pick<Order, "status" | "fulfilment">): OrderStatus {
  const last: OrderStatus = order.fulfilment === "collect" ? "collected" : "out_for_delivery";
  const flow: OrderStatus[] = ["received", "preparing", "ready", last];
  return flow[flow.indexOf(order.status) + 1] ?? order.status;
}

export const isFinished = (status: OrderStatus) => status === "collected" || status === "out_for_delivery";

/** The button that moves the order on, or null when it is finished. */
export function nextActionLabel(order: Pick<Order, "status" | "fulfilment">): string | null {
  if (order.status === "received") return "Start preparing";
  if (order.status === "preparing") return "Mark ready";
  if (order.status === "ready") return order.fulfilment === "collect" ? "Mark collected" : "Send for delivery";
  return null;
}

/** Next preparation date for a repeat order. From the report: weekly adds 7 days, monthly adds a month. */
export function nextRepeat(date: string, every: RepeatEvery): string {
  const d = new Date(date + "T00:00:00");
  if (every === "week") d.setDate(d.getDate() + 7);
  else {
    // 31 Jan + 1 month is 28 Feb, not 3 Mar: keep the day inside the next month.
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, lastDay));
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Whole days from today to an ISO date. Negative means overdue. */
export function daysFromToday(date: string, today = TODAY): number {
  return Math.round((Date.parse(date) - Date.parse(today)) / 86_400_000);
}

/** Subtotal, regular-customer discount, delivery fee and total, all in LKR. */
export function orderTotals(order: Pick<Order, "items" | "discountPercent" | "deliveryFee">) {
  const subtotal = order.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const discount = Math.round(subtotal * order.discountPercent) / 100;
  const total = subtotal - discount + order.deliveryFee;
  return { subtotal, discount, deliveryFee: order.deliveryFee, total };
}

export const labelledItems = (items: OrderItem[]) => items.filter((i) => i.needsLabel);

const TIMES_WORDS: Record<number, string> = { 1: "once a day", 2: "twice a day", 3: "3 times a day", 4: "4 times a day" };

export const WHEN_LABELS: Record<WhenToTake, string> = {
  before_meals: "Before meals",
  after_meals: "After meals",
  at_night: "At night",
  any_time: "Any time",
};

/** The instruction line on the dispensing label: "Take 1 capsule, 3 times a day for 7 days". */
export function labelText(item: Pick<OrderItem, "dose" | "timesPerDay" | "days">): string {
  const times = TIMES_WORDS[item.timesPerDay ?? 1] ?? `${item.timesPerDay} times a day`;
  return `Take ${item.dose ?? "as directed"}, ${times} for ${item.days ?? 1} days`;
}

/** Which of Morning, Afternoon and Night to mark on the label. */
export function doseTimes(item: Pick<OrderItem, "timesPerDay" | "when">): string[] {
  if (item.when === "at_night") return ["Night"];
  const n = item.timesPerDay ?? 1;
  if (n === 1) return ["Morning"];
  if (n === 2) return ["Morning", "Night"];
  return ["Morning", "Afternoon", "Night"];
}

/** The WhatsApp-style "your order is ready" message. Nothing is actually sent. */
export function readyMessage(order: Order): string {
  const first = order.customerName.split(" ")[0];
  const branch = branchName(order.branchId);
  const { total } = orderTotals(order);
  const how =
    order.fulfilment === "collect"
      ? `You can collect it from our ${branch} branch.`
      : order.fulfilment === "pickme_flash"
        ? "Your PickMe Flash rider can collect it from the counter."
        : "Our driver will bring it to you today.";
  return `Hello ${first}, your order ${orderCode(order.id)} from Medizone Pharmacy (${branch}) is ready.\n\nTotal: ${formatLKR(total)}\n${how}\n\nThank you! – medizone.lk`;
}

export const SOURCE_LABELS = { online: "Online", whatsapp: "WhatsApp", branch: "At branch", repeat: "Repeat" } as const;

export const FULFILMENT_LABELS = { collect: "Collect at branch", own_driver: "Pharmacy driver", pickme_flash: "PickMe Flash" } as const;

export const PAY_LABELS = {
  card: "Card",
  cash: "Cash",
  bank_transfer: "Bank transfer",
  cod: "Cash on delivery",
  pay_at_counter: "Pay at counter",
} as const;

/** "2026-11-06T09:30" -> "9:30 am". */
export function timeOf(isoDateTime: string): string {
  const [h, m] = isoDateTime.slice(11, 16).split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Customers see friendlier words than staff for the same status. */
export function customerStatusLabel(order: Pick<Order, "status" | "fulfilment"> & { history?: Order["history"] }): string {
  const delivered = order.fulfilment !== "collect";
  // The staff flow ends at "out for delivery". Sent out on an earlier day means it has arrived.
  const sentOut = order.history?.find((h) => h.status === "out_for_delivery");
  if (order.status === "out_for_delivery" && sentOut && !sentOut.at.startsWith(TODAY)) return "Delivered";
  const labels: Record<OrderStatus, string> = {
    received: "Order placed",
    preparing: "Being prepared",
    ready: delivered ? "Packed" : "Ready to collect",
    collected: "Collected",
    out_for_delivery: "Out for delivery",
  };
  return labels[order.status];
}

/** Regular-customer discount for a signed-in customer. The demo accounts say it in their title: "Customer (regular, 5%)". */
export function customerDiscount(jobTitle: string | undefined): 0 | 3 | 5 {
  const match = jobTitle?.match(/(\d+)%/);
  const n = match ? Number(match[1]) : 0;
  return n === 5 || n === 3 ? n : 0;
}

/** Delivery fee for the pharmacy's own driver. */
export const DELIVERY_FEE = 350;
