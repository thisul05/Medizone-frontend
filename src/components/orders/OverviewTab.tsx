"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Icon, Select, TextField, cx } from "@/components/shared";
import StatusBadge from "@/components/shared/StatusBadge";
import { posBills } from "@/data/orders";
import { formatDate, formatLKR } from "@/lib/format";
import { PAY_LABELS, SOURCE_LABELS, daysFromToday, orderCode, orderTotals, timeOf } from "@/lib/orders";
import type { Order, OrderSource } from "@/types/orders";
import type { BranchId } from "@/types/roles";
import { SourceBadge } from "./OrderBadges";
import { StatCard } from "./StatCard";

interface Row {
  id: string;
  href?: string;
  source: OrderSource | "pos";
  customer: string;
  method: string;
  total: number;
  paid: boolean;
  status: string;
  date: string;
}

const PAGE_SIZE = 10;

/** One list of every order, so in-store (POS) sales and online and prescription orders are counted together. */
function allRows(orders: Order[], branch: BranchId | "all"): Row[] {
  const fromOrders: Row[] = orders.map((o) => ({
    id: orderCode(o.id), href: `/orders/${o.id}`, source: o.source, customer: o.customerName, method: PAY_LABELS[o.payMethod],
    total: orderTotals(o).total, paid: o.paymentState === "paid", status: o.status, date: o.receivedAt,
  }));
  const fromPos: Row[] = posBills
    .filter((b) => branch === "all" || b.branchId === branch)
    .map((b) => ({
      id: b.id, source: "pos", customer: b.customerName, method: PAY_LABELS[b.payMethod],
      total: b.items.reduce((s, i) => s + i.qty * i.unitPrice, 0), paid: true, status: "completed", date: b.date,
    }));
  return [...fromOrders, ...fromPos].sort((a, b) => b.date.localeCompare(a.date));
}

/** Download the rows that match the filters as a CSV file for Excel. */
function exportCsv(rows: Row[]) {
  const head = ["Order", "Source", "Customer", "Payment method", "Total (LKR)", "Payment", "Status", "Date"];
  const lines = rows.map((r) => [r.id, r.source === "pos" ? "POS" : SOURCE_LABELS[r.source], r.customer, r.method, r.total.toFixed(2), r.paid ? "Paid" : "To pay", r.status.replaceAll("_", " "), r.date.replace("T", " ")]);
  const csv = [head, ...lines].map((l) => l.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "medizone-orders.csv" });
  a.click();
  URL.revokeObjectURL(url);
}

