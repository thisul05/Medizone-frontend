import type { Metadata } from "next";
import { AccessGuard, AppShell } from "@/components/shared";
import { StaffView } from "@/components/staff/StaffView";

export const metadata: Metadata = { title: "Staff & Payroll" };

export default function StaffPage() {
  return (
    <AccessGuard module="staff">
      <AppShell>
        <StaffView />
      </AppShell>
    </AccessGuard>
  );
}
