"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/staff/Sidebar";
import { Button, ButtonLink } from "@/components/shared/Button";
import { TextField } from "@/components/shared/TextField";
import { Select } from "@/components/shared/Select";
import { useToast } from "@/components/shared/Toast";
import { useStaff } from "@/components/staff/StaffContext";
import { STAFF_ROLES } from "@/data/staff";
import { branches } from "@/data/branches";
import type { BranchId } from "@/types/roles";

export default function AddStaffPage() {
  const router = useRouter();
  const toast = useToast();
  const { addStaff, nextId } = useStaff();

  const [form, setForm] = useState({
    name: "",
    nic: "",
    dateOfBirth: "",
    branch: "",
    role: "",
    mobile: "",
    email: "",
    dailyRate: "",
    joinedDate: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStaff({
      id: nextId(),
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
    toast({ tone: "success", title: "Staff member added" });
    router.push("/staff");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="min-w-0 flex-1 overflow-auto bg-surface-page">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <ButtonLink href="/staff" variant="ghost" size="sm" icon="arrow-left" aria-label="Back to staff" />
            <h1 className="mz-h1 text-ink">Add staff</h1>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-lg border border-line bg-surface-raised p-6 shadow-1">
            <h2 className="mz-h2 text-ink mb-6">Staff details</h2>

            <div className="flex flex-col gap-5">
              <TextField
                label="Full name"
                placeholder="Enter full name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextField
                  label="NIC number"
                  placeholder="Enter NIC number"
                  value={form.nic}
                  onChange={(e) => set("nic", e.target.value)}
                  required
                />
                <TextField
                  label="Date of birth"
                  type="date"
                  placeholder="Select date"
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                  required
                />
              </div>

              <Select
                label="Branch"
                placeholder="Select branch"
                value={form.branch}
                onChange={(e) => set("branch", e.target.value)}
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
                required
              />

              <Select
                label="Role"
                placeholder="Select role"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                options={STAFF_ROLES.map((r) => ({ value: r, label: r }))}
                required
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextField
                  label="Mobile number"
                  placeholder="077 000 0000"
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                  required
                />
                <TextField
                  label="Email"
                  optional
                  type="email"
                  placeholder="Enter email address"
                  hint="Leave blank if not available."
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextField
                  label="Daily rate"
                  placeholder="Rs. 0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.dailyRate}
                  onChange={(e) => set("dailyRate", e.target.value)}
                  required
                />
                <TextField
                  label="Joined date"
                  type="date"
                  placeholder="Select date"
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
                Save staff
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
