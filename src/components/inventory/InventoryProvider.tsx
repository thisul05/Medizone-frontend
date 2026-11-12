"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useToast } from "@/components/shared";
import { branches } from "@/data/branches";
import { useAuth } from "@/lib/auth";
import { applyAdjustment, applyProduct, applyReceive, inventoryToday } from "@/lib/inventory";
import type { AdjustStockInput, InventoryResult, InventoryState, ProductInput, ReceiveStockInput } from "@/types/inventory";
import type { BranchId } from "@/types/roles";
import { getInventorySnapshot, saveInventory } from "@/lib/inventory-store";
import { useInventoryState } from "@/lib/use-inventory-state";

export type SaveResult = { ok: boolean; error?: string };
interface InventoryContextValue extends InventoryState {
  today: string;
  ready: boolean;
  storageNotice: string | null;
  branchId: BranchId | "all";
  allowedBranches: BranchId[];
  receivingBranches: BranchId[];
  saveProduct: (input: ProductInput, id?: string) => SaveResult;
  receiveStock: (input: ReceiveStockInput) => SaveResult;
  adjustStock: (input: AdjustStockInput) => SaveResult;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user, activeBranchId, can } = useAuth();
  const { inventory, notice, ready, today } = useInventoryState();
  const toast = useToast();
  const branchId = user?.branchId === "all" ? activeBranchId ?? "all" : user?.branchId ?? "all";
  const allowedBranches: BranchId[] = user?.branchId === "all" ? branches.map((branch) => branch.id) : user ? [user.branchId] : [];
  const receivingBranches = branchId === "all" ? allowedBranches : allowedBranches.filter((id) => id === branchId);

  function commit(result: InventoryResult, title: string): SaveResult {
    if (!result.ok) return { ok: false, error: result.error };
    saveInventory(result.state);
    toast({ tone: "success", title });
    return { ok: true };
  }

  function denied(): SaveResult | null {
    return !user || !can("inventory") ? { ok: false, error: "Sign in with an account that can manage inventory." } : null;
  }

  const value: InventoryContextValue = {
    ...inventory, today, ready: ready && !!today, storageNotice: notice,
    branchId, allowedBranches, receivingBranches,
    saveProduct(input, id) {
      const error = denied();
      if (error) return error;
      return commit(applyProduct(getInventorySnapshot().inventory, input, id), id ? "Product updated" : "Product added");
    },
    receiveStock(input) {
      const error = denied();
      if (error) return error;
      if (!receivingBranches.includes(input.branchId)) return { ok: false, error: "Choose a branch available in your current inventory view." };
      const recordedAt = new Date();
      return commit(applyReceive(getInventorySnapshot().inventory, input, user!.name, inventoryToday(recordedAt), recordedAt.toISOString()), "Stock received and movement recorded");
    },
    adjustStock(input) {
      const error = denied();
      if (error) return error;
      const state = getInventorySnapshot().inventory;
      const batch = state.batches.find((item) => item.id === input.batchId);
      if (!batch || !receivingBranches.includes(batch.branchId)) return { ok: false, error: "This batch is outside your current branch. Switch branches and try again." };
      if (input.type === "transfer" && (!input.toBranchId || !allowedBranches.includes(input.toBranchId))) return { ok: false, error: "Choose a destination branch you can manage." };
      const recordedAt = new Date();
      return commit(applyAdjustment(state, input, user!.name, inventoryToday(recordedAt), recordedAt.toISOString()), input.type === "transfer" ? "Stock transferred between branches" : "Stock adjusted and movement recorded");
    },
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory must be used inside InventoryProvider");
  return context;
}
