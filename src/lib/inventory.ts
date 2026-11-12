import type { BranchId } from "@/types/roles";
import { INVENTORY_CATEGORIES } from "@/data/inventory";
import type {
  AdjustStockInput,
  ExpiryInfo,
  InventoryProduct,
  InventoryResult,
  InventoryState,
  ProductInput,
  ReceiveStockInput,
  StockBatch,
  StockMovement,
  StockMovementType,
} from "@/types/inventory";

const DAY_MS = 86_400_000;
const BRANCH_IDS: readonly string[] = ["b1", "b2", "b3", "b4", "b5"];
const MOVEMENT_TYPES: readonly string[] = ["receive", "increase", "decrease", "write_off", "transfer_in", "transfer_out"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonempty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function whole(value: unknown, minimum = 0): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= minimum;
}

function amount(value: unknown, minimum = 0): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= Number.MAX_SAFE_INTEGER;
}

function isBranch(value: unknown): value is BranchId {
  return typeof value === "string" && BRANCH_IDS.includes(value);
}

/** Strict calendar validation also rejects rollover dates such as 2027-02-29. */
export function isInventoryDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isInventoryTimestamp(value: unknown): value is string {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && isInventoryDate(value.slice(0, 10)) && Number.isFinite(Date.parse(value));
}

/** Inventory uses the branch's Sri Lankan calendar, independent of the browser timezone. */
export function inventoryToday(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Calendar-month addition clamps month ends (31 August + 6 months = 28/29 February). */
function addMonths(iso: string, months: number): string {
  const first = new Date(`${iso}T00:00:00Z`);
  const day = first.getUTCDate();
  first.setUTCDate(1);
  first.setUTCMonth(first.getUTCMonth() + months);
  const next = new Date(first);
  next.setUTCMonth(next.getUTCMonth() + 1);
  next.setUTCDate(0);
  const lastDay = next.getUTCDate();
  first.setUTCDate(Math.min(day, lastDay));
  return first.toISOString().slice(0, 10);
}

export function expiryInfo(date: string | null, today: string): ExpiryInfo {
  if (date === null) return { status: "none", label: "No expiry date", days: null };
  if (!isInventoryDate(date) || !isInventoryDate(today)) {
    return { status: "expired", label: "Check expiry date", days: null };
  }
  const days = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_MS);
  if (days < 0) return { status: "expired", label: "Expired", days };
  if (days === 0) return { status: "red", label: "Expires today", days };
  if (date <= addMonths(today, 6)) return { status: "red", label: "Within 6 months", days };
  if (date <= addMonths(today, 12)) return { status: "orange", label: "6–12 months", days };
  if (date <= addMonths(today, 18)) return { status: "yellow", label: "12–18 months", days };
  return { status: "ok", label: "Over 18 months", days };
}

/** Available units exclude expired batches; pass a branch-filtered list when appropriate. */
export function productQuantity(productId: string, batches: readonly StockBatch[], today: string): number {
  return batches.reduce((sum, batch) => sum + (
    batch.productId === productId && expiryInfo(batch.expiryDate, today).status !== "expired" ? batch.quantity : 0
  ), 0);
}

export function stockStatus(quantity: number, reorderLevel: number): "in_stock" | "low" | "out" {
  if (quantity <= 0) return "out";
  return quantity <= reorderLevel ? "low" : "in_stock";
}

function productError(input: ProductInput): string | null {
  if (!nonempty(input.sku)) return "Enter a product SKU";
  if (input.sku.trim().length > 48) return "Keep the product SKU within 48 characters";
  if (!nonempty(input.name)) return "Enter a product name including its strength and form";
  if (typeof input.genericName !== "string" || typeof input.brand !== "string") return "Enter valid product details";
  if (!INVENTORY_CATEGORIES.some((category) => category.id === input.categoryId)) return "Choose a valid category";
  if (!nonempty(input.unit)) return "Enter the stock unit";
  if (!amount(input.sellingPrice) || input.sellingPrice <= 0) return "Selling price must be above zero";
  if (!whole(input.reorderLevel)) return "Reorder level must be a whole number of zero or more";
  if (typeof input.rxRequired !== "boolean" || typeof input.isActive !== "boolean") return "Choose valid product settings";
  return null;
}

function nextId(prefix: string, ids: readonly string[]): string {
  const occupied = new Set(ids);
  let sequence = ids.length + 1;
  while (occupied.has(`${prefix}-${String(sequence).padStart(5, "0")}`)) sequence += 1;
  return `${prefix}-${String(sequence).padStart(5, "0")}`;
}

function error(message: string): InventoryResult {
  return { ok: false, error: message };
}

