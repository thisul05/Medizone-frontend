"use client";

import { useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/shared/Button";
import { useStaff } from "@/components/staff/StaffContext";
import { daysPresent, WORKING_DAYS } from "@/data/staff";
import { branchName } from "@/data/branches";
import { formatLKR, formatDate, formatPhone, formatMonth } from "@/lib/format";

export default function PayslipPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getStaff } = useStaff();
  const staffId = params.id as string;
  const month = searchParams.get("month") ?? "2026-11";

  const member = getStaff(staffId);

  const data = useMemo(() => {
    if (!member) return null;
    const present = daysPresent(member.id, month);
    const absent = WORKING_DAYS - present;
    const basicSalary = member.dailyRate * present;
    const deductions = member.dailyRate * absent;
    const netPay = basicSalary - deductions;
    return { present, absent, basicSalary, deductions, netPay };
  }, [member, month]);

  if (!member || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-page">
        <p className="text-ink-muted">Staff member not found.</p>
      </div>
    );
  }

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-surface-page">
      <div className="mz-no-print flex items-center justify-between px-6 py-4">
        <Button variant="secondary" icon="arrow-left" onClick={() => router.push("/staff/payroll")}>
          Back
        </Button>
        <Button variant="primary" icon="printer" onClick={handlePrint}>
          Print payslip
        </Button>
      </div>

      <div className="mz-print mx-auto max-w-2xl rounded-lg border border-line bg-white p-8 shadow-1 print:border-0 print:shadow-none print:rounded-none">
        <div className="flex items-start justify-between border-b-2 border-logo-navy pb-4">
          <div className="flex items-center gap-3">
            <Image src="/brand/medizone-logo.png" alt="Medizone" width={140} height={30} className="h-auto" style={{ width: 140, height: 30 }} />
            <div>
              <p className="mz-h3 text-ink">Medizone Pharmacy</p>
              <p className="mz-body-sm text-ink-muted">{branchName(member.branch)} branch</p>
            </div>
          </div>
          <div className="text-right">
            <p className="mz-h2 text-ink">PAYSLIP</p>
            <p className="mz-body-sm text-ink-muted">{formatMonth(month)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 border-b border-line pb-5">
          <div className="flex gap-4">
            <span className="mz-overline text-ink-muted w-20">Name</span>
            <span className="mz-label text-ink">{member.name}</span>
          </div>
          <div className="flex gap-4">
            <span className="mz-overline text-ink-muted w-24">Staff ID</span>
            <span className="mz-code text-ink">{member.id}</span>
          </div>
          <div className="flex gap-4">
            <span className="mz-overline text-ink-muted w-20">NIC</span>
            <span className="text-ink">{member.nic}</span>
          </div>
          <div className="flex gap-4">
            <span className="mz-overline text-ink-muted w-24">Joined date</span>
            <span className="mz-label text-ink">{formatDate(member.joinedDate)}</span>
          </div>
          <div className="flex gap-4">
            <span className="mz-overline text-ink-muted w-20">Role</span>
            <span className="mz-label text-ink">{member.role}</span>
          </div>
          <div className="flex gap-4">
            <span className="mz-overline text-ink-muted w-24">Mobile</span>
            <span className="text-ink">{formatPhone(member.mobile)}</span>
          </div>
          <div className="flex gap-4">
            <span className="mz-overline text-ink-muted w-20">Branch</span>
            <span className="mz-label text-ink">{branchName(member.branch)}</span>
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
            <span className="mz-label text-ink">{data.present}</span>
          </div>
          <span className="text-ink-muted">·</span>
          <div>
            <span className="mz-body-sm text-ink-muted">Days absent: </span>
            <span className="mz-label text-ink">{data.absent}</span>
          </div>
        </div>

        <table className="mt-5 w-full border border-line text-left">
          <thead>
            <tr className="border-b border-line bg-surface-sunken print:bg-gray-100">
              <th className="px-4 py-3 mz-label text-ink">Description</th>
              <th className="px-4 py-3 mz-label text-ink text-right">Days</th>
              <th className="px-4 py-3 mz-label text-ink text-right">Rate</th>
              <th className="px-4 py-3 mz-label text-ink text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <td className="px-4 py-3 text-ink">Basic salary</td>
              <td className="px-4 py-3 text-right mz-num text-ink">{data.present}</td>
              <td className="px-4 py-3 text-right mz-num text-ink">{formatLKR(member.dailyRate)}</td>
              <td className="px-4 py-3 text-right mz-num text-ink">{formatLKR(data.basicSalary)}</td>
            </tr>
            <tr className="border-b border-line">
              <td className="px-4 py-3 text-ink">Deductions (absent days)</td>
              <td className="px-4 py-3 text-right mz-num text-ink">{data.absent}</td>
              <td className="px-4 py-3 text-right mz-num text-ink">{formatLKR(member.dailyRate)}</td>
              <td className="px-4 py-3 text-right mz-num text-ink">− {formatLKR(data.deductions)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-surface-sunken print:bg-gray-100">
              <td className="px-4 py-3 mz-label text-ink" colSpan={3}>Net Pay</td>
              <td className="px-4 py-3 text-right mz-price text-ink">{formatLKR(data.netPay)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-6 flex items-center justify-between border-t-2 border-logo-navy pt-4">
          <p className="mz-body-sm text-ink-muted">Generated on {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
          <p className="mz-body-sm text-ink-muted">Medizone Pharmacy — {branchName(member.branch)}</p>
        </div>
      </div>
    </div>
  );
}
