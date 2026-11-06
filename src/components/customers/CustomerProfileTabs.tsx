"use client";

import { Fragment, useState } from "react";
import { getBranchName } from "@/data/customers";
import { formatDate, formatLKR, formatNumber, loyaltySummary, prescriptionStatus } from "@/lib/customers";
import type { Customer, CustomerFeedback, LoyaltyTransaction, PaymentMethod, Purchase, StoredPrescription } from "@/types/customers";
import { rowClass, tdClass, thClass } from "./CustomerTable";
import { FeedbackCard } from "./FeedbackCard";
import { LoyaltyHistoryTable } from "./LoyaltyHistoryTable";
import { Badge } from "./ui/Badge";
import { Card, cardClass } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { Icon } from "./ui/Icon";
import { TabPanel, Tabs } from "./ui/Tabs";

export type ProfileTab = "purchases" | "prescriptions" | "loyalty" | "feedback";

const PAY_LABEL: Record<PaymentMethod, string> = { cash: "Cash", card: "Card", bank_transfer: "Bank transfer" };

interface CustomerProfileTabsProps {
  customer: Customer;
  purchases: Purchase[];
  prescriptions: StoredPrescription[];
  transactions: LoyaltyTransaction[];
  feedback: CustomerFeedback[];
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export function CustomerProfileTabs({ customer, purchases, prescriptions, transactions, feedback, tab, onTabChange }: CustomerProfileTabsProps) {
  return (
    <Card as="section" aria-label="Customer records" className="overflow-hidden">
      <div className="px-3 pt-1">
        <Tabs<ProfileTab>
          label="Customer records"
          idPrefix="profile"
          value={tab}
          onChange={onTabChange}
          tabs={[
            { id: "purchases", label: "Purchase history", count: purchases.length },
            { id: "prescriptions", label: "Prescriptions", count: prescriptions.length },
            { id: "loyalty", label: "Loyalty points", count: transactions.length },
            { id: "feedback", label: "Feedback", count: feedback.length },
          ]}
        />
      </div>
      <TabPanel idPrefix="profile" id={tab}>
        {tab === "purchases" ? <PurchasesPanel purchases={purchases} /> : null}
        {tab === "prescriptions" ? <PrescriptionsPanel prescriptions={prescriptions} /> : null}
        {tab === "loyalty" ? <LoyaltyPanel customer={customer} transactions={transactions} /> : null}
        {tab === "feedback" ? <FeedbackPanel customer={customer} feedback={feedback} /> : null}
      </TabPanel>
    </Card>
  );
}

/* ---------- Purchase history ---------- */

function PurchasesPanel({ purchases }: { purchases: Purchase[] }) {
  const [open, setOpen] = useState<string[]>([]);
  if (purchases.length === 0) {
    return <EmptyState icon="receipt" title="No purchases yet" description="Bills from the Billing module will appear here." />;
  }
  const toggle = (id: string) => setOpen((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-sm leading-5">
        <caption className="sr-only">Purchase history</caption>
        <thead>
          <tr>
            <th scope="col" className={`${thClass} w-10`}>
              <span className="sr-only">Show items</span>
            </th>
            <th scope="col" className={`${thClass} text-left`}>Bill</th>
            <th scope="col" className={`${thClass} text-left`}>Date</th>
            <th scope="col" className={`${thClass} text-left`}>Items</th>
            <th scope="col" className={`${thClass} text-right`}>Subtotal</th>
            <th scope="col" className={`${thClass} text-right`}>Discount</th>
            <th scope="col" className={`${thClass} text-right`}>Paid</th>
            <th scope="col" className={`${thClass} text-right`}>Points</th>
            <th scope="col" className={`${thClass} text-left`}>Payment</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => {
            const expanded = open.includes(p.id);
            return (
              <Fragment key={p.id}>
                <tr className={rowClass}>
                  <td className={`${tdClass} pr-0`}>
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      aria-expanded={expanded}
                      aria-controls={`items-${p.id}`}
                      aria-label={`${expanded ? "Hide" : "Show"} items on bill ${p.id}`}
                      className="grid size-8 cursor-pointer place-items-center rounded-sm text-(--ink-muted) hover:bg-(--primary-tint) hover:text-(--primary-tint-ink)"
                    >
                      <Icon name={expanded ? "chevronDown" : "chevronRight"} size={18} />
                    </button>
                  </td>
                  <td className={`${tdClass} mz-mono whitespace-nowrap`}>{p.id}</td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    {formatDate(p.date)}
                    <span className="block text-[13px] text-(--ink-muted)">{getBranchName(p.branchId)}</span>
                  </td>
                  <td className={tdClass}>
                    <span className="line-clamp-1">{p.items.map((i) => i.medicine).join(", ")}</span>
                    <span className="block text-[13px] text-(--ink-muted)">
                      {p.items.length} {p.items.length === 1 ? "item" : "items"}
                    </span>
                  </td>
                  <td className={`${tdClass} text-right whitespace-nowrap tabular-nums`}>{formatLKR(p.subtotal)}</td>
                  <td className={`${tdClass} text-right whitespace-nowrap tabular-nums`}>
                    {p.discountPercent ? (
                      <>
                        −{formatLKR(p.discountAmount)}
                        <span className="block text-[13px] text-(--ink-muted)">{p.discountPercent}% regular</span>
                      </>
                    ) : (
                      <span className="text-(--ink-subtle)">–</span>
                    )}
                  </td>
                  <td className={`${tdClass} text-right font-bold whitespace-nowrap text-(--price) tabular-nums`}>{formatLKR(p.total)}</td>
                  <td className={`${tdClass} text-right tabular-nums`}>+{p.pointsEarned}</td>
                  <td className={tdClass}>
                    <Badge tone="neutral" icon={p.paymentMethod === "bank_transfer" ? "refresh" : "wallet"}>
                      {PAY_LABEL[p.paymentMethod]}
                    </Badge>
                  </td>
                </tr>
                {expanded ? (
                  <tr id={`items-${p.id}`}>
                    <td colSpan={9} className="border-b border-(--border) bg-(--surface-sunken) px-4 py-3">
                      <table className="w-full text-[13px]">
                        <caption className="sr-only">Items on bill {p.id}</caption>
                        <thead>
                          <tr className="text-left text-(--ink-muted)">
                            <th scope="col" className="py-1 pr-4 font-semibold">Medicine</th>
                            <th scope="col" className="py-1 pr-4 text-right font-semibold">Qty</th>
                            <th scope="col" className="py-1 pr-4 text-right font-semibold">Unit price</th>
                            <th scope="col" className="py-1 pr-4 text-right font-semibold">Line total</th>
                            <th scope="col" className="py-1 text-right font-semibold">Days supply</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.items.map((i) => (
                            <tr key={i.medicine}>
                              <td className="py-1 pr-4">{i.medicine}</td>
                              <td className="py-1 pr-4 text-right tabular-nums">{i.quantity}</td>
                              <td className="py-1 pr-4 text-right tabular-nums">{formatLKR(i.unitPrice)}</td>
                              <td className="py-1 pr-4 text-right tabular-nums">{formatLKR(i.quantity * i.unitPrice)}</td>
                              <td className="py-1 text-right tabular-nums">{i.daysSupply ? `${i.daysSupply} days` : "–"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Stored prescriptions ---------- */

type RxFilter = "all" | "active" | "expired";

function PrescriptionsPanel({ prescriptions }: { prescriptions: StoredPrescription[] }) {
  const [filter, setFilter] = useState<RxFilter>("all");
  if (prescriptions.length === 0) {
    return <EmptyState icon="file" title="No stored prescriptions" description="Prescriptions uploaded in the Prescriptions module are stored here." />;
  }
  const withStatus = prescriptions.map((p) => ({ ...p, status: prescriptionStatus(p) })).sort((a, b) => b.issuedOn.localeCompare(a.issuedOn));
  const visible = withStatus.filter((p) => filter === "all" || p.status === filter);

  return (
    <div className="flex flex-col gap-4 p-5">
      <Tabs<RxFilter>
        variant="pill"
        label="Prescription status"
        idPrefix="rx-filter"
        value={filter}
        onChange={setFilter}
        tabs={[
          { id: "all", label: "All", count: withStatus.length },
          { id: "active", label: "Active", count: withStatus.filter((p) => p.status === "active").length },
          { id: "expired", label: "Expired", count: withStatus.filter((p) => p.status === "expired").length },
        ]}
      />
      {visible.length === 0 ? (
        <EmptyState icon="file" title={`No ${filter} prescriptions`} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((p) => (
            <article key={p.id} className={`${cardClass} flex flex-col gap-3 p-5 shadow-none`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="mz-mono text-(--ink-muted)">{p.id}</p>
                  <h3 className="text-[15px] font-semibold">{p.doctorName}</h3>
                  <p className="text-[13px] text-(--ink-muted)">{p.hospital}</p>
                </div>
                {p.status === "active" ? (
                  <Badge tone="success" icon="check">Active</Badge>
                ) : (
                  <Badge tone="neutral" icon="clock">Expired</Badge>
                )}
              </div>
              <ul className="flex flex-col gap-1">
                {p.medicines.map((m) => (
                  <li key={m} className="flex items-center gap-2 text-sm">
                    <Icon name="pill" size={16} className="text-(--ink-muted)" />
                    {m}
                  </li>
                ))}
              </ul>
              {p.notes ? <p className="rounded-sm bg-(--surface-sunken) px-3 py-2 text-[13px] leading-[18px] text-(--ink)">{p.notes}</p> : null}
              <p className="text-[13px] text-(--ink-muted)">
                Issued {formatDate(p.issuedOn)} · Valid until {formatDate(p.validUntil)}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Loyalty points ---------- */

function LoyaltyPanel({ customer, transactions }: { customer: Customer; transactions: LoyaltyTransaction[] }) {
  const s = loyaltySummary(transactions);
  const stats = [
    { label: "Current balance", value: formatNumber(customer.loyaltyPoints) },
    { label: "Earned on purchases", value: formatNumber(s.earned) },
    { label: "Opening balance", value: formatNumber(s.adjusted) },
    { label: "Redeemed", value: formatNumber(s.redeemed) },
  ];
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-4 border-b border-(--border) p-5 md:grid-cols-4">
        {stats.map((st, i) => (
          <div key={st.label} className={i === 0 ? "rounded-md bg-(--loyalty-bg) p-3 text-(--loyalty-ink)" : "p-3"}>
            <p className={`text-[11px] leading-[14px] font-bold tracking-[0.08em] uppercase ${i === 0 ? "" : "text-(--ink-muted)"}`}>{st.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {st.value} <span className="text-sm font-medium">pts</span>
            </p>
          </div>
        ))}
      </div>
      <p className="flex items-center gap-2 px-5 py-3 text-[13px] text-(--ink-muted)">
        <Icon name="info" size={16} />
        1 point for every Rs. 100 paid. {customer.isRegular ? `The ${customer.discountPercent}% regular discount is applied separately.` : ""}
      </p>
      {transactions.length > 0 ? (
        <LoyaltyHistoryTable transactions={transactions} caption={`Loyalty points history for ${customer.name}`} />
      ) : (
        <EmptyState icon="gift" title="No points yet" description="Points appear here after the customer's first purchase." />
      )}
    </div>
  );
}

/* ---------- Feedback ---------- */

function FeedbackPanel({ customer, feedback }: { customer: Customer; feedback: CustomerFeedback[] }) {
  return (
    <div className="flex flex-col gap-4 p-5">
      {feedback.length > 0 ? (
        <>
          <p className="text-(--ink-muted)">
            {feedback.length} {feedback.length === 1 ? "entry" : "entries"} from {customer.name.split(" ")[0]}
          </p>
          {feedback.map((f) => (
            <FeedbackCard key={f.id} entry={f} customer={customer} hideCustomer />
          ))}
        </>
      ) : (
        <EmptyState icon="message" title="No feedback from this customer" description="Feedback the customer submits will appear here." />
      )}
    </div>
  );
}
