"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/shared/AppSidebar";
import { Button, ButtonLink } from "@/components/shared/Button";
import { Select } from "@/components/shared/Select";
import { TextField } from "@/components/shared/TextField";
import { useToast } from "@/components/shared/Toast";
import StatusBadge from "@/components/shared/StatusBadge";
import { Badge } from "@/components/shared/Badge";
import { useStaff } from "@/components/staff/StaffContext";
import { branchName } from "@/data/branches";

export default function AddAttendanceEntryPage() {
  const router = useRouter();
  const toast = useToast();
  const { staff, addAttendance } = useStaff();
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id ?? "");
  const [selectedMonth, setSelectedMonth] = useState("2026-11");

  const [date, setDate] = useState("2026-11-07");
  const [timeIn, setTimeIn] = useState("07:40");
  const [timeOut, setTimeOut] = useState("16:30");

  const selectedStaff = staff.find((s) => s.id === selectedStaffId);

  const hoursWorked = useMemo(() => {
    if (!timeIn || !timeOut) return null;
    const [hIn, mIn] = timeIn.split(":").map(Number);
    const [hOut, mOut] = timeOut.split(":").map(Number);
    const totalMin = hOut * 60 + mOut - (hIn * 60 + mIn);
    if (totalMin <= 0) return null;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${m}m`;
  }, [timeIn, timeOut]);

  const status: "present" | "absent" | "partial" = !timeIn
    ? "absent"
    : !timeOut
      ? "partial"
      : "present";

  const handleSave = () => {
    addAttendance({ staffId: selectedStaffId, date, timeIn, timeOut: timeOut || undefined });
    toast({ tone: "success", title: "Attendance saved" });
    router.push("/staff/attendance");
  };

  if (!selectedStaff) return null;

  return (
    <div className="flex min-h-screen">
      <AppSidebar />

      <div className="min-w-0 flex-1 overflow-auto bg-surface-page">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ButtonLink href="/staff/attendance" variant="ghost" size="sm" icon="arrow-left" aria-label="Back" />
              <h1 className="mz-h1 text-ink">Attendance entry</h1>
            </div>
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
          </div>

          <div className="mb-6">
            <Select
              label="Staff member"
              labelHidden
              size="md"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              options={staff.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.id})`,
              }))}
              className="max-w-sm"
            />
          </div>

          <div className="mx-auto max-w-2xl rounded-lg border border-line bg-surface-raised p-6 shadow-1">
            <p className="mz-body-sm text-ink-muted">Staff member</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h2 className="mz-h2 text-ink">{selectedStaff.name}</h2>
              <span className="mz-code text-ink-muted">{selectedStaff.id}</span>
              <Badge tone="brand" variant="soft">
                {branchName(selectedStaff.branch)}
              </Badge>
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <div className="mb-5 flex items-center gap-2">
                <span className="mz-label text-ink-muted">Date</span>
                <span className="text-ink">
                  {new Date(date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <TextField
                label="Date"
                labelHidden
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fieldClassName="mb-5"
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextField
                  label="Time in"
                  type="time"
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                />
                <TextField
                  label="Time out"
                  type="time"
                  value={timeOut}
                  onChange={(e) => setTimeOut(e.target.value)}
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-6 rounded-md bg-surface-sunken px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="mz-label text-ink-muted">Hours worked</span>
                  <span className="mz-label text-ink">
                    {hoursWorked ?? "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mz-label text-ink-muted">Status</span>
                  <StatusBadge kind="attendance" status={status} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="mz-label text-ink-muted">Date</span>
                  <span className="mz-label text-ink">
                    {new Date(date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-5">
              <ButtonLink href="/staff/attendance" variant="secondary">
                Cancel
              </ButtonLink>
              <Button variant="primary" onClick={handleSave}>
                Save attendance
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
