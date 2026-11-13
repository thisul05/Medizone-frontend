"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "@/components/delivery/Sidebar";
import { Icon } from "@/components/shared/Icon";

/** Staff layout: the group's role-based sidebar on the left, the page on the right. */
export function OrdersShell({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-[#0e1b2e]">
      <div className="hidden shrink-0 lg:block">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Topbar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-[#072f68] px-4 text-white lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-1.5 hover:bg-white/10 cursor-pointer"
              aria-label="Open sidebar"
            >
              <Icon name="menu" size={20} />
            </button>
            <span className="font-bold text-base tracking-tight">medizone.lk</span>
          </div>
          <span className="text-xs text-white/80 font-medium">Orders</span>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-nav max-w-[85vw] h-full shadow-2xl">
              <Sidebar />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-3 p-1.5 text-white/80 hover:text-white rounded-md bg-white/10 cursor-pointer"
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
