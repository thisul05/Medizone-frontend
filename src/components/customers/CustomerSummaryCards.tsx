import { averageRating, formatNumber, formatRating } from "@/lib/customers";
import type { Customer, CustomerFeedback } from "@/types/customers";
import { KpiCard, KpiGrid } from "./ui/Card";

/** Total Customers, Regular Customers, Total Loyalty Points (current balances), Average Rating. */
export function CustomerSummaryCards({ customers, feedback }: { customers: Customer[]; feedback: CustomerFeedback[] }) {
  const regular = customers.filter((c) => c.isRegular).length;
  const totalPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
  return (
    <KpiGrid label="Customer summary">
      <KpiCard label="Total Customers" value={formatNumber(customers.length)} />
      <KpiCard label="Regular Customers" value={formatNumber(regular)} />
      <KpiCard label="Total Loyalty Points" value={formatNumber(totalPoints)} />
      <KpiCard label="Average Rating" value={feedback.length ? `${formatRating(averageRating(feedback))}/5` : "–"} />
    </KpiGrid>
  );
}
