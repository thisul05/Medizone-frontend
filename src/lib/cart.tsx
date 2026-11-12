"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { readItem, writeItem } from "@/lib/auth-store";
import { cartStockIssue, type CatalogProduct } from "@/lib/catalog";
import { getCurrentCatalog, useCatalog } from "@/lib/use-catalog";
import type { BranchId } from "@/types/roles";

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
      cache = Array.isArray(parsed) ? parsed.filter((i) => i && typeof i.productId === "string" && Number.isSafeInteger(i.qty) && i.qty > 0).map((i) => ({ ...i, qty: Math.min(MAX_QTY, i.qty) })) : [];
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
  getProduct: (productId: string) => CatalogProduct | undefined;
  stockIssue: string | null;
  validateStock: (branchId?: BranchId | "all") => string | null;
  /** Returns false when the requested quantity exceeds stock or the cart limit. */
  add: (productId: string, qty?: number) => boolean;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products, ready } = useCatalog();
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const [open, setOpen] = useState(false);
  const getProduct = useCallback((productId: string) => products.find((product) => product.id === productId), [products]);
  const validateStock = useCallback((branchId: BranchId | "all" = "all") => cartStockIssue(read(), getCurrentCatalog(branchId)), []);

  const add = useCallback((productId: string, qty = 1) => {
    const product = getCurrentCatalog().find((entry) => entry.id === productId);
    if (!product || product.stock === "out" || !Number.isSafeInteger(qty) || qty <= 0) return false;
    const current = read();
    const existing = current.find((i) => i.productId === productId);
    const limit = Math.min(MAX_QTY, product.availableQuantity);
    if ((existing?.qty ?? 0) + qty > limit) return false;
    write(
      existing
        ? current.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i))
        : [...current, { productId, qty }],
    );
    return true;
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    if (!Number.isSafeInteger(qty)) return;
    const current = read();
    const product = getCurrentCatalog().find((entry) => entry.id === productId);
    const limit = Math.min(MAX_QTY, product?.availableQuantity ?? 0);
    write(
      qty <= 0 || limit <= 0
        ? current.filter((i) => i.productId !== productId)
        : current.map((i) => (i.productId === productId ? { ...i, qty: Math.min(limit, qty) } : i)),
    );
  }, []);

  const remove = useCallback((productId: string) => write(read().filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => write([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + (getProduct(i.productId)?.price ?? 0) * i.qty, 0);
    const stockIssue = ready ? cartStockIssue(items, products) : null;
    return { items, count, subtotal, ready, getProduct, stockIssue, validateStock, add, setQty, remove, clear, open, setOpen };
  }, [items, products, ready, getProduct, validateStock, add, setQty, remove, clear, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export { MAX_QTY };
