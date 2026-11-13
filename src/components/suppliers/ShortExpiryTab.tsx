"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ShortExpiryItem } from "@/types/suppliers";
import { formatDate } from "@/lib/suppliers";

interface ShortExpiryTabProps {
  items: ShortExpiryItem[];
  onReturnSelected: (selectedIds: string[]) => void;
}

export default function ShortExpiryTab({
  items: initialItems,
  onReturnSelected,
}: ShortExpiryTabProps) {
  const [items, setItems] = useState<ShortExpiryItem[]>(initialItems);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const toggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setItems((prev) => prev.map((item) => ({ ...item, selected: checked })));
  };

  const filteredItems = items.filter((item) => {
    const matchesStatus =
      statusFilter === "all" || item.creditStatus === statusFilter;
    return matchesStatus;
  });

  const selectedCount = items.filter((i) => i.selected).length;
  const itemsToReturnCount = items.filter((i) => i.creditStatus === "to_return").length;
  const deadlines30DaysCount = items.filter(
    (i) => !i.isDeadlinePassed && i.monthsRemaining <= 3
  ).length;
  const awaitingCreditCount = items.filter(
    (i) => i.creditStatus === "sent_to_supplier"
  ).length;

  const renderExpiryBadge = (tag: "red" | "orange" | "yellow", months: number) => {
    switch (tag) {
      case "red":
        return (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/60 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            Red · {months} month{months > 1 ? "s" : ""}
          </span>
        );
      case "orange":
        return (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/60 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
            Orange · {months} months
          </span>
        );
      case "yellow":
        return (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
            Yellow · {months} months
          </span>
        );
    }
  };

  const renderCreditBadge = (status: string) => {
    switch (status) {
      case "to_return":
        return (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
            To return
          </span>
        );
      case "sent_to_supplier":
        return (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
            Sent
          </span>
        );
      case "credit_received":
        return (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            Credit note
          </span>
        );
    }
  };

  const handleReturnAction = () => {
    const selectedIds = items.filter((i) => i.selected).map((i) => i.id);
    if (selectedIds.length === 0) {
      alert("Please select at least one item to return to supplier.");
      return;
    }
    // Update local state to sent_to_supplier
    setItems((prev) =>
      prev.map((item) =>
        item.selected ? { ...item, creditStatus: "sent_to_supplier", selected: false } : item
      )
    );
    onReturnSelected(selectedIds);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Short-expiry returns
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Return it in time and earn the credit.
          </p>
        </div>
        <button
          onClick={handleReturnAction}
          className="inline-flex items-center gap-2 bg-[#072f68] hover:bg-[#052350] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Return selected items
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs">
          <p className="text-xs font-semibold tracking-wider text-[#46566d] uppercase">
            Items to return
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1b2e] tabular-nums">
            {itemsToReturnCount}
          </p>
          <p className="mt-1 text-xs text-[#46566d]">
            Batches marked for supplier credit claim
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs">
          <p className="text-xs font-semibold tracking-wider text-[#46566d] uppercase">
            Deadlines in the next 30 days
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-amber-700 tabular-nums">
            {deadlines30DaysCount}
          </p>
          <p className="mt-1 text-xs text-[#46566d]">
            Urgent returns before credit eligibility expires
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs">
          <p className="text-xs font-semibold tracking-wider text-[#46566d] uppercase">
            Awaiting credit
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1b2e] tabular-nums">
            {awaitingCreditCount}
          </p>
          <p className="mt-1 text-xs text-[#46566d]">
            Dispatched to suppliers for credit note
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs flex items-center justify-between">
        <div className="w-full sm:w-60">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Credit status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-200 px-3.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-800"
          >
            <option value="all">All statuses</option>
            <option value="to_return">To return</option>
            <option value="sent_to_supplier">Sent to supplier</option>
            <option value="credit_received">Credit note received</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={items.length > 0 && items.every((i) => i.selected)}
                    className="rounded border-slate-300 text-[#072f68] focus:ring-sky-500 h-4 w-4"
                  />
                </th>
                <th className="px-6 py-3.5">Product and batch</th>
                <th className="px-6 py-3.5">Supplier</th>
                <th className="px-6 py-3.5">Expiry date</th>
                <th className="px-6 py-3.5">Expiry tag</th>
                <th className="px-6 py-3.5">Return deadline</th>
                <th className="px-6 py-3.5 text-right">Quantity</th>
                <th className="px-6 py-3.5">Credit status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    item.selected ? "bg-sky-50/40" : ""
                  }`}
                >
                  <td className="px-5 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={!!item.selected}
                      onChange={() => toggleSelect(item.id)}
                      className="rounded border-slate-300 text-[#072f68] focus:ring-sky-500 h-4 w-4"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{item.productName}</div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">
                      {item.batchNo}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{item.supplierName}</td>
                  <td className="px-6 py-4 text-slate-700">{formatDate(item.expiryDate)}</td>
                  <td className="px-6 py-4">
                    {renderExpiryBadge(item.expiryTag, item.monthsRemaining)}
                  </td>
                  <td className="px-6 py-4">
                    {item.isDeadlinePassed ? (
                      <div>
                        <span className="text-xs font-bold text-red-600 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Deadline passed
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(item.returnDeadline)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-800 font-medium">
                        {formatDate(item.returnDeadline)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{renderCreditBadge(item.creditStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanatory Footer Note */}
      <p className="text-xs text-slate-500 italic">
        The return deadline is the expiry date minus the supplier&apos;s return window. Items are sorted by the soonest deadline. {selectedCount} item{selectedCount === 1 ? "" : "s"} selected.
      </p>
    </div>
  );
}

