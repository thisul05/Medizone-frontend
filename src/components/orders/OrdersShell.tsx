"use client";

import type { ReactNode } from "react";
import Sidebar from "@/components/delivery/Sidebar";

/** Staff layout: the group's role-based sidebar on the left, the page on the right. */
export function OrdersShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-page">
      <Sidebar />
      <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
