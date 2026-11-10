"use client";

import { initialInventory } from "@/data/inventory";
import { isInventoryState } from "@/lib/inventory";
import type { InventoryState } from "@/types/inventory";

const STORAGE_KEY = "mz.inventory.v1";
type Snapshot = { inventory: InventoryState; notice: string | null };
const serverSnapshot: Snapshot = { inventory: initialInventory, notice: null };
let snapshot: Snapshot | undefined;
let hasUnsavedChanges = false;
const listeners = new Set<() => void>();

function readStorage(): Snapshot {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { inventory: initialInventory, notice: "Browser storage is unavailable. Changes will stay in this tab until it closes." };
  }
  if (!raw) return serverSnapshot;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isInventoryState(parsed)) return { inventory: parsed, notice: null };
  } catch {
    // Invalid JSON is recoverable in the same way as an invalid record shape.
  }
  return { inventory: initialInventory, notice: "Saved inventory could not be read. Sample records are displayed; saving a change will replace the invalid browser data." };
}

export function getInventorySnapshot(): Snapshot {
  if (typeof window === "undefined") return serverSnapshot;
  return snapshot ??= readStorage();
}

export function getServerInventorySnapshot(): Snapshot {
  return serverSnapshot;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  if (hasUnsavedChanges) return;
  snapshot = readStorage();
  emit();
}

export function subscribeInventory(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  // Re-read after navigating back into the module, even if no subscriber was mounted.
  if (!hasUnsavedChanges) {
    const current = readStorage();
    if (snapshot && (current.notice !== snapshot.notice || JSON.stringify(current.inventory) !== JSON.stringify(snapshot.inventory))) {
      snapshot = current;
      emit();
    }
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}

export function saveInventory(inventory: InventoryState) {
  let notice: string | null = null;
  hasUnsavedChanges = false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
  } catch {
    hasUnsavedChanges = true;
    notice = "Changes are available in this tab, but browser storage is full or disabled. They may be lost when the tab closes.";
  }
  snapshot = { inventory, notice };
  emit();
}
