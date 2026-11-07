"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { ButtonLink, Icon, cx } from "@/components/shared";
import { getCategory, getProduct } from "@/data/storefront";
import { useCart, MAX_QTY } from "@/lib/cart";
import { formatLKR } from "@/lib/format";
import { CartCheckout } from "./CartCheckout";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const stepBtn =
  "flex size-8 items-center justify-center rounded-md border border-line-strong text-primary-tint-ink transition-colors duration-150 hover:bg-primary-tint disabled:border-line disabled:text-ink-disabled disabled:hover:bg-transparent";

export function CartDrawer() {
  const { items, subtotal, open, setOpen, setQty, remove, count } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      returnTo.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    } else {
      document.body.style.overflow = "";
      returnTo.current?.focus();
      returnTo.current = null;
    }
  }, [open]);

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;
    const nodes = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className={cx("fixed inset-0 z-50 transition-opacity duration-150", open ? "opacity-100" : "pointer-events-none invisible opacity-0")}
      inert={!open}
    >
      <div className="absolute inset-0 bg-(--scrim)" onClick={() => setOpen(false)} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        onKeyDown={onKeyDown}
        className="absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col bg-surface-raised shadow-3"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="cart-title" className="mz-h3">
            Your cart {count > 0 && <span className="text-ink-muted">({count})</span>}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="rounded-md p-2 text-ink-muted transition-colors duration-150 hover:bg-surface-hover hover:text-ink"
          >
            <Icon name="x" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <Icon name="cart" size={28} className="text-ink-subtle" />
            <p className="mz-h3">Your cart is empty</p>
            <p className="text-ink-muted">Add vitamins, devices and everyday essentials to get started.</p>
            <ButtonLink href="/shop" onClick={() => setOpen(false)} className="mt-2">
              Browse products
            </ButtonLink>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-line px-5">
              {items.map((item) => {
                const p = getProduct(item.productId);
                if (!p) return null;
                return (
                  <li key={item.productId} className="flex gap-3 py-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-surface-sunken">
                      <Icon name={getCategory(p.categoryId)?.icon ?? "package"} size={28} className="text-ink-subtle" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex justify-between gap-2">
                        <p className="line-clamp-2 mz-label">{p.name}</p>
                        <p className="mz-label mz-num">{formatLKR(p.price * item.qty)}</p>
                      </div>
                      <p className="mz-body-sm text-ink-muted mz-num">{formatLKR(p.price)} each</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button type="button" className={stepBtn} onClick={() => setQty(p.id, item.qty - 1)} aria-label={`Decrease quantity of ${p.name}`}>
                            <Icon name="minus" size={16} />
                          </button>
                          <span className="w-6 text-center mz-label mz-num" aria-live="polite" aria-label={`Quantity ${item.qty}`}>
                            {item.qty}
                          </span>
                          <button type="button" className={stepBtn} disabled={item.qty >= MAX_QTY} onClick={() => setQty(p.id, item.qty + 1)} aria-label={`Increase quantity of ${p.name}`}>
                            <Icon name="plus" size={16} />
                          </button>
                        </div>
                        <button type="button" onClick={() => remove(p.id)} className="flex items-center gap-1 rounded-md px-2 py-1 mz-label text-danger-ink hover:bg-danger-bg">
                          <Icon name="trash" size={16} />
                          Remove<span className="sr-only"> {p.name}</span>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between border-t border-line px-5 py-4">
              <span className="mz-label">Subtotal</span>
              <span className="mz-price mz-num">{formatLKR(subtotal)}</span>
            </div>
            <CartCheckout />
          </div>
        )}
      </div>
    </div>
  );
}
