import type { Metadata } from "next";
import { AccessGuard, AppShell } from "@/components/shared";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = { title: "Dashboard · Overview" };

export default function AdminPage() {
  return (
    <AccessGuard module="admin">
      <AppShell>
        <AdminDashboard />
      </AppShell>
    </AccessGuard>
  );
}
