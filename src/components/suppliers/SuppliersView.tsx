"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface SupplierItem {
  id: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  ordersCount: number;
  status: "Active" | "Under review";
}

interface PurchaseOrder {
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  items: string;
  amount: number;
  status: "Delivered" | "In Transit" | "Pending Approval";
}

const SUPPLIERS_LIST: SupplierItem[] = [
  {
    id: "sup-01",
    name: "State Pharmaceuticals Manufacturing Corp",
    category: "Generic & Essential Medicines",
    contact: "Mr. K. Samarasinghe",
    phone: "011 285 5440",
    email: "procurement@spmc.gov.lk",
    ordersCount: 34,
    status: "Active",
  },
  {
    id: "sup-02",
    name: "Emerchemie NB (Ceylon) Ltd",
    category: "Antibiotics & Specialized Drugs",
    contact: "Ms. T. De Silva",
    phone: "011 472 8800",
    email: "orders@emerchemie.lk",
    ordersCount: 28,
    status: "Active",
  },
  {
    id: "sup-03",
    name: "Astron Limited",
    category: "Nutritional & OTC Healthcare",
    contact: "Mr. R. Perera",
    phone: "011 263 5211",
    email: "supply@astron.lk",
    ordersCount: 19,
    status: "Active",
  },
  {
    id: "sup-04",
    name: "Hemas Pharmaceuticals (Pvt) Ltd",
    category: "Branded Pharmaceuticals & Devices",
    contact: "Mr. D. Wickramasinghe",
    phone: "011 483 8383",
    email: "pharma.distribution@hemas.com",
    ordersCount: 42,
    status: "Active",
  },
  {
    id: "sup-05",
    name: "CIC Holdings PLC",
    category: "Surgicals & Diagnostic Devices",
    contact: "Ms. N. Jayawardena",
    phone: "011 235 9359",
    email: "healthcare@cic.lk",
    ordersCount: 15,
    status: "Active",
  },
];

const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    poNumber: "PO-2026-104",
    supplier: "State Pharmaceuticals Manufacturing Corp",
    orderDate: "08 Nov 2026",
    expectedDate: "14 Nov 2026",
    items: "Paracetamol 500mg, Metformin 500mg, Losartan 50mg",
    amount: 145000,
    status: "In Transit",
  },
  {
    poNumber: "PO-2026-103",
    supplier: "Emerchemie NB (Ceylon) Ltd",
    orderDate: "05 Nov 2026",
    expectedDate: "10 Nov 2026",
    items: "Amoxicillin 500mg, Ciprofloxacin 500mg",
    amount: 98400,
    status: "Delivered",
  },
  {
    poNumber: "PO-2026-102",
    supplier: "Astron Limited",
    orderDate: "02 Nov 2026",
    expectedDate: "07 Nov 2026",
    items: "Vitamin C 500mg, Multivitamin Syrup 200ml",
    amount: 62000,
    status: "Delivered",
  },
  {
    poNumber: "PO-2026-101",
    supplier: "CIC Holdings PLC",
    orderDate: "11 Nov 2026",
    expectedDate: "18 Nov 2026",
    items: "Digital Blood Pressure Monitors, Glucose Test Strips",
    amount: 215000,
    status: "Pending Approval",
  },
];

export function SuppliersView() {
  const [activeTab, setActiveTab] = useState<"suppliers" | "orders">("suppliers");
  const [search, setSearch] = useState("");

  const filteredSuppliers = SUPPLIERS_LIST.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.contact.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = PURCHASE_ORDERS.filter(
    (p) =>
      p.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier.toLowerCase().includes(search.toLowerCase()) ||
      p.items.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500">Back Office / Suppliers</div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Suppliers &amp; Procurement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage pharmaceutical vendors, distributors and incoming purchase orders.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Active suppliers</div>
          <div className="text-xl font-bold text-slate-900 mt-1">18</div>
          <div className="text-[11px] text-slate-400 mt-1">All verified vendors</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Open Purchase Orders</div>
          <div className="text-xl font-bold text-blue-600 mt-1">05</div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting dispatch/delivery</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">In-transit batches</div>
          <div className="text-xl font-bold text-amber-600 mt-1">02</div>
          <div className="text-[11px] text-slate-400 mt-1">Expected this week</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Monthly spend</div>
          <div className="text-xl font-bold text-slate-900 mt-1">LKR 520,400</div>
          <div className="text-[11px] text-slate-400 mt-1">November procurement</div>
        </div>
      </div>

      {/* Tab Switcher & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("suppliers")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "suppliers"
                ? "bg-[#072f68] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Registered Suppliers ({SUPPLIERS_LIST.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "orders"
                ? "bg-[#072f68] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Purchase Orders ({PURCHASE_ORDERS.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder={activeTab === "suppliers" ? "Search suppliers..." : "Search orders..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-3 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:border-[#072f68] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {activeTab === "suppliers" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#f0f4f9] text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Product Category</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{sup.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{sup.category}</td>
                    <td className="py-3.5 px-4 text-slate-800">{sup.contact}</td>
                    <td className="py-3.5 px-4 text-slate-500">{sup.phone}</td>
                    <td className="py-3.5 px-4 text-slate-500">{sup.email}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{sup.ordersCount}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium">
                        {sup.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#f0f4f9] text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Expected</th>
                  <th className="py-3 px-4">Amount (LKR)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((po) => (
                  <tr key={po.poNumber} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{po.poNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{po.supplier}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="max-w-[220px] truncate">{po.items}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{po.orderDate}</td>
                    <td className="py-3.5 px-4 text-slate-500">{po.expectedDate}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {po.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          po.status === "Delivered"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : po.status === "In Transit"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

