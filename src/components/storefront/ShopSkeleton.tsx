import { PRODUCT_GRID, cx } from "@/components/shared";
import { CONTAINER } from "./Section";

/** Placeholder with the same shape as the shop page, so nothing jumps when products appear. */
export function ShopSkeleton() {
  return (
    <div className={cx(CONTAINER, "min-h-dvh py-8 lg:py-10")} role="status" aria-label="Loading products">
      <div className="mb-3 h-[18px] w-40 rounded-sm bg-surface-sunken" />
      <div className="mb-6 h-[34px] w-56 rounded-sm bg-surface-sunken lg:mb-8" />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
        <div className="h-28 rounded-lg bg-surface-sunken lg:h-96" />
        <div className="flex flex-col gap-4">
          <div className="h-control-md w-full rounded-md bg-surface-sunken" />
          <ul className={PRODUCT_GRID}>
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface-raised">
                <div className="aspect-[4/3] bg-surface-sunken" />
                <div className="flex flex-col gap-2 p-4">
                  <div className="h-4 w-3/4 rounded-sm bg-surface-sunken" />
                  <div className="h-4 w-1/2 rounded-sm bg-surface-sunken" />
                  <div className="mt-4 h-control-md rounded-md bg-surface-sunken" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
