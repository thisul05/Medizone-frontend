# Medizone UI style guide

The shared design rules for the prototype. Read this before building a screen,
so all ten modules look like one system.

Medizone is a pharmacist-run, four-branch pharmacy in Piliyandala. The system
covers the staff tool (billing, inventory, prescriptions, back office) and the
customer pages. It should feel calm, exact and trustworthy, like a well-kept
dispensary counter: navy and white, generous labels, numbers you can check at
a glance.

**Where the code lives**

| File | What it holds |
| --- | --- |
| `src/app/tokens.css` | Every colour, radius, shadow and size, for light and dark |
| `src/app/globals.css` | Maps the tokens onto Tailwind, plus base and type classes |
| `src/lib/status.ts` | The status table: every value's label and tone |
| `src/lib/format.ts` | `formatLKR`, `formatDate`, `formatMonth`, `formatTime`, `formatPhone` |
| `src/components/shared/StatusBadge.tsx` | The one way to render a status |

---

## 1. Principles

- **Clarity over decoration.** Staff work fast at a busy counter. One primary
  action per screen, readable 15px text, numbers in tabular figures.
- **Status is never colour alone.** Every status carries a word as well as its
  colour. Use `StatusBadge`; never hand-roll a coloured pill.
- **Compliance is built in.** Prescription medicines are *prepared and
  collected*, never sold online (NMRA). Never say "Buy" or show a cart for them.
- **Every action answers back.** Saving, moving an order or restoring a backup
  always ends in a toast, a status change or a confirmation modal.

## 2. Content and voice

- Plain English, **sentence case**. Use *you* for customers and direct verbs
  for staff ("Mark as ready", "Stock in").
- Buttons are **verb + object**: *Add to bill*, *Print label*, *Save staff*.
  Never "OK", "Submit" or "Yes".
- **No emoji and no exclamation marks in the staff app.** Customer pages may
  use one where it reads naturally.
- Errors say what to do: "Price must be above zero", "Enter a 10-digit mobile
  number". The error replaces the hint under the field.

| Thing | Format | Helper |
| --- | --- | --- |
| Money | `Rs. 1,250.00` (KPI tiles may drop decimals) | `formatLKR(n)` |
| Dates | Show `4 Nov 2026`, store ISO `2026-11-04` | `formatDate(iso)` |
| Months | Show `Nov 2026`, store `2026-11` | `formatMonth(iso)` |
| Times | Show `7:40 pm`, store `19:40` | `formatTime(t)` |
| Phone | `077 123 4567` | `formatPhone(p)` |
| Ids | `BN-24-0917`, `RX-1042`, `PO-0042` in mono | class `mz-code` |
| Medicines | Keep strength and form: "Amoxicillin 500 mg capsules" | |
| Branches | By name once confirmed; until then "Branch 1–4" (`b1`–`b4`) | |

Store money as a plain number and dates as ISO text. Format only when
displaying, so sorting and arithmetic stay correct.

---

## 3. Colour

The palette starts from the logo. **`logo-navy` #072f68** is the brand: the
primary action colour in light mode, the side navigation in both themes, and
the ground the logo sits on. The cross's **`logo-red`** and the leaf's
**`logo-green`** are identity accents only — **never use them for status**,
because the status reds and greens are tuned for legibility.

| Use | Classes |
| --- | --- |
| Page background | `bg-surface-page` |
| Cards and panels | `bg-surface-raised border border-line` |
| Table heads, read-only fields | `bg-surface-sunken` |
| Hover fill | `bg-surface-hover` |
| Primary text | `text-ink` |
| Secondary text, labels, table headers | `text-ink-muted` |
| Placeholders, timestamps | `text-ink-subtle` |
| Primary button | `bg-primary text-primary-on hover:bg-primary-hover` |
| Selected row, active chip | `bg-primary-tint text-primary-tint-ink` |
| Inline link | `text-link` |

All three text tokens pass 4.5:1 on page, raised and sunken surfaces in both
themes.

### Status tones

Each tone has three tokens: `-bg` (ground), `-ink` (text and icon) and
`-solid` (dots and fills).

| Tone | Means |
| --- | --- |
| `neutral` | Recorded or finished; nothing to do |
| `info` | In progress at the pharmacy |
| `success` | Done, available, paid |
| `warning` | Needs attention soon |
| `danger` | Blocked, overdue, refused |
| `transit` | On its way to the customer |

`success` is a bluish green so it never relies on red-against-green alone.
`warning-solid` is for dots and icons only, never behind text.

### Dark theme

