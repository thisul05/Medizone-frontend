"use client";

import { useState, useMemo } from "react";
import { Icon } from "@/components/shared/Icon";
import { branches, branchName } from "@/data/branches";
import { useAuth } from "@/lib/auth";

interface OrderRecord {
  id: string;
  customer: string;
  phone: string;
  branchId: string;
  branchName: string;
  items: string[];
  total: number;
  status: "Completed" | "Processing" | "Pending" | "Ready for pickup";
  type: "In-Store" | "Online Prescription";
  time: string;
  date: string;
}

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: "#MZ1048",
    customer: "Nimal Perera",
    phone: "077 123 4567",
    branchId: "b1",
    branchName: "Piliyandala",
    items: ["Paracetamol 500mg (2 strips)", "Vitamin C 500mg (1 bottle)"],
    total: 4850,
    status: "Completed",
    type: "In-Store",
    time: "10:42 AM",
    date: "12 Nov 2026",
  },
  {
    id: "#MZ1047",
    customer: "Nadeesha Silva",
    phone: "071 987 6543",
    branchId: "b2",
    branchName: "Kesbewa",
    items: ["Amoxicillin 500mg (1 strip)", "Cetirizine 10mg (1 strip)"],
    total: 2360,
    status: "Processing",
    type: "Online Prescription",
    time: "10:38 AM",
    date: "12 Nov 2026",
  },
  {
    id: "#MZ1046",
    customer: "Amal Fernando",
    phone: "076 555 4321",
    branchId: "b1",
    branchName: "Piliyandala",
    items: ["Metformin 500mg (3 strips)", "Losartan 50mg (2 strips)"],
    total: 1750,
    status: "Pending",
    type: "In-Store",
    time: "10:31 AM",
    date: "12 Nov 2026",
  },
  {
    id: "#MZ1045",
    customer: "Dilani Jayasinghe",
    phone: "078 222 3344",
    branchId: "b3",
    branchName: "Maharagama",
    items: ["Omeprazole 20mg (2 strips)", "Gaviscon Liquid 200ml (1 bottle)"],
    total: 6420,
    status: "Completed",
    type: "Online Prescription",
    time: "10:25 AM",
    date: "12 Nov 2026",
  },
  {
    id: "#MZ1044",
    customer: "Kamal Wickramasinghe",
    phone: "070 333 8899",
    branchId: "b4",
    branchName: "Boralesgamuwa",
    items: ["Atorvastatin 20mg (3 strips)"],
    total: 3100,
    status: "Ready for pickup",
    type: "In-Store",
    time: "09:50 AM",
    date: "12 Nov 2026",
  },
  {
    id: "#MZ1043",
    customer: "Priyani Senaratne",
    phone: "075 666 1122",
    branchId: "b1",
    branchName: "Piliyandala",
    items: ["Digital Thermometer (1 unit)", "Surgical Face Masks (box of 50)"],
    total: 3850,
    status: "Completed",
    type: "In-Store",
    time: "09:15 AM",
    date: "12 Nov 2026",
  },
];

export function OrdersView() {
  const { activeBranchId } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredOrders = useMemo(() => {
    return INITIAL_ORDERS.filter((order) => {
      // Branch filter
      if (activeBranchId && activeBranchId !== "all" && order.branchId !== activeBranchId) {
        return false;
      }
      // Status filter
      if (statusFilter !== "All" && order.status !== statusFilter) {
        return false;
      }
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          order.id.toLowerCase().includes(q) ||
          order.customer.toLowerCase().includes(q) ||
          order.phone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, statusFilter, activeBranchId]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1">Pharmacy / Orders</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Prescriptions &amp; Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage counter orders and customer prescription dispensations across all branches.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total orders today</div>
          <div className="text-xl font-bold text-slate-900 mt-1">48</div>
          <div className="text-[11px] text-slate-400 mt-1">Across active branches</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Awaiting review</div>
          <div className="text-xl font-bold text-amber-600 mt-1">08</div>
          <div className="text-[11px] text-slate-400 mt-1">Pharmacist verification needed</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Processing</div>
          <div className="text-xl font-bold text-blue-600 mt-1">14</div>
          <div className="text-[11px] text-slate-400 mt-1">Dispensing in progress</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Completed</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">26</div>
          <div className="text-[11px] text-slate-400 mt-1">Collected / Dispatched</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by order ID, customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-3 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:border-[#072f68] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Status:</span>
          {["All", "Completed", "Processing", "Pending", "Ready for pickup"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === st
                  ? "bg-[#072f68] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f0f4f9] text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total (LKR)</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{o.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{o.customer}</div>
                      <div className="text-[11px] text-slate-400">{o.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{o.branchName}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="max-w-[200px] truncate">{o.items.join(", ")}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {o.total.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {o.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          o.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : o.status === "Processing"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : o.status === "Ready for pickup"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{o.time}</td>
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

