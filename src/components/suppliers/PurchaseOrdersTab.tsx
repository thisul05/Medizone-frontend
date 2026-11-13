"use client";

import { useState } from "react";
import { PurchaseOrder, PurchaseOrderStatus } from "@/types/suppliers";
import { formatLKR, formatDate, orderTotal } from "@/lib/suppliers";

interface PurchaseOrdersTabProps {
  orders: PurchaseOrder[];
  onSelectOrder: (order: PurchaseOrder) => void;
  onNewOrder: () => void;
  onSendOrder: (orderId: string) => void;
  onReceiveOrder: (order: PurchaseOrder) => void;
}

export default function PurchaseOrdersTab({
  orders,
  onSelectOrder,
  onNewOrder,
  onSendOrder,
  onReceiveOrder,
}: PurchaseOrdersTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "draft" && order.status === "draft") ||
      (statusFilter === "sent" && order.status === "sent") ||
      (statusFilter === "partial" && order.status === "partial") ||
      (statusFilter === "received" && order.status === "received");

    return matchesStatus;
  });

  const renderStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Draft
          </span>
        );
      case "sent":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Sent
          </span>
        );
      case "partial":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Partly received
          </span>
        );
      case "received":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Received
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase orders</h1>
          <p className="text-xs text-slate-500 mt-1">
            See which orders are waiting on stock.
          </p>
        </div>
        <button
          onClick={onNewOrder}
          className="inline-flex items-center gap-2 bg-[#072f68] hover:bg-[#052350] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New purchase order
        </button>
      </div>

      {/* Filter Bar with Pills */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 items-center">
          {[
            { id: "all", label: "All" },
            { id: "draft", label: "Draft" },
            { id: "sent", label: "Sent" },
            { id: "partial", label: "Partly received" },
            { id: "received", label: "Received" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === pill.id
                  ? "bg-[#072f68] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">PO id</th>
                <th className="px-6 py-3.5">Supplier</th>
                <th className="px-6 py-3.5">Branch</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Items</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Total</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                    No purchase orders found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const total = orderTotal(order);
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td
                        onClick={() => onSelectOrder(order)}
                        className="px-6 py-4 font-bold text-[#185394] hover:underline cursor-pointer"
                      >
                        {order.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {order.supplierName}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{order.branchId}</td>
                      <td className="px-6 py-4 text-slate-600">{formatDate(order.date)}</td>
                      <td className="px-6 py-4 text-slate-600">{order.lines.length}</td>
                      <td className="px-6 py-4">{renderStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatLKR(total)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {order.status === "draft" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSendOrder(order.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Send order
                          </button>
                        )}
                        {(order.status === "sent" || order.status === "partial") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onReceiveOrder(order);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Mark as received
                          </button>
                        )}
                        {order.status === "received" && (
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

