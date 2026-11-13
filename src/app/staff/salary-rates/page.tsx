"use client";

import { useState } from "react";
import AppSidebar from "@/components/shared/AppSidebar";
import { Button, ButtonLink } from "@/components/shared/Button";
import { useToast } from "@/components/shared/Toast";
import { useStaff } from "@/components/staff/StaffContext";
import { WORKING_DAYS } from "@/data/staff";
import { branchName } from "@/data/branches";
import { formatLKR } from "@/lib/format";

export default function SalaryRatesPage() {
  const toast = useToast();
  const { staff, updateStaff } = useStaff();
  const [dirty, setDirty] = useState(false);

  const handleRateChange = (id: string, value: string) => {
    const rate = parseFloat(value) || 0;
    updateStaff(id, { dailyRate: rate });
    setDirty(true);
  };

  const handleSave = () => {
    setDirty(false);
    toast({ tone: "success", title: "Salary rates saved" });
  };

  const totalMonthly = staff.reduce((sum, s) => sum + s.dailyRate * WORKING_DAYS, 0);

  return (
    <div className="flex min-h-screen">
      <AppSidebar />

      <div className="min-w-0 flex-1 overflow-auto bg-surface-page">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ButtonLink href="/staff/payroll" variant="ghost" size="sm" icon="arrow-left" aria-label="Back" />
              <h1 className="mz-h1 text-ink">Salary rates</h1>
            </div>
            <Button variant="primary" onClick={handleSave} disabled={!dirty}>
              Save changes
            </Button>
          </div>

          <p className="mb-4 mz-body-sm text-ink-muted">
            Daily rates used to calculate monthly payroll. {WORKING_DAYS} working days assumed.
          </p>

          <div className="rounded-lg border border-line bg-surface-raised shadow-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-surface-sunken">
                  <th className="px-4 py-3 mz-label text-ink-muted">Staff ID</th>
                  <th className="px-4 py-3 mz-label text-ink-muted">Name</th>
                  <th className="px-4 py-3 mz-label text-ink-muted">Role</th>
                  <th className="px-4 py-3 mz-label text-ink-muted">Branch</th>
                  <th className="px-4 py-3 mz-label text-ink-muted text-right">Daily Rate</th>
                  <th className="px-4 py-3 mz-label text-ink-muted text-right">Monthly Est.</th>
                  <th className="px-4 py-3 mz-label text-ink-muted">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-b-0 hover:bg-surface-hover transition-colors duration-150">
                    <td className="px-4 py-3 mz-code text-ink">{s.id}</td>
                    <td className="px-4 py-3 text-ink font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-ink">{s.role}</td>
                    <td className="px-4 py-3 text-ink">{branchName(s.branch)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1 rounded-md border border-line-strong px-3 py-1.5">
                        <span className="text-ink-muted mz-body-sm">Rs.</span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={s.dailyRate}
                          onChange={(e) => handleRateChange(s.id, e.target.value)}
                          className="w-24 bg-transparent text-right text-ink mz-num outline-none"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right mz-num text-ink">
                      {formatLKR(s.dailyRate * WORKING_DAYS)}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">4 Nov 2026</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-sunken">
                  <td colSpan={5} className="px-4 py-3 mz-body-sm text-ink-muted">
                    {WORKING_DAYS} working days · rates are per day
                  </td>
                  <td className="px-4 py-3 text-right mz-label text-ink mz-num" colSpan={2}>
                    Total: {formatLKR(totalMonthly)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