Every token has a dark value. Navy fills become a light blue `primary` with
dark `on-primary` text; the side nav stays logo navy so the PNG logo sits
seamlessly. Switch with `data-theme="dark"` on `<html>`. Because the `@theme`
block uses `inline`, every utility re-resolves automatically — you do not
write `dark:` variants for colour.

---

## 4. Type

**Figtree** for everything, with Noto Sans Sinhala and Noto Sans Tamil in the
stack for customer names and addresses. **IBM Plex Mono for ids only.**

| Class | Size / line | Use |
| --- | --- | --- |
| `mz-display` | 40 / 44 | One per screen at most |
| `mz-h1` | 28 / 34 | Page titles |
| `mz-h2` | 22 / 28 | Sections |
| `mz-h3` | 18 / 24 | Card and modal titles |
| `mz-body-lg` | 17 / 26 | Customer-facing paragraphs |
| *(default)* | 15 / 22 | Body text — already on `body` |
| `mz-body-sm` | 13 / 18 | Secondary lines |
| `mz-label` | 14 / 18 | Field labels and buttons |
| `mz-caption` | 12 / 16 | Badges and timestamps |
| `mz-overline` | 11 / 14 | Uppercase nav headings, KPI labels |
| `mz-kpi` | 30 / 36 | KPI numbers (tabular) |
| `mz-price` | 18 / 24 | Prices (tabular) |
| `mz-code` | 13 / 18 | Ids, in mono |
| `mz-num` | — | Tabular numerals on any element |

**Right-align numbers in tables** and give them `mz-num` so columns line up.
Do not set running text below 13px.

---

## 5. Space, shape and depth

4px base. Tailwind's default spacing scale already matches, so use `p-1` (4px)
through `p-12` (48px) as is. Card padding `p-5`; gaps between cards `gap-6`;
page gutters `px-8` desktop, `px-4` phone.

| Radius | Value | Use |
| --- | --- | --- |
| `rounded-sm` | 6px | Badges, checkboxes |
| `rounded-md` | 10px | Buttons, inputs, toasts |
| `rounded-lg` | 16px | Cards, modals |
| `rounded-pill` | 999px | Status badges, expiry tags |

> These override Tailwind's defaults, so `rounded-md` is 10px here, not 6px.

Depth is quiet: `shadow-1` on cards at rest, `shadow-2` for dropdowns, toasts
and hovered product cards, `shadow-3` for modals only. Prefer a border hairline
to a heavier shadow.

Controls: `h-control-sm` 32px (in tables and filters), `h-control-md` 40px
(default), `h-control-lg` 48px (billing counter, login). Side nav `w-nav`
248px; content fills the viewport fluidly (`--content-max: 100%`) with responsive gutters.

---

## 6. States and motion

- **Focus** is handled globally in `globals.css`: a 2px `focus-ring` outline
  with 2px offset on every focusable element. **Never remove it.** Inside the
  navy nav, wrap with `.mz-on-nav` so the ring turns white.
- **Hover:** fills shift one step. No movement.
- **Disabled:** `disabled:bg-surface-sunken disabled:text-ink-disabled` and a
  `not-allowed` cursor.
- **Loading:** the button keeps its label and shows a spinner. Lists show the
  empty state only after loading finishes.
- **Errors:** field border and message in `text-danger-ink` with an icon; the
  message replaces the hint.
- **Motion:** 120–150ms colour and shadow transitions only. No slides, bounces
  or page animations.

---

## 7. Layout

- **Staff app:** side nav on the left (`w-nav bg-surface-nav`), content on
  `bg-surface-page` spanning full width (`w-full`) with responsive padding, page title `mz-h1` with the primary
  action at the **top right**, then the KPI row, then cards and tables.
- Under 1024px the nav collapses to a top bar; tables scroll horizontally
  inside their card.
- **Customer pages:** white header with the logo on a navy block, product grid
  4 across on desktop and 2 on phone, and an *Upload prescription* path in
  place of checkout for prescription items.
- **Print views** (dispensing label, invoice, payslip): black ink on white,
  body type, no shadows or tints, one page. Put `mz-print` on the printable
  root and `mz-no-print` on anything that should not print.

---

## 8. Iconography

