"use client";

// Browser persistence for the Customers module (frontend prototype, no backend).
// Same pattern as src/lib/inventory-store.ts: a useSyncExternalStore snapshot backed by
// localStorage, with the seed data as the server snapshot so there are no hydration errors.
// Saved: customers (added or edited), loyalty transactions, feedback and sent reminders.

import {
  customers as seedCustomers,
  feedback as seedFeedback,
  loyaltyTransactions as seedTransactions,
  sentReminders as seedSent,
} from "@/data/customers";
import type { Customer, CustomerFeedback, LoyaltyTransaction } from "@/types/customers";

const STORAGE_KEY = "mz.customers.v1";
const BRANCH_IDS = ["b1", "b2", "b3", "b4", "b5"];

export interface CustomerModuleState {
  customers: Customer[];
  loyaltyTransactions: LoyaltyTransaction[];
  feedback: CustomerFeedback[];
  /** Reminder id -> ISO date it was marked as sent. */
  sentReminders: Record<string, string>;
}

export interface CustomerStoreSnapshot {
  state: CustomerModuleState;
  /** Set when saved data could not be read or written. */
  notice: string | null;
}

const seedState: CustomerModuleState = {
  customers: seedCustomers,
  loyaltyTransactions: seedTransactions,
  feedback: seedFeedback,
  sentReminders: seedSent,
};

const serverSnapshot: CustomerStoreSnapshot = { state: seedState, notice: null };
let snapshot: CustomerStoreSnapshot | undefined;
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCustomer(c: unknown): c is Customer {
  return (
    isRecord(c) &&
    typeof c.id === "string" &&
    typeof c.name === "string" &&
    typeof c.phone === "string" &&
    BRANCH_IDS.includes(String(c.branchId)) &&
    typeof c.isRegular === "boolean" &&
    [0, 3, 5].includes(Number(c.discountPercent)) &&
    typeof c.loyaltyPoints === "number" &&
    typeof c.joinedOn === "string"
  );
}

function isTransaction(t: unknown): t is LoyaltyTransaction {
  return (
    isRecord(t) &&
    typeof t.id === "string" &&
    typeof t.customerId === "string" &&
    typeof t.date === "string" &&
    ["earned", "redeemed", "adjusted"].includes(String(t.type)) &&
    typeof t.points === "number"
  );
}

function isFeedback(f: unknown): f is CustomerFeedback {
  return (
    isRecord(f) &&
    typeof f.id === "string" &&
    typeof f.customerId === "string" &&
    typeof f.date === "string" &&
    [1, 2, 3, 4, 5].includes(Number(f.rating)) &&
    typeof f.comment === "string"
  );
}

function isState(value: unknown): value is CustomerModuleState {
  if (!isRecord(value)) return false;
  const { customers, loyaltyTransactions, feedback, sentReminders } = value;
  return (
    Array.isArray(customers) &&
    customers.every(isCustomer) &&
    Array.isArray(loyaltyTransactions) &&
    loyaltyTransactions.every(isTransaction) &&
    Array.isArray(feedback) &&
    feedback.every(isFeedback) &&
    isRecord(sentReminders) &&
    Object.values(sentReminders).every((d) => typeof d === "string")
  );
}

function readStorage(): CustomerStoreSnapshot {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { state: seedState, notice: "Browser storage is unavailable. Changes will last until this tab is closed." };
  }
  if (!raw) return serverSnapshot;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isState(parsed)) return { state: parsed, notice: null };
  } catch {
    // Invalid JSON is handled the same way as an invalid shape.
  }
  return { state: seedState, notice: "Saved customer data could not be read, so the sample records are shown. Your next change will replace it." };
}

export function getCustomerSnapshot(): CustomerStoreSnapshot {
  if (typeof window === "undefined") return serverSnapshot;
  return (snapshot ??= readStorage());
}

export function getServerCustomerSnapshot(): CustomerStoreSnapshot {
  return serverSnapshot;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  snapshot = readStorage();
  emit();
}

export function subscribeCustomers(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}

/** Replaces the module state and saves it to localStorage. */
export function saveCustomerState(next: CustomerModuleState) {
  let notice: string | null = null;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    notice = "Browser storage is full or disabled. Changes will last until this tab is closed.";
  }
  snapshot = { state: next, notice };
  emit();
}

/** Applies a change to the latest state, so quick successive updates never overwrite each other. */
export function updateCustomerState(change: (current: CustomerModuleState) => CustomerModuleState) {
  saveCustomerState(change(getCustomerSnapshot().state));
}

/** Clears saved changes and returns to the sample data. */
export function resetCustomerState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing saved to clear.
  }
  snapshot = serverSnapshot;
  emit();
}
