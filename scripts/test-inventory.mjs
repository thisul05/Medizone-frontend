/* Run with node scripts/test-inventory.mjs. Uses the project's installed TypeScript. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeRequire = createRequire(import.meta.url);

// Compile only the small domain dependency graph in memory; no generated files or packages.
const cache = new Map();
function loadTs(filename) {
  filename = path.resolve(filename);
  if (cache.has(filename)) return cache.get(filename).exports;
  const result = { exports: {} };
  cache.set(filename, result);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  }).outputText;
  const localRequire = (specifier) => {
    if (specifier.startsWith("@/")) return loadTs(path.join(__dirname, "..", "src", `${specifier.slice(2)}.ts`));
    return nodeRequire(specifier);
  };
  new Function("require", "module", "exports", compiled)(localRequire, result, result.exports);
  return result.exports;
}

const domain = loadTs(path.join(__dirname, "..", "src/lib/inventory.ts"));
const { initialInventory } = loadTs(path.join(__dirname, "..", "src/data/inventory.ts"));
const { expiryInfo, inventoryToday, productQuantity, stockStatus, applyProduct, applyReceive, applyAdjustment, isInventoryState } = domain;
const today = "2026-11-09";
const clone = (value) => structuredClone(value);
const expectState = (result) => {
  assert.equal(result.ok, true, result.error);
  assert.equal(isInventoryState(result.state), true, "Transition must produce a valid persisted state");
  return result.state;
};
const reject = (result, expected) => {
  assert.equal(result.ok, false);
  if (expected) assert.match(result.error, expected);
};

assert.equal(isInventoryState(initialInventory), true, "Seed data must satisfy the storage schema and audit balances");
assert.equal(inventoryToday(new Date("2026-11-08T18:29:59Z")), "2026-11-08");
assert.equal(inventoryToday(new Date("2026-11-08T18:30:00Z")), today);
for (const [date, status] of [
  ["2026-11-08", "expired"], [today, "red"], ["2027-05-09", "red"],
  ["2027-05-10", "orange"], ["2027-11-09", "orange"], ["2027-11-10", "yellow"],
  ["2028-05-09", "yellow"], ["2028-05-10", "ok"], [null, "none"],
]) assert.equal(expiryInfo(date, today).status, status, `${date} band`);
assert.equal(expiryInfo(today, today).days, 0);
assert.equal(expiryInfo("2028-02-29", "2028-02-28").days, 1);
assert.equal(expiryInfo("2027-02-28", "2026-08-31").status, "red", "Clamp six months at February month end");
assert.equal(expiryInfo("2027-03-01", "2026-08-31").status, "orange");
assert.equal(expiryInfo("2028-02-29", "2027-08-31").status, "red", "Leap February remains inside six months");
assert.equal(expiryInfo("2027-02-29", today).label, "Check expiry date");
const b1 = initialInventory.batches.filter((batch) => batch.branchId === "b1");
assert.equal(productQuantity("p01", b1, today), 42, "Exclude six expired units");
assert.equal(productQuantity("p21", b1, today), 0);
assert.equal(stockStatus(0, 10), "out");
assert.equal(stockStatus(10, 10), "low");
assert.equal(stockStatus(11, 10), "in_stock");

const input = { ...initialInventory.products[0] };
delete input.id;
reject(applyProduct(initialInventory, { ...input, sku: " mz-0001 " }), /already/);
reject(applyProduct(initialInventory, { ...input, sku: "NEW", sellingPrice: 0 }), /above zero/);
reject(applyProduct(initialInventory, { ...input, sku: "NEW", reorderLevel: 1.5 }), /whole/);
reject(applyProduct(initialInventory, { ...input, sku: "NEW", categoryId: "unknown" }), /category/);
reject(applyProduct(initialInventory, { ...input, sku: "x".repeat(49) }), /48/);
const added = expectState(applyProduct(initialInventory, { ...input, sku: " new-001 ", name: " Test product " }));
assert.equal(added.products.at(-1).sku, "NEW-001");
assert.equal(added.products.at(-1).name, "Test product");
assert.equal(initialInventory.products.length + 1, added.products.length);
const inactive = expectState(applyProduct(initialInventory, { ...input, isActive: false }, "p01"));
assert.equal(inactive.batches.length, initialInventory.batches.length, "Deactivation preserves stock and audit history");

const receipt = {
  productId: "p01", branchId: "b1", batchNumber: "vid-new", quantity: 5, costPrice: 3000,
  receivedDate: today, expiryDate: "2027-11-30", supplier: "Test supplier", reason: "GRN-0007",
};
const received = expectState(applyReceive(initialInventory, receipt, "Test pharmacist", today));
assert.equal(received.movements.at(-1).quantity, 5);
assert.equal(received.batches.at(-1).batchNumber, "VID-NEW");
reject(applyReceive(received, receipt, "Test pharmacist", today), /already exists/);
reject(applyReceive(inactive, receipt, "Test pharmacist", today), /Reactivate/);
reject(applyReceive(initialInventory, { ...receipt, quantity: 0.5 }, "Test", today), /whole/);
reject(applyReceive(initialInventory, { ...receipt, costPrice: Infinity }, "Test", today), /Cost/);
reject(applyReceive(initialInventory, { ...receipt, receivedDate: "2026-11-10" }, "Test", today), /Received date/);
reject(applyReceive(initialInventory, { ...receipt, receivedDate: "2026-10-01", expiryDate: "2026-11-08" }, "Test", today), /Expired/);
reject(applyReceive(initialInventory, { ...receipt, expiryDate: "2027-02-29" }, "Test", today), /Expiry date/);
reject(applyReceive(initialInventory, { ...receipt, reason: " " }, "Test", today), /reason/);
const recordedReceipt = expectState(applyReceive(initialInventory, { ...receipt, supplier: "  " }, "Test", today, "2026-11-09T04:00:00.000Z"));
assert.equal(recordedReceipt.batches.at(-1).supplier, "", "Supplier may be left blank");
assert.equal(recordedReceipt.movements.at(-1).createdAt, "2026-11-09T04:00:00.000Z");
const timedAdjustment = expectState(applyAdjustment(recordedReceipt, {
  batchId: recordedReceipt.batches.at(-1).id, type: "increase", quantity: 2, reason: "Recount",
}, "Test", today, "2026-11-09T04:01:00.000Z"));
assert.ok(Date.parse(timedAdjustment.movements.at(-2).createdAt) < Date.parse(timedAdjustment.movements.at(-1).createdAt), "Actual timestamps retain within-day movement order");
expectState(applyReceive(initialInventory, receipt, "Test", today, "2026-11-08T20:00:00.000Z"));
reject(applyReceive(initialInventory, receipt, "Test", today, "invalid"), /timestamp/);
reject(applyReceive(initialInventory, receipt, "Test", today, "2026-11-09T23:00:00.000Z"), /timestamp/);

const source = initialInventory.batches.find((batch) => batch.productId === "p01" && batch.batchNumber === "VID-2608" && batch.branchId === "b1");
const change = { batchId: source.id, type: "decrease", quantity: 3, reason: "Count correction" };
const decreased = expectState(applyAdjustment(initialInventory, change, "Test", today));
assert.equal(decreased.batches.find((batch) => batch.id === source.id).quantity, source.quantity - 3);
assert.equal(decreased.movements.at(-1).quantity, -3);
reject(applyAdjustment(initialInventory, { ...change, quantity: source.quantity + 1 }, "Test", today), /exceeds/);
reject(applyAdjustment(initialInventory, { ...change, quantity: -2 }, "Test", today), /above zero/);
reject(applyAdjustment(initialInventory, { ...change, reason: "" }, "Test", today), /reason/);
const expired = initialInventory.batches.find((batch) => batch.expiryDate && batch.expiryDate < today);
reject(applyAdjustment(initialInventory, { ...change, batchId: expired.id }, "Test", today), /only be written off/);
const written = expectState(applyAdjustment(initialInventory, { ...change, type: "write_off", batchId: expired.id, quantity: expired.quantity }, "Test", today));
assert.equal(written.batches.find((batch) => batch.id === expired.id).quantity, 0);
assert.equal(written.movements.at(-1).quantity, -expired.quantity);

const transfer = { ...change, type: "transfer", toBranchId: "b2", quantity: 4 };
const beforeJson = JSON.stringify(initialInventory);
const transferred = expectState(applyAdjustment(initialInventory, transfer, "Test", today));
assert.equal(JSON.stringify(initialInventory), beforeJson, "Transitions must not mutate the starting state");
assert.equal(transferred.batches.length, initialInventory.batches.length, "Matching destination batch merges safely");
assert.equal(productQuantity("p01", transferred.batches, today), productQuantity("p01", initialInventory.batches, today));
assert.deepEqual(transferred.movements.slice(-2).map((item) => [item.type, item.quantity]), [["transfer_out", -4], ["transfer_in", 4]]);
assert.notEqual(transferred.movements.at(-2).id, transferred.movements.at(-1).id);
const timedTransfer = expectState(applyAdjustment(initialInventory, transfer, "Test", today, "2026-11-09T05:10:00.000Z"));
assert.deepEqual(timedTransfer.movements.slice(-2).map((item) => item.createdAt), ["2026-11-09T05:10:00.000Z", "2026-11-09T05:10:00.000Z"]);
reject(applyAdjustment(initialInventory, transfer, "Test", today, "2026-11-08T02:00:00.000Z"), /timestamp/);
const newDestination = expectState(applyAdjustment(initialInventory, { ...transfer, toBranchId: "b5" }, "Test", today));
assert.equal(newDestination.batches.length, initialInventory.batches.length + 1);
const transferredBatch = newDestination.batches.at(-1);
for (const key of ["productId", "batchNumber", "costPrice", "receivedDate", "expiryDate", "supplier"]) {
  assert.equal(transferredBatch[key], source[key], `Preserve ${key}`);
}
reject(applyAdjustment(initialInventory, { ...transfer, toBranchId: "b1" }, "Test", today), /different/);
const mismatch = clone(initialInventory);
mismatch.batches.find((batch) => batch.productId === "p01" && batch.batchNumber === "VID-2608" && batch.branchId === "b2").costPrice += 1;
reject(applyAdjustment(mismatch, transfer, "Test", today), /different receipt/);

for (const corrupt of [
  (state) => { state.version = 2; },
  (state) => { state.products[0].sellingPrice = NaN; },
  (state) => { state.products[0].rxRequired = "yes"; },
  (state) => { state.products[0].categoryId = "unknown"; },
  (state) => { state.products[1].sku = state.products[0].sku.toLowerCase(); },
  (state) => { state.batches[0].quantity = -1; },
  (state) => { state.batches[0].expiryDate = "2027-02-29"; },
  (state) => { state.batches[0].productId = "missing"; },
  (state) => { state.batches[0].branchId = "b9"; },
  (state) => { state.batches.push({ ...state.batches[0], id: "duplicate-batch" }); },
  (state) => { state.movements[0].quantity *= -1; },
  (state) => { state.movements[0].balanceAfter += 1; },
  (state) => { state.movements[0].createdAt = "2027-02-29T00:00:00Z"; },
]) {
  const state = clone(initialInventory);
  corrupt(state);
  assert.equal(isInventoryState(state), false, "Reject malformed persisted state");
}
assert.equal(isInventoryState(null), false);
assert.equal(isInventoryState({ version: 1, products: [], batches: [], movements: [] }), true);
const { selectCatalog, cartStockIssue } = loadTs(path.join(__dirname, "..", "src/lib/catalog.ts"));
const { selectInventoryReports } = loadTs(path.join(__dirname, "..", "src/lib/inventory-reports.ts"));
const catalogBefore = selectCatalog(initialInventory, today);
const meterBefore = catalogBefore.find((product) => product.id === "p08");
assert.equal(meterBefore.stock, "low");
assert.equal(meterBefore.availableQuantity, 3);
assert.equal(selectCatalog(initialInventory, today, "b1").find((product) => product.id === "p08").availableQuantity, 2);
assert.equal(selectCatalog(initialInventory, today, "b4").find((product) => product.id === "p08").availableQuantity, 1);
const meterReceipt = expectState(applyReceive(initialInventory, {
  productId: "p08", branchId: "b1", batchNumber: "PRO-REGRESSION", quantity: 7, costPrice: 4000,
  receivedDate: today, expiryDate: null, supplier: "Test supplier", reason: "Restock Prodigy meter",
}, "Test", today));
const meterAfter = selectCatalog(meterReceipt, today).find((product) => product.id === "p08");
assert.equal(meterAfter.availableQuantity, 10);
assert.equal(meterAfter.stock, "in_stock", "Receiving stock must replace the fixed storefront low-stock label");
assert.equal(meterAfter.image, meterBefore.image, "Keep product photos and presentation metadata");
assert.equal(meterAfter.warrantyMonths, 24);
assert.equal(selectCatalog(meterReceipt, today, "b1").find((product) => product.id === "p08").availableQuantity, 9);
assert.equal(selectCatalog(meterReceipt, today, "b4").find((product) => product.id === "p08").stock, "low", "An unrelated branch's shortage remains visible");
assert.equal(cartStockIssue([{ productId: "p08", qty: 4 }], catalogBefore)?.includes("Only 3 units"), true);
assert.equal(cartStockIssue([{ productId: "p08", qty: 4 }], selectCatalog(meterReceipt, today)), null);
assert.match(cartStockIssue([{ productId: "p08", qty: 1 }], selectCatalog(meterReceipt, today, "b2")), /out of stock/, "Pickup must check the selected branch");
assert.match(cartStockIssue([{ productId: "p21", qty: 1 }], catalogBefore), /out of stock/);
assert.match(cartStockIssue([{ productId: "missing", qty: 1 }], catalogBefore), /no longer available/);
assert.equal(selectCatalog(initialInventory, today, "b1").find((product) => product.id === "p01").availableQuantity, 42, "Public quantities exclude expired stock");
const meterProduct = meterReceipt.products.find((product) => product.id === "p08");
const editedMeter = expectState(applyProduct(meterReceipt, { ...meterProduct, name: "Updated Prodigy meter", sellingPrice: 6500 }, "p08"));
const editedPublic = selectCatalog(editedMeter, today).find((product) => product.id === "p08");
assert.equal(editedPublic.name, "Updated Prodigy meter");
assert.equal(editedPublic.price, 6500, "Cart and public catalogue use the inventory selling price");
assert.equal(editedPublic.originalPrice, undefined, "An obsolete offer price must not become a false discount");
const higherThreshold = expectState(applyProduct(meterReceipt, { ...meterProduct, reorderLevel: 10 }, "p08"));
assert.equal(selectCatalog(higherThreshold, today).find((product) => product.id === "p08").stock, "low", "Stock equal to the reorder level remains low");
const hiddenMeter = expectState(applyProduct(meterReceipt, { ...meterProduct, isActive: false }, "p08"));
assert.equal(selectCatalog(hiddenMeter, today).some((product) => product.id === "p08"), false);
const rxMeter = expectState(applyProduct(meterReceipt, { ...meterProduct, rxRequired: true }, "p08"));
assert.equal(selectCatalog(rxMeter, today).some((product) => product.id === "p08"), false, "Prescription items cannot enter the public cart");
const addedProductState = expectState(applyProduct(initialInventory, { ...meterProduct, sku: "MZ-NEW-METER", name: "New glucose meter" }));
const newProduct = addedProductState.products.at(-1);
assert.equal(selectCatalog(addedProductState, today).find((product) => product.id === newProduct.id).stock, "out");
assert.equal(selectCatalog(addedProductState, today).find((product) => product.id === newProduct.id).tag, "new");
assert.equal(selectCatalog(addedProductState, today).some((product) => product.id === "rx01"), false);

const beforeReports = selectInventoryReports(initialInventory, today);
const afterReports = selectInventoryReports(meterReceipt, today);
const shortageContainsMeter = (reports) => reports["reorder-shortage"].preview.rows.some((row) => row[1] === meterBefore.name);
assert.equal(shortageContainsMeter(beforeReports), true);
assert.equal(shortageContainsMeter(afterReports), false, "The report must clear the same shortage as the shop");
const stockRow = afterReports["current-stock"].preview.rows.find((row) => row[1] === meterBefore.name);
assert.equal(stockRow[2], "10");
assert.equal(stockRow[4], "in stock");
assert.equal(shortageContainsMeter(selectInventoryReports(meterReceipt, today, "b4")), true);
assert.equal(afterReports["batch-traceability"].preview.rows.some((row) => row[2] === "PRO-REGRESSION"), true);
assert.equal(afterReports["expiry-report"].preview.rows.some((row) => row[1] === meterBefore.name), false, "Non-expiring devices do not appear in expiry alerts");
assert.equal(selectInventoryReports(written, today)["shrinkage-adjustments"].preview.rows.length, 1);
assert.equal(selectInventoryReports(written, today, "all", `${today}T00:00`, `${today}T00:00`)["shrinkage-adjustments"].preview.rows.length, 1, "Date filtering uses Colombo time and includes the final minute");
assert.equal(selectInventoryReports(written, today, "all", `${today}T00:01`)["shrinkage-adjustments"].preview.rows.length, 0);
assert.equal(JSON.stringify(initialInventory), beforeJson, "Selectors and catalogue integration must preserve seed data");
console.log("Inventory domain and integration checks passed: expiry, validation, transfers, Prodigy restocking, branch availability, catalogue edits, cart stock checks and live inventory reports.");
