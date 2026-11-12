"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import AppSidebar from "@/components/shared/AppSidebar";
import { Button, ButtonLink } from "@/components/shared/Button";
import { Select } from "@/components/shared/Select";
import { Icon } from "@/components/shared/Icon";
import { useStaff } from "@/components/staff/StaffContext";
import { daysPresent, grossPay, WORKING_DAYS } from "@/data/staff";
import { branchName } from "@/data/branches";
import { formatLKR, formatDate, formatPhone, formatMonth } from "@/lib/format";
import { useState } from "react";

export default function MonthlyPayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-11");
  const { staff } = useStaff();

  const payrollData = useMemo(() => {
    return staff.map((s) => {
      const present = daysPresent(s.id, selectedMonth);
      const gross = grossPay(s.dailyRate, present);
      return { ...s, daysPresent: present, grossPay: gross };
    });
  }, [selectedMonth]);

  const totalPayroll = payrollData.reduce((sum, s) => sum + s.grossPay, 0);
  const headcount = payrollData.length;
  const avgGross = headcount > 0 ? totalPayroll / headcount : 0;

  const slipData = useMemo(() => {
    return staff.map((s) => {
      const present = daysPresent(s.id, selectedMonth);
      const absent = WORKING_DAYS - present;
      const basicSalary = s.dailyRate * present;
      const deductions = s.dailyRate * absent;
      const netPay = basicSalary - deductions;
      return { ...s, present, absent, basicSalary, deductions, netPay };
    });
  }, [selectedMonth]);

  return (
    <div className="flex min-h-screen">
      <div className="mz-no-print">
        <AppSidebar />
      </div>

      <div className="mz-no-print min-w-0 flex-1 overflow-auto bg-surface-page">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="mz-h1 text-ink">Monthly payroll</h1>
            <div className="flex items-center gap-3">
              <Select
                label="Month"
                labelHidden
                size="md"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={[
                  { value: "2026-11", label: "Nov 2026" },
                  { value: "2026-10", label: "Oct 2026" },
                  { value: "2026-09", label: "Sep 2026" },
                ]}
                className="w-40"
              />
              <ButtonLink href="/staff/salary-rates" variant="secondary" size="md">
                Salary rates
              </ButtonLink>
              <ButtonLink href="#" variant="secondary" size="md" icon="download">
                Export
              </ButtonLink>
              <Button variant="primary" size="md" icon="printer" onClick={() => window.print()}>
                Print payslips
              </Button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-surface-raised p-5 shadow-1">
              <p className="mz-overline text-ink-muted mb-2">Total payroll</p>
              <p className="mz-kpi text-ink">{formatLKR(totalPayroll)}</p>
            </div>
            <div className="rounded-lg border border-line bg-surface-raised p-5 shadow-1">
              <p className="mz-overline text-ink-muted mb-2">Headcount</p>
              <p className="mz-kpi text-ink">{headcount}</p>
            </div>
            <div className="rounded-lg border border-line bg-surface-raised p-5 shadow-1">
              <p className="mz-overline text-ink-muted mb-2">Avg gross pay</p>
              <p className="mz-kpi text-ink">{formatLKR(avgGross)}</p>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface-raised shadow-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-surface-sunken">
                  <th className="px-4 py-3 mz-label text-ink-muted">Staff ID</th>
                  <th className="px-4 py-3 mz-label text-ink-muted">Name</th>
                  <th className="px-4 py-3 mz-label text-ink-muted">Role</th>
                  <th className="px-4 py-3 mz-label text-ink-muted">Branch</th>
                  <th className="px-4 py-3 mz-label text-ink-muted text-right">Days Present</th>
                  <th className="px-4 py-3 mz-label text-ink-muted text-right">Daily Rate</th>
                  <th className="px-4 py-3 mz-label text-ink-muted text-right">Gross Pay</th>
                  <th className="px-4 py-3 mz-label text-ink-muted text-center">Payslip</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-b-0 hover:bg-surface-hover transition-colors duration-150">
                    <td className="px-4 py-3 mz-code text-ink">{s.id}</td>
                    <td className="px-4 py-3 text-ink font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-ink">{s.role}</td>
                    <td className="px-4 py-3 text-ink">{branchName(s.branch)}</td>
                    <td className="px-4 py-3 text-right mz-num text-ink">{s.daysPresent}</td>
                    <td className="px-4 py-3 text-right mz-num text-ink">{formatLKR(s.dailyRate)}</td>
                    <td className="px-4 py-3 text-right mz-num text-ink font-semibold">{formatLKR(s.grossPay)}</td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/staff/payslip/${s.id}?month=${selectedMonth}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-surface-hover hover:text-ink"
                        aria-label={`View payslip for ${s.name}`}
                      >
                        <Icon name="printer" size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-sunken">
                  <td colSpan={4} className="px-4 py-3 mz-body-sm text-ink-muted">
                    Nov 2026 · {WORKING_DAYS} working days
                  </td>
                  <td colSpan={4} className="px-4 py-3 text-right mz-label text-ink mz-num">
                    {formatLKR(totalPayroll)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Payslips: hidden on screen, one per page when printed */}
      <div className="mz-payslips-print">
        {slipData.map((s, idx) => (
          <div key={s.id} className="mz-print" style={{ breakAfter: idx < slipData.length - 1 ? "page" : "auto" }}>
            <div className="mx-auto max-w-2xl bg-white p-8">
              <div className="flex items-start justify-between border-b-2 border-logo-navy pb-4">
                <div className="flex items-center gap-3">
                  <Image src="/brand/medizone-logo.png" alt="Medizone" width={140} height={30} className="h-auto" style={{ width: 140, height: 30 }} />
                  <div>
                    <p className="mz-h3 text-ink">Medizone Pharmacy</p>
                    <p className="mz-body-sm text-ink-muted">{branchName(s.branch)} branch</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="mz-h2 text-ink">PAYSLIP</p>
                  <p className="mz-body-sm text-ink-muted">{formatMonth(selectedMonth)}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 border-b border-line pb-5">
                <div className="flex gap-4">
                  <span className="mz-overline text-ink-muted w-20">Name</span>
                  <span className="mz-label text-ink">{s.name}</span>
                </div>
                <div className="flex gap-4">
                  <span className="mz-overline text-ink-muted w-24">Staff ID</span>
                  <span className="mz-code text-ink">{s.id}</span>
                </div>
                <div className="flex gap-4">
                  <span className="mz-overline text-ink-muted w-20">NIC</span>
                  <span className="text-ink">{s.nic}</span>
                </div>
                <div className="flex gap-4">
                  <span className="mz-overline text-ink-muted w-24">Joined date</span>
                  <span className="mz-label text-ink">{formatDate(s.joinedDate)}</span>
                </div>
                <div className="flex gap-4">
                  <span className="mz-overline text-ink-muted w-20">Role</span>
                  <span className="mz-label text-ink">{s.role}</span>
                </div>
                <div className="flex gap-4">
                  <span className="mz-overline text-ink-muted w-24">Mobile</span>
                  <span className="text-ink">{formatPhone(s.mobile)}</span>
                </div>
                <div className="flex gap-4">
                  <span className="mz-overline text-ink-muted w-20">Branch</span>
                  <span className="mz-label text-ink">{branchName(s.branch)}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 text-center">
                <div>
                  <span className="mz-body-sm text-ink-muted">Days in month: </span>
                  <span className="mz-label text-ink">{WORKING_DAYS}</span>
                </div>
                <span className="text-ink-muted">·</span>
                <div>
                  <span className="mz-body-sm text-ink-muted">Days present: </span>
                  <span className="mz-label text-ink">{s.present}</span>
                </div>
                <span className="text-ink-muted">·</span>
                <div>
                  <span className="mz-body-sm text-ink-muted">Days absent: </span>
                  <span className="mz-label text-ink">{s.absent}</span>
                </div>
              </div>

              <table className="mt-5 w-full border border-line text-left">
                <thead>
                  <tr className="border-b border-line bg-gray-100">
                    <th className="px-4 py-3 mz-label text-ink">Description</th>
                    <th className="px-4 py-3 mz-label text-ink text-right">Days</th>
                    <th className="px-4 py-3 mz-label text-ink text-right">Rate</th>
                    <th className="px-4 py-3 mz-label text-ink text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-line">
                    <td className="px-4 py-3 text-ink">Basic salary</td>
                    <td className="px-4 py-3 text-right mz-num text-ink">{s.present}</td>
                    <td className="px-4 py-3 text-right mz-num text-ink">{formatLKR(s.dailyRate)}</td>
                    <td className="px-4 py-3 text-right mz-num text-ink">{formatLKR(s.basicSalary)}</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="px-4 py-3 text-ink">Deductions (absent days)</td>
                    <td className="px-4 py-3 text-right mz-num text-ink">{s.absent}</td>
                    <td className="px-4 py-3 text-right mz-num text-ink">{formatLKR(s.dailyRate)}</td>
                    <td className="px-4 py-3 text-right mz-num text-ink">− {formatLKR(s.deductions)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td className="px-4 py-3 mz-label text-ink" colSpan={3}>Net Pay</td>
                    <td className="px-4 py-3 text-right mz-price text-ink">{formatLKR(s.netPay)}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-6 flex items-center justify-between border-t-2 border-logo-navy pt-4">
                <p className="mz-body-sm text-ink-muted">Generated on {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                <p className="mz-body-sm text-ink-muted">Medizone Pharmacy — {branchName(s.branch)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
