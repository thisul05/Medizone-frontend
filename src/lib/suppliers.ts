import { PaymentStage } from "@/types/suppliers";

/**
 * Calculates payment due date based on supplier payment stage and credit terms.
 * - Cash on delivery: due on order/delivery date
 * - Post-dated cheque: 7-10 days credit (defaults to 10 days)
 * - Credit: 30-35 days after smooth cheque clearance (uses agreed creditDays)
 */
export function dueDate(
  orderDate: string,
  stage: PaymentStage,
  creditDays: number = 30
): string {
  const d = new Date(orderDate);
  if (isNaN(d.getTime())) return orderDate;

  if (stage === "cash_on_delivery") {
    // Due on delivery / order date
    return d.toISOString().slice(0, 10);
  }

  if (stage === "post_dated_cheque") {
    // 7 to 10 days credit
    const days = creditDays > 0 ? creditDays : 10;
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  if (stage === "credit") {
    // 30 to 35 days credit
    const days = creditDays > 0 ? creditDays : 30;
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  return d.toISOString().slice(0, 10);
}

/**
 * Calculates total monetary value of purchase order line items.
 */
export function orderTotal(po: { lines: { qty: number; unitCost: number }[] }): number {
  if (!po || !po.lines) return 0;
  return po.lines.reduce((sum, line) => sum + (line.qty || 0) * (line.unitCost || 0), 0);
}

/**
 * Return deadline = expiry date minus the supplier's return window in months.
 */
export function returnDeadline(expiry: string, windowMonths: number): string {
  const d = new Date(expiry);
  if (isNaN(d.getTime())) return expiry;
  d.setMonth(d.getMonth() - windowMonths);
  return d.toISOString().slice(0, 10);
}

/**
 * Calculates months remaining until expiry date relative to today.
 */
export function monthsToExpiry(expiry: string, today = new Date()): number {
  const e = new Date(expiry);
  if (isNaN(e.getTime())) return 0;
  return (e.getFullYear() - today.getFullYear()) * 12 + (e.getMonth() - today.getMonth());
}

/**
 * Returns the color code for expiry based on pharmacy rules:
 * - Red: <= 6 months
 * - Orange: 6 - 12 months
 * - Yellow: 12 - 18 months
 */
export function expiryTag(m: number): "red" | "orange" | "yellow" | "none" {
  if (m <= 6) return "red";
  if (m <= 12) return "orange";
  if (m <= 18) return "yellow";
  return "none";
}

/**
 * Formats numeric currency to Sri Lankan Rupees string (e.g., "Rs. 29,600.00").
 */
export function formatLKR(amount: number): string {
  return `Rs. ${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats an ISO date string (e.g. "2026-11-04") to a clean readable date (e.g. "4 Nov 2026").
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

