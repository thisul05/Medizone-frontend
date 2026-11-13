"use client";

import { useState } from "react";
import { Alert, Badge, Button, Icon, Select, Tabs, TextField, type IconName } from "@/components/shared";
import { branchName } from "@/data/branches";
import { INVENTORY_CATEGORIES } from "@/data/inventory";
import { formatDate, formatLKR } from "@/lib/format";
import { expiryInfo, productQuantity, stockStatus } from "@/lib/inventory";
import type { InventoryProduct, StockBatch } from "@/types/inventory";
import { AdjustmentForm } from "./AdjustmentForm";
import { InventoryModal } from "./InventoryModal";
import { useInventory } from "./InventoryProvider";
import { BatchTable, MovementTable, ProductTable } from "./InventoryTables";
import { ProductForm } from "./ProductForm";
import { ReceiveStockForm } from "./ReceiveStockForm";

type Tab = "products" | "batches" | "expiry" | "movements";
type Dialog = { type: "product"; product?: InventoryProduct } | { type: "receive"; productId?: string } | { type: "adjust"; batchId: string } | { type: "details"; productId: string } | null;
const quantity = (value: number) => value.toLocaleString("en-LK");
const categoryOptions = [{ value: "all", label: "All categories" }, ...INVENTORY_CATEGORIES.map((category) => ({ value: category.id, label: category.name }))];
const expiryOptions = [
  { value: "all", label: "All expiry dates" }, { value: "expired", label: "Expired" },
  { value: "red", label: "Red: up to 6 months" }, { value: "orange", label: "Orange: 6–12 months" },
  { value: "yellow", label: "Yellow: 12–18 months" }, { value: "ok", label: "Over 18 months" }, { value: "none", label: "No expiry date" },
];

export function InventoryView() {
  const { branchId } = useInventory();
  return <InventoryWorkspace key={branchId} />;
}

