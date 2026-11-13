"use client";

import { useState } from "react";
import { Alert, Badge, ButtonLink, cx } from "@/components/shared";
import { formatDate, formatLKR } from "@/lib/format";
import { customerStatusLabel, orderCode, orderTotals } from "@/lib/orders";
import { isCompletedOrder, orderStatusTone, orderSummary } from "@/lib/account/rules";
import { useAccount } from "@/lib/account/use-account";
import { site } from "@/data/site";
import { EmptyState, FilterChips, PANEL, PageTitle, Pagination, TABLE_HEAD, TD, TH, usePaged } from "./ui";

type Filter = "all" | "delivered" | "processing";

export function OrdersView() {
  const account = useAccount();
  const [filter, setFilter] = useState<Filter>("all");
  const orders = account?.orders ?? [];
  const delivered = orders.filter(isCompletedOrder);
  const processing = orders.filter((o) => !isCompletedOrder(o));
  const shown = filter === "all" ? orders : filter === "delivered" ? delivered : processing;
  const paged = usePaged(shown, 8);
  if (!account) return null;

  return (
    <>
      <PageTitle
        title="My Orders"
        description="Orders you placed with Medizone Pharmacy."
        actions={<ButtonLink href="/shop" variant="secondary" icon="bag">Continue shopping</ButtonLink>}
      />

      <FilterChips<Filter>
        label="Filter orders"
        value={filter}
        onChange={(f) => {
          setFilter(f);
          paged.setPage(1);
        }}
        options={[
          { id: "all", label: "All Orders", count: orders.length },
          { id: "delivered", label: "Delivered", count: delivered.length },
          { id: "processing", label: "Processing", count: processing.length },
        ]}
      />

      <div className={cx(PANEL, "overflow-hidden")}>
        {shown.length === 0 ? (
          <EmptyState
            icon="package"
            title={orders.length === 0 ? "No orders yet" : filter === "delivered" ? "No delivered orders" : "No orders in progress"}
            action={orders.length === 0 ? <ButtonLink href="/shop" icon="bag">Start shopping</ButtonLink> : undefined}
          >
            {orders.length === 0 ? "When you place an order on medizone.lk, it shows up here." : "Try another filter to see your other orders."}
          </EmptyState>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <caption className="sr-only">Your orders</caption>
                <thead className={TABLE_HEAD}>
                  <tr>
                    <th scope="col" className={TH}>Order ID</th>
                    <th scope="col" className={TH}>Date</th>
                    <th scope="col" className={TH}>Products</th>
                    <th scope="col" className={cx(TH, "text-right")}>Total (LKR)</th>
                    <th scope="col" className={TH}>Status</th>
                    <th scope="col" className={TH}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.slice.map((o) => (
                    <tr key={o.id} className="border-b border-line last:border-0 hover:bg-surface-hover">
                      <td className={cx(TD, "whitespace-nowrap mz-code")}>{orderCode(o.id)}</td>
                      <td className={cx(TD, "whitespace-nowrap")}>{formatDate(o.receivedAt)}</td>
                      <td className={TD}>
                        <p className="max-w-72 truncate" title={o.items.map((i) => i.name).join(", ")}>{orderSummary(o)}</p>
                        <p className="mz-body-sm text-ink-muted">{o.items.reduce((n, i) => n + i.qty, 0)} item{o.items.reduce((n, i) => n + i.qty, 0) === 1 ? "" : "s"}</p>
                      </td>
                      <td className={cx(TD, "whitespace-nowrap text-right mz-num mz-label")}>{formatLKR(orderTotals(o).total)}</td>
                      <td className={TD}><Badge tone={orderStatusTone(o)} dot>{customerStatusLabel(o)}</Badge></td>
                      <td className={cx(TD, "text-right")}>
                        <ButtonLink href={`/account/orders/${o.id}`} size="sm" variant="ghost" iconRight="arrow-right">
                          View Details<span className="sr-only"> for {orderCode(o.id)}</span>
                        </ButtonLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...paged} onChange={paged.setPage} noun="orders" />
          </>
        )}
      </div>

      <Alert tone="info" icon="message">
        Prescription medicines are not sold through online checkout. Send your prescription on WhatsApp or call {site.phone} and a pharmacist will prepare it for you.
      </Alert>
    </>
  );
}
