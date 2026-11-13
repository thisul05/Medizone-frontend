"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "@/components/delivery/Sidebar";
import { Icon } from "@/components/shared/Icon";

/** Module navigation follows the signed-in account's permissions with the unified Sidebar. */
export function InventoryShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-[#0e1b2e]">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface-raised p-3 text-link focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to inventory
      </a>

      {/* Desktop Permanent Unified Sidebar */}
      <div className="hidden shrink-0 lg:block">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header Bar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-[#072f68] px-4 text-white lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="rounded-md p-1.5 hover:bg-white/10"
              aria-label="Open sidebar"
            >
              <Icon name="menu" size={20} />
            </button>
            <span className="font-bold text-base tracking-tight">medizone.lk</span>
          </div>
          <span className="text-xs text-white/80 font-medium">Inventory</span>
        </header>

        {/* Mobile Navigation Drawer */}
        {navOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setNavOpen(false)}
            />
            <div className="relative z-10 w-nav max-w-[85vw] h-full shadow-2xl">
              <Sidebar />
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                className="absolute top-4 right-3 p-1.5 text-white/80 hover:text-white rounded-md bg-white/10"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
          </div>
        )}

        <main id="main" className="min-w-0 flex-1 overflow-auto">
          <div className="w-full max-w-7xl mx-auto px-5 py-6 sm:px-6 lg:px-8 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
