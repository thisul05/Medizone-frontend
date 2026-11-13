"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { getBranchName } from "@/data/customers";
import { formatCustomerId, formatDate, formatLKR, formatNumber, formatPhone } from "@/lib/customers";
import { CustomerAvatar, CustomerTypeBadge } from "./CustomerBadges";
import { CustomerFormModal } from "./CustomerFormModal";
import { CustomerProfileTabs, PROFILE_TABS, type ProfileTab } from "./CustomerProfileTabs";
import { useCustomers } from "./CustomersProvider";
import { Button, ButtonLink } from "./ui/Button";
import { Card, FootNote, KpiCard, KpiGrid } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { Icon } from "./ui/Icon";
import { PageHeader } from "./ui/PageHeader";

function BackLink() {
  return (
    <Link href="/customers" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-(--heading) underline-offset-2 hover:underline">
      <Icon name="arrowLeft" size={16} />
      Back to Customers
    </Link>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs leading-4 text-(--ink-muted)">{label}</dt>
      <dd className="mt-1 text-sm leading-5 font-semibold break-words text-(--ink)">{children}</dd>
    </div>
  );
}

function isProfileTab(value: string | null): value is ProfileTab {
  return PROFILE_TABS.some((t) => t.id === value);
}

export function CustomerProfile({ customerId }: { customerId: string }) {
  const { getCustomer, purchases, prescriptions, loyaltyTransactions, feedback, reminders, notify } = useCustomers();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editing, setEditing] = useState(false);
  const customer = getCustomer(customerId);

  // The open tab lives in the URL (?tab=loyalty), so links such as "View History" open the right tab.
  const tabParam = searchParams.get("tab");
  const tab: ProfileTab = isProfileTab(tabParam) ? tabParam : "purchases";
  function setTab(next: ProfileTab) {
    router.replace(next === "purchases" ? pathname : `${pathname}?tab=${next}`, { scroll: false });
  }

  const header = (
    <PageHeader
      breadcrumb={[{ label: "Customers", href: "/customers" }, { label: "Customer Profile" }]}
      title="Customer Profile"
      navyTitle
      action={<BackLink />}
    />
  );

  if (!customer) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            icon="users"
            title="Customer not found"
            description={`There is no customer with the ID "${customerId}". The record may have been removed, or the link is incorrect.`}
            action={<ButtonLink href="/customers" variant="primary">Back to Customers</ButtonLink>}
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

  return (
    <>
      {header}

      <Card as="section" aria-labelledby="customer-name" className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex min-w-0 items-start gap-5">
            <CustomerAvatar name={customer.name} size="lg" />
            <div className="min-w-0">
              <h2 id="customer-name" className="text-2xl leading-8 font-bold text-(--heading)">
                {customer.name}
              </h2>
              <p className="mt-1 text-sm text-(--ink-muted)">ID {formatCustomerId(customer.id)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <CustomerTypeBadge customer={customer} long />
                {myDueReminders.length > 0 ? (
                  <Link href="/customers/reminders" className="rounded-[5px]">
                    <span className="inline-flex h-6 items-center gap-1 rounded-[5px] bg-(--warning-bg) px-2.5 text-xs font-semibold text-(--warning-ink) hover:underline">
                      <Icon name="refresh" size={13} strokeWidth={2.25} />
                      {myDueReminders.length} refill {myDueReminders.length === 1 ? "reminder" : "reminders"} due
                    </span>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-2">
            <Detail label="Phone number">
              <a href={`tel:${customer.phone}`} className="tabular-nums underline-offset-2 hover:underline">
                {formatPhone(customer.phone)}
              </a>
            </Detail>
            <Detail label="Registered date">{formatDate(customer.joinedOn)}</Detail>
            <Detail label="Email address">{customer.email ?? <span className="font-normal text-(--ink-muted)">Not provided</span>}</Detail>
            <Detail label="Branch">{getBranchName(customer.branchId)}</Detail>
          </dl>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-(--border) pt-4">
          <p className="text-[13px] text-(--ink-muted)">{customer.address ? `Address: ${customer.address}` : "No address on file"}</p>
          <Button variant="secondary" size="sm" icon="edit" onClick={() => setEditing(true)}>
            Edit details
          </Button>
        </div>
      </Card>

      <KpiGrid label="Customer summary">
        <KpiCard label="Total Purchases" value={formatLKR(totalSpent, { decimals: 0 })} />
        <KpiCard label="Loyalty Points" value={formatNumber(customer.loyaltyPoints)} />
        <KpiCard label="Discount" value={`${customer.isRegular ? customer.discountPercent : 0}%`} />
        <KpiCard label="Total Orders" value={formatNumber(myPurchases.length)} />
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

      <FootNote>{customer.registeredVia === "staff" ? "Added by staff entry" : "Registered via Medizone.lk"} · Staff view only</FootNote>

      <CustomerFormModal
        open={editing}
        customer={customer}
        onClose={() => setEditing(false)}
        onSaved={(c) => {
          setEditing(false);
          notify({ tone: "success", title: "Customer details saved", description: `${c.name}'s record has been updated.` });
        }}
      />
    </>
  );
}
