import Link from "next/link";
import { Suspense } from "react";
import { CheckoutView } from "@/components/orders/customer/CheckoutView";
import { StorefrontShell } from "@/components/storefront/StorefrontShell";

export default function CheckoutPage() {
  return (
    <StorefrontShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6">
        <p className="mz-body-sm text-ink-muted">
          <Link href="/" className="text-link">Home</Link> › <Link href="/orders/cart" className="text-link">Cart</Link> › Checkout
        </p>
        <h1 className="mz-h1">Checkout</h1>
        <Suspense>
          <CheckoutView />
        </Suspense>
      </div>
    </StorefrontShell>
  );
}
