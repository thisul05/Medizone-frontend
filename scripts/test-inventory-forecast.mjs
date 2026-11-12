/* Run with node scripts/test-inventory-forecast.mjs. The Gemini response is stubbed; no network calls. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nodeRequire = createRequire(import.meta.url);
const cache = new Map();
let submitted;
let requests = 0;
function loadTs(filename) {
  filename = path.resolve(filename);
  if (cache.has(filename)) return cache.get(filename).exports;
  const compiledModule = { exports: {} };
  cache.set(filename, compiledModule);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: filename,
  }).outputText;
  const require = (specifier) => {
    if (specifier === "next/server") return { NextResponse: { json: (value, options) => Response.json(value, options) } };
    if (specifier === "./_gemini-request") return {
      requestGemini: async (_models, attempt) => ({ response: await attempt("test-model", new AbortController().signal), model: "test-model" }),
    };
    if (specifier.startsWith("@/")) return loadTs(path.join(root, "src", `${specifier.slice(2)}.ts`));
    return nodeRequire(specifier);
  };
  const mockFetch = async (_url, options) => {
    requests += 1;
    submitted = JSON.parse(JSON.parse(options.body).contents[0].parts[0].text);
    return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: "Stubbed inventory analysis" }] } }] });
  };
  new Function("require", "module", "exports", "process", "fetch", compiled)(require, compiledModule, compiledModule.exports,
    { env: { GEMINI_API_KEY: "test-only-placeholder", GEMINI_MODEL: "test-model" } }, mockFetch);
  return compiledModule.exports;
}

const { initialInventory } = loadTs(path.join(root, "src/data/inventory.ts"));
const { inventoryToday, applyReceive } = loadTs(path.join(root, "src/lib/inventory.ts"));
const { FORECAST_HISTORY } = loadTs(path.join(root, "src/data/forecasting.ts"));
const { POST } = loadTs(path.join(root, "src/app/reports/api/forecast/route.ts"));
const today = inventoryToday();
const received = applyReceive(initialInventory, {
  productId: "p08", branchId: "b1", batchNumber: "PRO-FORECAST", quantity: 10, costPrice: 4000,
  receivedDate: today, expiryDate: null, supplier: "Test supplier", reason: "Forecast regression receipt",
}, "Test", today);
assert.equal(received.ok, true);
const payload = { groupId: "inventory", featureId: "reorder", horizon: "30 days", branch: "Miriswaththa", dateRange: "All dates and times", inventory: received.state };
const post = (value) => POST(new Request("http://localhost:3000/reports/api/forecast", { method: "POST", body: JSON.stringify(value) }));
const response = await post(payload);
assert.equal(response.status, 200);
assert.equal((await response.json()).text, "Stubbed inventory analysis");
assert.equal(submitted.currentInventory.products.find((product) => product.id === "p08").availableUnits, 12);
assert.equal(submitted.currentInventory.products.find((product) => product.id === "p08").reorderLevel, 4);
assert.deepEqual(submitted.historicalRecords, FORECAST_HISTORY.inventory, "Live balances do not replace or fabricate sales history");
await post({ ...payload, branch: "All Branches" });
assert.equal(submitted.currentInventory.products.find((product) => product.id === "p08").availableUnits, 13);
await post({ ...payload, branch: "Moratuwa" });
assert.equal(submitted.currentInventory.products.find((product) => product.id === "p08").availableUnits, 1, "Forecasting must respect the selected branch");
const validRequests = requests;
assert.equal((await post({ ...payload, inventory: { version: 1, products: [] } })).status, 400);
assert.equal((await post({ ...payload, branch: "Unknown branch" })).status, 400);
assert.equal((await post({ ...payload, groupId: "revenue" })).status, 400);
assert.equal((await post({ ...payload, dateRange: "x".repeat(250001) })).status, 413);
assert.equal(requests, validRequests, "Invalid inventory must never reach the forecasting provider");
console.log("Inventory forecast checks passed: current stock, branch filtering, sample-history separation and invalid-payload rejection; no external requests.");
