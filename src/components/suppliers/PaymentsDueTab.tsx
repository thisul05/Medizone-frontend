"use client";

import { useState } from "react";
import { PaymentDueItem, PaymentDueStatus } from "@/types/suppliers";
import { formatLKR, formatDate } from "@/lib/suppliers";

interface PaymentsDueTabProps {
  payments: PaymentDueItem[];
  onMarkPaid: (paymentId: string) => void;
}

export default function PaymentsDueTab({
  payments: initialPayments,
  onMarkPaid,
}: PaymentsDueTabProps) {
  const [payments, setPayments] = useState<PaymentDueItem[]>(initialPayments);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleMarkAsPaid = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "paid" } : p))
    );
    onMarkPaid(id);
  };

  const filteredPayments = payments.filter((item) => {
    const matchesStage =
      stageFilter === "all" || item.paymentStage === stageFilter;
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesStage && matchesStatus;
  });

  const dueThisWeekTotal = payments
    .filter((p) => p.status === "due")
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueTotal = payments
    .filter((p) => p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOutstanding = payments
    .filter((p) => p.status !== "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const renderStageBadge = (stage: string, creditDays: number) => {
    switch (stage) {
      case "credit":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Credit ({creditDays} days)
          </span>
        );
      case "post_dated_cheque":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Post-dated cheque
          </span>
        );
      case "cash_on_delivery":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Cash on delivery
          </span>
        );
    }
  };

  const renderStatusBadge = (status: PaymentDueStatus) => {
    switch (status) {
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Overdue
          </span>
        );
      case "due":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Due
          </span>
        );
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Paid
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments due</h1>
          <p className="text-xs text-slate-500 mt-1">
            Clear supplier payments on time and keep your credit growing.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Due this week
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {formatLKR(dueThisWeekTotal)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Overdue
          </p>
          <p className="text-3xl font-extrabold text-red-600 mt-2">
            {formatLKR(overdueTotal)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Total outstanding
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {formatLKR(totalOutstanding)}
          </p>
        </div>
      </div>

      {/* Filter Bar with Pills */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-48">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Payment stage
          </label>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
          >
            <option value="all">All stages</option>
            <option value="credit">Credit</option>
            <option value="post_dated_cheque">Post-dated cheque</option>
            <option value="cash_on_delivery">Cash on delivery</option>
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 items-center self-end md:self-center">
          {[
            { id: "all", label: "All" },
            { id: "due", label: "Due" },
            { id: "overdue", label: "Overdue" },
            { id: "paid", label: "Paid" },
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">PO id</th>
                <th className="px-6 py-3.5">Supplier</th>
                <th className="px-6 py-3.5">Payment stage</th>
                <th className="px-6 py-3.5">Order date</th>
                <th className="px-6 py-3.5">Due date</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => {
                const isOverdue = p.status === "overdue";
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{p.poId}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {p.supplierName}
                    </td>
                    <td className="px-6 py-4">
                      {renderStageBadge(p.paymentStage, p.creditDays)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(p.orderDate)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          isOverdue ? "font-bold text-red-600" : "text-slate-700"
                        }
                      >
                        {formatDate(p.dueDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {formatLKR(p.amount)}
                    </td>
                    <td className="px-6 py-4">{renderStatusBadge(p.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {p.status !== "paid" ? (
                        <button
                          onClick={() => handleMarkAsPaid(p.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Mark as paid
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footnote */}
      <p className="text-xs text-slate-500 italic">
        Due dates: cash on delivery is due on delivery, post-dated cheques 10 days after the order, and credit after the supplier&apos;s credit days (30 to 35).
      </p>
    </div>
  );
}

