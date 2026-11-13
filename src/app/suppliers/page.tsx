"use client";

import { useState } from "react";
import Sidebar from "@/components/delivery/Sidebar";
import SuppliersTabsNav, { SupplierTabType } from "@/components/suppliers/SuppliersTabsNav";
import SuppliersListTab from "@/components/suppliers/SuppliersListTab";
import SupplierProfileView from "@/components/suppliers/SupplierProfileView";
import PurchaseOrdersTab from "@/components/suppliers/PurchaseOrdersTab";
import GoodsReceivedView from "@/components/suppliers/GoodsReceivedView";
import ShortExpiryTab from "@/components/suppliers/ShortExpiryTab";
import PaymentsDueTab from "@/components/suppliers/PaymentsDueTab";
import AddSupplierModal from "@/components/suppliers/AddSupplierModal";
import NewPurchaseOrderForm from "@/components/suppliers/NewPurchaseOrderForm";
import { useSuppliersData } from "@/lib/suppliers-store";
import { Supplier, PurchaseOrder, ReturnNote, PaymentDueItem } from "@/types/suppliers";
import { useAuth } from "@/lib/auth";
import { Icon } from "@/components/shared/Icon";

export default function SuppliersPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SupplierTabType>("suppliers");

  // Sub-view states
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedOrderForGRN, setSelectedOrderForGRN] = useState<PurchaseOrder | null>(null);
  const [isCreatingPO, setIsCreatingPO] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);

  const {
    suppliers,
    purchaseOrders,
    paymentsDue,
    shortExpiryItems,
    addSupplier,
    addPurchaseOrder,
    updatePurchaseOrders,
    updateShortExpiry,
    updatePaymentsDue,
    updateReturnNotes,
    returnNotes,
  } = useSuppliersData();

  // Metrics
  const ordersAwaitingCount = purchaseOrders.filter((o) => o.status === "sent" || o.status === "partial").length;
  const paymentsOverdueCount = paymentsDue.filter((p) => p.status === "overdue").length;

  // Handlers
  const handleTabChange = (tab: SupplierTabType) => {
    setActiveTab(tab);
    setSelectedSupplier(null);
    setSelectedOrderForGRN(null);
    setIsCreatingPO(false);
  };

  const handleConfirmReceived = (updatedOrder: PurchaseOrder, returnNote?: ReturnNote) => {
    updatePurchaseOrders(
      purchaseOrders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
    if (returnNote) {
      updateReturnNotes([returnNote, ...returnNotes]);
    }
    setSelectedOrderForGRN(null);
  };

  const handleSendOrder = (orderId: string) => {
    updatePurchaseOrders(
      purchaseOrders.map((o) => (o.id === orderId ? { ...o, status: "sent" } : o))
    );
  };

  const handleMarkPaid = (paymentId: string) => {
    updatePaymentsDue(
      paymentsDue.map((p) => (p.id === paymentId ? { ...p, status: "paid" } : p))
    );
  };

  const handleReturnSelected = (selectedIds: string[]) => {
    updateShortExpiry(
      shortExpiryItems.map((item) =>
        selectedIds.includes(item.id)
          ? { ...item, creditStatus: "sent_to_supplier" as const }
          : item
      )
    );
  };

  const handleCreatePOSubmit = (newOrder: PurchaseOrder) => {
    addPurchaseOrder(newOrder);

    const newPayment: PaymentDueItem = {
      id: `pay-${Date.now()}`,
      poId: newOrder.id,
      supplierId: newOrder.supplierId,
      supplierName: newOrder.supplierName,
      paymentStage: newOrder.paymentStage,
      creditDays: 30,
      orderDate: newOrder.date,
      dueDate: newOrder.paymentDueDate,
      amount: newOrder.lines.reduce((s, l) => s + l.qty * l.unitCost, 0),
      status: "due",
    };
    updatePaymentsDue([newPayment, ...paymentsDue]);
    setIsCreatingPO(false);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-[#0e1b2e]">
      {/* Desktop Sticky Sidebar */}
      <div className="hidden shrink-0 lg:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Topbar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-[#072f68] px-4 text-white lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-1.5 hover:bg-white/10"
              aria-label="Open sidebar"
            >
              <Icon name="menu" size={20} />
            </button>
            <span className="font-bold text-base tracking-tight">medizone.lk</span>
          </div>
          <span className="text-xs text-white/80 font-medium">Suppliers</span>
        </header>

        {/* Mobile Drawer */}
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
                className="absolute top-4 right-3 p-1.5 text-white/80 hover:text-white rounded-md bg-white/10"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
          </div>
        )}

        <main id="main" className="flex-1 p-5 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1400px] space-y-6">
            {/* Header: Breadcrumbs & Title */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                Back Office <span className="text-gray-400 mx-1">/</span> Suppliers &amp; Purchases
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#072f68]">
                    Suppliers &amp; Purchases
                  </h1>
                  <p className="text-xs sm:text-sm text-[#46566d] mt-0.5">
                    Manage pharmaceutical distributors, purchase orders, goods receipts, short-expiry returns, and invoice payments.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingPO(true)}
                    className="rounded-lg bg-[#072f68] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#052350]"
                  >
                    + New purchase order
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddSupplierOpen(true)}
                    className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-50"
                  >
                    Add supplier
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            {!selectedSupplier && !selectedOrderForGRN && !isCreatingPO && (
              <SuppliersTabsNav
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            )}

            {/* View Switching */}
            {isCreatingPO ? (
              <NewPurchaseOrderForm
                suppliers={suppliers}
                onBack={() => setIsCreatingPO(false)}
                onSubmit={handleCreatePOSubmit}
              />
            ) : selectedOrderForGRN ? (
              <GoodsReceivedView
                order={selectedOrderForGRN}
                onBack={() => setSelectedOrderForGRN(null)}
                onConfirmReceived={handleConfirmReceived}
              />
            ) : selectedSupplier ? (
              <SupplierProfileView
                supplier={selectedSupplier}
                purchaseOrders={purchaseOrders}
                returnNotes={returnNotes}
                onBack={() => setSelectedSupplier(null)}
                onCreatePO={() => {
                  setSelectedSupplier(null);
                  setIsCreatingPO(true);
                }}
                onSelectOrder={(order) => setSelectedOrderForGRN(order)}
              />
            ) : (
              <>
                {activeTab === "suppliers" && (
                  <SuppliersListTab
                    suppliers={suppliers}
                    ordersAwaitingCount={ordersAwaitingCount}
                    paymentsOverdueCount={paymentsOverdueCount}
                    onSelectSupplier={(s) => setSelectedSupplier(s)}
                    onOpenAddModal={() => setIsAddSupplierOpen(true)}
                  />
                )}

                {activeTab === "orders" && (
                  <PurchaseOrdersTab
                    orders={purchaseOrders}
                    onSelectOrder={(order) => {}}
                    onNewOrder={() => setIsCreatingPO(true)}
                    onSendOrder={handleSendOrder}
                    onReceiveOrder={(order) => setSelectedOrderForGRN(order)}
                  />
                )}

                {activeTab === "expiry" && (
                  <ShortExpiryTab
                    items={shortExpiryItems}
                    onReturnSelected={handleReturnSelected}
                  />
                )}

                {activeTab === "payments" && (
                  <PaymentsDueTab
                    payments={paymentsDue}
                    onMarkPaid={handleMarkPaid}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <AddSupplierModal
          isOpen={isAddSupplierOpen}
          onClose={() => setIsAddSupplierOpen(false)}
          onAddSupplier={(newSup) => {
            addSupplier(newSup);
            setIsAddSupplierOpen(false);
          }}
        />
      )}
    </div>
  );
}
