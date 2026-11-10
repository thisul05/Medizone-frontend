import type { BranchId } from "@/types/roles";

export interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  genericName: string;
  brand: string;
  categoryId: string;
  unit: string;
  sellingPrice: number;
  reorderLevel: number;
  rxRequired: boolean;
  isActive: boolean;
}

export interface StockBatch {
  id: string;
  productId: string;
  branchId: BranchId;
  batchNumber: string;
  quantity: number;
  costPrice: number;
  receivedDate: string;
  /** Devices without a stated expiry date use null. */
  expiryDate: string | null;
  /** Optional supplier name; an empty string means it has not been recorded. */
  supplier: string;
}

export type StockMovementType =
  | "receive"
  | "increase"
  | "decrease"
  | "write_off"
  | "transfer_in"
  | "transfer_out";

export interface StockMovement {
  id: string;
  batchId: string;
  productId: string;
  branchId: BranchId;
  type: StockMovementType;
  /** Signed change: outgoing movements are negative. */
  quantity: number;
  balanceAfter: number;
  reason: string;
  createdAt: string;
  performedBy: string;
}

export interface InventoryState {
  version: 1;
  products: InventoryProduct[];
  batches: StockBatch[];
  movements: StockMovement[];
}

export type ProductInput = Omit<InventoryProduct, "id">;
export type ReceiveStockInput = Omit<StockBatch, "id"> & { reason: string };

export interface AdjustStockInput {
  batchId: string;
  type: "increase" | "decrease" | "write_off" | "transfer";
  /** Positive amount; the movement direction supplies the sign. */
  quantity: number;
  reason: string;
  toBranchId?: BranchId;
}

export type InventoryResult =
  | { ok: true; state: InventoryState }
  | { ok: false; error: string };

export type ExpiryStatus = "expired" | "red" | "orange" | "yellow" | "ok" | "none";
export interface ExpiryInfo {
  status: ExpiryStatus;
  label: string;
  days: number | null;
}
