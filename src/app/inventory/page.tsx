import type { Metadata } from "next";
import { InventoryProvider } from "@/components/inventory/InventoryProvider";
import { InventoryShell } from "@/components/inventory/InventoryShell";
import { InventoryView } from "@/components/inventory/InventoryView";

export const metadata: Metadata = { title: "Products and inventory" };

export default function InventoryPage() {
  return (
    <InventoryProvider>
      <InventoryShell>
        <InventoryView />
      </InventoryShell>
    </InventoryProvider>
  );
}
