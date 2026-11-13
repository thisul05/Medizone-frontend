"use client";

export type SupplierTabType = "suppliers" | "orders" | "expiry" | "payments";

interface SuppliersTabsNavProps {
  activeTab: SupplierTabType;
  onTabChange: (tab: SupplierTabType) => void;
}

export default function SuppliersTabsNav({
  activeTab,
  onTabChange,
}: SuppliersTabsNavProps) {
  const tabs: { id: SupplierTabType; label: string }[] = [
    { id: "suppliers", label: "Suppliers" },
    { id: "orders", label: "Purchase orders" },
    { id: "expiry", label: "Short-expiry returns" },
    { id: "payments", label: "Payments due" },
  ];

  return (
    <div className="border-b border-slate-200 mb-6">
      <nav className="flex space-x-8" aria-label="Suppliers Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-3 px-1 inline-flex items-center text-sm font-medium border-b-2 transition-all cursor-pointer ${
                isActive
                  ? "border-[#072f68] text-[#072f68] font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

