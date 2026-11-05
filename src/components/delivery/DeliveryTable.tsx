"use client";
import type { Delivery, DeliveryMethod, DeliveryStatus } from "@/types/delivery";
import { nextDeliveryStatus } from "@/lib/delivery";
import StatusBadge from "./StatusBadge";

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
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {["Order", "Customer", "Address", "Method", "Status", "COD Amount", "Action"].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {deliveries.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                No deliveries found.
              </td>
            </tr>
          ) : (
            deliveries.map((d) => (
              <tr key={d.id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.orderId}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{d.customerName}</div>
                  <div className="text-xs text-gray-500">{d.phone}</div>
                </td>
                <td
                  className="max-w-[180px] truncate px-4 py-3 text-xs text-gray-600"
                  title={d.address}
                >
                  {d.address}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={d.method}
                    disabled={d.status === "delivered"}
                    onChange={(e) => onMethodChange(d.id, e.target.value as DeliveryMethod)}
                    className="rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1a2f4e] disabled:opacity-50"
                  >
                    <option value="own_driver">Own Driver</option>
                    <option value="pickme_flash">PickMe Flash</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={d.status} variant="delivery" />
                </td>
                <td className="px-4 py-3 text-sm">
                  {d.codAmount > 0 ? (
                    <span className="font-semibold text-gray-900">
                      Rs.&nbsp;{d.codAmount.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {actionLabel[d.status] ? (
                    <button
                      onClick={() => onStatusChange(d.id, nextDeliveryStatus(d.status))}
                      className="rounded bg-[#1a2f4e] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#243d63]"
                    >
                      {actionLabel[d.status]}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Done</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
