"use client";

import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/shared";
import {
  Bill,
  BillLine,
  PayMethod,
  ProductItem,
  CustomerProfile,
  initialBills,
  mockCatalogProducts,
  mockCustomersList,
  billTotals,
} from "@/data/billing";

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [cart, setCart] = useState<BillLine[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [lookupMessage, setLookupMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>("cash");
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [selectedBranch, setSelectedBranch] = useState("b1");
  const [activeTab, setActiveTab] = useState<"pos" | "summary" | "invoices">("pos");
  const [printBill, setPrintBill] = useState<Bill | null>(null);
  const [invoiceSearch, setInvoiceSearch] = useState("");

  // Product Categories
  const categories = useMemo(() => {
    const cats = new Set(mockCatalogProducts.map((p) => p.category));
    return ["All", ...Array.from(cats)];
  }, []);

  // Filtered Products Catalog
  const filteredProducts = useMemo(() => {
    return mockCatalogProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [productSearch, selectedCategory]);

  // Customer Lookup Logic
  const handleCustomerLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneSearch.trim()) {
      setLookupMessage({ text: "Please enter a valid phone number to lookup.", type: "error" });
      return;
    }

    const found = mockCustomersList.find((c) => c.phone.replace(/\s+/g, "") === phoneSearch.replace(/\s+/g, ""));
    if (found) {
      setSelectedCustomer(found);
      setLookupMessage({
        text: `Customer verified: ${found.name} (${found.discountPercent > 0 ? "Regular Customer" : "New Customer"})`,
        type: "success",
      });
    } else {
      setSelectedCustomer(null);
      setLookupMessage({
        text: "No registered regular customer found with this phone number. Walk-in rates applied.",
        type: "error",
      });
    }
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setPhoneSearch("");
    setLookupMessage(null);
  };

  // Cart Operations
  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.productId === productId ? { ...item, qty: newQty } : item))
      );
    }
  };

  const clearCart = () => setCart([]);

  // Compute Total Calculations
  const discountPercent = selectedCustomer ? selectedCustomer.discountPercent : 0;
  const totals = useMemo(() => billTotals(cart, discountPercent), [cart, discountPercent]);

  const balanceChange = useMemo(() => {
    if (paymentMethod !== "cash" || cashTendered <= 0) return 0;
    return Math.max(0, cashTendered - totals.total);
  }, [paymentMethod, cashTendered, totals.total]);

  // Handle Checkout / Sale Finalization
  const handleCompleteCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Add products before completing checkout.");
      return;
    }

    if (paymentMethod === "cash" && cashTendered < totals.total) {
      alert(`Cash tendered (LKR ${cashTendered.toFixed(2)}) is less than total due (LKR ${totals.total.toFixed(2)}).`);
      return;
    }

    const branchLabel = selectedBranch === "b1" ? "Colombo Main Branch" : "Kandy Healthcare Branch";

    const newBill: Bill = {
      id: `BILL-${Date.now().toString().slice(-6)}`,
      branchId: selectedBranch,
      branchName: branchLabel,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || "Walk-in Customer",
      customerPhone: selectedCustomer?.phone,
      date: new Date().toISOString().slice(0, 10),
      lines: [...cart],
      subtotal: totals.subtotal,
      discountPercent: totals.discountPercent,
      discountAmount: totals.discountAmount,
      total: totals.total,
      method: paymentMethod,
      pointsEarned: totals.pointsEarned,
    };

    setBills((prev) => [newBill, ...prev]);
    setPrintBill(newBill);
    setCart([]);
    setCashTendered(0);
    handleClearCustomer();
  };

  // Daily Summary Calculations
  const paymentMethodSummary = useMemo(() => {
    const methods: PayMethod[] = ["cash", "card", "bank_transfer", "cod", "payhere"];
    const labels: Record<PayMethod, string> = {
      cash: "Cash Payments",
      card: "Credit / Debit Card (POS)",
      bank_transfer: "Bank Transfer",
      cod: "Cash on Delivery",
      payhere: "PayHere Online Gateway",
    };

    return methods.map((m) => {
      const matchBills = bills.filter((b) => b.method === m);
      const total = matchBills.reduce((sum, b) => sum + b.total, 0);
      return {
        method: m,
        label: labels[m],
        count: matchBills.length,
        total,
      };
    });
  }, [bills]);

  const grandTotalRevenue = useMemo(() => {
    return bills.reduce((sum, b) => sum + b.total, 0);
  }, [bills]);

  // Filtered Archive Bills
  const filteredArchiveBills = useMemo(() => {
    return bills.filter((b) => {
      const q = invoiceSearch.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        b.method.toLowerCase().includes(q)
      );
    });
  }, [bills, invoiceSearch]);

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto min-h-screen text-slate-800 space-y-6">
        {/* Top Header & Navigation */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-200 gap-4">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Pharmacy / Billing &amp; POS</div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Billing &amp; POS Counter
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pharmacy counter point-of-sale, customer loyalty discounts and daily cash reconciliation.
            </p>
          </div>

          {/* Branch Selector & Tab Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-white shadow-sm focus:ring-2 focus:ring-[#072f68] outline-none"
            >
              <option value="b1">Colombo Main Branch (b1)</option>
              <option value="b2">Kandy Healthcare Branch (b2)</option>
            </select>

            <div className="bg-slate-200/80 p-1 rounded-lg flex space-x-1">
              <button
                type="button"
                onClick={() => setActiveTab("pos")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  activeTab === "pos" ? "bg-[#072f68] text-white shadow-sm" : "text-slate-700 hover:text-black"
                }`}
              >
                POS Terminal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  activeTab === "summary" ? "bg-[#072f68] text-white shadow-sm" : "text-slate-700 hover:text-black"
                }`}
              >
                Daily Summary
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("invoices")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  activeTab === "invoices" ? "bg-[#072f68] text-white shadow-sm" : "text-slate-700 hover:text-black"
                }`}
              >
                Invoices Archive ({bills.length})
              </button>
            </div>
          </div>
        </header>

        {/* POS TERMINAL VIEW */}
        {activeTab === "pos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Customer Lookup & Product Catalog (7 cols) */}
            <section className="lg:col-span-7 space-y-5">
              {/* Customer Lookup by Phone Number */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Customer Loyalty Lookup
                  </h2>
                  {selectedCustomer && (
                    <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      {selectedCustomer.discountPercent}% Discount Qualified
                    </span>
                  )}
                </div>

                <form onSubmit={handleCustomerLookup} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter customer mobile (e.g. 0712345678, 0779876543)"
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 flex-1 text-xs focus:ring-2 focus:ring-[#072f68] outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#072f68] hover:bg-[#05214b] text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    Verify
                  </button>
                  {selectedCustomer && (
                    <button
                      type="button"
                      onClick={handleClearCustomer}
                      className="border border-rose-300 text-rose-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-rose-50"
                    >
                      Reset
                    </button>
                  )}
                </form>

                {lookupMessage && (
                  <div
                    className={`mt-3 p-2.5 rounded-lg text-xs font-medium ${
                      lookupMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                        : "bg-amber-50 text-amber-900 border border-amber-200"
                    }`}
                  >
                    {lookupMessage.text}
                  </div>
                )}

                {selectedCustomer && (
                  <div className="mt-3 grid grid-cols-3 gap-2 bg-blue-50/60 p-3 rounded-lg border border-blue-100 text-xs">
                    <div>
                      <span className="text-slate-500 block">Name:</span>
                      <span className="font-semibold text-slate-900">{selectedCustomer.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Loyalty Points:</span>
                      <span className="font-semibold text-[#072f68]">{selectedCustomer.loyaltyPoints} pts</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Benefit:</span>
                      <span className="font-bold text-emerald-700">{selectedCustomer.discountPercent}% Off Entire Bill</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Catalog & Search */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div>
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Products Catalog
                    </h2>
                    <p className="text-xs text-slate-500">Search items by medicine name or drug code</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search medicine / SKU..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs w-full sm:w-48 focus:ring-2 focus:ring-[#072f68] outline-none"
                    />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                  {filteredProducts.map((p) => {
                    const inCart = cart.find((item) => item.productId === p.id);
                    return (
                      <div
                        key={p.id}
                        className="border border-slate-200 rounded-lg p-3 hover:border-[#072f68] hover:shadow-xs transition bg-white flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h3 className="text-xs font-bold text-slate-900 leading-snug">{p.name}</h3>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                              {p.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                            <span>{p.category}</span>
                            <span className={p.stock < 20 ? "text-amber-600 font-semibold" : "text-slate-500"}>
                              Stock: {p.stock} {p.unit}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-xs font-bold text-[#072f68]">LKR {p.price.toFixed(2)}</span>
                          {inCart ? (
                            <div className="flex items-center space-x-1.5 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                              <button
                                type="button"
                                onClick={() => updateQty(p.id, inCart.qty - 1)}
                                className="text-xs font-bold text-[#072f68] px-1 hover:text-black"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-slate-900">{inCart.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateQty(p.id, inCart.qty + 1)}
                                className="text-xs font-bold text-[#072f68] px-1 hover:text-black"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(p)}
                              className="bg-blue-50 hover:bg-[#072f68] text-[#072f68] hover:text-white border border-blue-200 hover:border-transparent px-3 py-1 rounded text-xs font-semibold transition"
                            >
                              + Add to Bill
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Right Column: Active Cart, Totals & Payment Panel (5 cols) */}
            <section className="lg:col-span-5 flex flex-col space-y-5">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Current Cart</h2>
                      <span className="bg-blue-100 text-[#072f68] text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {cart.reduce((s, i) => s + i.qty, 0)} items
                      </span>
                    </div>
                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={clearCart}
                        className="text-xs text-rose-600 hover:text-rose-800 underline font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Cart Line Items */}
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <p className="text-xs">Select items from the catalog to add to bill</p>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-3 max-h-56 overflow-y-auto pr-1">
                      {cart.map((line) => (
                        <div
                          key={line.productId}
                          className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                        >
                          <div className="flex-1 pr-2">
                            <p className="font-semibold text-slate-800 leading-tight">{line.productName}</p>
                            <p className="text-[11px] text-slate-500">
                              LKR {line.unitPrice.toFixed(2)} × {line.qty} ={" "}
                              <span className="font-bold text-slate-700">
                                LKR {(line.qty * line.unitPrice).toFixed(2)}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => updateQty(line.productId, line.qty - 1)}
                              className="w-6 h-6 rounded bg-white border border-slate-200 font-bold hover:bg-slate-100 flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold text-xs">{line.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(line.productId, line.qty + 1)}
                              className="w-6 h-6 rounded bg-white border border-slate-200 font-bold hover:bg-slate-100 flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals & Calculations Section */}
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Amount:</span>
                    <span className="font-semibold text-slate-800">LKR {totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>
                      Loyalty Discount ({totals.discountPercent}%):
                      {selectedCustomer && (
                        <span className="text-[10px] ml-1 text-slate-500">({selectedCustomer.name})</span>
                      )}
                    </span>
                    <span>- LKR {totals.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-100">
                    <span>Net Payable Amount:</span>
                    <span className="text-[#072f68] text-base">LKR {totals.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Loyalty Points to Earn:</span>
                    <span className="font-semibold text-amber-700">+{totals.pointsEarned} pts (1 pt per 100 LKR)</span>
                  </div>

                  {/* Payment Methods Panel */}
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Select Payment Method:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      {[
                        { id: "cash", label: "💵 Cash" },
                        { id: "card", label: "💳 Card (POS)" },
                        { id: "bank_transfer", label: "🏛️ Bank Transfer" },
                        { id: "cod", label: "📦 Cash On Delivery" },
                        { id: "payhere", label: "⚡ PayHere Gateway" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as PayMethod)}
                          className={`py-2 px-2.5 rounded-lg text-xs font-semibold text-left transition border ${
                            paymentMethod === m.id
                              ? "bg-blue-50 border-[#072f68] text-[#072f68] ring-1 ring-[#072f68]"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {/* Cash Change Calculation */}
                    {paymentMethod === "cash" && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-slate-700">Cash Received (LKR):</label>
                          <input
                            type="number"
                            min="0"
                            value={cashTendered === 0 ? "" : cashTendered}
                            onChange={(e) => setCashTendered(Number(e.target.value))}
                            placeholder="0.00"
                            className="border border-slate-300 rounded px-2 py-1 text-right text-xs font-bold w-28 focus:ring-1 focus:ring-[#072f68] outline-none"
                          />
                        </div>
                        <div className="flex gap-1.5 justify-end">
                          {[500, 1000, 2000, 5000].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setCashTendered(val)}
                              className="bg-white border border-slate-200 text-[10px] px-2 py-0.5 rounded font-medium hover:bg-slate-100"
                            >
                              +{val}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                          <span className="font-semibold text-slate-700">Change Due to Customer:</span>
                          <span className={`font-bold ${balanceChange >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                            LKR {balanceChange.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Complete Button */}
                    <button
                      type="button"
                      onClick={handleCompleteCheckout}
                      disabled={cart.length === 0}
                      className="w-full bg-[#072f68] hover:bg-[#05214b] disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
                    >
                      <span>Complete Sale &amp; Issue Receipt</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* DAILY SUMMARY RECONCILIATION TAB */}
        {activeTab === "summary" && (
          <section className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Daily Sales &amp; Reconciliation Summary</h2>
                  <p className="text-xs text-slate-500">Grouped by payment method for daily accountant auditing</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Total Revenue (All Channels):</span>
                  <span className="text-xl font-extrabold text-[#072f68]">LKR {grandTotalRevenue.toFixed(2)}</span>
                </div>
              </div>

              {/* Reconciliation Method Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                {paymentMethodSummary.map((item) => (
                  <div key={item.method} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block truncate">
                      {item.label}
                    </span>
                    <p className="text-lg font-extrabold text-slate-900 mt-2">LKR {item.total.toFixed(2)}</p>
                    <div className="flex justify-between items-center text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
                      <span>Invoices:</span>
                      <span className="font-bold text-slate-800">{item.count}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {grandTotalRevenue > 0
                        ? `${((item.total / grandTotalRevenue) * 100).toFixed(1)}% of sales`
                        : "0%"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Audit Breakdown Table */}
              <div className="mt-8">
                <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Accountant Reconciliation Grid
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#f0f4f9] text-slate-700 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Payment Channel</th>
                        <th className="p-3 text-center">Transactions Count</th>
                        <th className="p-3 text-right">Channel Revenue (LKR)</th>
                        <th className="p-3 text-right">Contribution %</th>
                        <th className="p-3 text-center">Reconciliation Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paymentMethodSummary.map((p) => {
                        const share = grandTotalRevenue > 0 ? (p.total / grandTotalRevenue) * 100 : 0;
                        return (
                          <tr key={p.method} className="hover:bg-slate-50/70">
                            <td className="p-3 font-semibold text-slate-900">{p.label}</td>
                            <td className="p-3 text-center font-mono">{p.count}</td>
                            <td className="p-3 text-right font-bold text-slate-900">{p.total.toFixed(2)}</td>
                            <td className="p-3 text-right">{share.toFixed(1)}%</td>
                            <td className="p-3 text-center">
                              <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                Verified
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                      <tr>
                        <td className="p-3">Total Sales Reconciled</td>
                        <td className="p-3 text-center font-mono">{bills.length}</td>
                        <td className="p-3 text-right text-sm">LKR {grandTotalRevenue.toFixed(2)}</td>
                        <td className="p-3 text-right">100.0%</td>
                        <td className="p-3 text-center">Balanced</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* INVOICES ARCHIVE TAB */}
        {activeTab === "invoices" && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Invoices Archive</h2>
                <p className="text-xs text-slate-500">History of customer transactions and printed receipts</p>
              </div>
              <input
                type="text"
                placeholder="Search by Bill ID, Customer, or Method..."
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs w-full sm:w-72 focus:ring-2 focus:ring-[#072f68] outline-none"
              />
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f0f4f9] text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Bill ID</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3 text-right">Subtotal</th>
                    <th className="p-3 text-right">Discount</th>
                    <th className="p-3 text-right">Total (LKR)</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredArchiveBills.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400">
                        No invoices found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredArchiveBills.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono font-bold text-[#072f68]">{b.id}</td>
                        <td className="p-3 text-slate-600">{b.branchName || b.branchId}</td>
                        <td className="p-3 text-slate-600">{b.date}</td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-900">{b.customerName || "Walk-in"}</span>
                          {b.customerPhone && (
                            <span className="block text-[10px] text-slate-400">{b.customerPhone}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                            {b.method}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono">{b.subtotal.toFixed(2)}</td>
                        <td className="p-3 text-right text-emerald-700 font-mono">
                          {b.discountPercent > 0 ? `-${b.discountAmount.toFixed(2)} (${b.discountPercent}%)` : "-"}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 font-mono">
                          {b.total.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setPrintBill(b)}
                            className="bg-blue-50 hover:bg-[#072f68] text-[#072f68] hover:text-white border border-blue-200 hover:border-transparent px-2.5 py-1 rounded text-[11px] font-semibold transition"
                          >
                            View / Print
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* PRINTABLE INVOICE MODAL */}
        {printBill && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              {/* Header info */}
              <div className="text-center border-b pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Official Tax Receipt
                </span>
                <h3 className="font-extrabold text-xl text-[#072f68] mt-1">MEDIZONE PHARMACY</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {printBill.branchName || "Colombo Main Branch"}
                </p>
                <p className="text-[11px] text-slate-400">Hotline: +94 11 234 5678 | Reg: PH-2026-LK</p>
              </div>

              {/* Bill Meta */}
              <div className="text-xs py-3 border-b space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Receipt Number:</span>
                  <span className="font-mono font-bold text-slate-800">{printBill.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date &amp; Time:</span>
                  <span className="font-medium text-slate-800">{printBill.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-medium text-slate-800">{printBill.customerName || "Walk-in Customer"}</span>
                </div>
                {printBill.customerPhone && (
                  <div className="flex justify-between">
                    <span>Contact:</span>
                    <span className="font-medium text-slate-800">{printBill.customerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Payment Tendered:</span>
                  <span className="font-bold uppercase text-[#072f68]">{printBill.method}</span>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full text-xs my-3">
                <thead>
                  <tr className="border-b text-slate-500 font-semibold text-left">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {printBill.lines.map((line, idx) => (
                    <tr key={idx} className="py-1.5">
                      <td className="py-1.5 pr-1 font-medium text-slate-800">{line.productName}</td>
                      <td className="py-1.5 text-center font-mono">{line.qty}</td>
                      <td className="py-1.5 text-right font-mono">{line.unitPrice.toFixed(2)}</td>
                      <td className="py-1.5 text-right font-mono font-bold text-slate-900">
                        {(line.qty * line.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculation Totals */}
              <div className="text-xs border-t pt-3 space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">LKR {printBill.subtotal.toFixed(2)}</span>
                </div>
                {printBill.discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Loyalty Discount ({printBill.discountPercent}%):</span>
                    <span className="font-mono">- LKR {printBill.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-slate-900 border-t pt-2">
                  <span>Total Amount Due:</span>
                  <span className="font-mono text-[#072f68]">LKR {printBill.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-amber-700 pt-1">
                  <span>Loyalty Points Credited:</span>
                  <span className="font-bold">+{printBill.pointsEarned} pts</span>
                </div>
              </div>

              {/* Notice Footer */}
              <div className="text-center text-[10px] text-slate-400 mt-5 pt-3 border-t">
                <p>Thank you for choosing Medizone Pharmacy!</p>
                <p>Prescription drugs cannot be returned or refunded once dispensed.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 bg-[#072f68] hover:bg-[#05214b] text-white py-2.5 rounded-lg text-xs font-bold transition shadow-sm"
                >
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setPrintBill(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg text-xs font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
