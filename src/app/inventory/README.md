# Module 3: Products and inventory

Open `/inventory` after signing in with an owner, senior pharmacist or purchasing-manager demo account from `demo_details.md`. Existing route access rules apply.

## Screens and actions

- **Products:** search by name, generic name, brand or SKU; filter by category, stock level and active state; add/edit products; inspect their batches. SKU comparisons are case-insensitive. Inactive products retain stock and history but cannot receive stock or increase a batch quantity.
- **Stock batches:** receive stock with its product, branch, batch number, quantity, unit cost, received date, optional supplier and optional expiry date. Duplicate batch numbers for the same product and branch are rejected. Use adjustments for count corrections.
- **Expiry alerts:** expired and red-tagged batches appear by default. Orange/yellow tags can be selected. Only batches with remaining units appear in alerts; disposed batches remain in the batch and movement views.
- **Stock movements:** every receipt, count correction, write-off and transfer records its batch, signed quantity, resulting batch balance, reason, actor and Colombo timestamp. Newest movements appear first.

All-branch accounts can select a branch in the existing staff top bar. Branch-assigned accounts see their own branch. Product definitions are shared; stock, value, alerts and history follow the branch view. Quantities and reorder alerts are aggregated when **All branches** is selected; choose an individual branch to inspect its reorder levels. Switching branches closes an open inventory task and resets filters. Transfers are available only between branches the account can manage, and create both outgoing and incoming records.

## Expiry rules

Expiry uses calendar dates in `Asia/Colombo`, independent of the device timezone. A batch remains valid through its expiry date and becomes expired the next day. The stickers follow `docs/UI-STYLE-GUIDE.md`:

| Remaining calendar months | Sticker |
| --- | --- |
| Up to 6, including today | Red |
| Over 6 through 12 | Orange |
| Over 12 through 18 | Yellow |
| Over 18 | Neutral |

Month-end boundaries are clamped to the last valid day. Expired stock is excluded from available quantities and stock value; it may only be written off. Stock value uses purchase cost, not selling price. Non-expiring items use a null expiry date.

## Data and persistence

`src/types/inventory.ts` defines products, batches and movements. `src/data/inventory.ts` seeds all 24 storefront product IDs and three prescription products, with example batches across the shared five branches. `src/lib/inventory.ts` contains immutable calculations and validated state transitions.

The inventory provider saves versioned state in this browser under `mz.inventory.v1`. Updates synchronize through storage events between tabs. Invalid saved data falls back to sample records with a notice. Storage failures keep changes in memory and display a warning. This is a frontend prototype: there is no shared database, and simultaneous edits in multiple tabs are not transactional.

`src/lib/inventory-store.ts` is the shared browser store. `useInventoryState` exposes it to every module. Storefront records supply initial products and presentation metadata (images, tags, warranties); `selectCatalog` derives current names, prices and availability from saved inventory. The homepage, shop, category counts, search suggestions and cart subscribe to these updates. Inactive and prescription products are excluded from the public catalogue. New active, non-prescription products appear in the shop. Available stock excludes expired batches and the low-stock threshold is the product's reorder level.

Public catalogue availability combines all branches. Pickup checkout checks the chosen branch; delivery uses combined stock. Cart quantities cannot exceed available units or the existing 20-unit limit. If an item becomes unavailable or its stock drops below a cart quantity, checkout shows a warning and checks again before the prototype confirmation. This remains a mock checkout and does not deduct inventory or create a real order.

Stock valuation, shortage, expiry, adjustment and batch-traceability reports (including previews and CSV exports) read the same inventory. Reports use the shared five branches. Stock and expiry reports show current balances; date filters apply only to adjustment history. Inventory forecasting includes a validated snapshot of current branch stock when generated; its sales history remains sample data. Sales, turnover and HR reports remain sample data. Orders, billing and suppliers are placeholder pages without transaction workflows; no backend or shared database has been added. Supplier names remain free text.

## Checks

```powershell
node scripts/test-inventory.mjs
node scripts/test-inventory-store.mjs
node scripts/test-inventory-forecast.mjs
npm.cmd run lint
npm.cmd run build
```

The focused Node checks use the project's installed TypeScript and Node assertions; no extra packages are required. Domain checks cover expiry boundaries, dates, stock availability, invalid inputs, immutable updates, transfer conservation, catalogue changes, cart availability and inventory reports. Store checks cover reloads, cross-tab catalogue/report updates, invalid data recovery and storage failure. Forecast checks stub the provider to verify current branch balances and payload validation without external requests.
