"use client";
import { useState } from "react";
import type { Delivery, DeliveryMethod, DeliveryStatus } from "@/types/delivery";
import { nextDeliveryStatus } from "@/lib/delivery";
import { formatLKR, formatPhone } from "@/lib/format";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/Button";
import { Icon } from "@/components/shared/Icon";

interface Props {
  deliveries: Delivery[];
  onStatusChange: (id: string, status: DeliveryStatus) => void;
  onMethodChange: (id: string, method: DeliveryMethod) => void;
}

const actionLabel: Record<DeliveryStatus, string | null> = {
  pending: "Mark Out",
  out: "Mark Delivered",
  delivered: null,
};

export default function DeliveryTable({ deliveries, onStatusChange, onMethodChange }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "">("");

  const filtered = deliveries.filter((d) => {
    if (statusFilter && d.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        d.orderId.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Sub-header + filters */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">Delivery list</p>
          <p className="mz-body-sm text-ink-muted">{deliveries.length} orders across branches</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              type="text"
              placeholder="Search order, name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-control-sm rounded-md border border-line pl-8 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-1 focus:ring-focus"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DeliveryStatus | "")}
            className="h-control-sm rounded-md border border-line px-3 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-focus"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="out">Out</option>
            <option value="delivered">Delivered</option>
          </select>
          <button
            type="button"
            className="flex h-control-sm items-center gap-1.5 rounded-md border border-line px-3 text-sm text-ink hover:bg-surface-hover"
          >
            <Icon name="calendar" size={14} className="text-ink-subtle" />
            4 Nov 2026
            <Icon name="chevron-down" size={12} className="text-ink-subtle" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-surface-sunken">
            <tr>
              {["Order", "Customer", "Address", "Method", "Status", "COD Amount", "Action"].map((h) => (
                <th key={h} className="border-b border-line px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface-raised">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-disabled">
                  No deliveries found.
                </td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-surface-hover">
                  <td className="mz-code px-4 py-3 text-ink-subtle">{d.orderId}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{d.customerName}</div>
                    <div className="mz-body-sm text-ink-muted">{formatPhone(d.phone)}</div>
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-xs text-ink-muted" title={d.address}>
                    {d.address}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={d.method}
                      disabled={d.status === "delivered"}
                      onChange={(e) => onMethodChange(d.id, e.target.value as DeliveryMethod)}
                      className="rounded border border-line bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-focus disabled:opacity-50"
                    >
                      <option value="own_driver">Own Driver</option>
                      <option value="pickme_flash">PickMe Flash</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge kind="delivery" status={d.status} />
                  </td>
                  <td className="mz-num px-4 py-3 text-sm">
                    {d.codAmount > 0 ? (
                      <span className="font-semibold text-ink">{formatLKR(d.codAmount, { decimals: false })}</span>
                    ) : (
                      <span className="text-ink-disabled">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {actionLabel[d.status] ? (
                      <Button size="sm" onClick={() => onStatusChange(d.id, nextDeliveryStatus(d.status))}>
                        {actionLabel[d.status]}
                      </Button>
                    ) : (
                      <span className="text-xs text-ink-disabled">Done</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-ink-muted">
        <span>Showing {filtered.length} of {deliveries.length} deliveries</span>
        <div className="flex items-center gap-1">
          <button className="rounded px-2 py-1 hover:bg-surface-hover disabled:opacity-40" disabled>
            <Icon name="chevron-left" size={16} />
          </button>
          <span className="rounded-md bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-on">1</span>
          <button className="rounded px-2 py-1 hover:bg-surface-hover disabled:opacity-40" disabled>
            <Icon name="chevron-right" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
