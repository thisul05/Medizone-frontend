"use client";

import { useState } from "react";
import { Supplier, PaymentStage } from "@/types/suppliers";

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSupplier: (supplier: Supplier) => void;
}

export default function AddSupplierModal({
  isOpen,
  onClose,
  onAddSupplier,
}: AddSupplierModalProps) {
  const [name, setName] = useState("");
  const [repName, setRepName] = useState("");
  const [distributorName, setDistributorName] = useState("");
  const [paymentStage, setPaymentStage] = useState<PaymentStage>("cash_on_delivery");
  const [creditDays, setCreditDays] = useState<number>(0);
  const [returnWindowMonths, setReturnWindowMonths] = useState<number>(3);

  if (!isOpen) return null;

  const handleStageChange = (stage: PaymentStage) => {
    setPaymentStage(stage);
    if (stage === "cash_on_delivery") setCreditDays(0);
    else if (stage === "post_dated_cheque") setCreditDays(10);
    else if (stage === "credit") setCreditDays(35);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !repName.trim()) {
      alert("Please enter both supplier name and representative name.");
      return;
    }

    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: name.trim(),
      repName: repName.trim(),
      distributorName: distributorName.trim() || "Local Pharma Distributor",
      paymentStage,
      creditDays: Number(creditDays) || 0,
      returnWindowMonths: Number(returnWindowMonths) || 3,
    };

    onAddSupplier(newSupplier);
    setName("");
    setRepName("");
    setDistributorName("");
    setPaymentStage("cash_on_delivery");
    setCreditDays(0);
    setReturnWindowMonths(3);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Add New Supplier</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Supplier Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Health Logistics Ltd"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Representative Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ruwan Jayawardena"
              value={repName}
              onChange={(e) => setRepName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Distributor / Importer Info
            </label>
            <input
              type="text"
              placeholder="e.g. Authorized Distributor for Direct Importers"
              value={distributorName}
              onChange={(e) => setDistributorName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Stage
              </label>
              <select
                value={paymentStage}
                onChange={(e) => handleStageChange(e.target.value as PaymentStage)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="cash_on_delivery">Cash on delivery (New)</option>
                <option value="post_dated_cheque">Post-dated cheque</option>
                <option value="credit">Credit (Established)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Credit Days
              </label>
              <input
                type="number"
                min="0"
                value={creditDays}
                onChange={(e) => setCreditDays(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Return Window (Months before expiry)
            </label>
            <select
              value={returnWindowMonths}
              onChange={(e) => setReturnWindowMonths(parseInt(e.target.value) || 3)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="2">2 months</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#0B2545] hover:bg-[#143259] text-white font-semibold shadow-sm"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

