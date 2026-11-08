"use client";
import type { Delivery } from "@/types/delivery";
import { codToHandOver } from "@/lib/delivery";
import { formatLKR, formatPhone } from "@/lib/format";

interface Props {
  deliveries: Delivery[];
  onToggleCollected: (id: string, collected: boolean) => void;
}

export default function CODPanel({ deliveries, onToggleCollected }: Props) {
  const codDeliveries = deliveries.filter((d) => d.codAmount > 0);
  const total = codToHandOver(deliveries);
  const collectedCount = codDeliveries.filter((d) => d.codCollected).length;
  const progressPct =
    codDeliveries.length === 0
      ? 0
      : Math.round((collectedCount / codDeliveries.length) * 100);

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="rounded-lg bg-[#072f68] p-5 text-white shadow">
        <div className="flex items-start justify-between">
          <div>
            <div className="mz-overline text-[#b8c7dc]">Driver Hand-over Total</div>
            <div className="mz-kpi mt-1">{formatLKR(total, { decimals: false })}</div>
          </div>
          <div className="flex gap-3">
            <div className="rounded-lg bg-blue-900/60 px-4 py-2 text-center">
              <div className="mz-overline text-[#b8c7dc]">Collected</div>
              <div className="mz-num mt-0.5 text-xl font-bold">
                {collectedCount}
                <span className="text-sm font-normal text-[#b8c7dc]">
                  /{codDeliveries.length}
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-blue-900/60 px-4 py-2 text-center">
              <div className="mz-overline text-[#b8c7dc]">Received</div>
              <div className="mz-num mt-0.5 text-xl font-bold">
                {formatLKR(total, { decimals: false })}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-[#b8c7dc]">
            <span>Collection progress</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-blue-900">
            <div
              className="h-1.5 rounded-full bg-green-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {codDeliveries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line p-10 text-center text-sm text-ink-disabled">
          No cash on delivery orders today.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-surface-sunken">
              <tr>
                {["Order", "Customer", "Address", "Amount", "Collected"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-subtle"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-surface-raised">
              {codDeliveries.map((d) => (
                <tr key={d.id} className={d.codCollected ? "bg-success-bg" : "hover:bg-surface-hover"}>
                  <td className="mz-code px-4 py-3 text-ink-subtle">{d.orderId}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{d.customerName}</div>
                    <div className="mz-body-sm text-ink-muted">{formatPhone(d.phone)}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{d.address}</td>
                  <td className="mz-num px-4 py-3 font-semibold text-ink">
                    {formatLKR(d.codAmount, { decimals: false })}
                  </td>
                  <td className="px-4 py-3">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={d.codCollected}
                        onChange={(e) => onToggleCollected(d.id, e.target.checked)}
                        className="h-4 w-4 rounded border-line accent-[#072f68]"
                      />
                      <span
                        className={`text-xs font-medium ${d.codCollected ? "text-success-ink" : "text-ink-muted"}`}
                      >
                        {d.codCollected ? "Collected" : "Pending"}
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
