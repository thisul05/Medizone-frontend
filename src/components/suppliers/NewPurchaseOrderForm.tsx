"use client";

import { useState } from "react";
import { Supplier, POLineItem, PurchaseOrder } from "@/types/suppliers";
import { catalogProducts } from "@/data/suppliers";
import { formatLKR, formatDate, dueDate, orderTotal } from "@/lib/suppliers";

interface NewPurchaseOrderFormProps {
  suppliers: Supplier[];
  onBack: () => void;
  onSubmit: (newOrder: PurchaseOrder, isSent: boolean) => void;
}

export default function NewPurchaseOrderForm({
  suppliers,
  onBack,
  onSubmit,
}: NewPurchaseOrderFormProps) {
  // Default values matching Image 4
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    suppliers[0]?.id || "sup-1"
  );
  const [deliverToBranch, setDeliverToBranch] = useState<string>("Branch 1");
  const [orderDate, setOrderDate] = useState<string>("2026-11-10");

  // Initial 4 items from the Figma screenshot
  const [items, setItems] = useState<POLineItem[]>([
    {
      id: "line-1",
      productId: "prod-1",
      productName: "Amoxicillin 500 mg capsules",
      qty: 500,
      receivedQty: 0,
      damagedQty: 0,
      unitCost: 24.0,
    },
    {
      id: "line-2",
      productId: "prod-2",
      productName: "Paracetamol 500 mg tablets",
      qty: 2000,
      receivedQty: 0,
      damagedQty: 0,
      unitCost: 2.5,
    },
    {
      id: "line-3",
      productId: "prod-3",
      productName: "Metformin 500 mg tablets",
      qty: 1000,
      receivedQty: 0,
      damagedQty: 0,
      unitCost: 6.0,
    },
    {
      id: "line-4",
      productId: "prod-4",
      productName: "Omeprazole 20 mg capsules",
      qty: 600,
      receivedQty: 0,
      damagedQty: 0,
      unitCost: 11.0,
    },
  ]);

  // Product adder inputs
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [inputQty, setInputQty] = useState<number>(0);
  const [inputUnitCost, setInputUnitCost] = useState<number>(0);

  const currentSupplier =
    suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

  const handleProductSelect = (prodId: string) => {
    setSelectedProduct(prodId);
    const prod = catalogProducts.find((p) => p.id === prodId);
    if (prod) {
      setInputUnitCost(prod.defaultUnitCost);
      if (inputQty === 0) setInputQty(100);
    }
  };

  const handleAddItem = () => {
    const prod = catalogProducts.find((p) => p.id === selectedProduct);
    if (!prod || inputQty <= 0 || inputUnitCost <= 0) {
      alert("Please select a product, enter quantity and valid unit cost.");
      return;
    }

    const newItem: POLineItem = {
      id: `line-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      qty: inputQty,
      receivedQty: 0,
      damagedQty: 0,
      unitCost: inputUnitCost,
    };

    setItems([...items, newItem]);
    setSelectedProduct("");
    setInputQty(0);
    setInputUnitCost(0);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const totalAmount = orderTotal({ lines: items });
  const paymentDueDate = dueDate(
    orderDate,
    currentSupplier.paymentStage,
    currentSupplier.creditDays
  );

  const handleSubmit = (isSent: boolean) => {
    if (items.length === 0) {
      alert("Please add at least one product item to the purchase order.");
      return;
    }

    const newPO: PurchaseOrder = {
      id: `PO-00${Math.floor(44 + Math.random() * 50)}`,
      supplierId: currentSupplier.id,
      supplierName: currentSupplier.name,
      branchId: deliverToBranch,
      date: orderDate,
      status: isSent ? "sent" : "draft",
      paymentStage: currentSupplier.paymentStage,
      paymentDueDate: paymentDueDate,
      lines: items,
    };

    onSubmit(newPO, isSent);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Top Navigation - Back to purchase orders */}
      <div className="mb-4">
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

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            New purchase order
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Raise an order and save it as a draft or send it now.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit(false)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Save as draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            className="inline-flex items-center gap-2 bg-[#072f68] hover:bg-[#052350] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send order
          </button>
        </div>
      </div>

      {/* Two Column Layout (No sidebar!) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Order details & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-slate-900">Order details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Supplier
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Deliver to branch
                </label>
                <select
                  value={deliverToBranch}
                  onChange={(e) => setDeliverToBranch(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                >
                  <option value="Branch 1">Branch 1 (Piliyandala HQ)</option>
                  <option value="Branch 2">Branch 2 (Piliyandala Town)</option>
                  <option value="Branch 3">Branch 3 (Kesbewa)</option>
                  <option value="Branch 4">Branch 4 (Moratuwa)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Order date
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Draft
              </span>
            </div>
          </div>

          {/* Items Section Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-slate-900">Items</h2>

            {/* Item Input Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                >
                  <option value="">Choose a product</option>
                  {catalogProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={inputQty || ""}
                  onChange={(e) => setInputQty(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Unit cost (Rs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={inputUnitCost || ""}
                  onChange={(e) => setInputUnitCost(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add item
                </button>
              </div>
            </div>

            {/* Added Items Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-center">Quantity</th>
                    <th className="px-4 py-3 text-right">Unit cost</th>
                    <th className="px-4 py-3 text-right">Line total</th>
                    <th className="px-4 py-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        No items added yet. Choose a product and click Add item.
                      </td>
                    </tr>
                  ) : (
                    items.map((line) => (
                      <tr key={line.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {line.productName}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700">
                          {line.qty.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {formatLKR(line.unitCost)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {formatLKR(line.qty * line.unitCost)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(line.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            title="Remove item"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Summary Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-6 sticky top-6">
          <div>
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase block">
              Order Total
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              {formatLKR(totalAmount)}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Items</span>
              <span className="font-bold text-slate-900">{items.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Supplier payment stage</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {currentSupplier.paymentStage === "credit"
                  ? "Credit"
                  : currentSupplier.paymentStage === "post_dated_cheque"
                  ? "Post-dated cheque"
                  : "Cash on delivery"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Payment due</span>
              <span className="font-bold text-slate-900">
                {formatDate(paymentDueDate)}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-3 text-[11px] text-slate-500 leading-relaxed">
            Credit of {currentSupplier.creditDays} days from the order date. Draft orders can be changed; sent orders move to goods received when the stock arrives.
          </div>
        </div>
      </div>
    </div>
  );
}

