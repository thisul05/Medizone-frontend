"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Button, ButtonLink, Icon, cx } from "@/components/shared";
import { formatDate, formatLKR } from "@/lib/format";
import { customerStatusLabel, orderCode, orderTotals } from "@/lib/orders";
import { orderStatusTone } from "@/lib/account/rules";
import { useAccount } from "@/lib/account/use-account";
import { FeedbackComposer } from "./FeedbackComposer";
import { Avatar, EmptyState, PANEL, Panel, StatCard, Stars, TABLE_HEAD, TD, TH } from "./ui";

export function OverviewView() {
  const account = useAccount();
  const [writing, setWriting] = useState(false);
  if (!account) return null;

  const recent = account.orders.slice(0, 4);
  const upcoming = account.reminders.filter((r) => r.daysRemaining >= 0);
  const dueSoon = account.reminders.filter((r) => r.status !== "upcoming").length;
  const latest = account.feedback[0];

  return (
    <>
      <section aria-labelledby="welcome-title" className={cx(PANEL, "flex flex-col gap-4 p-5 sm:flex-row sm:items-center")}>
        <Avatar initials={account.initials} size={56} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h1 id="welcome-title" className="mz-h2 text-primary-tint-ink">Welcome back, {account.firstName}!</h1>
          <p className="text-ink-muted">
            {account.name} · Customer ID <span className="mz-code text-ink">{account.customerId}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge tone={account.isRegular ? "loyalty" : "neutral"} icon={account.isRegular ? "badge-check" : "user"}>{account.statusLabel}</Badge>
            {account.isRegular ? (
              <Badge tone="brand" icon="percent">{account.discount}% discount on every purchase</Badge>
            ) : (
              <Badge tone="neutral" icon="info">Regular customers get 3% or 5% off</Badge>
            )}
          </div>
        </div>
        <ButtonLink href="/shop" variant="secondary" icon="bag" className="self-start sm:self-center">Continue shopping</ButtonLink>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="gift" tone="loyalty" label="Available loyalty points" value={account.loyalty.balance.toLocaleString("en-LK")} hint={<Link href="/account/loyalty" className="text-link hover:underline">View points history</Link>} />
        <StatCard icon="package" label="Orders placed" value={account.orders.length} hint={<Link href="/account/orders" className="text-link hover:underline">View all orders</Link>} />
        <StatCard icon="bell" tone={dueSoon ? "warning" : "info"} label="Upcoming refill reminders" value={upcoming.length} hint={dueSoon ? `${dueSoon} due soon or overdue` : <Link href="/account/refill-reminders" className="text-link hover:underline">View reminders</Link>} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel
          title="Recent Orders"
          action={<Link href="/account/orders" className="flex items-center gap-1 mz-label text-link hover:underline">View all <Icon name="arrow-right" size={16} /></Link>}
          bodyClassName="p-0"
        >
          {recent.length === 0 ? (
            <EmptyState icon="bag" title="No orders yet" action={<ButtonLink href="/shop" icon="bag">Start shopping</ButtonLink>}>
              Orders you place on medizone.lk will show up here.
            </EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead className={TABLE_HEAD}>
                  <tr>
                    <th scope="col" className={TH}>Order ID</th>
                    <th scope="col" className={TH}>Date</th>
                    <th scope="col" className={cx(TH, "text-right")}>Total</th>
                    <th scope="col" className={TH}>Status</th>
                    <th scope="col" className={TH}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id} className="border-b border-line last:border-0 hover:bg-surface-hover">
                      <td className={cx(TD, "mz-code")}>{orderCode(o.id)}</td>
                      <td className={cx(TD, "whitespace-nowrap")}>{formatDate(o.receivedAt)}</td>
                      <td className={cx(TD, "whitespace-nowrap text-right mz-num mz-label")}>{formatLKR(orderTotals(o).total)}</td>
                      <td className={TD}><Badge tone={orderStatusTone(o)} dot>{customerStatusLabel(o)}</Badge></td>
                      <td className={cx(TD, "text-right")}>
                        <ButtonLink href={`/account/orders/${o.id}`} size="sm" variant="ghost" iconRight="arrow-right">
                          View Order<span className="sr-only"> {orderCode(o.id)}</span>
                        </ButtonLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel title="Latest Feedback" action={latest ? <Link href="/account/feedback" className="mz-label text-link hover:underline">View all</Link> : undefined}>
            {latest ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Stars rating={latest.rating} />
                  <span className="mz-body-sm text-ink-muted">{formatDate(latest.date)}</span>
                </div>
                <p className="line-clamp-4 text-ink">&ldquo;{latest.comment}&rdquo;</p>
              </div>
            ) : (
              <p className="text-ink-muted">You haven&apos;t shared any feedback yet.</p>
            )}
          </Panel>

          <Panel title="Quick Actions">
            <div className="flex flex-col gap-2">
              <ButtonLink href="/account/profile/edit" variant="secondary" icon="user" block className="justify-start">Edit Profile</ButtonLink>
              <ButtonLink href="/account/orders" variant="secondary" icon="package" block className="justify-start">View Orders</ButtonLink>
              <Button variant="primary" icon="star" block className="justify-start" onClick={() => setWriting(true)}>Write Feedback</Button>
            </div>
          </Panel>
        </div>
      </div>

      <FeedbackComposer account={account} open={writing} onClose={() => setWriting(false)} showViewLink />
    </>
  );
}
