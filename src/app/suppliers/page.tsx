import type { Metadata } from "next";
import { AccessGuard, AppShell } from "@/components/shared";
import { SuppliersView } from "@/components/suppliers/SuppliersView";

export const metadata: Metadata = { title: "Suppliers & Purchases" };

export default function SuppliersPage() {
  return (
    <AccessGuard module="suppliers">
      <AppShell>
        <SuppliersView />
      </AppShell>
    </AccessGuard>
  );
}