function InventoryWorkspace() {
  const inventory = useInventory();
  const { products, batches, movements, branchId, today, ready } = inventory;
  const [tab, setTab] = useState<Tab>("products");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState("all");
  const [activity, setActivity] = useState("all");
  const [batchExpiry, setBatchExpiry] = useState("all");
  const [alertExpiry, setAlertExpiry] = useState("action");
  const [dialog, setDialog] = useState<Dialog>(null);

  if (!ready) return <div role="status" className="flex min-h-80 items-center justify-center gap-3 text-ink-muted"><Icon name="loader" className="animate-spin" /> Loading inventory…</div>;

  const scopedBatches = batches.filter((batch) => branchId === "all" || batch.branchId === branchId);
  const stockedBatches = scopedBatches.filter((batch) => batch.quantity > 0);
  const activeProducts = products.filter((product) => product.isActive);
  const lowStock = activeProducts.filter((product) => productQuantity(product.id, scopedBatches, today) <= product.reorderLevel);
  const expired = stockedBatches.filter((batch) => expiryInfo(batch.expiryDate, today).status === "expired");
  const expiring = stockedBatches.filter((batch) => expiryInfo(batch.expiryDate, today).status === "red");
  const stockValue = stockedBatches.reduce((total, batch) => total + (expiryInfo(batch.expiryDate, today).status === "expired" ? 0 : batch.quantity * batch.costPrice), 0);
  const query = search.trim().toLowerCase();
  const productById = new Map(products.map((product) => [product.id, product]));
  const visibleProducts = products.filter((product) => {
    const status = stockStatus(productQuantity(product.id, scopedBatches, today), product.reorderLevel);
    return (category === "all" || product.categoryId === category)
      && (!query || [product.name, product.sku, product.genericName, product.brand].some((value) => value.toLowerCase().includes(query)))
      && (activity === "all" || product.isActive === (activity === "active"))
      && (stock === "all" || (stock === "attention" ? status !== "in_stock" : status === stock));
  });
  function matchesBatch(batch: StockBatch) {
    const product = productById.get(batch.productId);
    return product && (category === "all" || product.categoryId === category)
      && (!query || [product.name, product.sku, product.genericName, product.brand, batch.batchNumber, batch.supplier].some((value) => value.toLowerCase().includes(query)));
  }
  const byExpiry = (a: StockBatch, b: StockBatch) => (a.expiryDate ?? "9999").localeCompare(b.expiryDate ?? "9999");
  const visibleBatches = scopedBatches.filter((batch) => matchesBatch(batch) && (batchExpiry === "all" || expiryInfo(batch.expiryDate, today).status === batchExpiry)).sort(byExpiry);
  const alertBatches = stockedBatches.filter((batch) => {
    const status = expiryInfo(batch.expiryDate, today).status;
    const match = alertExpiry === "action" ? status === "expired" || status === "red"
      : alertExpiry === "all" ? ["expired", "red", "orange", "yellow"].includes(status) : status === alertExpiry;
    return match && matchesBatch(batch);
  }).sort(byExpiry);
  const scopedMovements = movements.filter((movement) => branchId === "all" || movement.branchId === branchId);
  const visibleMovements = scopedMovements.filter((movement) => {
    const product = productById.get(movement.productId);
    const batch = batches.find((item) => item.id === movement.batchId);
    return product && (category === "all" || category === product.categoryId)
      && (!query || [product.name, product.sku, batch?.batchNumber ?? "", movement.reason, movement.performedBy].some((value) => value.toLowerCase().includes(query)));
  }).reverse().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const selectedProduct = dialog?.type === "details" ? productById.get(dialog.productId) : undefined;
  const selectedBatch = dialog?.type === "adjust" ? batches.find((batch) => batch.id === dialog.batchId) : undefined;
  const closeDialog = () => setDialog(null);
  const hasFilters = !!search || category !== "all" || (tab === "products" && (stock !== "all" || activity !== "all"))
    || (tab === "batches" && batchExpiry !== "all") || (tab === "expiry" && alertExpiry !== "action");
  const showing = tab === "products" ? visibleProducts.length : tab === "batches" ? visibleBatches.length : tab === "expiry" ? alertBatches.length : visibleMovements.length;

  function clearFilters() {
    setSearch(""); setCategory("all"); setStock("all"); setActivity("all"); setBatchExpiry("all"); setAlertExpiry("action");
  }
  function openTab(next: Tab) { setTab(next); clearFilters(); }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mz-body-sm text-ink-muted mb-1">Pharmacy / Inventory</p>
          <div className="flex flex-wrap items-center gap-3"><h1 className="mz-h1">Products and inventory</h1><Badge tone="brand" icon="store">{branchName(branchId)}</Badge></div>
          <p className="mt-2 max-w-2xl text-ink-muted">Keep track of products, batch stock and expiry dates across your pharmacy.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon="package" onClick={() => setDialog({ type: "receive" })} disabled={!activeProducts.length}>Receive stock</Button>
          <Button icon="plus" onClick={() => setDialog({ type: "product" })}>Add product</Button>
        </div>
      </div>
      {inventory.storageNotice && <Alert tone="warning" title="Changes may not be saved">{inventory.storageNotice}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Active products" value={quantity(activeProducts.length)} description="Products in the catalogue" icon="package" onClick={() => { openTab("products"); setActivity("active"); }} />
        <SummaryCard label="Available stock value" value={formatLKR(stockValue, { decimals: false })} description="At cost, excluding expired stock" icon="wallet" />
        <SummaryCard label="Low or out of stock" value={quantity(lowStock.length)} description="At or below the reorder level" icon="activity" tone="warning" onClick={() => { openTab("products"); setStock("attention"); setActivity("active"); }} />
        <SummaryCard label="Expiring in 6 months" value={quantity(expiring.length)} description={`${quantity(expired.length)} expired ${expired.length === 1 ? "batch" : "batches"} also need attention`} icon="calendar" tone="danger" onClick={() => openTab("expiry")} />
      </div>

      {expired.length > 0 && <Alert tone="danger" title={`${expired.length} expired ${expired.length === 1 ? "batch needs" : "batches need"} removal`} action={<Button variant="ghost" size="sm" iconRight="arrow-right" onClick={() => { openTab("expiry"); setAlertExpiry("expired"); }}>Review expired stock</Button>}>
        {quantity(expired.reduce((total, batch) => total + batch.quantity, 0))} units are excluded from available stock. Record a disposal when they are removed.
      </Alert>}

      <section aria-label="Inventory records" className="flex flex-col gap-5">
        <div className="overflow-x-auto"><Tabs idBase="inventory" label="Inventory views" value={tab} onChange={(next) => openTab(next as Tab)} className="min-w-max" tabs={[
          { id: "products", label: "Products", count: products.length }, { id: "batches", label: "Stock batches", count: scopedBatches.length },
          { id: "expiry", label: "Expiry alerts", count: expired.length + expiring.length }, { id: "movements", label: "Stock movements", count: scopedMovements.length },
        ]} /></div>

        <div className="rounded-lg border border-line bg-surface-raised p-4 shadow-1">
          <div className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <TextField label="Search inventory" labelHidden icon="search" placeholder={tab === "movements" ? "Product, reason or staff name" : tab === "products" ? "Search product, SKU or brand" : "Search product, batch or supplier"} value={search} onChange={(event) => setSearch(event.target.value)} fieldClassName="sm:col-span-2 xl:col-span-1" />
            <Select label="Category" labelHidden options={categoryOptions} value={category} onChange={(event) => setCategory(event.target.value)} />
            {tab === "products" ? <>
              <Select label="Stock status" labelHidden value={stock} onChange={(event) => setStock(event.target.value)} options={[{ value: "all", label: "All stock levels" }, { value: "attention", label: "Low or out of stock" }, { value: "in_stock", label: "In stock" }, { value: "low", label: "Low stock" }, { value: "out", label: "Out of stock" }]} />
              <Select label="Product activity" labelHidden value={activity} onChange={(event) => setActivity(event.target.value)} options={[{ value: "all", label: "Active and inactive products" }, { value: "active", label: "Active products" }, { value: "inactive", label: "Inactive products" }]} />
            </> : tab === "expiry" ? <Select label="Expiry alert level" labelHidden value={alertExpiry} onChange={(event) => setAlertExpiry(event.target.value)} options={[{ value: "action", label: "Expired and up to 6 months" }, { value: "all", label: "All tagged batches (18 months)" }, ...expiryOptions.filter((option) => ["expired", "red", "orange", "yellow"].includes(option.value))]} fieldClassName="xl:col-span-2" />
              : tab === "batches" ? <Select label="Batch expiry" labelHidden value={batchExpiry} onChange={(event) => setBatchExpiry(event.target.value)} options={expiryOptions} fieldClassName="xl:col-span-2" />
                : <p className="self-center mz-body-sm text-ink-muted xl:col-span-2">Every receipt, adjustment and transfer has a movement record.</p>}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 mz-body-sm text-ink-muted"><span aria-live="polite">{quantity(showing)} {tab === "products" ? "products" : tab === "movements" ? "movements" : "batches"} · {branchName(branchId)}</span>{hasFilters && <button type="button" onClick={clearFilters} className="rounded-sm font-semibold text-link hover:underline">Clear filters</button>}</div>
          {branchId === "all" && tab === "products" && <p className="mt-2 mz-body-sm text-ink-muted">Quantities and reorder alerts are combined across branches. Choose a branch above to review its stock.</p>}
        </div>

        {tab === "expiry" && <ExpiryLegend />}
        <div id={`inventory-panel-${tab}`} role="tabpanel" aria-labelledby={`inventory-tab-${tab}`} tabIndex={0} className="rounded-lg">
          {tab === "products" && <ProductTable products={visibleProducts} batches={scopedBatches} today={today} onView={(productId) => setDialog({ type: "details", productId })} onEdit={(product) => setDialog({ type: "product", product })} />}
          {(tab === "batches" || tab === "expiry") && <BatchTable batches={tab === "expiry" ? alertBatches : visibleBatches} products={products} today={today} onAdjust={(batch) => setDialog({ type: "adjust", batchId: batch.id })} />}
          {tab === "movements" && <MovementTable movements={visibleMovements} products={products} batches={batches} />}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 mz-body-sm text-ink-muted"><span className="flex items-center gap-2"><Icon name="store" size={16} />Demo inventory · {inventory.storageNotice ? "Changes available in this tab" : "Changes saved in this browser"}</span><span>Stock checked on {formatDate(today)} · Asia/Colombo</span></div>

      {dialog?.type === "product" && <ProductForm product={dialog.product} onClose={closeDialog} onSave={inventory.saveProduct} />}
      {dialog?.type === "receive" && <ReceiveStockForm products={products} branchId={branchId} allowedBranches={inventory.receivingBranches} productId={dialog.productId} today={today} onClose={closeDialog} onSave={inventory.receiveStock} />}
      {dialog?.type === "adjust" && selectedBatch && productById.get(selectedBatch.productId) && <AdjustmentForm batch={selectedBatch} product={productById.get(selectedBatch.productId)!} allowedBranches={inventory.allowedBranches} today={today} onClose={closeDialog} onSave={inventory.adjustStock} />}
      {selectedProduct && <InventoryModal title={selectedProduct.name} description={`${selectedProduct.sku} · ${selectedProduct.unit} · ${branchName(branchId)}`} onClose={closeDialog} size="lg">
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface-sunken p-4"><div><p className="mz-body-sm text-ink-muted">Available stock</p><p className="mz-h2 mz-num">{quantity(productQuantity(selectedProduct.id, scopedBatches, today))} <span className="text-sm font-normal text-ink-muted">{selectedProduct.unit}</span></p></div><div className="text-right"><p className="mz-body-sm text-ink-muted">Selling price / {selectedProduct.unit}</p><p className="mz-price">{formatLKR(selectedProduct.sellingPrice)}</p></div></div>
          <div className="flex flex-wrap items-center gap-2"><Badge tone={selectedProduct.isActive ? "success" : "neutral"}>{selectedProduct.isActive ? "Active" : "Inactive"}</Badge>{selectedProduct.rxRequired && <Badge tone="info" icon="file-text">Prescription required</Badge>}<span className="mz-body-sm text-ink-muted">Reorder level: {quantity(selectedProduct.reorderLevel)} {selectedProduct.unit}</span></div>
          <h3 className="mz-h3">Batches in this view</h3>
          <BatchTable batches={scopedBatches.filter((batch) => batch.productId === selectedProduct.id).sort(byExpiry)} products={products} today={today} onAdjust={(batch) => setDialog({ type: "adjust", batchId: batch.id })} />
          <div className="flex flex-wrap justify-end gap-3"><Button variant="secondary" onClick={() => setDialog({ type: "product", product: selectedProduct })}>Edit product</Button><Button icon="plus" disabled={!selectedProduct.isActive} onClick={() => setDialog({ type: "receive", productId: selectedProduct.id })}>Receive stock</Button></div>
        </div>
      </InventoryModal>}
    </div>
  );
}

