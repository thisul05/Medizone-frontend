"use client";

import { useMemo } from "react";
import { selectCatalog } from "@/lib/catalog";
import { inventoryToday } from "@/lib/inventory";
import { getInventorySnapshot } from "@/lib/inventory-store";
import { useInventoryState } from "@/lib/use-inventory-state";
import type { BranchId } from "@/types/roles";

export function getCurrentCatalog(branchId: BranchId | "all" = "all") {
  return selectCatalog(getInventorySnapshot().inventory, inventoryToday(), branchId);
}

export function useCatalog(branchId: BranchId | "all" = "all") {
  const { inventory, today, ready } = useInventoryState();
  const products = useMemo(() => selectCatalog(inventory, today, branchId), [inventory, today, branchId]);
  return { products, ready };
}
