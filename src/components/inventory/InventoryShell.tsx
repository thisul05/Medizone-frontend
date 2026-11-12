"use client";

import { type ReactNode } from "react";
import { AppShell } from "@/components/shared";

/** Module navigation follows the signed-in account's permissions and unified sidebar. */
export function InventoryShell({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8">
        {children}
      </div>
    </AppShell>
  );
}
