/**
 * The shared status table. See docs/UI-STYLE-GUIDE.md section "Statuses".
 *
 * Every status value in the project maps to one tone and one label, so each
 * module says the same thing. Status is never colour alone: the badge always
 * shows the word too.
 *
 * Never invent a new colour for a status — add the value here with one of the
 * six tones.
 */

export type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "transit";

export interface StatusEntry {
  label: string;
  tone: Tone;
}

/** What each tone means, for reference when adding a new status. */
export const TONE_MEANING: Record<Tone, string> = {
  neutral: "Recorded or finished; nothing to do",
  info: "In progress at the pharmacy",
  success: "Done, available, paid",
  warning: "Needs attention soon",
  danger: "Blocked, overdue, refused",
  transit: "On its way to the customer",
};

export const STATUS = {
  // Module 3 — Products and inventory
  stock: {
    in_stock: { label: "In stock", tone: "success" },
    low: { label: "Low stock", tone: "warning" },
    out: { label: "Out of stock", tone: "danger" },
  },

  // Module 4 — Prescriptions and orders
  order: {
    received: { label: "Received", tone: "neutral" },
    preparing: { label: "Preparing", tone: "info" },
    ready: { label: "Ready for pickup", tone: "success" },
    collected: { label: "Collected", tone: "neutral" },
    out_for_delivery: { label: "Out for delivery", tone: "transit" },
  },

  // Module 6 — Suppliers and purchases
  purchaseOrder: {
    draft: { label: "Draft", tone: "neutral" },
    sent: { label: "Sent", tone: "info" },
    partial: { label: "Partly received", tone: "warning" },
    received: { label: "Received", tone: "success" },
  },
  paymentStage: {
    cash_on_delivery: { label: "Cash on delivery", tone: "warning" },
    post_dated_cheque: { label: "Post-dated cheque", tone: "info" },
    credit: { label: "Credit", tone: "success" },
  },
  invoice: {
    due: { label: "Due", tone: "warning" },
    overdue: { label: "Overdue", tone: "danger" },
    paid: { label: "Paid", tone: "success" },
  },

  // Module 7 — Delivery, returns and warranty
  delivery: {
    pending: { label: "Pending", tone: "warning" },
    out: { label: "Out", tone: "transit" },
    delivered: { label: "Delivered", tone: "success" },
  },
  customerReturn: {
    requested: { label: "Requested", tone: "warning" },
    approved: { label: "Approved", tone: "success" },
    rejected: { label: "Rejected", tone: "danger" },
  },
  warranty: {
    received: { label: "Received", tone: "warning" },
    sent_to_supplier: { label: "Sent to supplier", tone: "info" },
    under_repair: { label: "Under repair", tone: "warning" },
    replaced: { label: "Replaced", tone: "success" },
    returned: { label: "Returned", tone: "neutral" },
  },

  // Module 8 — Billing and payments
  payMethod: {
    cash: { label: "Cash", tone: "neutral" },
    card: { label: "Card", tone: "neutral" },
    bank_transfer: { label: "Bank transfer", tone: "neutral" },
    cod: { label: "Cash on delivery", tone: "transit" },
  },

  // Module 9 — Staff and payroll
  attendance: {
    present: { label: "Present", tone: "success" },
    absent: { label: "Absent", tone: "danger" },
    partial: { label: "Missing out-time", tone: "warning" },
  },
} as const satisfies Record<string, Record<string, StatusEntry>>;

export type StatusKind = keyof typeof STATUS;

/** Look up a status, falling back to a neutral badge for unknown values. */
export function getStatus(kind: StatusKind, value: string): StatusEntry {
  const entry = (STATUS[kind] as Record<string, StatusEntry>)[value];
  return entry ?? { label: value, tone: "neutral" };
}
