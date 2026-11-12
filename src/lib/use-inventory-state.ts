"use client";

import { useSyncExternalStore } from "react";
import { inventoryToday } from "@/lib/inventory";
import { getInventorySnapshot, getServerInventorySnapshot, subscribeInventory } from "@/lib/inventory-store";

const subscribeReady = () => () => {};
function subscribeDay(callback: () => void) {
  const timer = window.setInterval(callback, 60000);
  window.addEventListener("focus", callback);
  return () => { window.clearInterval(timer); window.removeEventListener("focus", callback); };
}

/** Read the same saved state from any module, including browser-tab updates. */
export function useInventoryState() {
  const snapshot = useSyncExternalStore(subscribeInventory, getInventorySnapshot, getServerInventorySnapshot);
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const today = useSyncExternalStore(subscribeDay, inventoryToday, () => "");
  return { ...snapshot, today, ready: ready && !!today };
}
