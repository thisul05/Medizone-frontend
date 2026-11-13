"use client";

import { useState } from "react";
import Link from "next/link";
import AppSidebar from "@/components/shared/AppSidebar";
import { ButtonLink } from "@/components/shared/Button";
import { Icon } from "@/components/shared/Icon";
import { useToast } from "@/components/shared/Toast";
import { useStaff } from "@/components/staff/StaffContext";
import { branchName } from "@/data/branches";
import { formatDate, formatPhone } from "@/lib/format";

export default function StaffListPage() {
  const { staff, deleteStaff } = useStaff();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDelete = (id: string) => {
    deleteStaff(id);
    toast({ tone: "success", title: "Staff member removed" });
  };

  return (
    <div className="flex min-h-screen bg-surface-page">
      {/* Desktop Sticky Sidebar */}
      <div className="hidden shrink-0 lg:block">
        <AppSidebar />
      </div>

      <div className="min-w-0 flex-1 flex flex-col">
        {/* Mobile Header Bar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-[#072f68] px-4 text-white lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-1.5 hover:bg-white/10 cursor-pointer"
              aria-label="Open sidebar"
            >
              <span className="text-xl leading-none">☰</span>
            </button>
            <span className="font-bold text-base tracking-tight">medizone.lk</span>
          </div>
          <span className="text-xs text-white/80 font-medium">Staff</span>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-nav max-w-[85vw] h-full shadow-2xl">
              <AppSidebar />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-3 p-1.5 text-white/80 hover:text-white rounded-md bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <main id="main" className="min-w-0 flex-1 overflow-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h1 className="mz-h1 text-ink">Staff</h1>
              <div className="flex items-center gap-3">
                <ButtonLink href="/staff/attendance" variant="secondary" size="md">
                  Attendance
                </ButtonLink>
                <ButtonLink href="/staff/payroll" variant="secondary" size="md">
                  Monthly payroll
                </ButtonLink>
                <ButtonLink href="/staff/add" variant="primary" size="md" icon="plus">
                  Add staff
                </ButtonLink>
              </div>
            </div>

          <p className="mb-4 mz-body-sm text-ink-muted">
            {staff.length} active staff members across all branches.
          </p>

          <div className="rounded-lg border border-line bg-surface-raised shadow-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-surface-sunken">
                  <th className="px-4 py-3 mz-label text-ink-muted">Staff ID</th>
                  <th className="px-4 py-3 mz-label text-ink-muted">Name</th>
                  <th className="px-4 py-3 mz-label text-ink-muted">Role</th>
                  <th className="px-4 py-3 mz-label text-ink-muted">Branch</th>
                  <th className="px-4 py-3 mz-label text-ink-muted">Mobile</th>
                  <th className="px-4 py-3 mz-label text-ink-muted">Joined date</th>
                  <th className="px-4 py-3 mz-label text-ink-muted text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-b-0 hover:bg-surface-hover transition-colors duration-150">
                    <td className="px-4 py-3 mz-code text-ink">{s.id}</td>
                    <td className="px-4 py-3 text-ink font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-ink">{s.role}</td>
                    <td className="px-4 py-3 text-ink">{branchName(s.branch)}</td>
                    <td className="px-4 py-3 text-ink mz-num">{formatPhone(s.mobile)}</td>
                    <td className="px-4 py-3 text-ink">{formatDate(s.joinedDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/staff/edit/${s.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-primary transition-colors duration-150 hover:bg-primary-tint"
                          aria-label={`Edit ${s.name}`}
                        >
                          <Icon name="pencil" size={18} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-danger-ink transition-colors duration-150 hover:bg-danger-bg"
                          aria-label={`Delete ${s.name}`}
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
);
}
