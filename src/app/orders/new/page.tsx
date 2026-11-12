"use client";

import { Suspense } from "react";
import { Alert } from "@/components/shared";
import { NewOrderForm } from "@/components/orders/NewOrderForm";
import { OrdersRoleSwitch } from "@/components/orders/OrdersRoleSwitch";
import { OrdersShell } from "@/components/orders/OrdersShell";
import { StorefrontShell } from "@/components/storefront/StorefrontShell";

export default function NewOrderPage() {
  return (
    <Suspense>
      <OrdersRoleSwitch
        customer={
          <StorefrontShell>
            <div className="mx-auto max-w-3xl px-4 py-12">
              <Alert tone="info" title="Send your prescription on WhatsApp">
                Prescription medicines are not sold online. Send a photo of your prescription to +94 70 185 5855 and we will prepare it for you.
              </Alert>
            </div>
          </StorefrontShell>
        }
        staff={
          <OrdersShell>
            <p className="mz-body-sm text-ink-muted">Dashboard / Orders / New order</p>
            <h1 className="mz-h1">New order</h1>
            <p className="mb-6 text-ink-muted">Record a prescription the customer sent on WhatsApp or handed in, so it can be prepared in advance</p>
            <NewOrderForm />
          </OrdersShell>
        }
      />
    </Suspense>
  );
}
