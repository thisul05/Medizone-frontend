"use client";

import { useState } from "react";
import { demoAccounts } from "@/data/auth";
import { branchName } from "@/data/branches";
import StatusBadge from "@/components/shared/StatusBadge";
import type { BranchId } from "@/types/roles";

interface StaffPayrollRecord {
  id: string;
  name: string;
  jobTitle: string;
  branch: string;
  staffId: string;
  email: string;
  attendance: "present" | "absent" | "partial";
  basicSalary: number;
  allowance: number;
  status: "Paid" | "Pending Approval";
}

const STAFF_PAYROLL: StaffPayrollRecord[] = demoAccounts
  .filter((acc) => acc.role !== "customer")
  .map((acc, idx) => ({
    id: acc.id,
    name: acc.name,
    jobTitle: acc.jobTitle,
    branch: acc.branchId === "all" ? "All branches" : branchName(acc.branchId as BranchId),
    staffId: acc.staffId || `MZ-0${idx + 1}`,
    email: acc.email || "staff@medizone.lk",
    attendance: idx === 1 ? "partial" : idx === 3 ? "absent" : "present",
    basicSalary: acc.role === "owner" ? 180000 : acc.role === "senior_pharmacist" ? 95000 : 65000,
    allowance: acc.role === "owner" ? 25000 : 12000,
    status: "Paid",
  }));

export function StaffView() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"directory" | "payroll">("directory");

  const filteredStaff = STAFF_PAYROLL.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      s.staffId.toLowerCase().includes(search.toLowerCase()) ||
      s.branch.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1">Back Office / Staff &amp; payroll</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Staff &amp; Payroll Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage pharmacy personnel, daily attendance tracking and monthly payroll disbursements.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total staff members</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{STAFF_PAYROLL.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all 5 branches</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Present today</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {STAFF_PAYROLL.filter((s) => s.attendance === "present").length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">On active shifts</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">On leave / Absent</div>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {STAFF_PAYROLL.filter((s) => s.attendance !== "present").length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cover arranged</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Monthly payroll total</div>
          <div className="text-xl font-bold text-slate-900 mt-1">LKR 945,000</div>
          <div className="text-[11px] text-slate-400 mt-1">Disbursed for November</div>
        </div>
      </div>

      {/* Tab Switcher & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("directory")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "directory"
                ? "bg-[#072f68] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Staff Directory ({STAFF_PAYROLL.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payroll")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "payroll"
                ? "bg-[#072f68] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Payroll Summary
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search staff by name, ID or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-3 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:border-[#072f68] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {activeTab === "directory" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#f0f4f9] text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Role / Title</th>
                  <th className="py-3 px-4">Assigned Branch</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Today&apos;s Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{s.staffId}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{s.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.jobTitle}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.branch}</td>
                    <td className="py-3.5 px-4 text-slate-500">{s.email}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge kind="attendance" status={s.attendance} />
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
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Basic Salary (LKR)</th>
                  <th className="py-3 px-4">Allowances (LKR)</th>
                  <th className="py-3 px-4">Net Payout (LKR)</th>
                  <th className="py-3 px-4">Disbursement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{s.staffId}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{s.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.jobTitle}</td>
                    <td className="py-3.5 px-4 text-slate-700">{s.basicSalary.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-slate-700">{s.allowance.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {(s.basicSalary + s.allowance).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium">
                        {s.status}
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
