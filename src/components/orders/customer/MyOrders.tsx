"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Badge, ButtonLink, Icon, cx } from "@/components/shared";
import { useAuth } from "@/lib/auth";
import { formatDate, formatLKR } from "@/lib/format";
import { PAY_LABELS, customerStatusLabel, isFinished, orderCode, orderTotals } from "@/lib/orders";
import { useOrders } from "@/lib/orders-store";

const chip = (active: boolean) =>
  cx("h-control-sm rounded-pill border px-3 mz-label", active ? "border-primary bg-primary text-primary-on" : "border-line-strong bg-surface-raised text-ink hover:bg-surface-hover");

/** The signed-in customer's online orders, newest first. */
export function MyOrders() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const mine = orders.filter((o) => o.source === "online" && o.customerId === user?.customerId).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  const active = mine.filter((o) => !isFinished(o.status));
  const shown = filter === "all" ? mine : filter === "active" ? active : mine.filter((o) => isFinished(o.status));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mz-body-sm text-ink-muted"><Link href="/" className="text-link">Home</Link> › My orders</p>
          <h1 className="mz-h1">My orders</h1>
          <p className="text-ink-muted">Orders you placed on medizone.lk</p>
        </div>
        <ButtonLink href="/shop" variant="secondary" icon="bag">Continue shopping</ButtonLink>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter orders">
        {([["all", "All", mine.length], ["active", "Active", active.length], ["completed", "Completed", mine.length - active.length]] as const).map(([id, label, n]) => (
          <button key={id} type="button" className={chip(filter === id)} onClick={() => setFilter(id)} aria-pressed={filter === id}>
            {label} <span className="ml-1 opacity-80">{n}</span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface-raised shadow-1">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-surface-sunken text-xs font-semibold text-ink-muted">
            <tr>{["Order", "Date", "Items", "Total", "Payment", "Status", ""].map((h) => <th key={h} className={cx("whitespace-nowrap border-b border-line px-4 py-2.5", h === "Total" && "text-right")}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0 hover:bg-surface-hover">
                <td className="whitespace-nowrap px-4 py-3 mz-code"><Link href={`/orders/${o.id}`} className="text-link underline">{orderCode(o.id)}</Link></td>
                <td className="whitespace-nowrap px-4 py-3">{formatDate(o.receivedAt)}</td>
                <td className="px-4 py-3"><p>{o.items.length} item{o.items.length === 1 ? "" : "s"}</p><p className="max-w-56 truncate mz-body-sm text-ink-muted">{o.items.map((i) => i.name).join(", ")}</p></td>
                <td className="whitespace-nowrap px-4 py-3 text-right mz-num mz-label">{formatLKR(orderTotals(o).total)}</td>
                <td className="px-4 py-3"><p>{PAY_LABELS[o.payMethod]}</p><p className={cx("mz-body-sm", o.paymentState === "paid" ? "text-success-ink" : "text-warning-ink")}>{o.paymentState === "paid" ? "Paid" : o.payMethod === "card" ? "Awaiting card payment" : "To pay"}</p></td>
                <td className="whitespace-nowrap px-4 py-3"><Badge tone={isFinished(o.status) ? "success" : "info"} dot>{customerStatusLabel(o)}</Badge></td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <ButtonLink href={`/orders/${o.id}`} size="sm" variant={isFinished(o.status) ? "ghost" : "primary"} iconRight="arrow-right">{isFinished(o.status) ? "View details" : "Track order"}</ButtonLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Icon name="bag" size={28} className="text-ink-subtle" />
            <p className="mz-h3">No orders here yet</p>
            <p className="text-ink-muted">When you place an order on the website, it shows up here.</p>
          </div>
        )}
      </div>

      <Alert tone="success" icon="message">Prescription medicines are not sold online. Send your prescription on WhatsApp to +94 70 185 5855 and we will prepare it for you.</Alert>
    </div>
  );
}
