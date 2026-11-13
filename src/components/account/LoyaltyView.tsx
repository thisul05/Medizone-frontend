"use client";

import Link from "next/link";
import { cx } from "@/components/shared";
import { formatDate } from "@/lib/format";
import { orderCode } from "@/lib/orders";
import { useAccount } from "@/lib/account/use-account";
import { EmptyState, PANEL, PageTitle, Pagination, Panel, StatCard, TABLE_HEAD, TD, TH, usePaged } from "./ui";

const pts = (n: number) => n.toLocaleString("en-LK");

export function LoyaltyView() {
  const account = useAccount();
  // Newest first in the table; the balance column still reads oldest to newest.
  const history = [...(account?.loyalty.ledger ?? [])].reverse();
  const paged = usePaged(history, 8);
  if (!account) return null;
  const { loyalty } = account;
  const pendingOrders = account.orders.filter((o) => o.paymentState !== "paid").length;

  return (
    <>
      <PageTitle title="Loyalty Points" description="Earn points every time you shop with Medizone Pharmacy." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="gift" tone="loyalty" label="Available points" value={pts(loyalty.balance)} hint="Ready to use at any branch" />
        <StatCard icon="arrow-up" tone="success" label="Total points earned" value={pts(loyalty.earned)} />
        <StatCard icon="tag" tone="info" label="Total points redeemed" value={pts(loyalty.redeemed)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="How you earn points">
          <ul className="flex flex-col gap-3">
            <li className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-loyalty-bg mz-label text-loyalty-ink">1</span>
              <p><strong className="font-semibold">1 point for every Rs. 100</strong> of eligible purchases. For example, a Rs. 2,450 purchase earns 24 points. Part amounts below Rs. 100 do not earn a point.</p>
            </li>
            <li className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-loyalty-bg mz-label text-loyalty-ink">2</span>
              <p>Points are worked out on the amount you pay after any discount. Delivery fees do not earn points.</p>
            </li>
            <li className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-loyalty-bg mz-label text-loyalty-ink">3</span>
              <p>Points are added once an order is paid.{pendingOrders > 0 && ` You have ${pendingOrders} unpaid order${pendingOrders === 1 ? "" : "s"} that will earn points after payment.`}</p>
            </li>
          </ul>
        </Panel>

        <Panel title="Regular customer discount">
          <div className="flex flex-col gap-2">
            {account.isRegular ? (
              <p>
                As a <strong className="font-semibold">{account.statusLabel.toLowerCase()}</strong>, you get <strong className="font-semibold">{account.discount}% off</strong> every purchase.
              </p>
            ) : (
              <p>Customers who shop with us regularly get <strong className="font-semibold">3% or 5% off</strong> every purchase. Ask at your branch about becoming a regular customer.</p>
            )}
            <p className="text-ink-muted">
              This discount is separate from loyalty points. It comes off your bill straight away, and you still earn points on what you pay.
            </p>
          </div>
        </Panel>
      </div>

      <section aria-labelledby="points-history" className={cx(PANEL, "overflow-hidden")}>
        <h2 id="points-history" className="border-b border-line px-5 py-3.5 mz-h3 text-primary-tint-ink">Points history</h2>
        {history.length === 0 ? (
          <EmptyState icon="gift" title="No points yet">Your points will appear here after your first paid purchase.</EmptyState>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className={TABLE_HEAD}>
                  <tr>
                    <th scope="col" className={TH}>Date</th>
                    <th scope="col" className={TH}>Order ID</th>
                    <th scope="col" className={TH}>Description</th>
                    <th scope="col" className={cx(TH, "text-right")}>Points earned</th>
                    <th scope="col" className={cx(TH, "text-right")}>Points redeemed</th>
                    <th scope="col" className={cx(TH, "text-right")}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.slice.map((e) => (
                    <tr key={e.id} className="border-b border-line last:border-0 hover:bg-surface-hover">
                      <td className={cx(TD, "whitespace-nowrap")}>{formatDate(e.date)}</td>
                      <td className={cx(TD, "whitespace-nowrap")}>
                        {e.orderId ? (
                          <Link href={`/account/orders/${e.orderId}`} className="mz-code text-link underline-offset-2 hover:underline">{orderCode(e.orderId)}</Link>
                        ) : (
                          <span className="text-ink-muted">{e.reference ?? "—"}</span>
                        )}
                      </td>
                      <td className={TD}>{e.description}</td>
                      <td className={cx(TD, "text-right mz-num", e.earned ? "font-semibold text-success-ink" : "text-ink-subtle")}>{e.earned ? `+${pts(e.earned)}` : "—"}</td>
                      <td className={cx(TD, "text-right mz-num", e.redeemed ? "font-semibold text-danger-ink" : "text-ink-subtle")}>{e.redeemed ? `−${pts(e.redeemed)}` : "—"}</td>
                      <td className={cx(TD, "text-right mz-num mz-label")}>{pts(e.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...paged} onChange={paged.setPage} noun="entries" />
          </>
        )}
      </section>
    </>
  );
}
