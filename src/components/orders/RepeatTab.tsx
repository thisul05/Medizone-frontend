"use client";

import Link from "next/link";
import { Alert, Badge, Button, useToast } from "@/components/shared";
import { formatDate, formatPhone } from "@/lib/format";
import { daysFromToday, isFinished, orderCode } from "@/lib/orders";
import type { Order, Prescription } from "@/types/orders";
import { StatCard } from "./StatCard";

interface Props {
  prescriptions: Prescription[];
  orders: Order[];
  onPrepare: (prescriptionId: string) => void;
  onPause: (prescriptionId: string, paused: boolean) => void;
}

const dueText = (days: number) => (days === 0 ? "Today" : days < 0 ? `Overdue by ${-days} day${days === -1 ? "" : "s"}` : `In ${days} day${days === 1 ? "" : "s"}`);

/** Regular customers who collect weekly or monthly, sorted by the next preparation date. */
export function RepeatTab({ prescriptions, orders, onPrepare, onPause }: Props) {
  const toast = useToast();
  const repeats = prescriptions
    .filter((p) => p.repeat)
    .sort((a, b) => Number(!!a.repeat?.paused) - Number(!!b.repeat?.paused) || a.repeat!.nextDate.localeCompare(b.repeat!.nextDate));
  const active = repeats.filter((p) => !p.repeat?.paused);
  const dueSoon = active.filter((p) => daysFromToday(p.repeat!.nextDate) <= 7);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active repeat orders" value={active.length} hint={`${active.filter((p) => p.repeat?.every === "month").length} monthly · ${active.filter((p) => p.repeat?.every === "week").length} weekly`} icon="clock" />
        <StatCard label="Due in the next 7 days" value={dueSoon.length} hint={dueSoon[0] ? `Next: ${dueSoon[0].customerName}` : "Nothing due"} icon="calendar" />
        <StatCard label="Paused" value={repeats.length - active.length} hint="Customer asked to pause" icon="info" />
      </div>

      <Alert tone="info">On the next preparation date, prepare the order and it joins the order queue. The date after that is set one week or one month later.</Alert>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface-raised shadow-1">
        <table className="w-full min-w-[880px] text-left">
          <thead className="bg-surface-sunken text-xs font-semibold text-ink-muted">
            <tr>{["Customer", "Prescription", "Repeats", "Medicines", "Next preparation", "Status", "Action"].map((h) => <th key={h} className={`whitespace-nowrap border-b border-line px-4 py-2.5 ${h === "Action" ? "text-right" : ""}`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {repeats.map((p) => {
              const plan = p.repeat!;
              const order = orders.find((o) => o.id === p.orderId);
              const inQueue = !!order && !isFinished(order.status);
              const days = daysFromToday(plan.nextDate);
              return (
                <tr key={p.id} className={`border-b border-line last:border-0 ${!plan.paused && days <= 0 ? "bg-warning-bg/40" : ""}`}>
                  <td className="px-4 py-3"><p className="mz-label">{p.customerName}</p><p className="mz-body-sm text-ink-muted">{formatPhone(p.phone)}</p></td>
                  <td className="px-4 py-3 mz-code">{p.id}</td>
                  <td className="px-4 py-3"><Badge tone="warning">{plan.every === "week" ? "Weekly" : "Monthly"}</Badge></td>
                  <td className="px-4 py-3">{order ? <><p>{order.items.length} medicines</p><p className="max-w-48 truncate mz-body-sm text-ink-muted">{order.items.map((i) => i.name.split(" ")[0]).join(", ")}</p></> : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {plan.paused ? <><p>—</p><p className="mz-body-sm text-ink-muted">Paused · last {formatDate(plan.lastDate)}</p></> : <><p className="mz-label">{formatDate(plan.nextDate)}</p><p className={`mz-body-sm ${days <= 0 ? "text-danger-ink" : "text-ink-muted"}`}>{dueText(days)} · last {formatDate(plan.lastDate)}</p></>}
                  </td>
                  <td className="px-4 py-3"><Badge tone={plan.paused ? "neutral" : inQueue ? "info" : "success"}>{plan.paused ? "Paused" : inQueue ? "In queue" : "Active"}</Badge></td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {plan.paused ? (
                      <Button size="sm" variant="secondary" onClick={() => { onPause(p.id, false); toast({ tone: "success", title: `Repeat for ${p.customerName} resumed` }); }}>Resume</Button>
                    ) : inQueue ? (
                      <Link href={`/orders/${order!.id}`} className="mz-label text-link">View {orderCode(order!.id)} →</Link>
                    ) : (
                      <span className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { onPause(p.id, true); toast({ tone: "info", title: `Repeat for ${p.customerName} paused` }); }}>Pause</Button>
                        <Button size="sm" variant="secondary" iconRight="arrow-right" onClick={() => { onPrepare(p.id); toast({ tone: "success", title: `Repeat order for ${p.customerName} added to the queue` }); }}>Prepare now</Button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {repeats.length === 0 && <p className="p-10 text-center text-ink-muted">No repeat orders yet. Turn on “Repeat this order” on the New order form.</p>}
        <p className="border-t border-line px-4 py-2.5 mz-body-sm text-ink-muted">Showing {repeats.length} repeat orders · sorted by next preparation date</p>
      </div>
    </div>
  );
}