Outline icons on a 24px grid, 1.75 stroke, round caps and joins, drawn in
`currentColor`. The geometry follows [Lucide](https://lucide.dev), so
`lucide-react` fits at the same size and stroke.

- Sizes: 14–16 in badges and small buttons, 18–20 in buttons, fields and nav,
  28 in empty states.
- Icons sit beside words. An icon-only button needs an `aria-label`.
- No emoji, no filled or duotone icons, no illustrations of medicines or people
  in the staff app.

---

## 9. Statuses

Every status value maps to one tone and one label in `src/lib/status.ts`, so
each module says the same thing. Render it with the shared component:

```tsx
import StatusBadge from "@/components/shared/StatusBadge";

<StatusBadge kind="attendance" status={row.state} />;
```

| Module | `kind` | Values |
| --- | --- | --- |
| 3 Inventory | `stock` | `in_stock` · `low` · `out` |
| 4 Orders | `order` | `received` · `preparing` · `ready` · `collected` · `out_for_delivery` |
| 6 Suppliers | `purchaseOrder` | `draft` · `sent` · `partial` · `received` |
| 6 Suppliers | `paymentStage` | `cash_on_delivery` · `post_dated_cheque` · `credit` |
| 6 Suppliers | `invoice` | `due` · `overdue` · `paid` |
| 7 Delivery | `delivery` | `pending` · `out` · `delivered` |
| 7 Returns | `customerReturn` | `requested` · `approved` · `rejected` |
| 7 Warranty | `warranty` | `received` · `sent_to_supplier` · `repaired` · `replaced` · `returned` |
| 8 Billing | `payMethod` | `cash` · `card` · `bank_transfer` · `cod` |
| 9 Staff | `attendance` | `present` · `absent` · `partial` |

The exact labels and tones are in `src/lib/status.ts` — that file is the source
of truth, and this table is a summary.

**Never invent a new colour for a status.** Add the value to `STATUS` with one
of the six tones, in a pull request, and tell the group.

### Expiry tags (module 3)

| Months to expiry | Tag | Classes |
| --- | --- | --- |
| ≤ 6 | Red | `bg-expiry-red text-expiry-on-red` |
| 6–12 | Orange | `bg-expiry-orange text-expiry-on-orange` |
| 12–18 | Yellow | `bg-expiry-yellow text-expiry-on-yellow` |
| > 18 | OK | `bg-neutral-bg text-neutral-ink` |

These recreate the owner's physical stickers and are reserved for expiry.

---

## 10. Class recipes

| Component | Classes |
| --- | --- |
| Primary button | `h-control-md px-4 rounded-md bg-primary text-primary-on font-semibold text-sm hover:bg-primary-hover disabled:bg-surface-sunken disabled:text-ink-disabled` |
| Secondary button | `h-control-md px-4 rounded-md bg-surface-raised text-primary-tint-ink border border-line-strong hover:bg-primary-tint` |
| Danger button | `h-control-md px-4 rounded-md bg-danger-solid text-on-solid` |
| Card | `bg-surface-raised border border-line rounded-lg shadow-1 p-5` |
| Input | `h-control-md px-3 rounded-md bg-surface-raised border border-line-strong text-ink placeholder:text-ink-subtle focus:border-focus` |
| Table head cell | `bg-surface-sunken text-ink-muted text-xs font-semibold px-4 py-2.5 border-b border-line` |
| Numeric cell | `px-4 py-3 text-right mz-num` |
| Side nav | `w-nav bg-surface-nav text-nav-ink mz-on-nav` |
| Nav item | `h-10 px-2.5 rounded-md text-nav-muted hover:text-nav-ink` |
| Nav item (active) | `bg-nav-active text-nav-ink` |

### A page skeleton

```tsx
<main className="w-full px-4 py-6 sm:px-6 lg:px-8">
  <div className="flex items-center justify-between">
    <h1 className="mz-h1">Staff and payroll</h1>
    <button className="h-control-md px-4 rounded-md bg-primary text-primary-on font-semibold text-sm hover:bg-primary-hover">
      Add staff
    </button>
  </div>
  {/* KPI row, then cards and tables */}
</main>
```

---

## 11. Shared files

Put pieces used by several modules in `src/components/shared/`, **through a
pull request, and tell the group first** (see `CONTRIBUTING.md`).

Already there: `StatusBadge`.
Still to build as modules need them: `Button`, `Badge`, `ExpiryTag`,
`TextField`, `Select`, `Checkbox`, `Alert`, `Toast`, `Modal`, `DataTable`,
`Tabs`, `EmptyState`, `KpiCard`, `OrderStepper`, `SideNav`.

If you only need it in your own module, keep it in
`src/components/<module>/` instead.

---

## 12. Adding a token

1. Add the value to **both** theme blocks in `src/app/tokens.css`.
2. Map it in the `@theme inline` block in `src/app/globals.css` under the right
   namespace (`--color-*`, `--radius-*`, `--shadow-*`, `--font-*`).
3. Fixed sizes have no namespace in Tailwind v4 — add them with `@utility`,
   like `h-control-md`.
4. Note it in this file and tell the group.