export function applyProduct(state: InventoryState, input: ProductInput, id?: string): InventoryResult {
  const invalid = productError(input);
  if (invalid) return error(invalid);
  if (id && !state.products.some((product) => product.id === id)) return error("This product no longer exists");
  const sku = input.sku.trim().toUpperCase();
  if (state.products.some((product) => product.id !== id && product.sku.trim().toUpperCase() === sku)) {
    return error("This SKU already belongs to another product");
  }
  const product: InventoryProduct = {
    ...input,
    id: id ?? nextId("PRD", state.products.map((item) => item.id)),
    sku,
    name: input.name.trim(), genericName: input.genericName.trim(), brand: input.brand.trim(),
    categoryId: input.categoryId.trim(), unit: input.unit.trim(),
  };
  return { ok: true, state: {
    ...state,
    products: id ? state.products.map((item) => item.id === id ? product : item) : [...state.products, product],
  } };
}

function movement(
  state: InventoryState, batch: StockBatch, type: StockMovementType, quantity: number,
  reason: string, actor: string, recordedAt: string,
): StockMovement {
  return {
    id: nextId("MOV", state.movements.map((item) => item.id)),
    batchId: batch.id, productId: batch.productId, branchId: batch.branchId,
    type, quantity, balanceAfter: batch.quantity, reason: reason.trim(),
    createdAt: recordedAt, performedBy: actor.trim(),
  };
}

export function applyReceive(
  state: InventoryState, input: ReceiveStockInput, actor: string, today: string,
  recordedAt = `${today}T00:00:00+05:30`,
): InventoryResult {
  if (!isInventoryDate(today)) return error("Choose a valid stock date");
  if (!isInventoryTimestamp(recordedAt) || inventoryToday(new Date(recordedAt)) !== today) return error("Stock timestamp must be valid and fall on today's Sri Lankan date");
  if (!nonempty(actor)) return error("Sign in again before changing stock");
  const product = state.products.find((item) => item.id === input.productId);
  if (!product) return error("Choose an existing product");
  if (!product.isActive) return error("Reactivate this product before receiving stock");
  if (!isBranch(input.branchId)) return error("Choose a valid branch");
  if (!nonempty(input.batchNumber)) return error("Enter the batch number");
  if (!whole(input.quantity, 1)) return error("Quantity must be a whole number above zero");
  if (!amount(input.costPrice)) return error("Cost price must be zero or more");
  if (!isInventoryDate(input.receivedDate) || input.receivedDate > today) return error("Received date must be a valid date on or before today");
  if (input.expiryDate !== null && (!isInventoryDate(input.expiryDate) || input.expiryDate < input.receivedDate)) {
    return error("Expiry date must be on or after the received date");
  }
  if (input.expiryDate !== null && input.expiryDate < today) return error("Expired stock cannot be received");
  if (typeof input.supplier !== "string") return error("Enter a valid supplier name or leave it blank");
  if (!nonempty(input.reason)) return error("Enter a reason or goods received reference");
  const existing = state.batches.find((batch) => batch.productId === input.productId && batch.branchId === input.branchId
    && batch.batchNumber.toUpperCase() === input.batchNumber.trim().toUpperCase());
  if (existing) return error("This batch number already exists at this branch; use a stock adjustment to change its quantity");
  const batch: StockBatch = {
    id: nextId("BAT", state.batches.map((item) => item.id)), productId: input.productId,
    branchId: input.branchId, batchNumber: input.batchNumber.trim().toUpperCase(), quantity: input.quantity,
    costPrice: input.costPrice, receivedDate: input.receivedDate, expiryDate: input.expiryDate, supplier: input.supplier.trim(),
  };
  return { ok: true, state: {
    ...state,
    batches: [...state.batches, batch],
    movements: [...state.movements, movement(state, batch, "receive", input.quantity, input.reason, actor, recordedAt)],
  } };
}

