"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { branchName } from "@/data/branches";

interface SalesBar {
  day: string;
  amount: number;
  isToday?: boolean;
}

const SALES_DATA: SalesBar[] = [
  { day: "Fri, 6", amount: 85000 },
  { day: "Sat, 7", amount: 105000 },
  { day: "Sun, 8", amount: 72000 },
  { day: "Mon, 9", amount: 102000 },
  { day: "Tue, 10", amount: 120000 },
  { day: "Wed, 11", amount: 116000 },
  { day: "Thu, 12", amount: 132000, isToday: true },
];

const BRANCH_PERFORMANCE = [
  { name: "Piliyandala", amount: 58250, percentage: 85 },
  { name: "Kesbewa", amount: 32400, percentage: 55 },
  { name: "Maharagama", amount: 23800, percentage: 40 },
  { name: "Boralesgamuwa", amount: 14000, percentage: 24 },
];

const RECENT_ORDERS = [
  {
    id: "#MZ1048",
    customer: "Nimal Perera",
    branch: "Piliyandala",
    amount: "4,850",
    status: "Completed",
    time: "10:42 AM",
    tone: "success",
  },
  {
    id: "#MZ1047",
    customer: "Nadeesha Silva",
    branch: "Kesbewa",
    amount: "2,360",
    status: "Processing",
    time: "10:38 AM",
    tone: "info",
  },
  {
    id: "#MZ1046",
    customer: "Amal Fernando",
    branch: "Piliyandala",
    amount: "1,750",
    status: "Pending",
    time: "10:31 AM",
    tone: "warning",
  },
  {
    id: "#MZ1045",
    customer: "Dilani Jayasinghe",
    branch: "Maharagama",
    amount: "6,420",
    status: "Completed",
    time: "10:25 AM",
    tone: "success",
  },
];

const INVENTORY_ALERTS = [
  {
    name: "Paracetamol 500 mg",
    detail: "Piliyandala · 8 packs remaining",
    badge: "Low stock",
    tone: "warning",
  },
  {
    name: "Amoxicillin 250 mg",
    detail: "Kesbewa · 0 packs remaining",
    badge: "Out of stock",
    tone: "danger",
  },
  {
    name: "Cetirizine 10 mg",
    detail: "Maharagama · Expires 30 Nov 2026",
    badge: "Expiring soon",
    tone: "orange",
  },
];

export function AdminDashboard() {
  const { user, activeBranchId } = useAuth();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const activeBranchDisplay =
    activeBranchId === "all" || !activeBranchId
      ? "all branches"
      : branchName(activeBranchId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500">
            Dashboard / Overview
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, {user?.name?.replace(/^Mr\.\s*/, "") || "Yohan"}. Here&apos;s your pharmacy at a glance.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm flex items-center gap-1.5">
            <span>Today · 12 Nov 2026</span>
          </div>
          <Link
            href="/reports"
            className="rounded-lg bg-[#072f68] hover:bg-[#05214b] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-150"
          >
            View reports
          </Link>
        </div>
      </div>

      {/* Row 1: KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Today&apos;s sales</div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            LKR 128,450
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-600">
            +12.8% vs yesterday
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total orders</div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            48
          </div>
          <div className="mt-2 text-xs text-slate-500">
            36 in-store · 12 online
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Pending prescriptions</div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            08
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Awaiting pharmacist review
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Low-stock items</div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            12
          </div>
          <div className="mt-2 text-xs text-slate-500">
            4 items need urgent restocking
          </div>
        </div>
      </div>

      {/* Row 2: Sales overview chart + Branch performance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Sales Overview Bar Chart */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-start justify-between pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sales overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily revenue across {activeBranchDisplay} · LKR
              </p>
            </div>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
              Last 7 days
            </span>
          </div>

          {/* Bar Chart Area */}
          <div className="relative pt-6">
            {/* Y Axis Guide Lines */}
            <div className="space-y-7 text-[11px] text-slate-400 pr-2">
              <div className="flex items-center gap-3">
                <span className="w-7 text-right">150k</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 text-right">100k</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 text-right">50k</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 text-right">0</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </div>

            {/* Bars */}
            <div className="absolute inset-x-0 bottom-7 pl-12 pr-4 flex items-end justify-between h-36">
              {SALES_DATA.map((item, idx) => {
                const heightPercent = Math.min(100, Math.round((item.amount / 150000) * 100));
                const isHovered = hoveredBar === idx;

                return (
                  <div
                    key={item.day}
                    className="flex flex-col items-center flex-1 group cursor-pointer relative"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-8 z-20 rounded bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md whitespace-nowrap">
                        LKR {item.amount.toLocaleString()}
                      </div>
                    )}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-7 sm:w-10 rounded-t-sm transition-all duration-200 ${
                        item.isToday
                          ? "bg-[#072f68] hover:bg-[#05214b]"
                          : "bg-[#a8c5e6] hover:bg-[#8eb2dc]"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X Axis Labels */}
            <div className="pl-12 pr-4 flex justify-between pt-2">
              {SALES_DATA.map((item) => (
                <div
                  key={item.day}
                  className={`flex-1 text-center text-xs ${
                    item.isToday ? "font-bold text-slate-900" : "font-normal text-slate-500"
                  }`}
                >
                  {item.day}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Branch Performance */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Branch performance</h2>
            <p className="text-xs text-slate-500 mt-0.5">Today&apos;s sales · All branches</p>

            <div className="mt-6 space-y-5">
              {BRANCH_PERFORMANCE.map((branch) => (
                <div key={branch.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{branch.name}</span>
                    <span className="font-bold text-slate-900">
                      LKR {branch.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      style={{ width: `${branch.percentage}%` }}
                      className="h-full rounded-full bg-[#072f68] transition-all duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Orders Table + Inventory Alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent orders</h2>
                <p className="text-xs text-slate-500 mt-0.5">Latest orders across all branches</p>
              </div>
              <Link
                href="/orders"
                className="text-xs font-semibold text-slate-700 hover:text-[#072f68] hover:underline"
              >
                View all orders
              </Link>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f0f4f9] text-slate-600 font-semibold rounded-lg">
                    <th className="py-2.5 px-3 rounded-l-md">Order ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 rounded-r-md">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RECENT_ORDERS.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-900">{order.id}</td>
                      <td className="py-3 px-3 text-slate-800">{order.customer}</td>
                      <td className="py-3 px-3 text-slate-500">{order.branch}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{order.amount}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            order.tone === "success"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : order.tone === "info"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
            <span>All amounts in LKR</span>
            <span>Updated just now</span>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Inventory alerts</h2>
                <span className="rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[11px] font-bold text-amber-700">
                  12
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 -mt-2">Items that need your attention</p>

            <div className="mt-4 space-y-4">
              {INVENTORY_ALERTS.map((alert) => (
                <div
                  key={alert.name}
                  className="flex items-center justify-between gap-2 border-b border-slate-50 pb-3 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {alert.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {alert.detail}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-medium ${
                      alert.tone === "danger"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : alert.tone === "orange"
                        ? "bg-orange-50 text-orange-700 border border-orange-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {alert.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/inventory"
            className="mt-6 flex h-9 w-full items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            View inventory
          </Link>
        </div>
      </div>
    </div>
  );
}

