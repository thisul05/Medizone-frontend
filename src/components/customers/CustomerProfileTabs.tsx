"use client";

import { Fragment, useState } from "react";
import { getBranchName } from "@/data/customers";
import { averageRating, formatDate, formatLKR, formatNumber, formatRating, loyaltySummary, prescriptionStatus } from "@/lib/customers";
import type { Customer, CustomerFeedback, LoyaltyTransaction, PaymentMethod, Purchase, StoredPrescription } from "@/types/customers";
import { FeedbackCard } from "./FeedbackCard";
import { PrescriptionPreviewModal } from "./PrescriptionPreviewModal";
import { useCustomers } from "./CustomersProvider";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card, CardHeader } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { Icon } from "./ui/Icon";
import { Pagination, usePagination } from "./ui/Pagination";
import { TabPanel, Tabs } from "./ui/Tabs";
import { rowClass, tableClass, tableWrap, tdClass, thClass } from "./ui/table";

export type ProfileTab = "purchases" | "prescriptions" | "loyalty" | "feedback";

export const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: "purchases", label: "Purchase History" },
  { id: "prescriptions", label: "Prescriptions" },
  { id: "loyalty", label: "Loyalty History" },
  { id: "feedback", label: "Feedback" },
];

const PAGE_SIZE = 6;
const PAY_LABEL: Record<PaymentMethod, string> = { cash: "Cash", card: "Card", bank_transfer: "Bank transfer" };

/** "Metformin 500 mg tablets" -> "Metformin" for the compact Items column. */
function shortMedicine(name: string): string {
  return name.split(/\s\d/)[0];
}

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
    <>
      <Tabs<ProfileTab> label="Customer records" idPrefix="profile" value={tab} onChange={onTabChange} tabs={PROFILE_TABS} />
      <TabPanel idPrefix="profile" id={tab}>
        {tab === "purchases" ? <PurchasesPanel purchases={purchases} /> : null}
        {tab === "prescriptions" ? <PrescriptionsPanel customer={customer} prescriptions={prescriptions} /> : null}
        {tab === "loyalty" ? <LoyaltyPanel customer={customer} transactions={transactions} purchases={purchases} /> : null}
        {tab === "feedback" ? <FeedbackPanel customer={customer} feedback={feedback} /> : null}
      </TabPanel>
    </>
  );
}

/* ---------- Purchase history ---------- */