/** For the owner and senior pharmacist assistant: every order, with counts by where it came from. */
export function OverviewTab({ orders, branch }: { orders: Order[]; branch: BranchId | "all" }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [payment, setPayment] = useState("all");
  const [period, setPeriod] = useState("all");
  const [page, setPage] = useState(0);

  const rows = allRows(orders, branch);
  const q = query.trim().toLowerCase();
  const shown = rows
    .filter((r) => !q || r.id.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q))
    .filter((r) => source === "all" || (source === "prescription" ? ["whatsapp", "branch", "repeat"].includes(r.source) : r.source === source))
    .filter((r) => payment === "all" || (payment === "paid") === r.paid)
    .filter((r) => period === "all" || daysFromToday(r.date.slice(0, 10)) > (period === "today" ? -1 : -7));
  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const prescriptionCount = rows.filter((r) => ["whatsapp", "branch", "repeat"].includes(r.source)).length;
  const resetPage = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(0); };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total orders" value={rows.length} hint="All sources" icon="bag" />
        <StatCard label="In-store (POS)" value={rows.filter((r) => r.source === "pos").length} hint="Billed at the counter" icon="store" />
        <StatCard label="Online" value={rows.filter((r) => r.source === "online").length} hint="Website shop orders" icon="globe" />
        <StatCard label="Prescription orders" value={prescriptionCount} hint="WhatsApp, at branch and repeat" icon="file-text" />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <TextField label="Search orders" labelHidden icon="search" placeholder="Search by order ID or customer" value={query} onChange={(e) => resetPage(setQuery)(e.target.value)} fieldClassName="w-full max-w-sm" />
        <Select label="Source" labelHidden value={source} onChange={(e) => resetPage(setSource)(e.target.value)} options={[{ value: "all", label: "All sources" }, { value: "pos", label: "In-store (POS)" }, { value: "online", label: "Online" }, { value: "prescription", label: "Prescription orders" }]} fieldClassName="w-48" />
        <Select label="Payment" labelHidden value={payment} onChange={(e) => resetPage(setPayment)(e.target.value)} options={[{ value: "all", label: "All payments" }, { value: "paid", label: "Paid" }, { value: "to_pay", label: "To pay" }]} fieldClassName="w-40" />
        <Select label="Date" labelHidden value={period} onChange={(e) => resetPage(setPeriod)(e.target.value)} options={[{ value: "all", label: "All dates" }, { value: "today", label: "Today" }, { value: "week", label: "Last 7 days" }]} fieldClassName="w-40" />
        <Button variant="secondary" icon="arrow-up" className="ml-auto" onClick={() => exportCsv(shown)} disabled={shown.length === 0}>Export CSV</Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface-raised shadow-1">
        <table className="w-full min-w-[960px] text-left">
          <thead className="bg-surface-sunken text-xs font-semibold text-ink-muted">
            <tr>{["Order", "Source", "Customer", "Payment method", "Total", "Payment", "Status", "Date", "View"].map((h) => <th key={h} className={cx("whitespace-nowrap border-b border-line px-4 py-2.5", h === "Total" && "text-right")}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {shown.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE).map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0 hover:bg-surface-hover">
                <td className="whitespace-nowrap px-4 py-3 mz-code">{r.href ? <Link href={r.href} className="text-link underline">{r.id}</Link> : r.id}</td>
                <td className="px-4 py-3">{r.source === "pos" ? <Badge tone="info">POS</Badge> : <SourceBadge source={r.source} />}</td>
                <td className="px-4 py-3 mz-label">{r.customer}</td>
                <td className="px-4 py-3">{r.method}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right mz-num mz-label">{formatLKR(r.total)}</td>
                <td className="px-4 py-3"><Badge tone={r.paid ? "success" : "warning"}>{r.paid ? "Paid" : "To pay"}</Badge></td>
                <td className="whitespace-nowrap px-4 py-3">{r.status === "completed" ? <Badge tone="neutral">Completed at counter</Badge> : <StatusBadge kind="order" status={r.status} />}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{formatDate(r.date)} · {timeOf(r.date)}</td>
                <td className="px-4 py-3">
                  {r.href && (
                    <Link href={r.href} aria-label={`View ${r.id}`} className="inline-flex size-8 items-center justify-center rounded-md bg-primary-tint text-primary-tint-ink hover:bg-surface-hover">
                      <Icon name="eye" size={16} />
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="p-10 text-center text-ink-muted">No orders match these filters.</p>}
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 mz-body-sm text-ink-muted">
          <span>Showing {shown.length === 0 ? 0 : current * PAGE_SIZE + 1}–{Math.min(shown.length, (current + 1) * PAGE_SIZE)} of {shown.length} orders</span>
          <span className="flex items-center gap-2">
            <button type="button" aria-label="Previous page" disabled={current === 0} onClick={() => setPage(current - 1)} className="rounded-md border border-line-strong p-1 disabled:opacity-40"><Icon name="chevron-left" size={16} /></button>
            Page {current + 1} of {pages}
            <button type="button" aria-label="Next page" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="rounded-md border border-line-strong p-1 disabled:opacity-40"><Icon name="chevron-right" size={16} /></button>
          </span>
        </div>
      </div>
    </div>
  );
}
