"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import Sidebar from "@/components/delivery/Sidebar";
import { Tabs, type TabItem } from "@/components/shared/Tabs";

type Tab = "deliveries" | "cod" | "returns" | "warranty" | "checker";

const VALID_TABS: Tab[] = ["deliveries", "cod", "returns", "warranty", "checker"];

const TABS: TabItem[] = [
  { id: "deliveries", label: "Deliveries" },
  { id: "cod", label: "Cash on Delivery" },
  { id: "returns", label: "Customer Returns" },
  { id: "warranty", label: "Warranty Claims" },
  { id: "checker", label: "Warranty Check" },
];

export default function DeliveryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get("tab");
  const activeTab: Tab = VALID_TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "deliveries";
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [returns, setReturns] = useState<CustomerReturn[]>(initialReturns);
  const [claims, setClaims] = useState<WarrantyClaim[]>(initialClaims);

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

  const deliveredCount = deliveries.filter((d) => d.status === "delivered").length;
  const pendingCount = deliveries.filter((d) => d.status === "pending").length;
  const outCount = deliveries.filter((d) => d.status === "out").length;

  const stats = [
    {
      label: "Total Deliveries",
      value: deliveries.length,
      sub: `${deliveredCount} delivered`,
      color: "text-primary",
    },
    {
      label: "Pending / Out",
      value: deliveries.filter((d) => d.status !== "delivered").length,
      sub: `${pendingCount} pending · ${outCount} out`,
      color: "text-warning-ink",
    },
    {
      label: "Open Returns",
      value: returns.filter((r) => r.status === "requested").length,
      sub: "Awaiting review",
      color: "text-warning-ink",
    },
    {
      label: "Active Claims",
      value: claims.filter((c) => c.status !== "replaced" && c.status !== "returned").length,
      sub: "In progress",
      color: "text-info-ink",
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="min-w-0 flex-1 overflow-auto bg-surface-page">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="mz-h1 text-ink">Delivery, Returns &amp; Warranty</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Manage dispatches, customer returns and warranty support in one place.
            </p>
          </div>

          {/* KPI cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-line bg-surface-raised p-5 shadow-1">
                <div className="mz-overline mb-2 text-ink-muted">{s.label}</div>
                <div className={`mz-kpi ${s.color}`}>{s.value}</div>
                <div className="mz-body-sm mt-1 text-ink-subtle">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs
            tabs={TABS}
            value={activeTab}
            onChange={(id) => router.replace(`/delivery?tab=${id}`, { scroll: false })}
            label="Delivery module sections"
            idBase="delivery"
            className="mb-5"
          />

          {/* Tab content */}
          <div className="rounded-lg border border-line bg-surface-raised p-5 shadow-1">
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
    </div>
  );
}
