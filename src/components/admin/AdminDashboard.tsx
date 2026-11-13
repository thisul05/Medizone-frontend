"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/delivery/Sidebar";
import { Icon } from "@/components/shared/Icon";
import { useAuth } from "@/lib/auth";

export function AdminDashboard() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sales 7-day revenue data
  const salesDays = [
    { day: "Fri, 6", amount: "82,400", heightPercent: 55, isToday: false },
    { day: "Sat, 7", amount: "105,200", heightPercent: 70, isToday: false },
    { day: "Sun, 8", amount: "72,150", heightPercent: 48, isToday: false },
    { day: "Mon, 9", amount: "98,300", heightPercent: 65, isToday: false },
    { day: "Tue, 10", amount: "118,600", heightPercent: 79, isToday: false },
    { day: "Wed, 11", amount: "114,200", heightPercent: 76, isToday: false },
    { day: "Thu, 12", amount: "128,450", heightPercent: 86, isToday: true },
  ];

  // Branch performance data
  const branchPerformance = [
    { name: "Piliyandala", sales: "LKR 58,250", progressPercent: 85 },
    { name: "Kesbewa", sales: "LKR 32,400", progressPercent: 50 },
    { name: "Maharagama", sales: "LKR 23,800", progressPercent: 37 },
    { name: "Boralesgamuwa", sales: "LKR 14,000", progressPercent: 22 },
  ];

  // Recent orders data
  const recentOrders = [
    {
      id: "#MZ1048",
      customer: "Nimal Perera",
      branch: "Piliyandala",
      amount: "4,850",
      status: "Completed",
      statusTone: "green",
      time: "10:42 AM",
    },
    {
      id: "#MZ1047",
      customer: "Nadeesha Silva",
      branch: "Kesbewa",
      amount: "2,360",
      status: "Processing",
      statusTone: "blue",
      time: "10:38 AM",
    },
    {
      id: "#MZ1046",
      customer: "Amal Fernando",
      branch: "Piliyandala",
      amount: "1,750",
      status: "Pending",
      statusTone: "amber",
      time: "10:31 AM",
    },
    {
      id: "#MZ1045",
      customer: "Dilani Jayasinghe",
      branch: "Maharagama",
      amount: "6,420",
      status: "Completed",
      statusTone: "green",
      time: "10:25 AM",
    },
  ];

  // Inventory priority alerts
  const inventoryAlerts = [
    {
      name: "Paracetamol 500 mg",
      detail: "Piliyandala · 8 packs remaining",
      badge: "Low stock",
      tone: "amber",
    },
    {
      name: "Amoxicillin 250 mg",
      detail: "Kesbewa · 0 packs remaining",
      badge: "Out of stock",
      tone: "red",
    },
    {
      name: "Cetirizine 10 mg",
      detail: "Maharagama · Expires 30 Nov 2026",
      badge: "Expiring soon",
      tone: "orange",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-[#0e1b2e]">
      {/* Desktop Permanent Sidebar */}
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
          <span className="text-xs text-white/80 font-medium">Dashboard</span>
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

        <main id="main" className="flex-1 p-5 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1400px] space-y-6">
            {/* Header: Breadcrumb & Title Row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Dashboard <span className="text-gray-400 mx-1">/</span> Overview
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-[#0e1b2e]">
                  Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-[#46566d] mt-0.5">
                  Welcome back, {user?.name?.split(" ")[1] || user?.name || "Yohan"}. Here&apos;s your pharmacy at a glance.
                </p>
              </div>

              {/* Action Pill & Button */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-xs">
                  <span>Today</span>
                  <span className="text-gray-300">·</span>
                  <span className="font-semibold text-gray-900">12 Nov 2026</span>
                </div>
                <Link
                  href="/reports"
                  className="rounded-lg bg-[#072f68] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#052350]"
                >
                  View reports
                </Link>
              </div>
            </div>

            {/* 4 Key Metric Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Metric 1 */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs">
                <p className="text-xs font-semibold tracking-wider text-[#46566d] uppercase">Today&apos;s sales</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1b2e] tabular-nums">
                  LKR 128,450
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-600">
                  +12.8% vs yesterday
                </p>
              </div>

              {/* Metric 2 */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs">
                <p className="text-xs font-semibold tracking-wider text-[#46566d] uppercase">Total orders</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1b2e] tabular-nums">
                  48
                </p>
                <p className="mt-1 text-xs text-[#46566d]">
                  <span className="font-semibold text-gray-800">36</span> in-store · <span className="font-semibold text-gray-800">12</span> online
                </p>
              </div>

              {/* Metric 3 */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs">
                <p className="text-xs font-semibold tracking-wider text-[#46566d] uppercase">Pending prescriptions</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1b2e] tabular-nums">
                  08
                </p>
                <p className="mt-1 text-xs text-[#46566d]">
                  Awaiting pharmacist review
                </p>
              </div>

              {/* Metric 4 */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs">
                <p className="text-xs font-semibold tracking-wider text-[#46566d] uppercase">Low-stock items</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1b2e] tabular-nums">
                  12
                </p>
                <p className="mt-1 text-xs font-semibold text-amber-700">
                  4 items need urgent restocking
                </p>
              </div>
            </div>

            {/* Middle Row: Sales Overview & Branch Performance */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Sales Overview Bar Chart (2/3 width) */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs lg:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#0e1b2e]">Sales overview</h2>
                    <p className="mt-0.5 text-xs text-[#46566d]">
                      Daily revenue across all branches · LKR
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-2xs">
                    Last 7 days
                  </div>
                </div>

                {/* Chart Area */}
                <div className="mt-8 flex h-60 gap-4">
                  {/* Y-axis Labels */}
                  <div className="flex flex-col justify-between text-right text-[11px] font-medium text-gray-400 pr-2 shrink-0 select-none pb-6">
                    <span>150k</span>
                    <span>100k</span>
                    <span>50k</span>
                    <span>0</span>
                  </div>

                  {/* Bars Container */}
                  <div className="relative flex flex-1 items-end justify-between border-b border-gray-100 pb-2">
                    {/* Horizontal Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2">
                      <div className="w-full border-b border-gray-100" />
                      <div className="w-full border-b border-gray-100" />
                      <div className="w-full border-b border-gray-100" />
                      <div className="w-full border-b border-gray-200" />
                    </div>

                    {salesDays.map((bar) => (
                      <div
                        key={bar.day}
                        className="relative z-10 flex flex-1 flex-col items-center h-full justify-end px-1 sm:px-2 group"
                      >
                        {/* Hover Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#072f68] text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap shadow-xs">
                          LKR {bar.amount}
                        </div>

                        {/* Bar */}
                        <div
                          className={`w-full max-w-[48px] rounded-t-sm transition-all duration-300 ${
                            bar.isToday
                              ? "bg-[#072f68]"
                              : "bg-[#a4c2e6] hover:bg-[#8faecf]"
                          }`}
                          style={{ height: `${bar.heightPercent}%` }}
                        />

                        {/* X-axis Label */}
                        <span
                          className={`mt-2 text-[11px] ${
                            bar.isToday
                              ? "font-bold text-[#0e1b2e]"
                              : "font-medium text-gray-500"
                          }`}
                        >
                          {bar.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Branch Performance Breakdown (1/3 width) */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0e1b2e]">
                    Branch performance
                  </h2>
                  <p className="mt-0.5 text-xs text-[#46566d]">
                    Today&apos;s sales · All branches
                  </p>

                  <div className="mt-6 space-y-5">
                    {branchPerformance.map((branch) => (
                      <div key={branch.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-900">
                            {branch.name}
                          </span>
                          <span className="font-bold text-gray-900">
                            {branch.sales}
                          </span>
                        </div>
                        {/* Progress Bar Track */}
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-[#072f68]"
                            style={{ width: `${branch.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Recent Orders & Inventory Alerts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Recent Orders Table (2/3 width) */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs lg:col-span-2">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h2 className="text-base font-bold text-[#0e1b2e]">Recent orders</h2>
                    <p className="mt-0.5 text-xs text-[#46566d]">
                      Latest orders across all branches
                    </p>
                  </div>
                  <Link
                    href="/orders"
                    className="text-xs font-semibold text-[#072f68] hover:underline"
                  >
                    View all orders
                  </Link>
                </div>

                {/* Orders Table */}
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-y border-gray-100 bg-[#f0f4f9]/60 text-[11px] font-semibold tracking-wider text-gray-600 uppercase">
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Branch</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-3 font-semibold text-gray-900">
                            {order.id}
                          </td>
                          <td className="py-3 px-3 text-gray-800 font-medium">
                            {order.customer}
                          </td>
                          <td className="py-3 px-3 text-gray-600">
                            {order.branch}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-gray-900">
                            {order.amount}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                order.statusTone === "green"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                  : order.statusTone === "blue"
                                  ? "bg-sky-50 text-sky-700 border border-sky-200/60"
                                  : "bg-amber-50 text-amber-700 border border-amber-200/60"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                  order.statusTone === "green"
                                    ? "bg-emerald-500"
                                    : order.statusTone === "blue"
                                    ? "bg-sky-500"
                                    : "bg-amber-500"
                                }`}
                              />
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-gray-500 font-medium">
                            {order.time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer notes */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-400">
                  <span>All amounts in LKR</span>
                  <span>Updated just now</span>
                </div>
              </div>

              {/* Inventory Alerts (1/3 width) */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#0e1b2e]">
                        Inventory alerts
                      </h2>
                      <p className="mt-0.5 text-xs text-[#46566d]">
                        Items that need your attention
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-xs font-bold text-amber-800">
                      12
                    </span>
                  </div>

                  {/* Alert List */}
                  <div className="mt-4 divide-y divide-gray-100">
                    {inventoryAlerts.map((item) => (
                      <div key={item.name} className="py-3.5 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-gray-500">
                            {item.detail}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${
                            item.tone === "red"
                              ? "bg-red-50 text-red-700 border border-red-200/60"
                              : item.tone === "orange"
                              ? "bg-orange-50 text-orange-700 border border-orange-200/60"
                              : "bg-amber-50 text-amber-700 border border-amber-200/60"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                              item.tone === "red"
                                ? "bg-red-500"
                                : item.tone === "orange"
                                ? "bg-orange-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {item.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* View Inventory Button */}
                <div className="mt-6 pt-2">
                  <Link
                    href="/inventory"
                    className="flex w-full items-center justify-center rounded-lg bg-[#f0f4f9] py-2.5 text-xs font-semibold text-[#072f68] transition-colors hover:bg-[#e2eaf5]"
                  >
                    View inventory
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