function PurchasesPanel({ purchases }: { purchases: Purchase[] }) {
  const [open, setOpen] = useState<string[]>([]);
  const pager = usePagination(purchases, PAGE_SIZE);
  const toggle = (id: string) => setOpen((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return (
    <Card as="section" aria-labelledby="purchases-title" className="overflow-hidden">
      <CardHeader
        id="purchases-title"
        title="Purchase History"
        description="Recent purchases across Medizone branches"
        action={<span className="text-xs font-medium text-(--ink)">All amounts in LKR</span>}
      />
      {purchases.length === 0 ? (
        <EmptyState icon="receipt" title="No purchases yet" description="Orders and counter bills for this customer will appear here." compact />
      ) : (
        <>
          <div className={tableWrap}>
            <table className={`${tableClass} min-w-[820px]`}>
              <caption className="sr-only">Purchase history</caption>
              <thead>
                <tr>
                  <th scope="col" className={thClass}>Order ID</th>
                  <th scope="col" className={thClass}>Date</th>
                  <th scope="col" className={thClass}>Items</th>
                  <th scope="col" className={thClass}>Amount</th>
                  <th scope="col" className={thClass}>Points Earned</th>
                  <th scope="col" className={thClass}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pager.visible.map((p) => {
                  const expanded = open.includes(p.id);
                  return (
                    <Fragment key={p.id}>
                      <tr className={rowClass}>
                        <td className={tdClass}>
                          <button
                            type="button"
                            onClick={() => toggle(p.id)}
                            aria-expanded={expanded}
                            aria-controls={`items-${p.id}`}
                            title={`${expanded ? "Hide" : "Show"} bill details`}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-sm font-bold text-(--ink) hover:text-(--heading)"
                          >
                            <Icon name={expanded ? "chevronDown" : "chevronRight"} size={14} className="text-(--ink-muted)" />
                            {p.id}
                          </button>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap`}>{formatDate(p.date)}</td>
                        <td className={tdClass}>{p.items.map((i) => shortMedicine(i.medicine)).join(", ")}</td>
                        <td className={`${tdClass} whitespace-nowrap tabular-nums`}>{formatLKR(p.total, { decimals: 0 })}</td>
                        <td className={`${tdClass} tabular-nums`}>+{p.pointsEarned}</td>
                        <td className={tdClass}>
                          <Badge tone="success">Completed</Badge>
                        </td>
                      </tr>
                      {expanded ? (
                        <tr id={`items-${p.id}`}>
                          <td colSpan={6} className="border-b border-(--border) bg-(--surface-page) px-4 py-3">
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
                            <p className="mt-2 text-[13px] text-(--ink-muted)">
                              Subtotal {formatLKR(p.subtotal)}
                              {p.discountPercent ? ` · ${p.discountPercent}% regular discount −${formatLKR(p.discountAmount)}` : ""} · Paid {formatLKR(p.total)} by{" "}
                              {PAY_LABEL[p.paymentMethod].toLowerCase()} · {getBranchName(p.branchId)} branch
                            </p>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination {...pager} onPageChange={pager.setPage} noun="orders" variant="text" />
        </>
      )}
    </Card>
  );
}

/* ---------- Prescriptions ---------- */

function PrescriptionsPanel({ customer, prescriptions }: { customer: Customer; prescriptions: StoredPrescription[] }) {
  const { today } = useCustomers();
  const [previewId, setPreviewId] = useState<string>();
  const sorted = [...prescriptions].sort((a, b) => b.issuedOn.localeCompare(a.issuedOn));
  const preview = sorted.find((p) => p.id === previewId);

  return (
    <Card as="section" aria-labelledby="rx-title" className="overflow-hidden">
      <CardHeader
        id="rx-title"
        title="Prescriptions"
        description={`Stored prescriptions submitted by ${customer.name}`}
        action={<span className="text-xs font-medium text-(--ink)">{sorted.length} stored {sorted.length === 1 ? "record" : "records"}</span>}
      />
      {sorted.length === 0 ? (
        <EmptyState icon="file" title="No stored prescriptions" description="Prescriptions this customer uploads or brings to a branch will be stored here." compact />
      ) : (
        <>
          <div className={tableWrap}>
            <table className={`${tableClass} min-w-[760px]`}>
              <caption className="sr-only">Stored prescriptions</caption>
              <thead>
                <tr>
                  <th scope="col" className={thClass}>Prescription</th>
                  <th scope="col" className={thClass}>Date</th>
                  <th scope="col" className={thClass}>Medicine names</th>
                  <th scope="col" className={`${thClass} w-28`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => {
                  const status = prescriptionStatus(p, today);
                  return (
                    <tr key={p.id} className={rowClass}>
                      <td className={`${tdClass} py-4`}>
                        <span className="font-semibold text-(--heading)">{p.id}</span>
                        <span className="block text-xs text-(--ink-muted)">{p.fileType === "jpg" ? "JPG image" : "PDF document"}</span>
                      </td>
                      <td className={`${tdClass} whitespace-nowrap`}>
                        {formatDate(p.issuedOn)}
                        <span className={`block text-xs ${status === "active" ? "text-(--success-ink)" : "text-(--ink-muted)"}`}>
                          {status === "active" ? `Valid until ${formatDate(p.validUntil)}` : "Expired"}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <span className="font-semibold">{p.medicines.join(" · ")}</span>
                        <span className="block text-xs text-(--ink-muted)">{p.fileName}</span>
                      </td>
                      <td className={tdClass}>
                        <Button size="sm" className="min-w-[84px]" onClick={() => setPreviewId(p.id)} aria-label={`View prescription ${p.id}`}>
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-4 text-xs text-(--ink-muted)">Documents retained for reference only</p>
        </>
      )}
      <PrescriptionPreviewModal prescription={preview} customer={customer} onClose={() => setPreviewId(undefined)} />
    </Card>
  );
}

/* ---------- Loyalty history ---------- */

function LoyaltyPanel({ customer, transactions, purchases }: { customer: Customer; transactions: LoyaltyTransaction[]; purchases: Purchase[] }) {
  const summary = loyaltySummary(transactions);
  // Running balance after each transaction, oldest first; then shown newest first.
  const chronological = [...transactions].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const rows = chronological
    .reduce<{ t: LoyaltyTransaction; balance: number; purchase?: Purchase }[]>((list, t) => {
      const balance = (list.at(-1)?.balance ?? 0) + t.points;
      list.push({ t, balance, purchase: t.purchaseId ? purchases.find((p) => p.id === t.purchaseId) : undefined });
      return list;
    }, [])
    .reverse();
  const pager = usePagination(rows, PAGE_SIZE);

  const kindLabel = (t: LoyaltyTransaction) => (t.type === "redeemed" ? "Redeemed against bill" : t.type === "adjusted" ? "Opening balance" : null);

  return (
    <Card as="section" aria-labelledby="loyalty-title" className="overflow-hidden">
      <CardHeader
        id="loyalty-title"
        title="Loyalty History"
        description="1 point earned for every Rs. 100 spent."
        action={
          <span className="text-xs font-medium text-(--ink)">
            Current balance: {formatNumber(customer.loyaltyPoints)} points
          </span>
        }
      />
      {rows.length === 0 ? (
        <EmptyState icon="gift" title="No loyalty transactions yet" description="Points will appear here after this customer's first eligible purchase." compact />
      ) : (
        <>
          <p className="-mt-2 px-5 pb-3 text-xs text-(--ink-muted)">
            Earned on purchases {formatNumber(summary.earned)} · Opening balance {formatNumber(summary.adjusted)} · Redeemed {formatNumber(summary.redeemed)}
          </p>
          <div className={tableWrap}>
            <table className={`${tableClass} min-w-[720px]`}>
              <caption className="sr-only">Loyalty points history for {customer.name}</caption>
              <thead>
                <tr>
                  <th scope="col" className={thClass}>Date</th>
                  <th scope="col" className={thClass}>Order ID</th>
                  <th scope="col" className={thClass}>Purchase Amount</th>
                  <th scope="col" className={thClass}>Points Earned</th>
                  <th scope="col" className={thClass}>Current Balance</th>
                </tr>
              </thead>
              <tbody>
                {pager.visible.map(({ t, balance, purchase }) => (
                  <tr key={t.id} className={rowClass}>
                    <td className={`${tdClass} font-semibold whitespace-nowrap`}>{formatDate(t.date)}</td>
                    <td className={tdClass}>
                      {t.purchaseId ?? <span className="text-(--ink-muted)">—</span>}
                      {kindLabel(t) ? <span className="block text-xs text-(--ink-muted)">{kindLabel(t)}</span> : null}
                    </td>
                    <td className={`${tdClass} tabular-nums`}>
                      {purchase && t.type === "earned" ? formatLKR(purchase.total, { decimals: 0 }) : <span className="text-(--ink-muted)">—</span>}
                    </td>
                    <td className={`${tdClass} tabular-nums ${t.points < 0 ? "text-(--danger-ink)" : ""}`}>
                      {t.points > 0 ? "+" : ""}
                      {formatNumber(t.points)}
                    </td>
                    <td className={`${tdClass} font-semibold text-(--heading) tabular-nums`}>{formatNumber(balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination {...pager} onPageChange={pager.setPage} noun="transactions" variant="text" />
        </>
      )}
    </Card>
  );
}

/* ---------- Feedback ---------- */

function FeedbackPanel({ customer, feedback }: { customer: Customer; feedback: CustomerFeedback[] }) {
  return (
    <Card as="section" aria-labelledby="profile-feedback-title" className="overflow-hidden">
      <CardHeader
        id="profile-feedback-title"
        title="Submitted Feedback"
        description="Customer reviews submitted through Medizone.lk"
        action={
          feedback.length ? (
            <span className="text-xs font-medium text-(--ink)">
              {feedback.length} {feedback.length === 1 ? "review" : "reviews"} · Average rating {formatRating(averageRating(feedback))}/5
            </span>
          ) : undefined
        }
      />
      {feedback.length === 0 ? (
        <EmptyState icon="message" title="No feedback submitted" description={`${customer.name} has not submitted any reviews yet.`} compact />
      ) : (
        <div className="flex flex-col gap-4 px-5 pb-5">
          {feedback.map((f) => (
            <FeedbackCard key={f.id} entry={f} customer={customer} variant="profile" />
          ))}
        </div>
      )}
    </Card>
  );
}
