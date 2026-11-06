import { averageRating, formatNumber, formatRating } from "@/lib/customers";
import type { Customer, CustomerFeedback } from "@/types/customers";
import { KpiCard, KpiGrid } from "./ui/Card";

export function CustomerSummaryCards({ customers, feedback }: { customers: Customer[]; feedback: CustomerFeedback[] }) {
  const regular = customers.filter((c) => c.isRegular);
  const totalPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
  const avg = averageRating(feedback);
  const regularShare = customers.length ? Math.round((regular.length / customers.length) * 100) : 0;

  return (
    <KpiGrid label="Customer summary">
      <KpiCard label="Total customers" value={formatNumber(customers.length)} icon="users" hint="Registered across all 4 branches" />
      <KpiCard
        label="Regular customers"
        value={formatNumber(regular.length)}
        icon="shield"
        hint={`${regularShare}% of customers · 3% or 5% discount`}
      />
      <KpiCard
        label="Total loyalty points"
        value={formatNumber(totalPoints)}
        unit="pts"
        icon="gift"
        tone="loyalty"
        hint="Sum of all balances · 1 point per Rs. 100"
      />
      <KpiCard
        label="Average customer rating"
        value={feedback.length ? formatRating(avg) : "–"}
        unit="/ 5"
        icon="star"
        tone="warning"
        hint={`From ${feedback.length} feedback entries`}
      />
    </KpiGrid>
  );
}
