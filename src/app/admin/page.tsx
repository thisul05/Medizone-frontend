import type { Metadata } from "next";
import { AccessGuard } from "@/components/shared";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Medizone Owner & Admin Dashboard: Sales, stock and branch performance at a glance.",
};

export default function AdminPage() {
  return (
    <AccessGuard module="admin">
      <AdminDashboard />
    </AccessGuard>
  );
}
