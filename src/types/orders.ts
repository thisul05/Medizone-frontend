// Module 4: Prescriptions and orders.
// Orders cover online shop orders, WhatsApp prescriptions, prescriptions handed in at a branch
// and repeat orders. Module 7 (Delivery) refers to orders by `id` ("ord-01").
import type { BranchId } from "./roles";

/** Same values as the shared status table (`STATUS.order` in src/lib/status.ts). */
export type OrderStatus = "received" | "preparing" | "ready" | "collected" | "out_for_delivery";

export type OrderSource = "online" | "whatsapp" | "branch" | "repeat";

/** How the order reaches the customer. */
export type Fulfilment = "collect" | "own_driver" | "pickme_flash";

export type OrderPayMethod = "card" | "cash" | "bank_transfer" | "cod" | "pay_at_counter";

export type PaymentState = "paid" | "pending";

export type WhenToTake = "before_meals" | "after_meals" | "at_night" | "any_time";

export interface OrderItem {
  name: string;
  qty: number;
  /** LKR per unit. */
  unitPrice: number;
  /** Storefront product id, for online orders. */
  productId?: string;
  /** Dispensing instructions. Only medicines that need a label have them. */
  needsLabel: boolean;
  dose?: string;
  timesPerDay?: number;
  days?: number;
  when?: WhenToTake;
}

export interface StatusStep {
  status: OrderStatus;
  /** ISO date and time, "2026-11-06T09:30". */
  at: string;
  by: string;
}

export interface Order {
  /** "ord-01". Shown as "ORD-01". */
  id: string;
  source: OrderSource;
  customerId: string;
  customerName: string;
  /** Digits only, "0771234567". */
  phone: string;
  branchId: BranchId;
  /** ISO date and time. */
  receivedAt: string;
  status: OrderStatus;
  history: StatusStep[];
  items: OrderItem[];
  fulfilment: Fulfilment;
  address?: string;
  /** ISO date and time the customer expects it ready. */
  readyBy?: string;
  payMethod: OrderPayMethod;
  paymentState: PaymentState;
  discountPercent: 0 | 3 | 5;
  /** LKR. Only for the pharmacy's own driver. */
  deliveryFee: number;
  prescriptionId?: string;
  /** True once the "ready" message was sent to the customer. */
  notified: boolean;
  note?: string;
}

export type RepeatEvery = "week" | "month";

export interface RepeatPlan {
  every: RepeatEvery;
  /** ISO date of the last preparation. */
  lastDate: string;
  /** ISO date of the next preparation. */
  nextDate: string;
  paused?: boolean;
}

export interface Prescription {
  /** "RX-1101". */
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  branchId: BranchId;
  doctor: string;
  clinic: string;
  /** ISO date. */
  receivedOn: string;
  via: "whatsapp" | "branch" | "repeat";
  /** Placeholder path; the prototype has no real upload. */
  imageUrl: string;
  /** The latest order prepared from this prescription. */
  orderId?: string;
  repeat?: RepeatPlan;
}

/** A bill from the existing POS system, read only, used to print labels. */
export interface PosBill {
  id: string;
  branchId: BranchId;
  customerName: string;
  payMethod: "cash" | "card";
  /** ISO date and time. */
  date: string;
  items: OrderItem[];
}
