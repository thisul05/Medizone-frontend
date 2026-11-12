"use client";

import { Suspense } from "react";
import { NewOrderForm } from "@/components/orders/NewOrderForm";
import { OrdersShell } from "@/components/orders/OrdersShell";

export default function NewOrderPage() {
  return (
    <Suspense>
      <OrdersShell>
        <p className="mz-body-sm text-ink-muted">Dashboard / Orders / New order</p>
        <h1 className="mz-h1">New order</h1>
        <p className="mb-6 text-ink-muted">Record a prescription the customer sent on WhatsApp or handed in, so it can be prepared in advance</p>
        <NewOrderForm />
      </OrdersShell>
    </Suspense>
  );
}
