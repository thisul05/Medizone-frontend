"use client";

import { useState, type ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import Link from "next/link";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-[#0e1b2e]">
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white p-3 text-[#1d5aa6] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 shadow-lg"
      >
        Skip to content
      </a>

      {/* Desktop Sidebar (Permanent, non-switchable) */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen z-30">
        <AppSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-[#072f68] px-4 text-white lg:hidden">
          <Link href="/home" aria-label="Medizone Pharmacy">
            <Logo height={26} />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="rounded-lg p-2 hover:bg-white/10"
          >
            <Icon name={mobileMenuOpen ? "x" : "menu"} size={22} />
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-10 w-64 max-w-[80vw]">
              <AppSidebar onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        <main id="main-content" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

