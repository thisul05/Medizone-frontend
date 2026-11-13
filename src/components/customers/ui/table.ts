// Compact table styling from the Figma design: a light grey rounded header band inset in
// the card, thin row dividers, 14px text. Wrap tables in `tableWrap` for horizontal scroll.

export const tableWrap = "overflow-x-auto px-5";
export const tableClass = "w-full border-separate border-spacing-0 text-sm leading-5";
export const thClass =
  "bg-(--table-head) px-3 py-3 text-left text-xs leading-4 font-semibold whitespace-nowrap text-(--ink) first:rounded-l-md first:pl-3 last:rounded-r-md";
export const tdClass = "border-b border-(--border) px-3 py-3 align-middle text-(--ink)";
export const rowClass = "transition-colors hover:bg-(--surface-hover) [&:last-child>td]:border-b-0";
