"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { Icon, TextField, cx } from "@/components/shared";
import { products } from "@/data/storefront";
import { formatLKR } from "@/lib/format";

/** Product search with up to 5 keyboard-accessible suggestions. Submits to /shop?q=. */
export function SearchBox({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const term = q.trim().toLowerCase();
  const matches =
    term.length >= 2
      ? products.filter((p) => p.name.toLowerCase().includes(term) || p.brand?.toLowerCase().includes(term)).slice(0, 5)
      : [];
  const showList = open && term.length >= 2;
  const optionCount = matches.length + 1; // plus the "Search for" row

  function go(query: string) {
    setOpen(false);
    setActive(-1);
    onDone?.();
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (showList && active >= 0 && active < matches.length) go(matches[active].name);
    else if (term) go(q);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % optionCount);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? optionCount - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const optionId = (i: number) => `${listId}-opt-${i}`;

  return (
    <form role="search" onSubmit={onSubmit} className="relative w-full">
      <TextField
        label="Search products"
        labelHidden
        size="lg"
        icon="search"
        type="search"
        placeholder="Search vitamins, devices, skincare and brands"
        value={q}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        suffix={
          <button type="submit" aria-label="Search" className="-mr-1.5 flex size-9 items-center justify-center rounded-md bg-primary text-primary-on transition-colors duration-150 hover:bg-primary-hover">
            <Icon name="arrow-right" />
          </button>
        }
      />
      {showList && (
        <ul id={listId} role="listbox" aria-label="Search suggestions" className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-line bg-surface-raised py-1 shadow-2">
          {matches.map((p, i) => (
            <li
              key={p.id}
              id={optionId(i)}
              role="option"
              aria-selected={active === i}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(p.name)}
              className={cx("flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5", active === i ? "bg-primary-tint" : "hover:bg-surface-hover")}
            >
              <span className="truncate text-body">{p.name}</span>
              <span className="shrink-0 text-label text-ink-muted tabular">{formatLKR(p.price)}</span>
            </li>
          ))}
          <li
            id={optionId(matches.length)}
            role="option"
            aria-selected={active === matches.length}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => go(q)}
            className={cx("flex cursor-pointer items-center gap-2 border-t border-line px-4 py-2.5 text-label text-link", active === matches.length ? "bg-primary-tint" : "hover:bg-surface-hover")}
          >
            <Icon name="search" size={16} />
            Search for “{q.trim()}”
          </li>
        </ul>
      )}
    </form>
  );
}