export function applyAdjustment(
  state: InventoryState, input: AdjustStockInput, actor: string, today: string,
  recordedAt = `${today}T00:00:00+05:30`,
): InventoryResult {
  if (!isInventoryDate(today)) return error("Choose a valid stock date");
  if (!isInventoryTimestamp(recordedAt) || inventoryToday(new Date(recordedAt)) !== today) return error("Stock timestamp must be valid and fall on today's Sri Lankan date");
  if (!nonempty(actor)) return error("Sign in again before changing stock");
  const batch = state.batches.find((item) => item.id === input.batchId);
  if (!batch) return error("This batch no longer exists");
  if (!["increase", "decrease", "write_off", "transfer"].includes(input.type)) return error("Choose a valid stock action");
  if (!whole(input.quantity, 1)) return error("Quantity must be a whole number above zero");
  if (!nonempty(input.reason)) return error("Enter a reason for the stock change");
  if (expiryInfo(batch.expiryDate, today).status === "expired" && input.type !== "write_off") {
    return error("Expired stock can only be written off");
  }
  if (input.type === "increase" && !state.products.find((product) => product.id === batch.productId)?.isActive) {
    return error("Reactivate this product before increasing stock");
  }
  const delta = input.type === "increase" ? input.quantity : -input.quantity;
  if (!whole(batch.quantity + delta)) return error(delta < 0 ? "Quantity exceeds the units in this batch" : "Quantity is too large");
  const updated = { ...batch, quantity: batch.quantity + delta };

  if (input.type !== "transfer") {
    return { ok: true, state: {
      ...state, batches: state.batches.map((item) => item.id === batch.id ? updated : item),
      movements: [...state.movements, movement(state, updated, input.type, delta, input.reason, actor, recordedAt)],
    } };
  }
  if (!isBranch(input.toBranchId)) return error("Choose a destination branch");
  if (input.toBranchId === batch.branchId) return error("Choose a different destination branch");
  // Preserve receipt provenance; conflicting destination metadata requires staff review.
  const destination = state.batches.find((item) => item.productId === batch.productId
    && item.branchId === input.toBranchId && item.batchNumber.toUpperCase() === batch.batchNumber.toUpperCase());
  if (destination && (destination.expiryDate !== batch.expiryDate || destination.costPrice !== batch.costPrice
    || destination.receivedDate !== batch.receivedDate || destination.supplier !== batch.supplier)) {
    return error("The destination has this batch number with different receipt details; check its expiry, cost and supplier");
  }
  if (destination && !whole(destination.quantity + input.quantity)) return error("Destination quantity is too large");
  const received: StockBatch = destination ? { ...destination, quantity: destination.quantity + input.quantity } : {
    ...batch, id: nextId("BAT", state.batches.map((item) => item.id)), branchId: input.toBranchId, quantity: input.quantity,
  };
  const out = movement(state, updated, "transfer_out", -input.quantity, input.reason, actor, recordedAt);
  const inMovement = movement({ ...state, movements: [...state.movements, out] }, received, "transfer_in", input.quantity, input.reason, actor, recordedAt);
  return { ok: true, state: {
    ...state,
    batches: [...state.batches.map((item) => item.id === batch.id ? updated : item.id === destination?.id ? received : item),
      ...(destination ? [] : [received])],
    movements: [...state.movements, out, inMovement],
  } };
}

/** Treat browser storage as untrusted input; reject malformed and disconnected records. */
export function isInventoryState(raw: unknown): raw is InventoryState {
  if (!isRecord(raw) || raw.version !== 1 || !Array.isArray(raw.products)
    || !Array.isArray(raw.batches) || !Array.isArray(raw.movements)) return false;
  const productIds = new Set<string>();
  const skus = new Set<string>();
  for (const product of raw.products) {
    if (!isRecord(product) || !nonempty(product.id) || productIds.has(product.id)
      || productError(product as unknown as ProductInput)) return false;
    const sku = (product.sku as string).trim().toUpperCase();
    if (skus.has(sku)) return false;
    productIds.add(product.id); skus.add(sku);
  }
  const batches = new Map<string, StockBatch>();
  const batchKeys = new Set<string>();
  for (const batch of raw.batches) {
    if (!isRecord(batch) || !nonempty(batch.id) || batches.has(batch.id)
      || typeof batch.productId !== "string" || !productIds.has(batch.productId)
      || !isBranch(batch.branchId) || !nonempty(batch.batchNumber) || !whole(batch.quantity)
      || !amount(batch.costPrice) || !isInventoryDate(batch.receivedDate)
      || !(batch.expiryDate === null || (isInventoryDate(batch.expiryDate) && batch.expiryDate >= batch.receivedDate))
      || typeof batch.supplier !== "string") return false;
    const key = JSON.stringify([batch.productId, batch.branchId, batch.batchNumber.trim().toUpperCase()]);
    if (batchKeys.has(key)) return false;
    batchKeys.add(key);
    batches.set(batch.id, batch as unknown as StockBatch);
  }
  const movementIds = new Set<string>();
  const balances = new Map<string, number>();
  for (const item of raw.movements) {
    if (!isRecord(item) || !nonempty(item.id) || movementIds.has(item.id) || typeof item.batchId !== "string") return false;
    const batch = batches.get(item.batchId);
    if (!batch || item.productId !== batch.productId || item.branchId !== batch.branchId
      || typeof item.type !== "string" || !MOVEMENT_TYPES.includes(item.type)
      || typeof item.quantity !== "number" || !Number.isSafeInteger(item.quantity) || item.quantity === 0
      || !whole(item.balanceAfter) || !nonempty(item.reason) || !nonempty(item.performedBy)
      || !isInventoryTimestamp(item.createdAt)) return false;
    if (["receive", "increase", "transfer_in"].includes(item.type) ? item.quantity < 0 : item.quantity > 0) return false;
    const previous = balances.get(item.batchId) ?? 0;
    if (!whole(previous + item.quantity) || previous + item.quantity !== item.balanceAfter) return false;
    balances.set(item.batchId, item.balanceAfter);
    movementIds.add(item.id);
  }
  for (const [id, batch] of batches) {
    if (balances.get(id) !== batch.quantity) return false;
  }
  return true;
}
