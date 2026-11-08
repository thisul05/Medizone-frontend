"use client";

import Image from "next/image";
import { useState } from "react";
import { formatLKR } from "@/lib/format";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import StatusBadge from "./StatusBadge";

export type ProductStock = "in_stock" | "low" | "out";

export interface ProductCardProps {
  name: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  /** Category name, shown for screen readers and as a fallback caption. */
  category?: string;
  /** Icon shown in the image area when there is no image or it fails to load. */
  categoryIcon?: IconName;
  stock?: ProductStock;
  /** For prescription items in other modules. The public storefront never sets it. */
  rxRequired?: boolean;
  onAdd?: () => void;
  /** For prescription items in other modules. The public storefront never sets it. */
  onUpload?: () => void;
  note?: string;
  warrantyMonths?: number;
  brand?: string;
  isNew?: boolean;
}

function warrantyText(months: number) {
  if (months % 12 === 0) {
    const years = months / 12;
    return `${years}-year warranty`;
  }
  return `${months}-month warranty`;
}

export function ProductCard({
  name, price, originalPrice, image, category, categoryIcon = "package", stock = "in_stock",
  rxRequired, onAdd, onUpload, note, warrantyMonths, brand, isNew,
}: ProductCardProps) {
  const discount =
    price !== undefined && originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : null;
  const out = stock === "out";
  const [failed, setFailed] = useState(false);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface-raised shadow-1 transition-shadow duration-150 hover:shadow-2">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-surface-sunken">
        {image && !failed ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-contain"
            onError={() => setFailed(true)}
          />
        ) : (
          <Icon name={categoryIcon} size={40} className="text-ink-subtle" />
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {discount !== null ? (
            <span className="inline-flex h-6 items-center rounded-sm bg-sale px-2 mz-caption text-on-solid">
              <span className="sr-only">Save </span>−{discount}%
            </span>
          ) : isNew ? (
            <Badge tone="brand" variant="solid">New</Badge>
          ) : null}
          {rxRequired && <Badge tone="info" icon="file-text">Prescription</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        {brand && <p className="mz-caption text-ink-muted">{brand}</p>}
        <h3 className="line-clamp-2 font-semibold text-ink">{name}</h3>
        {category && <p className="sr-only">Category: {category}</p>}
        {note && <p className="mz-body-sm text-ink-muted">{note}</p>}
        {warrantyMonths ? (
          <p className="flex items-center gap-1.5 mz-body-sm text-ink-muted">
            <Icon name="shield-check" size={16} />
            {warrantyText(warrantyMonths)}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-3 pt-2">
          {price !== undefined && (
            <p className="flex flex-wrap items-baseline gap-x-2 mz-num">
              <span className="mz-price text-ink">{formatLKR(price)}</span>
              {discount !== null && originalPrice && (
                <s className="mz-body-sm text-ink-subtle">
                  <span className="sr-only">Was </span>
                  {formatLKR(originalPrice)}
                </s>
              )}
            </p>
          )}
          <div>
            <StatusBadge kind="stock" status={stock} />
          </div>
          {rxRequired && onUpload ? (
            <Button variant="secondary" block icon="file-text" onClick={onUpload}>
              Upload prescription
            </Button>
          ) : (
            <Button variant="secondary" block disabled={out || !onAdd} onClick={onAdd} aria-label={out ? undefined : `Add to cart: ${name}`}>
              {out ? "Out of stock" : "Add to cart"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

/** 4 / 3 / 2 columns at 1024 / 768 / phone. */
export const PRODUCT_GRID = "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4";