function SummaryCard({ label, value, description, icon, tone = "brand", onClick }: { label: string; value: string; description: string; icon: IconName; tone?: "brand" | "warning" | "danger"; onClick?: () => void }) {
  const iconTone = tone === "warning" ? "bg-amber-50 text-amber-700 border border-amber-200/60" : tone === "danger" ? "bg-red-50 text-red-700 border border-red-200/60" : "bg-blue-50 text-[#072f68] border border-blue-200/60";
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-wider text-[#46566d] uppercase">{label}</p>
        <span className={`flex size-8 items-center justify-center rounded-lg ${iconTone}`}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0e1b2e] tabular-nums break-words">{value}</p>
      <p className="mt-1 text-xs text-[#46566d]">{description}</p>
    </>
  );
  const className = "rounded-xl border border-gray-200/80 bg-white p-5 text-left shadow-xs";
  return onClick ? <button type="button" onClick={onClick} className={`${className} transition-all duration-150 hover:border-gray-300 cursor-pointer`}>{content}</button> : <div className={className}>{content}</div>;
}

function ExpiryLegend() {
  return <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="mz-label">Expiry sticker guide</p><p className="mt-1 mz-body-sm text-ink-muted">Use the earliest expiry first. Expired stock is excluded from availability.</p></div><div className="flex flex-wrap gap-2"><span className="inline-flex items-center rounded-pill bg-expiry-red px-3 py-1 mz-caption font-semibold text-expiry-on-red">Red · ≤ 6 months</span><span className="inline-flex items-center rounded-pill bg-expiry-orange px-3 py-1 mz-caption font-semibold text-expiry-on-orange">Orange · 6–12 months</span><span className="inline-flex items-center rounded-pill bg-expiry-yellow px-3 py-1 mz-caption font-semibold text-expiry-on-yellow">Yellow · 12–18 months</span></div></div>;
}
