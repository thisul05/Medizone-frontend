"use client";

import { useRouter } from "next/navigation";
import NewPurchaseOrderForm from "@/components/suppliers/NewPurchaseOrderForm";
import { useSuppliersData } from "@/lib/suppliers-store";
import { PurchaseOrder, PaymentDueItem } from "@/types/suppliers";

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { suppliers, addPurchaseOrder, paymentsDue, updatePaymentsDue } =
    useSuppliersData();

  const handleBack = () => {
    router.push("/suppliers");
  };

  const handleSubmit = (newOrder: PurchaseOrder) => {
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

    router.push("/suppliers");
  };

  return (
    <NewPurchaseOrderForm
      suppliers={suppliers}
      onBack={handleBack}
      onSubmit={handleSubmit}
    />
  );
}
