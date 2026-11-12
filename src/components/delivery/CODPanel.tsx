"use client";
import type { Delivery } from "@/types/delivery";
import { formatLKR, formatPhone } from "@/lib/format";
import { Button } from "@/components/shared/Button";
import { Icon } from "@/components/shared/Icon";

interface Props {
  deliveries: Delivery[];
  onToggleCollected: (id: string, collected: boolean) => void;
}

export default function CODPanel({ deliveries, onToggleCollected }: Props) {
  const codDeliveries = deliveries.filter((d) => d.codAmount > 0);
  const totalToCollect = codDeliveries.reduce((s, d) => s + d.codAmount, 0);
  const collectedAmount = codDeliveries
    .filter((d) => d.codCollected)
    .reduce((s, d) => s + d.codAmount, 0);
  const collectedCount = codDeliveries.filter((d) => d.codCollected).length;
  const progressPct =
    codDeliveries.length === 0
      ? 0
      : Math.round((collectedCount / codDeliveries.length) * 100);

  return (
    <div className="space-y-4">
      {/* Page title */}
      <div>
        <h2 className="text-xl font-bold text-ink">Cash on Delivery</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Track cash collections and hand over collected payments to the accountant.
        </p>
      </div>

      {/* Summary banner */}
      <div className="rounded-lg bg-[#072f68] px-6 py-5 text-white shadow">
        <p className="mz-overline text-[#b8c7dc]">Cash Collection Summary</p>
        <p className="mt-1 text-xl font-bold">
          Total to collect: {formatLKR(totalToCollect, { decimals: false })}
          <span className="ml-3 text-sm font-normal text-[#b8c7dc]">
            · {collectedCount} of {codDeliveries.length} collected
          </span>
        </p>
      </div>

      {/* Table */}
      {codDeliveries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line p-10 text-center text-sm text-ink-disabled">
          No cash on delivery orders today.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-surface-sunken">
              <tr>
                {["Order", "Customer", "COD Amount", "Collected", "Status"].map((h) => (
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
                <tr
                  key={d.id}
                  className={d.codCollected ? "bg-success-bg" : "hover:bg-surface-hover"}
                >
                  <td className="mz-code px-4 py-3 text-ink-subtle">{d.orderId}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{d.customerName}</div>
                    <div className="mz-body-sm text-ink-muted">{formatPhone(d.phone)}</div>
                  </td>
                  <td className="mz-num px-4 py-3 font-semibold text-ink">
                    {formatLKR(d.codAmount, { decimals: false })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={d.codCollected}
                        onClick={() => onToggleCollected(d.id, !d.codCollected)}
                        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus ${
                          d.codCollected ? "bg-success-solid" : "bg-line"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                            d.codCollected ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                      {d.codCollected && (
                        <span className="text-xs font-medium text-success-ink">Collected</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {d.codCollected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success-ink">
                        <Icon name="check" size={13} />
                        Collected
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-warning-bg px-2.5 py-0.5 text-xs font-medium text-warning-ink">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-6 rounded-lg border border-line bg-surface-raised px-4 py-3">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between text-xs text-ink-muted">
            <span>Collection progress</span>
            <span>{collectedCount} of {codDeliveries.length} collected · {progressPct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-sunken">
            <div
              className="h-2 rounded-full bg-success-solid transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-1 mz-caption text-ink-subtle">
            {formatLKR(collectedAmount, { decimals: false })} collected and ready to hand over
          </p>
        </div>
        <Button icon="arrow-right">Hand over to accountant</Button>
      </div>
    </div>
  );
}
