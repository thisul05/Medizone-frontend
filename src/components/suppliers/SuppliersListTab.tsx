"use client";

import { useState } from "react";
import { Supplier, PaymentStage } from "@/types/suppliers";

interface SuppliersListTabProps {
  suppliers: Supplier[];
  ordersAwaitingCount: number;
  paymentsOverdueCount: number;
  onSelectSupplier: (supplier: Supplier) => void;
  onOpenAddModal: () => void;
}

export default function SuppliersListTab({
  suppliers,
  ordersAwaitingCount,
  paymentsOverdueCount,
  onSelectSupplier,
  onOpenAddModal,
}: SuppliersListTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");

  const filteredSuppliers = suppliers.filter((sup) => {
    const matchesSearch =
      sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.repName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage =
      selectedStage === "all" || sup.paymentStage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const renderPaymentBadge = (stage: PaymentStage) => {
    switch (stage) {
      case "credit":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Credit
          </span>
        );
      case "post_dated_cheque":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            Post-dated cheque
          </span>
        );
      case "cash_on_delivery":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
            Cash on delivery
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Suppliers</h1>
        <p className="text-xs text-slate-500 mt-1">
          Find a supplier and see their payment stage at a glance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Suppliers
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{suppliers.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Orders Awaiting Delivery
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {ordersAwaitingCount}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Payments Overdue
          </p>
          <p className="text-3xl font-extrabold text-red-600 mt-2">
            {paymentsOverdueCount}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-80">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by supplier or representative"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-200 px-3.5 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-800"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="w-full sm:w-60">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Payment stage
          </label>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-200 px-3.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-800"
          >
            <option value="all">All stages</option>
            <option value="credit">Credit</option>
            <option value="post_dated_cheque">Post-dated cheque</option>
            <option value="cash_on_delivery">Cash on delivery</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3.5">
                  Supplier
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Representative
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Payment stage
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Credit days
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Return window
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    No suppliers match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((sup) => (
                  <tr
                    key={sup.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => onSelectSupplier(sup)}
                  >
                    <td className="px-6 py-4 font-semibold text-[#185394] hover:underline">
                      {sup.name}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{sup.repName}</td>
                    <td className="px-6 py-4">{renderPaymentBadge(sup.paymentStage)}</td>
                    <td className="px-6 py-4 text-slate-600">{sup.creditDays}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {sup.returnWindowMonths} months
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

