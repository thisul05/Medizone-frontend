import type { Metadata } from "next";
import { AccessGuard, AppShell } from "@/components/shared";
import { OrdersView } from "@/components/orders/OrdersView";

export const metadata: Metadata = { title: "Prescriptions & Orders" };

export default function OrdersPage() {
  return (
    <AccessGuard module="orders">
      <AppShell>
        <OrdersView />
      </AppShell>
    </AccessGuard>
  );
}
