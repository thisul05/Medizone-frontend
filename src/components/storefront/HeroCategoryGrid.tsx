import Image from "next/image";
import Link from "next/link";
import { getCategory } from "@/data/storefront";

const HERO_CATEGORIES = ["vitamins", "devices", "skincare", "mom-baby"];

/** 2x2 grid of category photos in the hero. Below the text on smaller screens. */
export function HeroCategoryGrid() {
  const tiles = HERO_CATEGORIES.map(getCategory).filter((c) => c?.image);
  return (
    <ul className="grid grid-cols-2 gap-3" aria-label="Popular categories">
      {tiles.map((c) =>
        c ? (
          <li key={c.id}>
            <Link
              href={`/shop?category=${c.id}`}
              className="group relative block aspect-[4/3] xl:aspect-square overflow-hidden rounded-lg border border-line bg-surface-sunken"
            >
              <Image
                src={c.image as string}
                alt=""
                fill
                sizes="(min-width: 1280px) 140px, (min-width: 640px) 30vw, 45vw"
                className="object-cover transition-opacity duration-150 group-hover:opacity-90"
              />
              <span className="absolute bottom-2 left-2 right-2 w-fit max-w-full rounded-sm bg-surface-raised px-2 py-1 mz-body-sm font-semibold text-ink shadow-1">
                {c.name}
              </span>
            </Link>
          </li>
        ) : null,
      )}
    </ul>
  );
}
