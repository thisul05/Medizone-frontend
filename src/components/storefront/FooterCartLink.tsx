"use client";

import { useCart } from "@/lib/cart";

export function FooterCartLink({ className }: { className?: string }) {
  const { setOpen } = useCart();
  return (
    <button type="button" onClick={() => setOpen(true)} className={className}>
      Cart
    </button>
  );
}
