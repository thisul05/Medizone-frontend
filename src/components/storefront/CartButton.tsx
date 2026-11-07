"use client";

import { Icon } from "@/components/shared";
import { useCart } from "@/lib/cart";

export function CartButton() {
  const { count, ready, setOpen } = useCart();
  const shown = ready ? count : 0;
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Cart, ${shown} item${shown === 1 ? "" : "s"}`}
      className="relative flex h-control-lg items-center gap-2 rounded-md px-3 text-label text-primary-tint-ink transition-colors duration-150 hover:bg-primary-tint"
    >
      <Icon name="cart" />
      <span className="hidden sm:inline">Cart</span>
      {ready && count > 0 && (
        <span className="absolute -top-0.5 left-6 flex h-5 min-w-5 items-center justify-center rounded-pill bg-sale px-1 text-body-sm font-semibold text-on-solid tabular">
          {count}
        </span>
      )}
    </button>
  );
}
