"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate, formatLKR, formatNumber, formatPhone, loyaltySummary, matchesCustomerSearch } from "@/lib/customers";
import type { LoyaltyTransactionType } from "@/types/customers";
import { CustomerTypeBadge } from "./CustomerBadges";
import { useCustomers } from "./CustomersProvider";
import { PointsCalculator } from "./PointsCalculator";
import { PointsEarnedChart } from "./PointsEarnedChart";
import { Button, ButtonLink } from "./ui/Button";
import { Card, CardHeader, KpiCard, KpiGrid } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { InlineSelect, SearchInput } from "./ui/Field";
import { Icon } from "./ui/Icon";
import { PageHeader } from "./ui/PageHeader";
import { Pagination, usePagination } from "./ui/Pagination";
import { rowClass, tableClass, tableWrap, tdClass, thClass } from "./ui/table";

const EXAMPLES = [100, 500, 1000, 5000];
const PAGE_SIZE = 8;
type TypeFilter = "all" | LoyaltyTransactionType;

export function LoyaltyView() {
  const { customers, purchases, loyaltyTransactions, getCustomer, today } = useCustomers();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const currentMonth = today.slice(0, 7);
  const totalPoints = customers.reduce((s, c) => s + c.loyaltyPoints, 0);
  const regularCount = customers.filter((c) => c.isRegular).length;
  const earnedThisMonth = loyaltyTransactions.filter((t) => t.type === "earned" && t.date.startsWith(currentMonth)).reduce((s, t) => s + t.points, 0);

  const records = useMemo(
    () =>
      customers
        .filter((c) => matchesCustomerSearch(c, search))
        .map((c) => {
          const s = loyaltySummary(loyaltyTransactions.filter((t) => t.customerId === c.id));
          const spent = purchases.filter((p) => p.customerId === c.id).reduce((sum, p) => sum + p.total, 0);
          // Total points credited (purchases + opening balance), separate from the current balance.
          return { customer: c, spent, credited: s.earned + Math.max(0, s.adjusted) };
        }),
    [customers, purchases, loyaltyTransactions, search],
  );
  const recordsPager = usePagination(records, PAGE_SIZE, search);

  // Every transaction with the customer's balance right after it, newest first.
  const transactions = useMemo(() => {
    const running = new Map<string, number>();
    const withBalance = [...loyaltyTransactions]
      .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
      .map((t) => {
        const balance = (running.get(t.customerId) ?? 0) + t.points;
        running.set(t.customerId, balance);
        return { t, balance };
      })
      .reverse();
    return withBalance.filter(({ t }) => typeFilter === "all" || t.type === typeFilter);
  }, [loyaltyTransactions, typeFilter]);
  const txnPager = usePagination(transactions, PAGE_SIZE, typeFilter);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Customers", href: "/customers" }, { label: "Loyalty Points" }]}
        title="Loyalty Points Management"
        description="Monitor customer loyalty rewards and transaction history"
      />

      <KpiGrid label="Loyalty summary" columns={3}>
        <KpiCard label="Total Loyalty Points" value={formatNumber(totalPoints)} />
        <KpiCard label="Regular Customers" value={formatNumber(regularCount)} />
        <KpiCard label="Points Earned This Month" value={formatNumber(earnedThisMonth)} />
      </KpiGrid>

      <Card as="section" aria-labelledby="earn-title">
        <CardHeader
          id="earn-title"
          icon="info"
          title="How to Earn Loyalty Points"
          description={<span className="text-sm text-(--heading)">Earn 1 loyalty point for every Rs.100 spent on eligible purchases at Medizone.</span>}
        />
        <ul className="grid grid-cols-1 gap-3 px-5 sm:grid-cols-2 xl:grid-cols-4">
          {EXAMPLES.map((amount) => (
            <li key={amount} className="flex items-center gap-3 rounded-md bg-(--surface-sunken) px-4 py-3">
              <Icon name="dollarFile" size={22} className="text-(--heading)" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-(--ink-muted)">Spend Rs.{formatNumber(amount)}</p>
                <p className="text-sm font-semibold text-(--heading)">
                  Earn {Math.floor(amount / 100)} {Math.floor(amount / 100) === 1 ? "point" : "points"}
                </p>
              </div>
              <Icon name="arrowRight" size={18} className="text-(--heading)" />
            </li>
          ))}
        </ul>
        <p className="px-5 pt-4 pb-5 text-xs leading-5 text-(--ink-muted)">
          Loyalty points are calculated based on eligible purchases. Customers earn 1 point for every Rs. 100 spent. Regular customer discounts of 3% or 5% are applied separately.
        </p>
      </Card>

      <Card as="section" aria-labelledby="records-title" className="overflow-hidden">
        <CardHeader
          id="records-title"
          title="Customer Loyalty Records"
          action={<SearchInput label="Search customers" placeholder="Search customers" value={search} onChange={setSearch} className="w-full sm:w-[300px]" />}
        />
        {records.length > 0 ? (
          <>
            <div className={tableWrap}>
              <table className={`${tableClass} min-w-[900px]`}>
                <caption className="sr-only">Customer loyalty records</caption>
                <thead>
                  <tr>
                    <th scope="col" className={thClass}>Customer</th>
                    <th scope="col" className={thClass}>Phone</th>
                    <th scope="col" className={thClass}>Customer Type</th>
                    <th scope="col" className={thClass}>Total Spent</th>
                    <th scope="col" className={thClass}>Points Earned</th>
                    <th scope="col" className={thClass}>Current Balance</th>
                    <th scope="col" className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsPager.visible.map((r) => (
                    <tr key={r.customer.id} className={rowClass}>
                      <td className={`${tdClass} py-2`}>
                        <Link href={`/customers/${r.customer.id}`} className="font-medium underline-offset-2 hover:text-(--heading) hover:underline">
                          {r.customer.name}
                        </Link>
                      </td>
                      <td className={`${tdClass} py-2 whitespace-nowrap tabular-nums`}>{formatPhone(r.customer.phone)}</td>
                      <td className={`${tdClass} py-2`}>
                        <CustomerTypeBadge customer={r.customer} />
                      </td>
                      <td className={`${tdClass} py-2 whitespace-nowrap tabular-nums`}>LKR {formatLKR(r.spent).replace("Rs. ", "")}</td>
                      <td className={`${tdClass} py-2 font-semibold text-(--heading) tabular-nums`}>{formatNumber(r.credited)}</td>
                      <td className={`${tdClass} py-2 font-semibold text-(--heading) tabular-nums`}>{formatNumber(r.customer.loyaltyPoints)}</td>
                      <td className={`${tdClass} py-2`}>
                        <ButtonLink href={`/customers/${r.customer.id}?tab=loyalty`} variant="soft" size="sm" aria-label={`View loyalty history for ${r.customer.name}`}>
                          View History
                        </ButtonLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...recordsPager} onPageChange={recordsPager.setPage} noun="customers" />
          </>
        ) : (
          <EmptyState
            icon="search"
            title="No customers found"
            description={`No customer matches "${search.trim()}".`}
            action={
              <Button variant="secondary" onClick={() => setSearch("")}>
                Clear search
              </Button>
            }
            compact
          />
        )}
      </Card>

      <Card as="section" aria-labelledby="txn-title" className="overflow-hidden">
        <CardHeader
          id="txn-title"
          title="Recent Points Transactions"
          action={
            <InlineSelect
              label="Type"
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as TypeFilter)}
              options={[
                { value: "all", label: "All transactions" },
                { value: "earned", label: "Earned" },
                { value: "redeemed", label: "Redeemed" },
                { value: "adjusted", label: "Opening balance" },
              ]}
              className="w-full sm:w-[260px]"
            />
          }
        />
        {transactions.length > 0 ? (
          <>
            <div className={tableWrap}>
              <table className={`${tableClass} min-w-[720px]`}>
                <caption className="sr-only">Recent points transactions</caption>
                <thead>
                  <tr>
                    <th scope="col" className={thClass}>Date</th>
                    <th scope="col" className={thClass}>Customer</th>
                    <th scope="col" className={thClass}>Purchase Amount</th>
                    <th scope="col" className={thClass}>Points Earned</th>
                    <th scope="col" className={thClass}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {txnPager.visible.map(({ t, balance }) => {
                    const customer = getCustomer(t.customerId);
                    const purchase = t.purchaseId ? purchases.find((p) => p.id === t.purchaseId) : undefined;
                    return (
                      <tr key={t.id} className={rowClass}>
                        <td className={`${tdClass} py-2 whitespace-nowrap`}>{formatDate(t.date)}</td>
                        <td className={`${tdClass} py-2`}>
                          {customer ? (
                            <Link href={`/customers/${customer.id}?tab=loyalty`} className="underline-offset-2 hover:text-(--heading) hover:underline">
                              {customer.name}
                            </Link>
                          ) : (
                            t.customerId
                          )}
                          {t.type !== "earned" ? <span className="block text-xs text-(--ink-muted)">{t.type === "redeemed" ? "Redeemed against bill" : "Opening balance"}</span> : null}
                        </td>
                        <td className={`${tdClass} py-2 whitespace-nowrap tabular-nums`}>
                          {purchase && t.type === "earned" ? `LKR ${formatLKR(purchase.total).replace("Rs. ", "")}` : <span className="text-(--ink-muted)">—</span>}
                        </td>
                        <td className={`${tdClass} py-2 font-semibold tabular-nums ${t.points < 0 ? "text-(--danger-ink)" : "text-(--heading)"}`}>
                          {t.points > 0 ? "+" : ""}
                          {formatNumber(t.points)}
                        </td>
                        <td className={`${tdClass} py-2 font-semibold text-(--heading) tabular-nums`}>{formatNumber(balance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination {...txnPager} onPageChange={txnPager.setPage} noun="transactions" />
          </>
        ) : (
          <EmptyState icon="gift" title="No transactions of this type" compact action={<Button variant="secondary" onClick={() => setTypeFilter("all")}>Show all transactions</Button>} />
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PointsCalculator />
        <PointsEarnedChart transactions={loyaltyTransactions} today={today} />
      </div>
    </>
  );
}
