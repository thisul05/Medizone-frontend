"use client";

import React, { useState, useMemo } from "react";
import Sidebar from "@/components/delivery/Sidebar";
import { Icon } from "@/components/shared/Icon";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/shared/Toast";
import { branches } from "@/data/branches";
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

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("94") && digits.length === 11) {
    return "0" + digits.slice(2);
  }
  return digits;
}

export default function BillingPage() {
  const { user, activeBranchId } = useAuth();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [cart, setCart] = useState<BillLine[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [lookupMessage, setLookupMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>("cash");
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [selectedBranch, setSelectedBranch] = useState<string>(activeBranchId && activeBranchId !== "all" ? activeBranchId : "b1");
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

  // Customer Lookup Logic (supports "077 123 4567", "0771234567", "+94 77 123 4567", ID or name)
  const handleCustomerLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = phoneSearch.trim();
    if (!cleanQuery) {
      setLookupMessage({ text: "Please enter a mobile phone number to search.", type: "error" });
      return;
    }
    const queryDigits = normalizePhone(cleanQuery);

    const found = mockCustomersList.find((c) => {
      const cDigits = normalizePhone(c.phone);
      if (queryDigits && cDigits && queryDigits === cDigits) return true;
      if (c.phone === cleanQuery) return true;
      if (c.id.toLowerCase() === cleanQuery.toLowerCase()) return true;
      const normId = c.id.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normQueryId = cleanQuery.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normId && normQueryId && normId === normQueryId) return true;
      if (normQueryId.replace(/0+/g, "") === normId.replace(/0+/g, "")) return true;
      if (c.name.toLowerCase() === cleanQuery.toLowerCase()) return true;
      return false;
    });

    if (found) {
      setSelectedCustomer(found);
      if (found.discountPercent > 0) {
        setLookupMessage({
          text: `Customer found: ${found.name} (${found.discountPercent}% VIP discount applied). Loyalty Points: ${found.loyaltyPoints}`,
          type: "success",
        });
        toast({ tone: "success", title: `${found.name} verified: ${found.discountPercent}% discount applied` });
      } else {
        setLookupMessage({
          text: `Customer found: ${found.name} (Non-regular customer, 0% discount). Loyalty Points: ${found.loyaltyPoints}`,
          type: "success",
        });
        toast({ tone: "info", title: `${found.name} verified (0% discount)` });
      }
    } else {
      setSelectedCustomer(null);
      setLookupMessage({
        text: "Customer not registered. Walk-in rate (0% discount) applied.",
        type: "error",
      });
    }
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setPhoneSearch("");
    setLookupMessage(null);
  };

  // Cart operations
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
          qty: 1,
          unitPrice: product.price,
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

  const clearCart = () => {
    setCart([]);
  };

  // Calculated totals using pure logic function billTotals
  const discountPercent = selectedCustomer ? selectedCustomer.discountPercent : 0;
  const totals = useMemo(() => billTotals(cart, discountPercent), [cart, discountPercent]);
  const balanceChange = paymentMethod === "cash" ? Math.max(0, cashTendered - totals.total) : 0;

  // Complete Checkout
  const handleCompleteCheckout = () => {
    if (cart.length === 0) {
      toast({ tone: "danger", title: "Cart is empty. Add products before completing checkout." });
      return;
    }

    if (paymentMethod === "cash" && cashTendered < totals.total) {
      toast({ tone: "danger", title: `Cash tendered (LKR ${cashTendered.toFixed(2)}) is less than total due (LKR ${totals.total.toFixed(2)}).` });
      return;
    }

    const currentBranchObj = branches.find((b) => b.id === selectedBranch);
    const branchName = currentBranchObj ? `${currentBranchObj.name} (${currentBranchObj.area})` : "Miriswaththa (Piliyandala)";

    const newBill: Bill = {
      id: `BILL-${Date.now().toString().slice(-6)}`,
      branchId: selectedBranch,
      branchName,
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
    toast({ tone: "success", title: `Bill ${newBill.id} generated successfully!` });
  };

  // Daily Summary Calculations
  const paymentMethodSummary = useMemo(() => {
    const methods: PayMethod[] = ["cash", "card", "bank_transfer", "cod", "payhere"];
    return methods.map((method) => {
      const matched = bills.filter((b) => b.method === method);
      const totalAmount = matched.reduce((sum, b) => sum + b.total, 0);
      return {
        method,
        label:
          method === "cash"
            ? "Cash"
            : method === "card"
            ? "Credit / Debit Card"
            : method === "bank_transfer"
            ? "Bank Transfer"
            : method === "cod"
            ? "Cash On Delivery (COD)"
            : "PayHere Online Gateway",
        count: matched.length,
        total: totalAmount,
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
    <div className="flex min-h-screen bg-[#f5f7fa] text-[#0e1b2e]">
      {/* Desktop Sticky Sidebar */}
      <div className="hidden shrink-0 lg:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Topbar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-[#072f68] px-4 text-white lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-1.5 hover:bg-white/10"
              aria-label="Open sidebar"
            >
              <Icon name="menu" size={20} />
            </button>
            <span className="font-bold text-base tracking-tight">medizone.lk</span>
          </div>
          <span className="text-xs text-white/80 font-medium">Billing</span>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-nav max-w-[85vw] h-full shadow-2xl">
              <Sidebar />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-3 p-1.5 text-white/80 hover:text-white rounded-md bg-white/10"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
          </div>
        )}

        <main id="main" className="min-w-0 flex-1 overflow-auto">
          <div className="w-full max-w-7xl mx-auto px-5 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Top Header & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Pharmacy / Billing &amp; Counter POS
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-[#0e1b2e]">
                  Billing &amp; Point of Sale
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#46566d]">
                  Counter POS checkout, customer loyalty discounts, and daily cash reconciliation.
                </p>
              </div>

              {/* Branch Selector & Tab Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white shadow-xs focus:ring-2 focus:ring-[#072f68] outline-none"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.area})
                    </option>
                  ))}
                </select>

                <div className="bg-white border border-gray-200/80 p-1 rounded-xl flex space-x-1 shadow-xs">
                  <button
                    onClick={() => setActiveTab("pos")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeTab === "pos"
                        ? "bg-[#072f68] text-white shadow-xs"
                        : "text-gray-700 hover:text-black hover:bg-gray-50"
                    }`}
                  >
                    POS Terminal
                  </button>
                  <button
                    onClick={() => setActiveTab("summary")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeTab === "summary"
                        ? "bg-[#072f68] text-white shadow-xs"
                        : "text-gray-700 hover:text-black hover:bg-gray-50"
                    }`}
                  >
                    Daily Summary
                  </button>
                  <button
                    onClick={() => setActiveTab("invoices")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeTab === "invoices"
                        ? "bg-[#072f68] text-white shadow-xs"
                        : "text-gray-700 hover:text-black hover:bg-gray-50"
                    }`}
                  >
                    Invoices Archive ({bills.length})
                  </button>
                </div>
              </div>
            </div>

            {/* POS TERMINAL VIEW */}
            {activeTab === "pos" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Customer Lookup & Product Catalog (7 cols) */}
                <section className="lg:col-span-7 space-y-5">
                  {/* Customer Lookup by Phone Number */}
                  <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-200/80">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer Loyalty Lookup
                      </h2>
                      {selectedCustomer && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            selectedCustomer.discountPercent > 0
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200/60"
                              : "bg-blue-50 text-blue-800 border-blue-200/60"
                          }`}
                        >
                          {selectedCustomer.discountPercent > 0
                            ? `${selectedCustomer.discountPercent}% Discount Qualified`
                            : "Registered Customer (0% Discount)"}
                        </span>
                      )}
                    </div>

                    <form onSubmit={handleCustomerLookup} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter customer mobile (e.g. 077 123 4567, 0771234567)"
                        value={phoneSearch}
                        onChange={(e) => setPhoneSearch(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 flex-1 text-xs focus:ring-2 focus:ring-[#072f68] outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-[#072f68] hover:bg-[#052350] text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
                      >
                        Verify
                      </button>
                      {selectedCustomer && (
                        <button
                          type="button"
                          onClick={handleClearCustomer}
                          className="border border-red-300 text-red-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-50 cursor-pointer"
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
                      <div className="mt-3 grid grid-cols-3 gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-xs">
                        <div>
                          <span className="text-gray-500 block">Name:</span>
                          <span className="font-semibold text-gray-900">{selectedCustomer.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Loyalty Points:</span>
                          <span className="font-semibold text-[#072f68]">{selectedCustomer.loyaltyPoints} pts</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Benefit:</span>
                          <span className="font-bold text-emerald-700">{selectedCustomer.discountPercent}% Off Entire Bill</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Catalog & Search */}
                  <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-200/80">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <div>
                        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Products Catalog
                        </h2>
                        <p className="text-xs text-gray-500">Search items by medicine name or drug code</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Search medicine / SKU..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs w-full sm:w-48 focus:ring-2 focus:ring-[#072f68] outline-none"
                        />
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none"
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
                            className="border border-gray-200/80 rounded-lg p-3 hover:border-[#072f68] hover:shadow-xs transition bg-white flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start gap-1">
                                <h3 className="text-xs font-bold text-gray-900 leading-snug">{p.name}</h3>
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                                  {p.id}
                                </span>
                              </div>
                              <div className="text-[11px] text-gray-500 mt-1 flex justify-between">
                                <span>{p.category}</span>
                                <span className={p.stock < 20 ? "text-amber-600 font-semibold" : "text-gray-500"}>
                                  Stock: {p.stock} {p.unit}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                              <span className="text-xs font-bold text-[#072f68]">LKR {p.price.toFixed(2)}</span>
                              {inCart ? (
                                <div className="flex items-center space-x-1.5 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                                  <button
                                    onClick={() => updateQty(p.id, inCart.qty - 1)}
                                    className="text-xs font-bold text-[#072f68] px-1 hover:text-black cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs font-bold text-[#072f68]">{inCart.qty}</span>
                                  <button
                                    onClick={() => updateQty(p.id, inCart.qty + 1)}
                                    className="text-xs font-bold text-[#072f68] px-1 hover:text-black cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToCart(p)}
                                  className="bg-blue-50 hover:bg-[#072f68] text-[#072f68] hover:text-white border border-blue-200 hover:border-transparent px-3 py-1 rounded text-xs font-semibold transition cursor-pointer"
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
                  <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-200/80 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Current Cart</h2>
                          <span className="bg-blue-100 text-[#072f68] text-[11px] font-bold px-2 py-0.5 rounded-full">
                            {cart.reduce((s, i) => s + i.qty, 0)} items
                          </span>
                        </div>
                        {cart.length > 0 && (
                          <button
                            onClick={clearCart}
                            className="text-xs text-red-600 hover:text-red-800 underline font-medium cursor-pointer"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Cart Line Items */}
                      {cart.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                          <Icon name="package" size={32} className="mx-auto text-gray-300 mb-2" />
                          <p className="text-xs">Select items from the catalog to add to bill</p>
                        </div>
                      ) : (
                        <div className="space-y-2 mt-3 max-h-56 overflow-y-auto pr-1">
                          {cart.map((line) => (
                            <div
                              key={line.productId}
                              className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                            >
                              <div className="flex-1 pr-2">
                                <p className="font-semibold text-gray-800 leading-tight">{line.productName}</p>
                                <p className="text-[11px] text-gray-500">
                                  LKR {line.unitPrice.toFixed(2)} × {line.qty} ={" "}
                                  <span className="font-bold text-gray-700">
                                    LKR {(line.qty * line.unitPrice).toFixed(2)}
                                  </span>
                                </p>
                              </div>
                              <div className="flex items-center space-x-1.5">
                                <button
                                  onClick={() => updateQty(line.productId, line.qty - 1)}
                                  className="w-6 h-6 rounded bg-white border border-gray-300 font-bold hover:bg-gray-100 flex items-center justify-center text-xs cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-5 text-center font-bold text-xs">{line.qty}</span>
                                <button
                                  onClick={() => updateQty(line.productId, line.qty + 1)}
                                  className="w-6 h-6 rounded bg-white border border-gray-300 font-bold hover:bg-gray-100 flex items-center justify-center text-xs cursor-pointer"
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
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal Amount:</span>
                        <span className="font-semibold text-gray-800">LKR {totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>
                          Loyalty Discount ({totals.discountPercent}%):
                          {selectedCustomer && (
                            <span className="text-[10px] ml-1 text-gray-500">({selectedCustomer.name})</span>
                          )}
                        </span>
                        <span>- LKR {totals.discountAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-[#072f68] pt-1 border-t border-gray-100">
                        <span>Net Payable Amount:</span>
                        <span className="text-[#072f68] text-base">LKR {totals.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>Loyalty Points to Earn:</span>
                        <span className="font-semibold text-amber-700">+{totals.pointsEarned} pts (1 pt per 100 LKR)</span>
                      </div>

                      {/* Payment Methods Panel */}
                      <div className="pt-3 border-t border-gray-100">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                          Select Payment Method:
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 mb-3">
                          {[
                            { id: "cash", label: "Cash" },
                            { id: "card", label: "Card (POS)" },
                            { id: "bank_transfer", label: "Bank Transfer" },
                            { id: "cod", label: "Cash On Delivery" },
                            { id: "payhere", label: "PayHere Gateway" },
                          ].map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setPaymentMethod(m.id as PayMethod)}
                              className={`py-2 px-2.5 rounded-lg text-xs font-semibold text-left transition border cursor-pointer ${
                                paymentMethod === m.id
                                  ? "bg-blue-50 border-[#072f68] text-[#072f68] ring-1 ring-[#072f68]"
                                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>

                        {/* Cash Change Calculation */}
                        {paymentMethod === "cash" && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-semibold text-gray-700">Cash Received (LKR):</label>
                              <input
                                type="number"
                                min="0"
                                value={cashTendered === 0 ? "" : cashTendered}
                                onChange={(e) => setCashTendered(Number(e.target.value))}
                                placeholder="0.00"
                                className="border border-gray-300 rounded px-2 py-1 text-right text-xs font-bold w-28 focus:ring-1 focus:ring-[#072f68] outline-none"
                              />
                            </div>
                            <div className="flex gap-1.5 justify-end">
                              {[500, 1000, 2000, 5000].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setCashTendered(val)}
                                  className="bg-white border border-gray-300 text-[10px] px-2 py-0.5 rounded font-medium hover:bg-gray-100 cursor-pointer"
                                >
                                  +{val}
                                </button>
                              ))}
                            </div>
                            <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                              <span className="font-semibold text-gray-700">Change Due to Customer:</span>
                              <span className={`font-bold ${balanceChange >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                                LKR {balanceChange.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Complete Button */}
                        <button
                          onClick={handleCompleteCheckout}
                          disabled={cart.length === 0}
                          className="w-full bg-[#072f68] hover:bg-[#052350] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
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
                <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200/80">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 gap-2">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Daily Sales &amp; Reconciliation Summary</h2>
                      <p className="text-xs text-gray-500">Grouped by payment method for daily accountant auditing</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 block">Total Revenue (All Channels):</span>
                      <span className="text-xl font-extrabold text-[#072f68]">LKR {grandTotalRevenue.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Reconciliation Method Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                    {paymentMethodSummary.map((item) => (
                      <div key={item.method} className="bg-gray-50/60 border border-gray-200/80 rounded-xl p-4">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block truncate">
                          {item.label}
                        </span>
                        <p className="text-lg font-extrabold text-[#072f68] mt-2">LKR {item.total.toFixed(2)}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                          <span>Invoices:</span>
                          <span className="font-bold text-gray-800">{item.count}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {grandTotalRevenue > 0
                            ? `${((item.total / grandTotalRevenue) * 100).toFixed(1)}% of sales`
                            : "0%"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Audit Breakdown Table */}
                  <div className="mt-8">
                    <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
                      Accountant Reconciliation Grid
                    </h3>
                    <div className="overflow-x-auto border border-gray-200/80 rounded-lg">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#f0f4f9] text-gray-700 uppercase font-bold border-b border-gray-200">
                          <tr>
                            <th className="p-3">Payment Channel</th>
                            <th className="p-3 text-center">Transactions Count</th>
                            <th className="p-3 text-right">Channel Revenue (LKR)</th>
                            <th className="p-3 text-right">Contribution %</th>
                            <th className="p-3 text-center">Reconciliation Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paymentMethodSummary.map((p) => {
                            const share = grandTotalRevenue > 0 ? (p.total / grandTotalRevenue) * 100 : 0;
                            return (
                              <tr key={p.method} className="hover:bg-gray-50">
                                <td className="p-3 font-semibold text-gray-900">{p.label}</td>
                                <td className="p-3 text-center font-mono">{p.count}</td>
                                <td className="p-3 text-right font-bold text-[#072f68]">{p.total.toFixed(2)}</td>
                                <td className="p-3 text-right">{share.toFixed(1)}%</td>
                                <td className="p-3 text-center">
                                  <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    Verified
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-blue-50/50 font-bold text-[#072f68] border-t border-blue-200">
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
              <section className="bg-white p-6 rounded-xl shadow-xs border border-gray-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Invoices Archive</h2>
                    <p className="text-xs text-gray-500">History of customer transactions and printed receipts</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Bill ID, Customer, or Method..."
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs w-full sm:w-72 focus:ring-2 focus:ring-[#072f68] outline-none"
                  />
                </div>

                <div className="overflow-x-auto border border-gray-200/80 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#f0f4f9] text-gray-700 uppercase font-bold border-b border-gray-200">
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
                    <tbody className="divide-y divide-gray-200">
                      {filteredArchiveBills.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-6 text-center text-gray-400">
                            No invoices found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredArchiveBills.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50">
                            <td className="p-3 font-mono font-bold text-[#072f68]">{b.id}</td>
                            <td className="p-3 text-gray-600">{b.branchName || b.branchId}</td>
                            <td className="p-3 text-gray-600">{b.date}</td>
                            <td className="p-3">
                              <span className="font-semibold text-gray-900">{b.customerName || "Walk-in"}</span>
                              {b.customerPhone && (
                                <span className="block text-[11px] text-gray-500">{b.customerPhone}</span>
                              )}
                            </td>
                            <td className="p-3 capitalize">{b.method.replace("_", " ")}</td>
                            <td className="p-3 text-right">{b.subtotal.toFixed(2)}</td>
                            <td className="p-3 text-right text-emerald-700">
                              {b.discountAmount > 0 ? `-${b.discountAmount.toFixed(2)}` : "0.00"}
                            </td>
                            <td className="p-3 text-right font-bold text-gray-900">{b.total.toFixed(2)}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => setPrintBill(b)}
                                className="bg-blue-50 hover:bg-[#072f68] text-[#072f68] hover:text-white px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer"
                              >
                                View Receipt
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

            {/* RECEIPT PRINT MODAL */}
            {printBill && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-xs text-gray-800 border border-gray-200">
                  <div className="text-center pb-4 border-b border-dashed border-gray-300">
                    <h3 className="text-lg font-bold text-[#072f68]">MEDIZONE PHARMACY</h3>
                    <p className="text-[11px] text-gray-500">{printBill.branchName || "Retail Unit"}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Receipt ID: {printBill.id}</p>
                    <p className="text-[10px] text-gray-400">Date: {printBill.date}</p>
                  </div>

                  <div className="py-3 border-b border-dashed border-gray-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer:</span>
                      <span className="font-semibold">{printBill.customerName}</span>
                    </div>
                    {printBill.customerPhone && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span>{printBill.customerPhone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment:</span>
                      <span className="uppercase font-semibold">{printBill.method.replace("_", " ")}</span>
                    </div>
                  </div>

                  <div className="py-3 border-b border-dashed border-gray-300 space-y-1.5">
                    {printBill.lines.map((line) => (
                      <div key={line.productId} className="flex justify-between">
                        <span className="flex-1 pr-2 truncate">
                          {line.productName} × {line.qty}
                        </span>
                        <span className="font-medium">LKR {(line.qty * line.unitPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="py-3 border-b border-dashed border-gray-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>LKR {printBill.subtotal.toFixed(2)}</span>
                    </div>
                    {printBill.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount ({printBill.discountPercent}%):</span>
                        <span>- LKR {printBill.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-[#072f68] pt-1">
                      <span>Total Paid:</span>
                      <span>LKR {printBill.total.toFixed(2)}</span>
                    </div>
                    {printBill.pointsEarned > 0 && (
                      <div className="flex justify-between text-[11px] text-amber-700 pt-1">
                        <span>Points Earned:</span>
                        <span>+{printBill.pointsEarned} pts</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-5">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 bg-[#072f68] hover:bg-[#052350] text-white py-2.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Print Receipt
                    </button>
                    <button
                      onClick={() => setPrintBill(null)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
