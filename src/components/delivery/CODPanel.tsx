"use client";
import type { Delivery } from "@/types/delivery";
import { codToHandOver } from "@/lib/delivery";

interface Props {
  deliveries: Delivery[];
  onToggleCollected: (id: string, collected: boolean) => void;
}

export default function CODPanel({ deliveries, onToggleCollected }: Props) {
  const codDeliveries = deliveries.filter((d) => d.codAmount > 0);
  const total = codToHandOver(deliveries);
  const collectedCount = codDeliveries.filter((d) => d.codCollected).length;

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="flex items-center justify-between rounded-lg bg-[#1a2f4e] p-5 text-white shadow">
        <div>
          <div className="text-xs font-medium text-blue-200">Driver Hand-over Total (Today)</div>
          <div className="mt-1 text-3xl font-bold">Rs.&nbsp;{total.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {collectedCount}/{codDeliveries.length}
          </div>
          <div className="text-xs text-blue-200">COD orders collected</div>
        </div>
      </div>

      {codDeliveries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
          No cash on delivery orders today.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Order", "Customer", "Address", "Amount (Rs.)", "Collected"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {codDeliveries.map((d) => (
                <tr key={d.id} className={d.codCollected ? "bg-green-50" : "hover:bg-gray-50"}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.orderId}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{d.customerName}</div>
                    <div className="text-xs text-gray-500">{d.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{d.address}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {d.codAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={d.codCollected}
                        onChange={(e) => onToggleCollected(d.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 accent-[#1a2f4e]"
                      />
                      <span
                        className={`text-xs font-medium ${d.codCollected ? "text-green-700" : "text-gray-500"}`}
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
