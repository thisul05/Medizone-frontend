"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { getBranchName } from "@/data/customers";
import { averageRating, formatDate, formatLKR, formatNumber, formatPhone, formatRating } from "@/lib/customers";
import { CustomerAvatar, CustomerTypeBadge } from "./CustomerBadges";
import { CustomerFormModal } from "./CustomerFormModal";
import { CustomerProfileTabs, type ProfileTab } from "./CustomerProfileTabs";
import { useCustomers } from "./CustomersProvider";
import { Button, ButtonLink } from "./ui/Button";
import { Card, KpiCard, KpiGrid } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { Icon, type IconName } from "./ui/Icon";

function BackLink() {
  return (
    <Link href="/customers" className="inline-flex items-center gap-1.5 self-start rounded-sm text-sm font-semibold text-(--link) underline-offset-2 hover:underline">
      <Icon name="arrowLeft" size={16} />
      All customers
    </Link>
  );
}

function Detail({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 grid size-8 flex-none place-items-center rounded-sm bg-(--surface-sunken) text-(--ink-muted)">
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0">
        <dt className="text-[13px] leading-[18px] text-(--ink-muted)">{label}</dt>
        <dd className="break-words text-(--ink)">{children}</dd>
      </div>
    </div>
  );
}

export function CustomerProfile({ customerId }: { customerId: string }) {
  const { getCustomer, purchases, prescriptions, loyaltyTransactions, feedback, reminders, notify } = useCustomers();
  const [tab, setTab] = useState<ProfileTab>("purchases");
  const [editing, setEditing] = useState(false);
  const customer = getCustomer(customerId);

  if (!customer) {
    return (
      <>
        <BackLink />
        <Card>
          <EmptyState
            icon="users"
            title="Customer not found"
            description={`There is no customer with the id "${customerId}". They may have been added in another session, which resets on refresh.`}
            action={<ButtonLink href="/customers" variant="primary">Go to customer list</ButtonLink>}
          />
        </Card>
      </>
    );
  }

  const myPurchases = purchases.filter((p) => p.customerId === customer.id);
  const myPrescriptions = prescriptions.filter((p) => p.customerId === customer.id);
  const myTransactions = loyaltyTransactions.filter((t) => t.customerId === customer.id);
  const myFeedback = feedback.filter((f) => f.customerId === customer.id).sort((a, b) => b.date.localeCompare(a.date));
  const myDueReminders = reminders.filter((r) => r.customerId === customer.id && (r.status === "due_soon" || r.status === "overdue"));
  const totalSpent = myPurchases.reduce((s, p) => s + p.total, 0);
  const lastPurchase = myPurchases[0]?.date;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <BackLink />
        <div className="text-xs font-medium text-slate-500">Pharmacy / Customers / {customer.name}</div>
      </div>

      <Card as="section" aria-labelledby="customer-name" className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex flex-wrap items-start gap-4">
              <CustomerAvatar name={customer.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="mz-mono text-(--ink-muted)">{customer.id}</p>
                <h1 id="customer-name" className="text-[28px] leading-[34px] font-semibold">
                  {customer.name}
                </h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  <CustomerTypeBadge customer={customer} showDiscount />
                  {myDueReminders.length > 0 ? (
                    <Link href="/customers/reminders" className="rounded-full">
                      <span className="inline-flex h-6 items-center gap-1 rounded-full bg-(--loyalty-bg) pr-2.5 pl-2 text-xs font-semibold text-(--loyalty-ink) hover:underline">
                        <Icon name="refresh" size={14} strokeWidth={2.25} />
                        {myDueReminders.length} refill {myDueReminders.length === 1 ? "reminder" : "reminders"} due
                      </span>
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" icon="edit" onClick={() => setEditing(true)}>
                  Edit details
                </Button>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail icon="phone" label="Mobile number">
                <a href={`tel:${customer.phone}`} className="tabular-nums underline-offset-2 hover:text-(--link) hover:underline">
                  {formatPhone(customer.phone)}
                </a>
              </Detail>
              <Detail icon="mail" label="Email">
                {customer.email ?? <span className="text-(--ink-subtle)">Not provided</span>}
              </Detail>
              <Detail icon="mapPin" label="Address">
                {customer.address}
              </Detail>
              <Detail icon="store" label="Home branch">
                {getBranchName(customer.branchId)} <span className="mz-mono text-(--ink-muted)">({customer.branchId})</span>
              </Detail>
              <Detail icon="calendar" label="Customer since">
                {formatDate(customer.joinedOn)}
              </Detail>
              <Detail icon="percent" label="Regular customer discount">
                {customer.isRegular ? `${customer.discountPercent}% on every bill` : "0% (not a regular customer)"}
              </Detail>
            </dl>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:w-64 lg:flex-col">
            <div className="flex-1 rounded-lg bg-(--loyalty-bg) p-5 text-(--loyalty-ink)">
              <p className="flex items-center gap-2 text-[11px] leading-[14px] font-bold tracking-[0.08em] uppercase">
                <Icon name="gift" size={16} /> Loyalty points balance
              </p>
              <p className="mt-2 text-[40px] leading-[44px] font-extrabold tracking-[-0.02em] tabular-nums">{formatNumber(customer.loyaltyPoints)}</p>
              <p className="mt-1 text-[13px]">1 point per Rs. 100 spent</p>
            </div>
            <div className="flex-1 rounded-lg border border-(--border) p-5">
              <p className="text-[11px] leading-[14px] font-bold tracking-[0.08em] text-(--ink-muted) uppercase">Discount</p>
              <p className="mt-2 text-[40px] leading-[44px] font-extrabold tracking-[-0.02em] tabular-nums">{customer.isRegular ? customer.discountPercent : 0}%</p>
              <p className="mt-1 text-[13px] text-(--ink-muted)">{customer.isRegular ? "Regular customer" : "Non-regular customer"}</p>
            </div>
          </div>
        </div>
      </Card>

      <KpiGrid label="Customer activity">
        <KpiCard label="Total spent" value={formatLKR(totalSpent, { decimals: 0 })} icon="wallet" hint={`Across ${myPurchases.length} bills, after discounts`} />
        <KpiCard label="Last purchase" value={lastPurchase ? formatDate(lastPurchase) : "–"} icon="receipt" hint={myPurchases[0] ? `Bill ${myPurchases[0].id}` : "No purchases yet"} />
        <KpiCard label="Prescriptions" value={myPrescriptions.length} icon="file" hint="Stored on file" />
        <KpiCard
          label="Average rating given"
          value={myFeedback.length ? formatRating(averageRating(myFeedback)) : "–"}
          unit={myFeedback.length ? "/ 5" : undefined}
          icon="star"
          tone="warning"
          hint={`${myFeedback.length} feedback ${myFeedback.length === 1 ? "entry" : "entries"}`}
        />
      </KpiGrid>

      <CustomerProfileTabs
        customer={customer}
        purchases={myPurchases}
        prescriptions={myPrescriptions}
        transactions={myTransactions}
        feedback={myFeedback}
        tab={tab}
        onTabChange={setTab}
      />

      <CustomerFormModal
        open={editing}
        customer={customer}
        onClose={() => setEditing(false)}
        onSaved={(c) => {
          setEditing(false);
          notify({ tone: "success", title: "Customer details saved", description: `${c.name}'s record is updated.` });
        }}
      />
    </div>
  );
}
