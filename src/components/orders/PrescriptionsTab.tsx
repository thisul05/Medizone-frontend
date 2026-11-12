"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Icon, TextField, cx } from "@/components/shared";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDate, formatPhone } from "@/lib/format";
import { daysFromToday, orderCode } from "@/lib/orders";
import type { Order, Prescription } from "@/types/orders";
import { StatCard } from "./StatCard";

const VIA_LABELS = { whatsapp: "via WhatsApp", branch: "Handed in at branch", repeat: "Repeat order" } as const;
const chip = (active: boolean) =>
  cx("h-control-sm rounded-pill border px-3 mz-label transition-colors", active ? "border-primary bg-primary text-primary-on" : "border-line-strong bg-surface-raised text-ink hover:bg-surface-hover");

/** Every prescription received, stored with the customer and linked to the order made from it. */
export function PrescriptionsTab({ prescriptions, orders }: { prescriptions: Prescription[]; orders: Order[] }) {
  const [via, setVia] = useState<"all" | Prescription["via"]>("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const rows = [...prescriptions]
    .sort((a, b) => b.receivedOn.localeCompare(a.receivedOn))
    .filter((p) => via === "all" || p.via === via)
    .filter((p) => !q || p.id.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q) || p.phone.includes(q.replace(/\s/g, "")));
  const thisWeek = prescriptions.filter((p) => daysFromToday(p.receivedOn) > -7);
  const repeats = prescriptions.filter((p) => p.repeat && !p.repeat.paused);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Stored prescriptions" value={prescriptions.length} hint="With the customer, not in WhatsApp chats" icon="file-text" />
        <StatCard label="Received this week" value={thisWeek.length} hint={`${thisWeek.filter((p) => p.via === "whatsapp").length} by WhatsApp`} icon="calendar" />
        <StatCard label="Active repeat orders" value={repeats.length} hint={`${repeats.filter((p) => p.repeat?.every === "month").length} monthly · ${repeats.filter((p) => p.repeat?.every === "week").length} weekly`} icon="clock" />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <TextField label="Search prescriptions" labelHidden icon="search" placeholder="Search by customer, phone or prescription ID" value={query} onChange={(e) => setQuery(e.target.value)} fieldClassName="w-full max-w-sm" />
        {(["all", "whatsapp", "branch", "repeat"] as const).map((v) => (
          <button key={v} type="button" className={chip(via === v)} onClick={() => setVia(v)} aria-pressed={via === v}>
            {v === "all" ? "All" : v === "whatsapp" ? "WhatsApp" : v === "branch" ? "Handed in at branch" : "Repeat"}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface-raised shadow-1">
        <table className="w-full min-w-[960px] text-left">
          <thead className="bg-surface-sunken text-xs font-semibold text-ink-muted">
            <tr>{["ID", "Customer", "Doctor", "Received", "Medicines", "Linked order", "Repeat", "View"].map((h) => <th key={h} className="whitespace-nowrap border-b border-line px-4 py-2.5">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const order = orders.find((o) => o.id === p.orderId);
              return (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface-hover">
                  <td className="whitespace-nowrap px-4 py-3 mz-code">{p.id}</td>
                  <td className="px-4 py-3"><p className="mz-label">{p.customerName}</p><p className="mz-body-sm text-ink-muted">{formatPhone(p.phone)}</p></td>
                  <td className="px-4 py-3"><p>{p.doctor}</p><p className="mz-body-sm text-ink-muted">{p.clinic || "—"}</p></td>
                  <td className="whitespace-nowrap px-4 py-3"><p>{formatDate(p.receivedOn)}</p><p className="mz-body-sm text-ink-muted">{VIA_LABELS[p.via]}</p></td>
                  <td className="px-4 py-3">
                    {order ? <><p>{order.items.length} medicine{order.items.length === 1 ? "" : "s"}</p><p className="max-w-48 truncate mz-body-sm text-ink-muted">{order.items.map((i) => i.name.split(" ")[0]).join(", ")}</p></> : <span className="text-ink-muted">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {order ? <span className="flex items-center gap-2"><Link href={`/orders/${order.id}`} className="mz-code text-link underline">{orderCode(order.id)}</Link><StatusBadge kind="order" status={order.status} dot={false} /></span> : <span className="text-ink-muted">No order yet</span>}
                  </td>
                  <td className="px-4 py-3">{p.repeat ? <Badge tone={p.repeat.paused ? "neutral" : "warning"}>{p.repeat.paused ? "Paused" : p.repeat.every === "week" ? "Weekly" : "Monthly"}</Badge> : <span className="text-ink-subtle">—</span>}</td>
                  <td className="px-4 py-3">
                    {order && (
                      <Link href={`/orders/${order.id}`} aria-label={`View ${p.id}`} className="inline-flex size-8 items-center justify-center rounded-md bg-primary-tint text-primary-tint-ink hover:bg-surface-hover">
                        <Icon name="eye" size={16} />
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-10 text-center text-ink-muted">No prescriptions match this search.</p>}
        <p className="border-t border-line px-4 py-2.5 mz-body-sm text-ink-muted">Showing {rows.length} of {prescriptions.length} prescriptions · newest first</p>
      </div>
    </div>
  );
}
