"use client";

import { useState, useMemo } from "react";
import AppSidebar from "@/components/shared/AppSidebar";
import { ButtonLink } from "@/components/shared/Button";
import { Select } from "@/components/shared/Select";
import { useStaff } from "@/components/staff/StaffContext";
import { attendanceRecords, WORKING_DAYS } from "@/data/staff";

export default function AttendancePage() {
  const { staff } = useStaff();
  const [selectedMonth, setSelectedMonth] = useState("2026-11");

  const days = Array.from({ length: WORKING_DAYS }, (_, i) => i + 1);

  const presenceMap = useMemo(() => {
    const map = new Map<string, Set<number>>();
    for (const r of attendanceRecords) {
      if (!r.date.startsWith(selectedMonth)) continue;
      const day = parseInt(r.date.split("-")[2], 10);
      if (!map.has(r.staffId)) map.set(r.staffId, new Set());
      map.get(r.staffId)!.add(day);
    }
    return map;
  }, [selectedMonth]);

  const totalSlots = staff.length * WORKING_DAYS;
  const totalPresent = staff.reduce(
    (sum, s) => sum + (presenceMap.get(s.id)?.size ?? 0),
    0,
  );
  const totalAbsent = totalSlots - totalPresent;
  const avgAttendance =
    totalSlots > 0 ? Math.round((totalPresent / totalSlots) * 100) : 0;

  const daysPerColumn = days.map((day) =>
    staff.filter((s) => presenceMap.get(s.id)?.has(day)).length,
  );

  return (
    <div className="flex min-h-screen">
      <AppSidebar />

      <div className="min-w-0 flex-1 overflow-auto bg-surface-page">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="mz-h1 text-ink">Attendance</h1>
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
              <ButtonLink href="/staff/attendance/add" variant="primary">
                Add entry
              </ButtonLink>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-surface-raised p-5 shadow-1">
              <p className="mz-kpi text-ink">{WORKING_DAYS}</p>
              <p className="mz-body-sm text-ink-muted mt-1">Days in month</p>
            </div>
            <div className="rounded-lg border border-line bg-surface-raised p-5 shadow-1">
              <p className="mz-kpi text-ink">{avgAttendance}%</p>
              <p className="mz-body-sm text-ink-muted mt-1">Avg attendance</p>
            </div>
            <div className="rounded-lg border border-line bg-surface-raised p-5 shadow-1">
              <p className="mz-kpi text-ink">{totalAbsent}</p>
              <p className="mz-body-sm text-ink-muted mt-1">Absent entries</p>
            </div>
          </div>

          {/* Attendance Grid */}
          <div className="rounded-lg border border-line bg-surface-raised shadow-1 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface-sunken">
                  <th className="sticky left-0 z-10 bg-surface-sunken px-4 py-3 text-left mz-label text-ink-muted min-w-[180px]">
                    Staff
                  </th>
                  {days.map((d) => (
                    <th
                      key={d}
                      className="px-1 py-3 text-center mz-label text-ink-muted min-w-[36px]"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => {
                  const presentDays = presenceMap.get(s.id);
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-line last:border-b-0"
                    >
                      <td className="sticky left-0 z-10 bg-surface-raised px-4 py-2.5 min-w-[180px]">
                        <div className="font-medium text-ink text-sm leading-tight">
                          {s.name}
                        </div>
                        <div className="mz-code text-ink-muted text-xs">
                          {s.id}
                        </div>
                      </td>
                      {days.map((d) => {
                        const isPresent = presentDays?.has(d) ?? false;
                        return (
                          <td key={d} className="px-1 py-2.5 text-center">
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                                isPresent
                                  ? "bg-success-bg text-success-ink"
                                  : "bg-danger-bg text-danger-ink"
                              }`}
                            >
                              {isPresent ? "P" : "A"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-line bg-surface-sunken">
                  <td className="sticky left-0 z-10 bg-surface-sunken px-4 py-3 mz-label text-ink-muted">
                    Days present
                  </td>
                  {daysPerColumn.map((count, i) => (
                    <td
                      key={i}
                      className="px-1 py-3 text-center mz-label text-ink-muted"
                    >
                      {count}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
