import { Suspense } from "react";
import { CartPage } from "@/components/orders/customer/CartPage";
import { StorefrontShell } from "@/components/storefront/StorefrontShell";

export default function OrdersCartPage() {
  return (
    <StorefrontShell>
      <Suspense>
        <CartPage />
      </Suspense>
    </StorefrontShell>
  );
}
