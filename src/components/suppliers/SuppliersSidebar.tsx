"use client";

import Link from "next/link";

interface SuppliersSidebarProps {
  currentBranch?: string;
}

export default function SuppliersSidebar({
  currentBranch = "Branch 1",
}: SuppliersSidebarProps) {

  return (
    <aside className="w-64 min-h-screen bg-[#072f68] text-white flex flex-col p-5 shrink-0 select-none">
      {/* Medizone Brand / Logo Placeholder */}
      <div className="mb-6 rounded-lg border border-dashed border-sky-400/40 bg-white/5 p-4 text-center">
        <span className="text-xs font-mono text-sky-200 block tracking-wider">
          medizone-logo.png
        </span>
        <span className="text-[10px] text-sky-300/60 block mt-0.5">
          (placeholder)
        </span>
      </div>

      {/* Branch Selector Box */}
      <div className="mb-8 rounded-lg bg-[#052350] p-3 border border-white/10">
        <div className="text-[10px] font-bold tracking-wider text-sky-300 uppercase">
          Branch
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-semibold text-sm text-white">{currentBranch}</span>
          <span className="text-xs text-sky-300/70">Main HQ</span>
        </div>
        <p className="text-[11px] text-sky-200/60 mt-1 leading-tight">
          Purchasing centralized at Piliyandala
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        <Link
          href="/home"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Home
        </Link>

        <Link
          href="/inventory"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          Inventory
        </Link>

        {/* Suppliers Navigation Link - Active */}
        <Link
          href="/suppliers"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold bg-[#1E3E6B] text-white shadow-inner"
        >
          <svg
            className="w-4 h-4 text-sky-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Suppliers
        </Link>
      </nav>

      {/* Role / Module info footer */}
      <div className="pt-4 mt-auto border-t border-white/10 text-[11px] text-slate-400">
        <span className="font-medium text-slate-300 block">Medizone MIS</span>
        Module 6: Suppliers & Purchases
      </div>
    </aside>
  );
}

