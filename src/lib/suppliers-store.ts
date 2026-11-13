"use client";

import { useSyncExternalStore } from "react";
import {
  Supplier,
  PurchaseOrder,
  ReturnNote,
  ShortExpiryItem,
  PaymentDueItem,
} from "@/types/suppliers";
import {
  initialSuppliers,
  initialPurchaseOrders,
  initialReturnNotes,
  initialShortExpiryItems,
  initialPaymentsDue,
} from "@/data/suppliers";

interface SuppliersModuleState {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  returnNotes: ReturnNote[];
  shortExpiryItems: ShortExpiryItem[];
  paymentsDue: PaymentDueItem[];
}

const STORAGE_KEY = "medizone_suppliers_module_v1";

const defaultState: SuppliersModuleState = {
  suppliers: initialSuppliers,
  purchaseOrders: initialPurchaseOrders,
  returnNotes: initialReturnNotes,
  shortExpiryItems: initialShortExpiryItems,
  paymentsDue: initialPaymentsDue,
};

let memoryState: SuppliersModuleState = defaultState;
let isInitialized = false;
const listeners = new Set<() => void>();

function getSnapshot(): SuppliersModuleState {
  if (typeof window === "undefined") return defaultState;
  if (!isInitialized) {
    isInitialized = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        memoryState = JSON.parse(raw);
      }
    } catch {
      // fallback to defaultState
    }
  }
  return memoryState;
}

function getServerSnapshot(): SuppliersModuleState {
  return defaultState;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function saveState(newState: SuppliersModuleState) {
  memoryState = newState;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.warn("Failed to persist to localStorage", e);
    }
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSuppliersData() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addSupplier = (newSup: Supplier) => {
    saveState({
      ...state,
      suppliers: [newSup, ...state.suppliers],
    });
  };

  const updatePurchaseOrders = (orders: PurchaseOrder[]) => {
    saveState({
      ...state,
      purchaseOrders: orders,
    });
  };

  const addPurchaseOrder = (newPO: PurchaseOrder) => {
    saveState({
      ...state,
      purchaseOrders: [newPO, ...state.purchaseOrders],
    });
  };

  const updateReturnNotes = (returns: ReturnNote[]) => {
    saveState({
      ...state,
      returnNotes: returns,
    });
  };

  const updatePaymentsDue = (payments: PaymentDueItem[]) => {
    saveState({
      ...state,
      paymentsDue: payments,
    });
  };

  const updateShortExpiry = (items: ShortExpiryItem[]) => {
    saveState({
      ...state,
      shortExpiryItems: items,
    });
  };

  return {
    suppliers: state.suppliers,
    purchaseOrders: state.purchaseOrders,
    returnNotes: state.returnNotes,
    shortExpiryItems: state.shortExpiryItems,
    paymentsDue: state.paymentsDue,
    addSupplier,
    updatePurchaseOrders,
    addPurchaseOrder,
    updateReturnNotes,
    updatePaymentsDue,
    updateShortExpiry,
  };
}
