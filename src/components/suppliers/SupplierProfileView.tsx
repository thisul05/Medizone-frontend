"use client";

import { Supplier, PurchaseOrder, ReturnNote } from "@/types/suppliers";
import { formatLKR, formatDate, orderTotal } from "@/lib/suppliers";

interface SupplierProfileViewProps {
  supplier: Supplier;
  purchaseOrders: PurchaseOrder[];
  returnNotes: ReturnNote[];
  onBack: () => void;
  onCreatePO: (supplier: Supplier) => void;
  onSelectOrder: (order: PurchaseOrder) => void;
}

export default function SupplierProfileView({
  supplier,
  purchaseOrders,
  returnNotes,
  onBack,
  onCreatePO,
  onSelectOrder,
}: SupplierProfileViewProps) {
  const supplierOrders = purchaseOrders.filter(
    (po) => po.supplierId === supplier.id || po.supplierName === supplier.name
  );
  const supplierReturnNotes = returnNotes.filter(
    (rn) => rn.supplierId === supplier.id || rn.supplierName === supplier.name
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#185394] hover:text-[#0B2545] cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Suppliers
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {supplier.name}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {supplier.paymentStage === "credit"
                ? "Credit"
                : supplier.paymentStage === "post_dated_cheque"
                ? "Post-dated cheque"
                : "Cash on delivery"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            See how far this supplier&apos;s credit has grown.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit supplier
          </button>
          <button
            onClick={() => onCreatePO(supplier)}
            className="inline-flex items-center gap-2 bg-[#0B2545] hover:bg-[#143259] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create purchase order
          </button>
        </div>
      </div>

      {/* Details & Return Window Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left card: Details */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Supplier details</h2>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Representative</span>
              <span className="text-slate-800 font-semibold mt-0.5 block">
                {supplier.repName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Payment stage</span>
              <span className="text-slate-800 font-semibold capitalize mt-0.5 block">
                {supplier.paymentStage.replace(/_/g, " ")}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Credit days</span>
              <span className="text-slate-800 font-semibold mt-0.5 block">
                {supplier.creditDays}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Return window</span>
              <span className="text-slate-800 font-semibold mt-0.5 block">
                {supplier.returnWindowMonths} months
              </span>
            </div>
          </div>
        </div>

        {/* Right card: Return Window Policy */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-2">
          <h2 className="text-sm font-bold text-slate-900">Return window</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Takes short-dated stock back {supplier.returnWindowMonths} months before expiry.
          </p>
          <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 text-xs text-slate-500">
            Example: An item expiring on <strong className="text-slate-700">15 Feb 2027</strong> must go back by{" "}
            <strong className="text-slate-700">15 Nov 2026</strong>.
          </div>
        </div>
      </div>

      {/* Payment Stage Progress Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Payment stage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Step 1 */}
          <div className="border-t-2 border-[#0B2545] pt-3">
            <h3 className="text-xs font-bold text-slate-900">Cash on delivery</h3>
            <p className="text-xs text-slate-500 mt-1">New supplier, no credit.</p>
            <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              ✓ Reached
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`border-t-2 pt-3 ${
              supplier.paymentStage === "post_dated_cheque" || supplier.paymentStage === "credit"
                ? "border-[#0B2545]"
                : "border-slate-200"
            }`}
          >
            <h3 className="text-xs font-bold text-slate-900">Post-dated cheque</h3>
            <p className="text-xs text-slate-500 mt-1">
              7 to 10 days credit after a few months of payment history.
            </p>
            <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              {supplier.paymentStage === "post_dated_cheque" || supplier.paymentStage === "credit"
                ? "✓ Reached"
                : "Upcoming"}
            </div>
          </div>

          {/* Step 3 */}
          <div
            className={`border-t-2 pt-3 ${
              supplier.paymentStage === "credit" ? "border-[#0B2545]" : "border-slate-200"
            }`}
          >
            <h3 className="text-xs font-bold text-slate-900">Credit</h3>
            <p className="text-xs text-slate-500 mt-1">
              30 to 35 days after 4 to 5 months of smooth cheque clearance.
            </p>
            <div className="mt-2 text-xs font-semibold text-sky-700 flex items-center gap-1">
              {supplier.paymentStage === "credit" ? "✓ Current stage" : "Target stage"}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase orders table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden space-y-3 p-5">
        <h2 className="text-sm font-bold text-slate-900">Purchase orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2.5">PO id</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {supplierOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No purchase orders recorded for this supplier yet.
                  </td>
                </tr>
              ) : (
                supplierOrders.map((po) => (
                  <tr
                    key={po.id}
                    onClick={() => onSelectOrder(po)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-bold text-[#185394]">{po.id}</td>
                    <td className="px-4 py-3">{formatDate(po.date)}</td>
                    <td className="px-4 py-3 capitalize">{po.status}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatLKR(orderTotal(po))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return notes table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden space-y-3 p-5">
        <h2 className="text-sm font-bold text-slate-900">Return notes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2.5">Note id</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Reason</th>
                <th className="px-4 py-2.5 text-right">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {supplierReturnNotes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No return notes on file.
                  </td>
                </tr>
              ) : (
                supplierReturnNotes.map((rn) => (
                  <tr key={rn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{rn.id}</td>
                    <td className="px-4 py-3">{formatDate(rn.date)}</td>
                    <td className="px-4 py-3">{rn.reason}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {rn.items.reduce((s, i) => s + i.qty, 0)}
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

