"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/shared/Icon";
import { StaffTopBar } from "@/components/shared/StaffTopBar";
import { InventorySidebar } from "./InventorySidebar";

/** Module navigation follows the signed-in account's permissions. */
export function InventoryShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-page text-ink">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface-raised p-3 text-link focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to inventory
      </a>
      <aside className="sticky top-0 hidden h-dvh w-nav shrink-0 lg:block" aria-label="Workspace sidebar">
        <InventorySidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <StaffTopBar />
        <div className="mz-on-nav bg-surface-nav px-4 pb-3 text-nav-ink lg:hidden">
          <button
            type="button"
            aria-expanded={navOpen}
            aria-controls="inventory-mobile-navigation"
            onClick={() => setNavOpen((open) => !open)}
            className="flex h-control-md items-center gap-2 rounded-md px-3 mz-label text-nav-ink transition-colors duration-150 hover:bg-nav-active"
          >
            <Icon name={navOpen ? "x" : "menu"} size={20} />
            {navOpen ? "Close navigation" : "Browse modules"}
          </button>
          {navOpen && (
            <div id="inventory-mobile-navigation" className="h-[min(75dvh,740px)]">
              <InventorySidebar onNavigate={() => setNavOpen(false)} />
            </div>
          )}
        </div>
        <main id="main" className="mx-auto w-full max-w-content flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
