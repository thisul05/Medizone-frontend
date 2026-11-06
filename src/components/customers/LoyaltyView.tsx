"use client";

import { useMemo, useRef, useState } from "react";
import { PROTOTYPE_TODAY, formatDate, formatLKR, formatMonth, formatNumber, formatPhone, loyaltySummary } from "@/lib/customers";
import type { LoyaltyTransactionType } from "@/types/customers";
import { CustomerTypeBadge } from "./CustomerBadges";
import { rowClass, tdClass, thClass } from "./CustomerTable";
import { useCustomers } from "./CustomersProvider";
import { matchesCustomerSearch } from "./CustomersView";
import { LoyaltyHistoryTable } from "./LoyaltyHistoryTable";
import { PointsCalculator } from "./PointsCalculator";
import { PointsEarnedChart } from "./PointsEarnedChart";
import { Button } from "./ui/Button";
import { Card, CardHeader, KpiCard, KpiGrid } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { SearchInput } from "./ui/Field";
import { Icon } from "./ui/Icon";
import { PageHeader } from "./ui/PageHeader";
import { Tabs } from "./ui/Tabs";

type TypeFilter = "all" | LoyaltyTransactionType;

const EXAMPLES = [99, 250, 1254, 2450];

export function LoyaltyView() {
  const { customers, loyaltyTransactions, getCustomer } = useCustomers();
  const [search, setSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>();
  const historyRef = useRef<HTMLSpanElement>(null);

  const currentMonth = PROTOTYPE_TODAY.slice(0, 7);
  const totalPoints = customers.reduce((s, c) => s + c.loyaltyPoints, 0);
  const earnedThisMonth = loyaltyTransactions.filter((t) => t.type === "earned" && t.date.startsWith(currentMonth)).reduce((s, t) => s + t.points, 0);
  const redeemedTotal = loyaltyTransactions.filter((t) => t.type === "redeemed").reduce((s, t) => s + Math.abs(t.points), 0);
  const regular = customers.filter((c) => c.isRegular);

  const rows = useMemo(
    () =>
      customers
        .filter((c) => matchesCustomerSearch(c, search))
        .map((c) => {
          const txns = loyaltyTransactions.filter((t) => t.customerId === c.id);
          return { customer: c, ...loyaltySummary(txns), lastActivity: txns.reduce((max, t) => (t.date > max ? t.date : max), "") };
        })
        .sort((a, b) => b.customer.loyaltyPoints - a.customer.loyaltyPoints),
    [customers, loyaltyTransactions, search],
  );

  const groups = [
    { label: "Regular · 5% discount", list: customers.filter((c) => c.isRegular && c.discountPercent === 5) },
    { label: "Regular · 3% discount", list: customers.filter((c) => c.isRegular && c.discountPercent === 3) },
    { label: "Non-regular", list: customers.filter((c) => !c.isRegular) },
  ];

  const historyBase = loyaltyTransactions.filter((t) => {
    if (selectedCustomerId && t.customerId !== selectedCustomerId) return false;
    if (!historySearch.trim()) return true;
    const c = getCustomer(t.customerId);
    const q = historySearch.trim().toLowerCase();
    return (c ? matchesCustomerSearch(c, historySearch) : false) || t.id.toLowerCase().includes(q) || (t.purchaseId?.toLowerCase().includes(q) ?? false);
  });
  const typeCount = (f: TypeFilter) => (f === "all" ? historyBase.length : historyBase.filter((t) => t.type === f).length);
  const history = historyBase.filter((t) => typeFilter === "all" || t.type === typeFilter);
  const selectedCustomer = selectedCustomerId ? getCustomer(selectedCustomerId) : undefined;

  function showHistory(customerId: string) {
    setSelectedCustomerId(customerId);
    setTypeFilter("all");
    setHistorySearch("");
    historyRef.current?.scrollIntoView({ block: "start" });
  }

  return (
    <>
      <PageHeader title="Loyalty points" description="Points balances, how they were earned and every points transaction across all branches." />

      <KpiGrid label="Loyalty summary">
        <KpiCard label="Total loyalty points" value={formatNumber(totalPoints)} unit="pts" icon="gift" tone="loyalty" hint={`Held by ${customers.filter((c) => c.loyaltyPoints > 0).length} customers`} />
        <KpiCard label="Earned this month" value={formatNumber(earnedThisMonth)} unit="pts" icon="arrowUp" hint={`${formatMonth(currentMonth)}, to ${formatDate(PROTOTYPE_TODAY)}`} />
        <KpiCard label="Redeemed to date" value={formatNumber(redeemedTotal)} unit="pts" icon="arrowDown" hint="Points used against bills" />
        <KpiCard label="Regular customers" value={regular.length} unit={`of ${customers.length}`} icon="shield" hint="Get a 3% or 5% discount as well as points" />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card as="section" aria-labelledby="earning-rule-title">
          <CardHeader id="earning-rule-title" title="How customers earn points" />
          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-start gap-3 rounded-md bg-(--loyalty-bg) p-4 text-(--loyalty-ink)">
              <Icon name="gift" size={24} />
              <div>
                <p className="text-lg leading-6 font-semibold">1 point for every Rs. 100 spent</p>
                <p className="mt-1 text-[13px] leading-[18px]">
                  <code className="mz-mono">points = Math.floor(purchaseTotal / 100)</code>. Part of Rs. 100 earns nothing, so Rs. 199 earns 1 point.
                </p>
              </div>
            </div>
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Examples of the earning rule</caption>
              <thead>
                <tr>
                  <th scope="col" className={`${thClass} text-left`}>Amount paid</th>
                  <th scope="col" className={`${thClass} text-right`}>Points earned</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map((amount) => (
                  <tr key={amount} className={rowClass}>
                    <td className={`${tdClass} py-2 tabular-nums`}>{formatLKR(amount)}</td>
                    <td className={`${tdClass} py-2 text-right font-semibold tabular-nums`}>{Math.floor(amount / 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="flex items-start gap-2 text-[13px] leading-[18px] text-(--ink-muted)">
              <Icon name="info" size={16} className="mt-px" />
              The regular-customer discount (3% or 5%) is a separate benefit. Billing takes it off the bill first, and points are earned on the amount paid. For example, a Rs. 1,320 bill with 5% off is Rs. 1,254 paid, which earns 12 points.
            </p>
          </div>
        </Card>
        <PointsCalculator />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card as="section" aria-labelledby="regular-stats-title">
          <CardHeader id="regular-stats-title" title="Regular customer statistics" description="Discount groups and the points each group holds." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <caption className="sr-only">Customers and points by discount group</caption>
              <thead>
                <tr>
                  <th scope="col" className={`${thClass} text-left`}>Group</th>
                  <th scope="col" className={`${thClass} text-right`}>Customers</th>
                  <th scope="col" className={`${thClass} text-right`}>Points held</th>
                  <th scope="col" className={`${thClass} text-right`}>Average balance</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => {
                  const pts = g.list.reduce((s, c) => s + c.loyaltyPoints, 0);
                  return (
                    <tr key={g.label} className={rowClass}>
                      <td className={`${tdClass} font-semibold`}>{g.label}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{g.list.length}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(pts)}</td>
                      <td className={`${tdClass} text-right tabular-nums`}>{g.list.length ? formatNumber(pts / g.list.length) : "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-(--border) px-5 py-3 text-[13px] text-(--ink-muted)">
            Regular customers hold {totalPoints ? Math.round((regular.reduce((s, c) => s + c.loyaltyPoints, 0) / totalPoints) * 100) : 0}% of all points.
          </p>
        </Card>
        <PointsEarnedChart transactions={loyaltyTransactions} />
      </div>

      <Card as="section" aria-labelledby="balances-title" className="overflow-hidden">
        <CardHeader id="balances-title" title="Customer balances" description="Each customer's points balance. Select View history to see their transactions." />
        <div className="border-b border-(--border) px-5 py-4">
          <SearchInput label="Search customer balances" placeholder="Search by name or phone" value={search} onChange={setSearch} className="md:max-w-80" />
        </div>
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-sm leading-5">
              <caption className="sr-only">Customer loyalty balances</caption>
              <thead>
                <tr>
                  <th scope="col" className={`${thClass} text-left`}>Customer</th>
                  <th scope="col" className={`${thClass} text-left`}>Customer type</th>
                  <th scope="col" className={`${thClass} text-right`}>Earned + opening</th>
                  <th scope="col" className={`${thClass} text-right`}>Redeemed</th>
                  <th scope="col" className={`${thClass} text-right`}>Balance</th>
                  <th scope="col" className={`${thClass} text-left`}>Last activity</th>
                  <th scope="col" className={`${thClass} text-right`}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.customer.id} className={`${rowClass} ${r.customer.id === selectedCustomerId ? "bg-(--primary-tint)" : ""}`}>
                    <td className={tdClass}>
                      <span className="font-semibold">{r.customer.name}</span>
                      <span className="block text-[13px] text-(--ink-muted) tabular-nums">{formatPhone(r.customer.phone)}</span>
                    </td>
                    <td className={tdClass}>
                      <CustomerTypeBadge customer={r.customer} showDiscount />
                    </td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(r.earned + Math.max(0, r.adjusted))}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(r.redeemed)}</td>
                    <td className={`${tdClass} text-right font-semibold tabular-nums`}>{formatNumber(r.customer.loyaltyPoints)}</td>
                    <td className={`${tdClass} whitespace-nowrap`}>{r.lastActivity ? formatDate(r.lastActivity) : <span className="text-(--ink-subtle)">No activity</span>}</td>
                    <td className={`${tdClass} text-right`}>
                      <Button size="sm" variant="secondary" icon="clock" onClick={() => showHistory(r.customer.id)} aria-label={`View points history for ${r.customer.name}`}>
                        View history
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="search" title="No customers match your search" description={`Nothing found for "${search.trim()}".`} action={<Button variant="secondary" onClick={() => setSearch("")}>Clear search</Button>} />
        )}
      </Card>

      <Card as="section" aria-labelledby="txn-title" className="overflow-hidden">
        <span ref={historyRef} className="block scroll-mt-20" />
        <CardHeader
          id="txn-title"
          title="Points transaction history"
          description="Every point earned, redeemed or adjusted, newest first."
        />
        <div className="flex flex-col gap-3 border-b border-(--border) px-5 py-4 lg:flex-row lg:items-center">
          <SearchInput label="Search transactions" placeholder="Customer, reference or bill number" value={historySearch} onChange={setHistorySearch} className="lg:w-80" />
          <Tabs<TypeFilter>
            variant="pill"
            label="Transaction type"
            idPrefix="txn-type"
            value={typeFilter}
            onChange={setTypeFilter}
            tabs={[
              { id: "all", label: "All", count: typeCount("all") },
              { id: "earned", label: "Earned", count: typeCount("earned") },
              { id: "redeemed", label: "Redeemed", count: typeCount("redeemed") },
              { id: "adjusted", label: "Adjusted", count: typeCount("adjusted") },
            ]}
          />
          {selectedCustomer ? (
            <span className="inline-flex h-8 items-center gap-1 self-start rounded-full bg-(--primary-tint) pr-1 pl-3 text-[13px] font-semibold text-(--primary-tint-ink) lg:ml-auto lg:self-center">
              {selectedCustomer.name}
              <button
                type="button"
                onClick={() => setSelectedCustomerId(undefined)}
                aria-label={`Show all customers instead of ${selectedCustomer.name}`}
                className="cursor-pointer rounded-full p-1 hover:bg-(--surface-raised)"
              >
                <Icon name="x" size={14} />
              </button>
            </span>
          ) : null}
        </div>
        {history.length > 0 ? (
          <LoyaltyHistoryTable transactions={history} getCustomer={getCustomer} showCustomer caption="Points transactions" />
        ) : (
          <EmptyState
            icon="gift"
            title="No transactions match these filters"
            description={selectedCustomer ? `${selectedCustomer.name} has no ${typeFilter === "all" ? "" : `${typeFilter} `}transactions yet.` : "Try another type or search."}
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedCustomerId(undefined);
                  setTypeFilter("all");
                  setHistorySearch("");
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}
      </Card>
    </>
  );
}
