"use client";

import { useState, type FormEvent } from "react";
import { Alert, Button, Checkbox, Select, TextField } from "@/components/shared";
import { INVENTORY_CATEGORIES } from "@/data/inventory";
import type { InventoryProduct, ProductInput } from "@/types/inventory";
import { InventoryModal } from "./InventoryModal";

interface ProductFormProps {
  product?: InventoryProduct;
  onClose: () => void;
  onSave: (input: ProductInput, id?: string) => { ok: boolean; error?: string };
}

export function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [genericName, setGenericName] = useState(product?.genericName ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [categoryId, setCategoryId] = useState<ProductInput["categoryId"]>(product?.categoryId ?? INVENTORY_CATEGORIES[0].id);
  const [unit, setUnit] = useState(product?.unit ?? "tablet");
  const [price, setPrice] = useState(product ? String(product.sellingPrice) : "");
  const [reorderLevel, setReorderLevel] = useState(String(product?.reorderLevel ?? 20));
  const [rxRequired, setRxRequired] = useState(product?.rxRequired ?? false);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: Record<string, string> = {};
    if (!name.trim()) found.name = "Enter the product name, strength and form";
    if (!sku.trim()) found.sku = "Enter a unique product code";
    if (!unit.trim()) found.unit = "Enter the unit used to count stock";
    if (!INVENTORY_CATEGORIES.some((category) => category.id === categoryId)) found.categoryId = "Select a product category";
    if (!price.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0) found.price = "Price must be above zero";
    if (!reorderLevel.trim() || !Number.isSafeInteger(Number(reorderLevel)) || Number(reorderLevel) < 0) found.reorderLevel = "Enter a whole number of zero or more";
    setErrors(found);
    setError(undefined);
    if (Object.keys(found).length) {
      const field = event.currentTarget.elements.namedItem(Object.keys(found)[0]);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    const result = onSave({ name: name.trim(), sku: sku.trim().toUpperCase(), genericName: genericName.trim(), brand: brand.trim(), categoryId, unit: unit.trim(), sellingPrice: Number(price), reorderLevel: Number(reorderLevel), rxRequired, isActive }, product?.id);
    if (result.ok) onClose();
    else setError(result.error ?? "The product could not be saved. Check the details and try again.");
  }

  return (
    <InventoryModal title={product ? "Edit product" : "Add product"} description="Manage the product details used across branches. Stock is recorded separately by batch." onClose={onClose}>
      <form onSubmit={save} onInvalid={(event) => {
        const input = event.target as HTMLInputElement;
        setErrors((current) => ({ ...current, [input.name]: input.validationMessage }));
      }}>
        <div className="flex flex-col gap-5 px-5 py-5 sm:px-6">
          {error && <Alert tone="danger">{error}</Alert>}
          <TextField name="name" label="Product name" placeholder="Paracetamol 500 mg tablets" value={name} onChange={(event) => setName(event.target.value)} required maxLength={160} error={errors.name} hint="Include the strength and dosage form for medicines." />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="sku" label="Product code (SKU)" placeholder="MED-PARA-500" value={sku} onChange={(event) => setSku(event.target.value)} required maxLength={48} error={errors.sku} className="mz-code" />
            <Select name="categoryId" label="Category" options={INVENTORY_CATEGORIES.map((category) => ({ value: category.id, label: category.name }))} value={categoryId} onChange={(event) => setCategoryId(event.target.value as ProductInput["categoryId"])} required error={errors.categoryId} />
            <TextField name="genericName" label="Generic name" optional placeholder="Paracetamol" value={genericName} onChange={(event) => setGenericName(event.target.value)} maxLength={120} />
            <TextField name="brand" label="Brand" optional placeholder="Manufacturer or brand" value={brand} onChange={(event) => setBrand(event.target.value)} maxLength={120} />
            <TextField name="unit" label="Stock unit" placeholder="tablet, bottle, box" value={unit} onChange={(event) => setUnit(event.target.value)} required maxLength={40} error={errors.unit} hint="Receive and adjust stock using this unit." />
            <TextField name="price" label="Selling price per unit" type="number" min="0.01" step="0.01" prefix="Rs." value={price} onChange={(event) => setPrice(event.target.value)} required error={errors.price} />
            <TextField name="reorderLevel" label="Reorder level" type="number" min="0" step="1" value={reorderLevel} onChange={(event) => setReorderLevel(event.target.value)} required error={errors.reorderLevel} hint="A low-stock alert appears at or below this quantity." />
          </div>
          <div className="flex flex-col gap-4 rounded-md border border-line bg-surface-sunken p-4">
            <Checkbox label="Prescription required" description="Identify medicines that require a prescription." checked={rxRequired} onChange={(event) => setRxRequired(event.target.checked)} />
            <Checkbox label="Active product" description="Inactive products keep their stock history and cannot receive new stock." checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-line bg-surface-sunken px-5 py-4 sm:px-6">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" icon="check">Save product</Button>
        </div>
      </form>
    </InventoryModal>
  );
}

export default ProductForm;
