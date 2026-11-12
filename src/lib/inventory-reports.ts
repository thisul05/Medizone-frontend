import { branchName } from "@/data/branches";
import { formatLKR } from "@/lib/format";
import { expiryInfo, productQuantity, stockStatus } from "@/lib/inventory";
import type { InventoryState } from "@/types/inventory";
import type { BranchId } from "@/types/roles";

export interface ReportPreview {
  headers: string[];
  rows: string[][];
  summary: Record<string, string>;
}
interface InventoryReport {
  stats: string;
  trend: string;
  status: string;
  statusColor: string;
  lastUpdated: string;
  preview: ReportPreview;
  description?: string;
}

/** Current stock is a snapshot; the optional date range filters movement history only. */
export function selectInventoryReports(state: InventoryState, today: string, branchId: BranchId | "all" = "all", start = "", end = ""): Record<string, InventoryReport> {
  const batches = state.batches.filter((batch) => branchId === "all" || batch.branchId === branchId);
  const active = state.products.filter((product) => product.isActive);
  const productById = new Map(state.products.map((product) => [product.id, product]));
  const available = active.map((product) => ({ product, quantity: productQuantity(product.id, batches, today) }));
  const shortage = available.filter(({ product, quantity }) => quantity <= product.reorderLevel);
  const expiry = batches.filter((batch) => batch.quantity > 0 && ["expired", "red"].includes(expiryInfo(batch.expiryDate, today).status))
    .sort((a, b) => (a.expiryDate ?? "").localeCompare(b.expiryDate ?? ""));
  const value = batches.reduce((sum, batch) => sum + (expiryInfo(batch.expiryDate, today).status === "expired" ? 0 : batch.quantity * batch.costPrice), 0);
  const adjustments = state.movements.filter((movement) => (branchId === "all" || movement.branchId === branchId)
    && ["increase", "decrease", "write_off"].includes(movement.type)
    && (!start || Date.parse(movement.createdAt) >= Date.parse(`${start}:00+05:30`))
    && (!end || Date.parse(movement.createdAt) <= Date.parse(`${end}:59.999+05:30`)))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const make = (stats: string, trend: string, headers: string[], rows: string[][], attention = false): InventoryReport => ({
    stats, trend, status: attention ? "Needs attention" : "Live", statusColor: attention ? "amber" : "green", lastUpdated: "Live inventory",
    preview: { headers, rows, summary: { source: "Saved browser inventory", date: today } },
  });
  return {
    "current-stock": make(`${active.length} active products`, `${formatLKR(value)} at cost`,
      ["SKU", "Product", "Available units", "Selling price", "Stock status"],
      available.map(({ product, quantity }) => [product.sku, product.name, String(quantity), formatLKR(product.sellingPrice), stockStatus(quantity, product.reorderLevel).replaceAll("_", " ")])),
    "reorder-shortage": make(`${shortage.length} low or out of stock`, "At or below reorder level",
      ["SKU", "Product", "Available units", "Reorder level", "Shortfall to clear alert"],
      shortage.map(({ product, quantity }) => [product.sku, product.name, String(quantity), String(product.reorderLevel), String(product.reorderLevel + 1 - quantity)]), shortage.length > 0),
    "expiry-report": {
      ...make(`${expiry.length} batches need attention`, "Expired or within 6 months",
        ["SKU", "Product", "Branch", "Batch", "Units", "Expiry date", "Status"],
        expiry.map((batch) => [productById.get(batch.productId)?.sku ?? batch.productId, productById.get(batch.productId)?.name ?? batch.productId,
          branchName(batch.branchId), batch.batchNumber, String(batch.quantity), batch.expiryDate ?? "", expiryInfo(batch.expiryDate, today).label]), expiry.length > 0),
      description: "Lists expired stock and batches expiring within six months, using the same expiry rules as Inventory.",
    },
    "shrinkage-adjustments": make(`${adjustments.length} stock adjustments`, "Recorded adjustments and write-offs",
      ["Recorded at", "Product", "Branch", "Batch", "Action", "Quantity change", "Balance after", "Reason", "Recorded by"],
      adjustments.map((movement) => [movement.createdAt, productById.get(movement.productId)?.name ?? movement.productId, branchName(movement.branchId),
        state.batches.find((batch) => batch.id === movement.batchId)?.batchNumber ?? movement.batchId, movement.type, String(movement.quantity),
        String(movement.balanceAfter), movement.reason, movement.performedBy])),
    "batch-traceability": make(`${batches.length} stock batches`, "Recorded batch provenance",
      ["Product", "Branch", "Batch", "Units", "Unit cost", "Received date", "Expiry date", "Supplier"],
      batches.map((batch) => [productById.get(batch.productId)?.name ?? batch.productId, branchName(batch.branchId), batch.batchNumber,
        String(batch.quantity), formatLKR(batch.costPrice), batch.receivedDate, batch.expiryDate ?? "No expiry date", batch.supplier])),
  };
}
