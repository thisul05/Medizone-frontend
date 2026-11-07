"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { getProduct } from "@/data/storefront";
import { readItem, writeItem } from "@/lib/auth-store";

export interface CartItem {
  productId: string;
  qty: number;
}

const KEY = "mz.cart";
const MAX_QTY = 20;
const EMPTY: CartItem[] = [];

// A small external store so the cart is read from storage only in the browser.
let cache: CartItem[] | undefined;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  if (cache === undefined) {
    try {
      const parsed = JSON.parse(readItem(KEY) ?? "[]") as CartItem[];
      cache = Array.isArray(parsed) ? parsed.filter((i) => getProduct(i.productId) && i.qty > 0) : [];
    } catch {
      cache = [];
    }
  }
  return cache;
}

function write(items: CartItem[]) {
  cache = items;
  writeItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  /** False on the server and during hydration. */
  ready: boolean;
  /** Returns false when the product is out of stock or unknown. */
  add: (productId: string, qty?: number) => boolean;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const noopSubscribe = () => () => {};

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);

  const add = useCallback((productId: string, qty = 1) => {
    const product = getProduct(productId);
    if (!product || product.stock === "out") return false;
    const current = read();
    const existing = current.find((i) => i.productId === productId);
    write(
      existing
        ? current.map((i) => (i.productId === productId ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i))
        : [...current, { productId, qty }],
    );
    return true;
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    const current = read();
    write(
      qty <= 0
        ? current.filter((i) => i.productId !== productId)
        : current.map((i) => (i.productId === productId ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)),
    );
  }, []);

  const remove = useCallback((productId: string) => write(read().filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => write([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + (getProduct(i.productId)?.price ?? 0) * i.qty, 0);
    return { items, count, subtotal, ready, add, setQty, remove, clear, open, setOpen };
  }, [items, ready, add, setQty, remove, clear, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export { MAX_QTY };
