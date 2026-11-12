"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AppSidebar from "@/components/shared/AppSidebar";
import { Button, ButtonLink } from "@/components/shared/Button";
import { TextField } from "@/components/shared/TextField";
import { Select } from "@/components/shared/Select";
import { useToast } from "@/components/shared/Toast";
import { useStaff } from "@/components/staff/StaffContext";
import { STAFF_ROLES } from "@/data/staff";
import { branches } from "@/data/branches";
import type { BranchId } from "@/types/roles";

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const { getStaff, updateStaff } = useStaff();
  const staffId = params.id as string;

  const member = getStaff(staffId);

  const [form, setForm] = useState({
    name: member?.name ?? "",
    nic: member?.nic ?? "",
    dateOfBirth: member?.dateOfBirth ?? "",
    branch: member?.branch ?? "",
    role: member?.role ?? "",
    mobile: member?.mobile ?? "",
    email: member?.email ?? "",
    dailyRate: member?.dailyRate?.toString() ?? "",
    joinedDate: member?.joinedDate ?? "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStaff(staffId, {
      name: form.name,
      nic: form.nic,
      dateOfBirth: form.dateOfBirth,
      role: form.role,
      branch: form.branch as BranchId,
      mobile: form.mobile,
      email: form.email || undefined,
      dailyRate: parseFloat(form.dailyRate) || 0,
      joinedDate: form.joinedDate,
    });
    toast({ tone: "success", title: "Staff details updated" });
    router.push("/staff");
  };

  if (!member) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 items-center justify-center bg-surface-page">
          <p className="text-ink-muted">Staff member not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />

      <div className="min-w-0 flex-1 overflow-auto bg-surface-page">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <ButtonLink href="/staff" variant="ghost" size="sm" icon="arrow-left" aria-label="Back to staff" />
            <h1 className="mz-h1 text-ink">Edit staff</h1>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-lg border border-line bg-surface-raised p-6 shadow-1">
            <h2 className="mz-h2 text-ink mb-6">Edit staff details</h2>

            <div className="flex flex-col gap-5">
              <TextField
                label="Full name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextField
                  label="NIC"
                  value={form.nic}
                  onChange={(e) => set("nic", e.target.value)}
                  required
                />
                <TextField
                  label="Date of birth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Select
                  label="Branch"
                  value={form.branch}
                  onChange={(e) => set("branch", e.target.value)}
                  options={branches.map((b) => ({ value: b.id, label: b.name }))}
                  required
                />
                <Select
                  label="Role"
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  options={STAFF_ROLES.map((r) => ({ value: r, label: r }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextField
                  label="Mobile"
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextField
                  label="Daily rate"
                  type="number"
                  min="0"
                  step="0.01"
                  prefix="Rs."
                  value={form.dailyRate}
                  onChange={(e) => set("dailyRate", e.target.value)}
                  required
                />
                <TextField
                  label="Joined date"
                  type="date"
                  value={form.joinedDate}
                  onChange={(e) => set("joinedDate", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-line pt-5">
              <ButtonLink href="/staff" variant="secondary">
                Cancel
              </ButtonLink>
              <Button type="submit" variant="primary">
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
