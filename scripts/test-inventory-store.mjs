/* Run with node scripts/test-inventory-store.mjs. No browser or extra packages are needed. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nodeRequire = createRequire(import.meta.url);
const STORAGE_KEY = "mz.inventory.v1";

function fixture({ stored = null, browser = true, throwRead = false, throwWrite = false } = {}) {
  const storage = new Map(stored === null ? [] : [[STORAGE_KEY, stored]]);
  const events = new Map();
  const failures = { read: throwRead, write: throwWrite };
  const calls = { read: 0, write: 0 };
  const windowMock = browser ? {
    localStorage: {
      getItem(key) {
        calls.read += 1;
        if (failures.read) throw new Error("Storage access is disabled");
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        calls.write += 1;
        if (failures.write) throw new Error("Storage quota exceeded");
        storage.set(key, value);
      },
    },
    addEventListener(type, callback) {
      if (!events.has(type)) events.set(type, new Set());
      events.get(type).add(callback);
    },
    removeEventListener(type, callback) {
      events.get(type)?.delete(callback);
    },
  } : undefined;

  // Give every fixture a fresh module graph and its own window/storage, as separate tabs have.
  const cache = new Map();
  function loadTs(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const result = { exports: {} };
    cache.set(filename, result);
    const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: filename,
    }).outputText;
    const localRequire = (specifier) => specifier.startsWith("@/")
      ? loadTs(path.join(root, "src", `${specifier.slice(2)}.ts`))
      : nodeRequire(specifier);
    new Function("require", "module", "exports", "window", compiled)(localRequire, result, result.exports, windowMock);
    return result.exports;
  }
  const store = loadTs(path.join(root, "src/components/inventory/inventory-store.ts"));
  const { initialInventory } = loadTs(path.join(root, "src/data/inventory.ts"));
  const { selectCatalog } = loadTs(path.join(root, "src/lib/catalog.ts"));
  const { selectInventoryReports } = loadTs(path.join(root, "src/lib/inventory-reports.ts"));
  const { applyReceive } = loadTs(path.join(root, "src/lib/inventory.ts"));
  return {
    ...store, initialInventory, selectCatalog, selectInventoryReports, applyReceive, storage, failures, calls,
    listenerCount: () => events.get("storage")?.size ?? 0,
    externalWrite(state, key = STORAGE_KEY) {
      storage.set(STORAGE_KEY, JSON.stringify(state));
      for (const callback of events.get("storage") ?? []) callback({ key });
    },
    dispatchStorage(key = STORAGE_KEY) {
      for (const callback of events.get("storage") ?? []) callback({ key });
    },
  };
}

function namedState(initialInventory, name) {
  const state = structuredClone(initialInventory);
  state.products[0].name = name;
  return state;
}

// Server snapshots never access browser APIs and remain stable for hydration.
const server = fixture({ browser: false });
assert.equal(server.getInventorySnapshot(), server.getServerInventorySnapshot());
assert.equal(server.getServerInventorySnapshot().inventory, server.initialInventory);
assert.equal(server.calls.read, 0);

// Saving persists the complete state, refreshes the cached snapshot and notifies subscribers.
const saved = fixture();
const initial = saved.getInventorySnapshot();
assert.equal(initial, saved.getInventorySnapshot(), "Snapshot identity must remain stable between changes");
assert.equal(initial.notice, null);
let firstNotifications = 0;
let secondNotifications = 0;
const stopFirst = saved.subscribeInventory(() => { firstNotifications += 1; });
const stopSecond = saved.subscribeInventory(() => { secondNotifications += 1; });
assert.equal(saved.listenerCount(), 1, "One browser storage listener serves all subscribers");
assert.equal(firstNotifications, 0, "Subscribing to unchanged data should not notify");
const stateA = namedState(saved.initialInventory, "Saved product A");
saved.saveInventory(stateA);
assert.deepEqual(JSON.parse(saved.storage.get(STORAGE_KEY)), stateA);
assert.equal(saved.getInventorySnapshot().inventory, stateA);
assert.equal(saved.getInventorySnapshot().notice, null);
assert.equal(firstNotifications, 1);
assert.equal(secondNotifications, 1);
stopFirst();
assert.equal(saved.listenerCount(), 1);
const stateB = namedState(saved.initialInventory, "Saved product B");
saved.saveInventory(stateB);
assert.equal(firstNotifications, 1, "Unsubscribed listeners are not called");
assert.equal(secondNotifications, 2);
stopSecond();
assert.equal(saved.listenerCount(), 0, "Unmounting the final subscriber detaches the browser listener");
const reloaded = fixture({ stored: saved.storage.get(STORAGE_KEY) });
assert.deepEqual(reloaded.getInventorySnapshot().inventory, stateB);
assert.equal(reloaded.getInventorySnapshot().notice, null);

// Another tab can update a mounted store; unrelated storage keys must be ignored.
const live = fixture({ stored: JSON.stringify(stateA) });
live.getInventorySnapshot();
let liveNotifications = 0;
const stopLive = live.subscribeInventory(() => { liveNotifications += 1; });
const liveBefore = live.getInventorySnapshot();
live.externalWrite(stateB, "unrelated.setting");
assert.equal(live.getInventorySnapshot(), liveBefore);
assert.equal(liveNotifications, 0);
live.dispatchStorage();
assert.deepEqual(live.getInventorySnapshot().inventory, stateB);
assert.equal(liveNotifications, 1);
live.storage.delete(STORAGE_KEY);
live.dispatchStorage(null);
assert.equal(live.getInventorySnapshot().inventory, live.initialInventory, "Storage clear restores sample inventory");
assert.equal(liveNotifications, 2);
stopLive();

// Changes made while the module was unmounted are discovered when it is mounted again.
const remount = fixture({ stored: JSON.stringify(stateA) });
remount.getInventorySnapshot();
const stopBeforeNavigation = remount.subscribeInventory(() => {});
stopBeforeNavigation();
remount.externalWrite(stateB); // No mounted listener receives this event.
assert.deepEqual(remount.getInventorySnapshot().inventory, stateA, "The old snapshot is cached while unmounted");
let remountNotifications = 0;
const stopAfterNavigation = remount.subscribeInventory(() => { remountNotifications += 1; });
assert.deepEqual(remount.getInventorySnapshot().inventory, stateB);
assert.equal(remountNotifications, 1, "Remount tells React that storage changed while the module was absent");
stopAfterNavigation();

// Invalid JSON and invalid shapes recover without destroying the original stored value.
for (const invalid of ["{ broken JSON", JSON.stringify({ version: 1, products: [] })]) {
  const corrupt = fixture({ stored: invalid });
  const snapshot = corrupt.getInventorySnapshot();
  assert.equal(snapshot.inventory, corrupt.initialInventory);
  assert.match(snapshot.notice, /could not be read/);
  assert.equal(corrupt.storage.get(STORAGE_KEY), invalid);
  let corruptNotifications = 0;
  const stopCorrupt = corrupt.subscribeInventory(() => { corruptNotifications += 1; });
  corrupt.saveInventory(stateA);
  assert.deepEqual(JSON.parse(corrupt.storage.get(STORAGE_KEY)), stateA, "A successful save replaces invalid data");
  assert.equal(corrupt.getInventorySnapshot().notice, null);
  assert.equal(corruptNotifications, 1);
  stopCorrupt();
}

// Recovery must also work when another tab repairs corrupt data while this screen is absent.
const repaired = fixture({ stored: "[ invalid" });
assert.match(repaired.getInventorySnapshot().notice, /could not be read/);
const stopCorruptScreen = repaired.subscribeInventory(() => {});
stopCorruptScreen();
repaired.externalWrite(stateB);
assert.match(repaired.getInventorySnapshot().notice, /could not be read/);
let repairedNotifications = 0;
const stopRepairedScreen = repaired.subscribeInventory(() => { repairedNotifications += 1; });
assert.deepEqual(repaired.getInventorySnapshot().inventory, stateB);
assert.equal(repaired.getInventorySnapshot().notice, null);
assert.equal(repairedNotifications, 1);
stopRepairedScreen();

// Failed writes retain the latest in-memory edits through storage events and remounts.
const unsaved = fixture({ stored: JSON.stringify(stateA), throwWrite: true });
unsaved.getInventorySnapshot();
let unsavedNotifications = 0;
const stopUnsaved = unsaved.subscribeInventory(() => { unsavedNotifications += 1; });
unsaved.saveInventory(stateB);
assert.equal(unsavedNotifications, 1);
assert.equal(unsaved.getInventorySnapshot().inventory, stateB);
assert.match(unsaved.getInventorySnapshot().notice, /available in this tab/);
assert.deepEqual(JSON.parse(unsaved.storage.get(STORAGE_KEY)), stateA, "A failed write did not persist the edit");
const otherTabState = namedState(unsaved.initialInventory, "Another tab's product");
unsaved.externalWrite(otherTabState);
assert.equal(unsaved.getInventorySnapshot().inventory, stateB, "An external event must not discard unsaved edits");
assert.equal(unsavedNotifications, 1);
stopUnsaved();
const unsavedBeforeRemount = unsaved.getInventorySnapshot();
const stopUnsavedRemount = unsaved.subscribeInventory(() => { unsavedNotifications += 1; });
assert.equal(unsaved.getInventorySnapshot(), unsavedBeforeRemount, "Resubscribing must preserve both unsaved state and its notice");
assert.equal(unsavedNotifications, 1);
unsaved.failures.write = false;
unsaved.saveInventory(stateB);
assert.equal(unsaved.getInventorySnapshot().notice, null, "A successful retry clears the persistence warning");
assert.deepEqual(JSON.parse(unsaved.storage.get(STORAGE_KEY)), stateB);
unsaved.externalWrite(otherTabState);
assert.deepEqual(unsaved.getInventorySnapshot().inventory, otherTabState, "External synchronization resumes after a successful save");
stopUnsavedRemount();

// Read failures expose a recoverable warning; a later remount can read storage again.
const unavailable = fixture({ stored: JSON.stringify(stateA), throwRead: true });
assert.equal(unavailable.getInventorySnapshot().inventory, unavailable.initialInventory);
assert.match(unavailable.getInventorySnapshot().notice, /storage is unavailable/);
const stopUnavailable = unavailable.subscribeInventory(() => {});
stopUnavailable();
unavailable.failures.read = false;
const stopAvailable = unavailable.subscribeInventory(() => {});
assert.deepEqual(unavailable.getInventorySnapshot().inventory, stateA);
assert.equal(unavailable.getInventorySnapshot().notice, null);
stopAvailable();

// Real restocking must propagate through the shared store to catalogue and report subscribers.
const connected = fixture();
const day = "2026-11-09";
let publicMeter;
let shortageRows;
const stopConnected = connected.subscribeInventory(() => {
  const { inventory } = connected.getInventorySnapshot();
  publicMeter = connected.selectCatalog(inventory, day).find((product) => product.id === "p08");
  shortageRows = connected.selectInventoryReports(inventory, day)["reorder-shortage"].preview.rows;
});
const receipt = connected.applyReceive(connected.initialInventory, {
  productId: "p08", branchId: "b1", batchNumber: "PRO-SHARED-STORE", quantity: 10,
  costPrice: 4000, receivedDate: day, expiryDate: null, supplier: "Test", reason: "Regression receipt",
}, "Test", day);
assert.equal(receipt.ok, true);
connected.saveInventory(receipt.state);
assert.equal(publicMeter.stock, "in_stock");
assert.equal(publicMeter.availableQuantity, 13);
assert.equal(shortageRows.some((row) => row[1] === publicMeter.name), false);
const reloadConnected = fixture({ stored: connected.storage.get(STORAGE_KEY) });
assert.equal(reloadConnected.selectCatalog(reloadConnected.getInventorySnapshot().inventory, day).find((product) => product.id === "p08").stock, "in_stock", "Reloading preserves the restock on public screens");
connected.externalWrite(connected.initialInventory);
assert.equal(publicMeter.stock, "low", "Another tab's inventory updates public subscribers");
stopConnected();
console.log("Inventory store checks passed: save/load, subscriptions, cross-tab catalogue/report updates, restock persistence, invalid data recovery and unsaved-change retention.");
