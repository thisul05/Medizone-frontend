import { categories, products } from "@/data/storefront";
import type { BranchId } from "@/types/roles";
import type { InventoryProduct, InventoryState, StockBatch } from "@/types/inventory";

export const INVENTORY_CATEGORIES = [
  ...categories.map(({ id, name }) => ({ id, name })),
  { id: "prescription", name: "Prescription medicines" },
];

const catalog: InventoryProduct[] = products.map((product, index) => ({
  id: product.id,
  sku: `MZ-${String(index + 1).padStart(4, "0")}`,
  name: product.name,
  genericName: product.id === "p14" ? "Paracetamol" : product.id === "p15" ? "Oral rehydration salts" : "",
  brand: product.brand ?? "Generic",
  categoryId: product.categoryId,
  unit: product.id === "p14" || product.id === "p04" ? "strip" : product.categoryId === "devices" ? "unit" : "pack",
  sellingPrice: product.price,
  reorderLevel: product.categoryId === "devices" ? 4 : 10,
  rxRequired: false,
  isActive: true,
}));

catalog.push(
  { id: "rx01", sku: "MZ-RX-0001", name: "Amoxicillin 500 mg capsules, strip of 10", genericName: "Amoxicillin", brand: "Generic", categoryId: "prescription", unit: "strip", sellingPrice: 350, reorderLevel: 20, rxRequired: true, isActive: true },
  { id: "rx02", sku: "MZ-RX-0002", name: "Metformin 500 mg tablets, strip of 10", genericName: "Metformin hydrochloride", brand: "Generic", categoryId: "prescription", unit: "strip", sellingPrice: 180, reorderLevel: 25, rxRequired: true, isActive: true },
  { id: "rx03", sku: "MZ-RX-0003", name: "Losartan potassium 50 mg tablets, strip of 10", genericName: "Losartan potassium", brand: "Generic", categoryId: "prescription", unit: "strip", sellingPrice: 260, reorderLevel: 20, rxRequired: true, isActive: true },
);

type BatchSeed = [productId: string, branchId: BranchId, batchNumber: string, quantity: number, expiryDate: string | null, receivedDate?: string];

// Fixed demonstration dates around November 2026 make every expiry band inspectable.
// p21 has no stock; p08/p10 are low; expired units remain visible but unavailable.
const seeds: BatchSeed[] = [
  ["p01", "b1", "VID-2601", 6, "2026-10-31", "2026-02-04"],
  ["p01", "b1", "VID-2608", 24, "2027-02-28"],
  ["p01", "b1", "VID-2609", 18, "2028-03-31"],
  ["p02", "b1", "NUT-2609", 16, "2027-08-31"],
  ["p03", "b1", "NEP-2607", 22, "2028-04-30"],
  ["p04", "b1", "BEZ-2606", 42, "2029-01-31"],
  ["p05", "b1", "OMR-2610", 8, null],
  ["p06", "b1", "SUD-2608", 14, "2027-03-31"],
  ["p07", "b1", "PER-2609", 12, "2027-10-31"],
  ["p08", "b1", "PRO-2610", 2, null],
  ["p09", "b1", "OXI-2610", 10, null],
  ["p10", "b1", "THE-2610", 3, null],
  ["p11", "b1", "STR-2608", 18, "2027-01-31"],
  ["p12", "b1", "NEB-2609", 6, null],
  ["p13", "b1", "SMT-2608", 35, "2028-06-30"],
  ["p14", "b1", "PAR-2607", 85, "2027-04-30"],
  ["p14", "b1", "PAR-2610", 120, "2028-12-31"],
  ["p15", "b1", "ORS-2609", 48, "2028-01-31"],
  ["p16", "b1", "KNE-2608", 16, null],
  ["p17", "b1", "BEA-2605", 4, "2026-09-30", "2026-05-12"],
  ["p17", "b1", "BEA-2609", 5, "2027-02-28"],
  ["p18", "b1", "PHO-2608", 19, "2027-07-31"],
  ["p19", "b1", "LOT-2608", 28, "2028-02-29"],
  ["p20", "b1", "BAB-2609", 21, "2028-08-31"],
  ["p22", "b1", "PET-2609", 14, "2027-11-30"],
  ["p23", "b1", "SAN-2607", 40, "2027-05-31"],
  ["p24", "b1", "MSK-2609", 45, "2029-03-31"],
  ["rx01", "b1", "AMX-2608", 12, "2027-01-31"],
  ["rx02", "b1", "MET-2609", 95, "2028-06-30"],
  ["rx03", "b1", "LOS-2608", 18, "2027-09-30"],
  ["p01", "b2", "VID-2608", 18, "2027-02-28"],
  ["p05", "b2", "OMR-2610", 5, null],
  ["p10", "b2", "THE-2610", 2, null],
  ["p14", "b2", "PAR-2610", 65, "2028-12-31"],
  ["p23", "b2", "SAN-2607", 8, "2027-05-31"],
  ["rx01", "b2", "AMX-2608", 30, "2027-01-31"],
  ["p06", "b3", "SUD-2608", 9, "2027-03-31"],
  ["p14", "b3", "PAR-2610", 42, "2028-12-31"],
  ["p15", "b3", "ORS-2609", 20, "2028-01-31"],
  ["rx02", "b3", "MET-2609", 40, "2028-06-30"],
  ["p02", "b4", "NUT-2609", 14, "2027-08-31"],
  ["p08", "b4", "PRO-2610", 1, null],
  ["p11", "b4", "STR-2608", 4, "2027-01-31"],
  ["p14", "b4", "PAR-2610", 55, "2028-12-31"],
  ["rx03", "b4", "LOS-2608", 28, "2027-09-30"],
  ["p09", "b5", "OXI-2610", 3, null],
  ["p14", "b5", "PAR-2610", 36, "2028-12-31"],
  ["rx02", "b5", "MET-2609", 22, "2028-06-30"],
];

const batches: StockBatch[] = seeds.map(([productId, branchId, batchNumber, quantity, expiryDate, receivedDate], index) => ({
  id: `BAT-${String(index + 1).padStart(5, "0")}`,
  productId, branchId, batchNumber, quantity, expiryDate,
  receivedDate: receivedDate ?? "2026-10-15",
  costPrice: Math.round((catalog.find((product) => product.id === productId)?.sellingPrice ?? 0) * 0.72 * 100) / 100,
  supplier: productId.startsWith("rx") ? "Central pharmaceutical supply (demo)" : "Island healthcare distributors (demo)",
}));

/** Browser-persisted prototype state. Storefront product IDs stay stable for future integration. */
export const initialInventory: InventoryState = {
  version: 1,
  products: catalog,
  batches,
  movements: batches.map((batch, index) => ({
    id: `MOV-${String(index + 1).padStart(5, "0")}`,
    batchId: batch.id, productId: batch.productId, branchId: batch.branchId,
    type: "receive", quantity: batch.quantity, balanceAfter: batch.quantity,
    reason: "Opening balance — demonstration stock",
    createdAt: `${batch.receivedDate}T09:00:00+05:30`, performedBy: "Opening stock",
  })),
};
