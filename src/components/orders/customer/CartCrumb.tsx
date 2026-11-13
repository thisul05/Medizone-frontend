"use client";

import { useCart } from "@/lib/cart";

/** "Cart" breadcrumb on checkout: the cart is a drawer, so this opens it. */
export function CartCrumb() {
  const { setOpen } = useCart();
  return (
    <button type="button" className="text-link hover:underline" onClick={() => setOpen(true)}>
      Cart
    </button>
  );
}
