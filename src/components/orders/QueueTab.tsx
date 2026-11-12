"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Icon, TextField, cx, useToast } from "@/components/shared";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatPhone } from "@/lib/format";
import { FULFILMENT_LABELS, PAY_LABELS, SOURCE_LABELS, TODAY, isFinished, nextActionLabel, nextStatus, orderCode, timeOf } from "@/lib/orders";
import type { Order, OrderSource, OrderStatus } from "@/types/orders";
import { SourceBadge } from "./OrderBadges";
import { ReadyMessageModal } from "./ReadyMessageModal";

type StatusFilter = "all" | "received" | "preparing" | "ready" | "done";
const STATUS_ORDER: OrderStatus[] = ["received", "preparing", "ready", "collected", "out_for_delivery"];
/** "1 item", "3 medicines". */
const itemCount = (o: Order) => {
  const word = o.source === "online" ? "item" : "medicine";
  return `${o.items.length} ${word}${o.items.length === 1 ? "" : "s"}`;
};
const chip = (active: boolean) =>
  cx("h-control-sm rounded-pill border px-3 mz-label transition-colors", active ? "border-primary bg-primary text-primary-on" : "border-line-strong bg-surface-raised text-ink hover:bg-surface-hover");

interface Props {
  orders: Order[];
  staffName: string;
  onAdvance: (id: string) => void;
  onNotified: (id: string) => void;
}

/** Orders waiting to be prepared: online, WhatsApp, at-branch and repeat orders. POS sales are not here. */
export function QueueTab({ orders, staffName, onAdvance, onNotified }: Props) {
  const toast = useToast();
  const [source, setSource] = useState<"all" | OrderSource>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [readyId, setReadyId] = useState<string | null>(null);

  // Open orders, plus orders finished today.
  const queue = orders
    .filter((o) => !isFinished(o.status) || o.history[o.history.length - 1].at.startsWith(TODAY))
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || a.receivedAt.localeCompare(b.receivedAt));

  const bySource = queue.filter((o) => source === "all" || o.source === source);
  const count = (s: StatusFilter) => bySource.filter((o) => s === "all" || (s === "done" ? isFinished(o.status) : o.status === s)).length;
  const q = query.trim().toLowerCase();
  const rows = bySource
    .filter((o) => status === "all" || (status === "done" ? isFinished(o.status) : o.status === status))
    .filter((o) => !q || o.id.includes(q) || o.customerName.toLowerCase().includes(q) || o.phone.includes(q.replace(/\s/g, "")));

  function move(o: Order) {
    const to = nextStatus(o);
    onAdvance(o.id);
    toast({ tone: "success", title: `${orderCode(o.id)} moved to ${to.replaceAll("_", " ")}`, description: `By ${staffName}` });
    if (to === "ready") setReadyId(o.id);
  }

  const readyOrder = orders.find((o) => o.id === readyId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <TextField label="Search orders" labelHidden icon="search" placeholder="Search by order ID, customer or phone" value={query} onChange={(e) => setQuery(e.target.value)} fieldClassName="w-full max-w-sm" />
        {(["all", "online", "whatsapp", "branch", "repeat"] as const).map((s) => (
          <button key={s} type="button" className={chip(source === s)} onClick={() => setSource(s)} aria-pressed={source === s}>
            {s === "all" ? "All sources" : SOURCE_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {(["all", "received", "preparing", "ready", "done"] as const).map((s) => (
          <button key={s} type="button" className={chip(status === s)} onClick={() => setStatus(s)} aria-pressed={status === s}>
            {s === "all" ? "All" : s === "done" ? "Collected / Out for delivery" : s[0].toUpperCase() + s.slice(1)} <span className="ml-1 mz-num opacity-80">{count(s)}</span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface-raised shadow-1">
        <table className="w-full min-w-[1000px] text-left">
          <thead className="bg-surface-sunken text-xs font-semibold text-ink-muted">
            <tr>
              {["Order", "Source", "Customer", "Items", "Fulfilment", "Payment", "Status", "Action", "View"].map((h) => (
                <th key={h} className={cx("whitespace-nowrap border-b border-line px-4 py-2.5", (h === "Action" || h === "View") && "text-right")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const action = nextActionLabel(o);
              return (
                <tr key={o.id} className="whitespace-nowrap border-b border-line last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3">
                    <Link href={`/orders/${o.id}`} className="mz-code text-link underline">{orderCode(o.id)}</Link>
                    <p className="mz-body-sm text-ink-muted">{o.receivedAt.startsWith(TODAY) ? timeOf(o.receivedAt) : o.receivedAt.slice(5, 10).split("-").reverse().join("/")}</p>
                  </td>
                  <td className="px-4 py-3"><SourceBadge source={o.source} /></td>
                  <td className="px-4 py-3">
                    <p className="mz-label">{o.customerName}</p>
                    <p className="mz-body-sm text-ink-muted">{formatPhone(o.phone)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{itemCount(o)}</p>
                    <p className="max-w-40 truncate mz-body-sm text-ink-muted">{o.items.map((i) => i.name.split(" ")[0]).join(", ")}</p>
                  </td>
                  <td className="px-4 py-3">{FULFILMENT_LABELS[o.fulfilment]}</td>
                  <td className="px-4 py-3">
                    <p>{PAY_LABELS[o.payMethod]}</p>
                    <p className={cx("mz-body-sm", o.paymentState === "paid" ? "text-success-ink" : "text-warning-ink")}>{o.paymentState === "paid" ? "Paid" : "To pay"}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge kind="order" status={o.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {action ? <Button size="sm" variant="secondary" iconRight="arrow-right" onClick={() => move(o)}>{action}</Button> : <span className="text-ink-subtle">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/orders/${o.id}`} aria-label={`View ${orderCode(o.id)}`} className="inline-flex size-8 items-center justify-center rounded-md bg-primary-tint text-primary-tint-ink hover:bg-surface-hover">
                      <Icon name="eye" size={16} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Icon name="clipboard" size={28} className="text-ink-subtle" />
            <p className="mz-h3">No orders here</p>
            <p className="text-ink-muted">Try another filter, or record a new order.</p>
          </div>
        )}
        <p className="border-t border-line px-4 py-2.5 mz-body-sm text-ink-muted">Showing {rows.length} of {queue.length} orders · status moves one step at a time and cannot go back</p>
      </div>

      {readyOrder && <ReadyMessageModal order={readyOrder} onClose={() => setReadyId(null)} onNotified={() => { onNotified(readyOrder.id); setReadyId(null); toast({ tone: "success", title: "Customer marked as notified" }); }} />}
    </div>
  );
}
