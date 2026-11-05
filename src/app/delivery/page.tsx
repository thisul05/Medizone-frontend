"use client";
import { useState } from "react";
import {
  deliveries as initialDeliveries,
  customerReturns as initialReturns,
  warrantyClaims as initialClaims,
} from "@/data/delivery";
import type {
  Delivery,
  DeliveryMethod,
  DeliveryStatus,
  CustomerReturn,
  ReturnStatus,
  WarrantyClaim,
  WarrantyStatus,
} from "@/types/delivery";
import DeliveryTable from "@/components/delivery/DeliveryTable";
import CODPanel from "@/components/delivery/CODPanel";
import ReturnsTable from "@/components/delivery/ReturnsTable";
import WarrantyTable from "@/components/delivery/WarrantyTable";
import WarrantyChecker from "@/components/delivery/WarrantyChecker";

type Tab = "deliveries" | "cod" | "returns" | "warranty" | "checker";

const TABS: { id: Tab; label: string }[] = [
  { id: "deliveries", label: "Deliveries" },
  { id: "cod", label: "Cash on Delivery" },
  { id: "returns", label: "Customer Returns" },
  { id: "warranty", label: "Warranty Claims" },
  { id: "checker", label: "Warranty Check" },
];

export default function DeliveryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("deliveries");
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [returns, setReturns] = useState<CustomerReturn[]>(initialReturns);
  const [claims, setClaims] = useState<WarrantyClaim[]>(initialClaims);

  /* ── handlers ───────────────────────────────────────────── */
  const updateDeliveryStatus = (id: string, status: DeliveryStatus) =>
    setDeliveries((ds) => ds.map((d) => (d.id === id ? { ...d, status } : d)));

  const updateDeliveryMethod = (id: string, method: DeliveryMethod) =>
    setDeliveries((ds) => ds.map((d) => (d.id === id ? { ...d, method } : d)));

  const toggleCOD = (id: string, codCollected: boolean) =>
    setDeliveries((ds) => ds.map((d) => (d.id === id ? { ...d, codCollected } : d)));

  const updateReturnStatus = (id: string, status: ReturnStatus) =>
    setReturns((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));

  const addReturn = (r: Omit<CustomerReturn, "id">) =>
    setReturns((rs) => [{ ...r, id: `ret-${Date.now()}` }, ...rs]);

  const updateWarrantyStatus = (id: string, status: WarrantyStatus) =>
    setClaims((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));

  const addClaim = (c: Omit<WarrantyClaim, "id">) =>
    setClaims((cs) => [{ ...c, id: `wc-${Date.now()}` }, ...cs]);

  /* ── derived stats ──────────────────────────────────────── */
  const stats = [
    { label: "Total Deliveries", value: deliveries.length, color: "text-[#1a2f4e]" },
    {
      label: "Pending / Out",
      value: deliveries.filter((d) => d.status !== "delivered").length,
      color: "text-amber-600",
    },
    {
      label: "Open Returns",
      value: returns.filter((r) => r.status === "requested").length,
      color: "text-orange-600",
    },
    {
      label: "Active Claims",
      value: claims.filter((c) => c.status !== "replaced" && c.status !== "returned").length,
      color: "text-blue-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-10 bg-[#1a2f4e] shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-white">
              mediz<span className="text-red-400">o</span>ne
            </span>
            <span className="hidden text-blue-300 sm:block">·</span>
            <span className="hidden text-sm text-blue-200 sm:block">
              Delivery, Returns &amp; Warranty
            </span>
          </div>
          <span className="rounded-full bg-blue-900 px-3 py-1 text-xs font-medium text-blue-200">
            Module 7 · Prototype
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* ── Stat cards ── */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-1 text-xs text-gray-500">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="mb-5 border-b border-gray-200">
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-[#1a2f4e] text-[#1a2f4e]"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Tab content ── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          {activeTab === "deliveries" && (
            <DeliveryTable
              deliveries={deliveries}
              onStatusChange={updateDeliveryStatus}
              onMethodChange={updateDeliveryMethod}
            />
          )}
          {activeTab === "cod" && (
            <CODPanel deliveries={deliveries} onToggleCollected={toggleCOD} />
          )}
          {activeTab === "returns" && (
            <ReturnsTable
              returns={returns}
              onStatusChange={updateReturnStatus}
              onAddReturn={addReturn}
            />
          )}
          {activeTab === "warranty" && (
            <WarrantyTable
              claims={claims}
              onStatusChange={updateWarrantyStatus}
              onAddClaim={addClaim}
            />
          )}
          {activeTab === "checker" && <WarrantyChecker />}
        </div>
      </div>
    </div>
  );
}
