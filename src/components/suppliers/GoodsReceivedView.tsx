"use client";

import { useState } from "react";
import { PurchaseOrder, POLineItem, ReturnNote } from "@/types/suppliers";
import { formatLKR, formatDate, orderTotal } from "@/lib/suppliers";

interface GoodsReceivedViewProps {
  order: PurchaseOrder;
  onBack: () => void;
  onConfirmReceived: (updatedOrder: PurchaseOrder, returnNote?: ReturnNote) => void;
}

export default function GoodsReceivedView({
  order,
  onBack,
  onConfirmReceived,
}: GoodsReceivedViewProps) {
  const [lines, setLines] = useState<POLineItem[]>(order.lines);
  const [showReturnNote, setShowReturnNote] = useState(
    lines.some((l) => (l.damagedQty || 0) > 0)
  );

  const handleReceivedQtyChange = (lineId: string, val: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, receivedQty: Math.max(0, val) } : l))
    );
  };

  const handleDamagedQtyChange = (lineId: string, val: number) => {
    const updated = lines.map((l) =>
      l.id === lineId ? { ...l, damagedQty: Math.max(0, val) } : l
    );
    setLines(updated);
    if (updated.some((l) => (l.damagedQty || 0) > 0)) {
      setShowReturnNote(true);
    }
  };

  const handleConfirm = () => {
    const damagedLines = lines.filter((l) => (l.damagedQty || 0) > 0);
    let newReturnNote: ReturnNote | undefined;

    if (damagedLines.length > 0) {
      newReturnNote = {
        id: `RN-${Math.floor(1000 + Math.random() * 9000)}`,
        poId: order.id,
        supplierId: order.supplierId,
        supplierName: order.supplierName,
        date: new Date().toISOString().slice(0, 10),
        reason: "Damaged",
        items: damagedLines.map((l) => ({
          productName: l.productName,
          qty: l.damagedQty,
          reason: "Damaged packaging / stock on arrival",
        })),
      };
    }

    const updatedOrder: PurchaseOrder = {
      ...order,
      status: "received",
      lines: lines,
    };

    onConfirmReceived(updatedOrder, newReturnNote);
  };

  const damagedLines = lines.filter((l) => (l.damagedQty || 0) > 0);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#185394] hover:text-[#072f68] cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Purchase orders
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {order.id}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {order.status === "received" ? "Received" : "Sent"}
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Count what arrived and return what is damaged.
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {order.supplierName} · {order.branchId} · {formatDate(order.date)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReturnNote(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate return note
          </button>
          <button
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 bg-[#072f68] hover:bg-[#052350] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Confirm goods received
          </button>
        </div>
      </div>

      {/* Stepper Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="border-t-2 border-[#072f68] pt-2">
            <span className="font-bold text-slate-900 block">Draft</span>
            <span className="text-emerald-600 font-medium">✓ Reached</span>
          </div>
          <div className="border-t-2 border-[#072f68] pt-2">
            <span className="font-bold text-slate-900 block">Sent</span>
            <span className="text-sky-700 font-medium">✓ Current step</span>
          </div>
          <div
            className={`border-t-2 pt-2 ${
              order.status === "received" ? "border-[#072f68]" : "border-slate-200"
            }`}
          >
            <span className="font-bold text-slate-900 block">Received</span>
            <span
              className={
                order.status === "received"
                  ? "text-emerald-600 font-medium"
                  : "text-slate-400"
              }
            >
              {order.status === "received" ? "✓ Reached" : "Not reached yet"}
            </span>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-sky-900">
        <svg className="w-5 h-5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>Receiving note:</strong> Mark damaged items on the invoice while the supplier representative is still here to claim instant return credit.
        </span>
      </div>

      {/* Item Verification Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3 text-center">Ordered</th>
                <th className="px-6 py-3 text-center">Received</th>
                <th className="px-6 py-3 text-center">Damaged</th>
                <th className="px-6 py-3 text-right">Unit cost</th>
                <th className="px-6 py-3 text-right">Line value</th>
                <th className="px-6 py-3 text-center">Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((l) => {
                const lineTotal = l.qty * l.unitCost;
                const isShort = l.receivedQty < l.qty;
                const isDamaged = (l.damagedQty || 0) > 0;

                return (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">
                      {l.productName}
                    </td>
                    <td className="px-6 py-3.5 text-center text-slate-700 font-medium">
                      {l.qty}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <input
                        type="number"
                        min="0"
                        value={l.receivedQty}
                        onChange={(e) =>
                          handleReceivedQtyChange(l.id, parseInt(e.target.value) || 0)
                        }
                        className="w-20 text-center text-xs font-semibold rounded border border-slate-300 py-1 focus:ring-2 focus:ring-sky-500"
                      />
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <input
                        type="number"
                        min="0"
                        value={l.damagedQty || 0}
                        onChange={(e) =>
                          handleDamagedQtyChange(l.id, parseInt(e.target.value) || 0)
                        }
                        className="w-20 text-center text-xs font-semibold rounded border border-slate-300 py-1 focus:ring-2 focus:ring-red-500 text-red-600"
                      />
                    </td>
                    <td className="px-6 py-3.5 text-right text-slate-600">
                      {formatLKR(l.unitCost)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                      {formatLKR(lineTotal)}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      {isDamaged ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          ⚠ {l.damagedQty} damaged
                        </span>
                      ) : isShort ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          ⚠ Short by {l.qty - l.receivedQty}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ Complete
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
              <tr>
                <td colSpan={5} className="px-6 py-3 text-right text-slate-700">
                  Order total:
                </td>
                <td className="px-6 py-3 text-right text-slate-900 font-extrabold text-sm">
                  {formatLKR(orderTotal({ lines }))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Generated Return note card (RN-0003) */}
      {(showReturnNote || damagedLines.length > 0) && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Return note <span className="font-mono text-slate-600">RN-0003</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {order.supplierName} · {formatDate("2026-11-10")}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print return note
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2 text-center">Quantity</th>
                  <th className="px-4 py-2">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {damagedLines.length === 0 ? (
                  <tr>
                    <td className="px-4 py-2 font-medium">Omeprazole 20 mg capsules</td>
                    <td className="px-4 py-2 text-center font-bold text-red-600">24</td>
                    <td className="px-4 py-2 text-slate-600">Damaged packaging / cracked seal</td>
                  </tr>
                ) : (
                  damagedLines.map((l) => (
                    <tr key={l.id}>
                      <td className="px-4 py-2 font-medium">{l.productName}</td>
                      <td className="px-4 py-2 text-center font-bold text-red-600">{l.damagedQty}</td>
                      <td className="px-4 py-2 text-slate-600">Damaged blister / transit damage</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

