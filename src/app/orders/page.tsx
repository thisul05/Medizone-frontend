"use client";

import { Suspense } from "react";
import { StaffOrders } from "@/components/orders/StaffOrders";

// Module 4: Prescriptions and orders. Staff see the Orders page.
// (Customers will see My Orders here once that page is built.)
export default function OrdersPage() {
  return (
    <Suspense>
      <StaffOrders />
    </Suspense>
  );
}
