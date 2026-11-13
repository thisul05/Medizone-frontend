"use client";

import { useRouter } from "next/navigation";
import { Alert, Button, Icon, useToast } from "@/components/shared";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { cartStockIssue } from "@/lib/catalog";
import { useCatalog } from "@/lib/use-catalog";

/** Cart footer. Delivery, payment and placing the order happen on /orders/checkout (Module 4). */
export function CartCheckout() {
  const { user } = useAuth();
  const { setOpen, validateStock, ready, items } = useCart();
  const toast = useToast();
  const router = useRouter();
  const { products } = useCatalog("all");
  const stockIssue = ready ? cartStockIssue(items, products) : null;
  const isStaffUser = !!user && user.role !== "customer";

  function goToCheckout() {
    const issue = validateStock("all");
    if (issue || !items.length) {
      toast({ tone: "warning", title: issue ?? "Add products to your cart first" });
      return;
    }
    setOpen(false);
    if (!user) {
      toast({ tone: "info", title: "Sign in to place your order" });
      router.push("/login?next=" + encodeURIComponent("/orders/checkout"));
      return;
    }
    router.push("/orders/checkout");
  }

  return (
    <div className="flex flex-col gap-4 border-t border-line px-5 py-5">
      {stockIssue && <Alert tone="warning" title="Check cart availability">{stockIssue}</Alert>}
      {isStaffUser ? (
        <>
          <Alert tone="info">Sign in as a customer to place an order.</Alert>
          <Button size="lg" block disabled>
            Proceed to checkout
          </Button>
        </>
      ) : (
        <Button size="lg" block disabled={!ready || !!stockIssue || !items.length} onClick={goToCheckout}>
          Proceed to checkout
        </Button>
      )}
      <p className="flex items-center gap-1.5 mz-body-sm text-ink-muted">
        <Icon name="lock" size={16} />
        Choose delivery and payment on the next step.
      </p>
    </div>
  );
}
