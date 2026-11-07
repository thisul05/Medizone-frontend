"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon, cx } from "@/components/shared";
import { categories } from "@/data/storefront";
import { NAV_LINKS } from "./nav-links";
import { CONTAINER } from "./Section";

/** Desktop menu row (1024px and up): Shop by category dropdown and the main links. */
export function MainNav() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <nav aria-label="Main" className="hidden border-t border-line bg-surface-raised lg:block">
      <div className={cx(CONTAINER, "flex h-12 items-center gap-6")}>
        <div ref={root} className="relative" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="category-menu"
            onClick={() => setOpen((o) => !o)}
            className="flex h-control-md items-center gap-2 rounded-md bg-primary px-4 mz-label text-primary-on transition-colors duration-150 hover:bg-primary-hover"
          >
            <Icon name="menu" />
            Shop by category
            <Icon name="chevron-down" size={16} />
          </button>
          {open && (
            <ul id="category-menu" className="absolute left-0 top-full z-50 mt-1 w-72 rounded-md border border-line bg-surface-raised py-1 shadow-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/shop?category=${c.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-ink transition-colors duration-150 hover:bg-surface-hover"
                  >
                    <Icon name={c.icon} className="text-ink-subtle" />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ul className="flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="rounded-md px-3 py-2 mz-label text-ink transition-colors duration-150 hover:bg-primary-tint hover:text-primary-tint-ink">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
