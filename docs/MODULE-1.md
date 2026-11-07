# Module 1: website, login, roles and access

Module 1 owns the public website (`/` and `/shop`), sign-in, customer registration, roles, access control and routing. It also owns the shared files the other modules use: `layout.tsx`, `globals.css`, `tokens.css`, `src/components/shared`, `src/types/{roles,auth}.ts` and `src/lib/{access,auth,auth-store,routes,format,cart}`.

> **Prototype, not real security.** There is no backend. Accounts, sessions and the cart live in the browser (`localStorage` / `sessionStorage`), and demo passwords are plain text on purpose.

## Demo accounts

All 14 demo accounts (11 staff, 3 customers) are listed in **[`demo_details.md`](../demo_details.md)** at the project root, with usernames, emails, staff ids, passwords and the modules each can open.

Everyone signs in on the same form at `/login`: the owner, staff and customers. There are no separate staff or customer tabs. The identifier can be a **mobile number, email, username or staff id** (not case-sensitive), and the account decides the role. Customers can also create an account at `/register`; staff accounts are created by the owner.

**Module 5:** the three demo customers have customer ids **`c1`, `c2` and `c3`**. Please reuse these ids in `src/data/customers.ts` so a signed-in customer matches your records. Customers who register in the browser get ids from `c101` upwards.

All names are fictional except the owner, Mr. Yohan.

## Access table

| Module | Owner | Senior pharmacist assistant | Pharmacist assistant / trainee | Purchasing manager | Accountant | Customer |
|---|---|---|---|---|---|---|
| Dashboard `/admin` | Yes | Yes | | | | |
| Inventory `/inventory` | Yes | Yes | | Yes | | |
| Prescriptions `/orders` | Yes | Yes | Yes | | | Yes* |
| Customers `/customers` | Yes | Yes | Yes | | | |
| Suppliers `/suppliers` | Yes | Yes | | Yes | | |
| Delivery & warranty `/delivery` | Yes | Yes | Yes | | | |
| Billing `/billing` | Yes | Yes | Yes | | Yes | |
| Staff & payroll `/staff` | Yes | Yes | | | Yes | |
| Reports `/reports` | Yes | Yes | | | Yes | |

\* Customers keep `orders` in their access list for the group plan, but no Module 1 page links them there.

Every signed-in user can open `/home` and `/profile`. Public pages: `/`, `/shop`, `/login`, `/register`, `/modules`.

The rules live in `src/types/roles.ts` (`access`). Change them there only.

## Your pages are already protected

`RouteGuard` wraps the whole app in the root layout. When someone opens `/billing` (or `/billing/anything`):

- not signed in: they go to `/login?next=%2Fbilling` and come back after signing in,
- signed in without access: they go to `/access-denied?module=billing`,
- otherwise your page renders.

You don't need to add anything. If you want to protect only part of a page, use `AccessGuard`:

```tsx
import { AccessGuard } from "@/components/shared";

<AccessGuard module="inventory">
  <StockAdjustments />
</AccessGuard>
```

**Dev-only notice.** Because guarded pages render in the browser only, `npm run dev` may show "Could not validate that a segment in your UI has instant navigation" for your page. It never affects `npm run build`. To silence it, add this line to your `page.tsx`:

```tsx
export const instant = false;
```

## Using auth in your module

```tsx
"use client";
import { useAuth } from "@/lib/auth";

export function MyPanel() {
  const { user, ready, activeBranchId, can } = useAuth();
  if (!ready || !user) return null; // guarded pages always have a user, but check anyway

  return (
    <p>
      {user.name} ({user.jobTitle}) is working in {activeBranchId === "all" ? "all branches" : activeBranchId}.
      {can("reports") && " They can also open Reports."}
    </p>
  );
}
```

`useAuth()` returns:

| Field | What it is |
|---|---|
| `user` | `SessionUser` (`id, name, role, jobTitle, branchId, username?, email?, phone?, staffId?, customerId?, createdAt`) or `null` |
| `ready` | `false` until browser storage has been read. Render nothing user-specific before then. |
| `activeBranchId` | The branch the user is working in. Staff with `branchId: "all"` pick it in the top bar (`"all"` or `b1`–`b4`). Others always get their own branch. **Filter your branch data by this.** |
| `setActiveBranch(id)` | Changes it (only works for all-branch users). |
| `can(module)` | `true` if the user's role may open that module. |
| `signIn(identifier, password, remember)`, `register`, `signOut` | Used by the Module 1 pages. `signIn` searches every account by mobile number, email, username or staff id. |

Outside React, use the pure helpers in `src/lib/access.ts`: `canOpen(role, module)`, `modulesFor(role)`, `isStaff(role)`.

Branch names: `import { branches, branchName } from "@/data/branches"` (`branchName("all")` gives "All branches").

### Registered customers (Module 5)

```ts
import { getRegisteredCustomers } from "@/lib/auth-store";

// [{ id: "c101", name, phone: "07XXXXXXXX", branchId, isRegular: false, discountPercent: 0, loyaltyPoints: 0 }]
const fromWebsite = getRegisteredCustomers();
```

Merge these with your own mock customers (c1 to c3) in the browser. Full registration details (address, contact channel, consents) are in `getCustomerProfile(customerId)`.

## Shared components

Import everything from `@/components/shared`. Use the token class names from `globals.css` (`bg-primary`, `text-ink-muted`, `border-line`, `rounded-md`, `shadow-1`, `h-control-md`, `text-h1` ...), never raw hex values.

| Component | Props |
|---|---|
| `Icon` | `name, size=20, strokeWidth=1.75, label?, className?`. Names: check, x, info, alert, search, cart, truck, store, users, logout, and more (see `Icon.tsx`). |
| `Button` | `variant: primary \| secondary \| ghost \| danger \| success`, `size: sm \| md \| lg`, `icon?, iconRight?, loading?, block?` plus button props |
| `ButtonLink` | Same look, renders `next/link` |
| `TextField` | `label, hint?, error?, icon?, prefix?, suffix?, size?, optional?, labelHidden?` plus input props |
| `PasswordField` | TextField with a Show / Hide password button |
| `Select` | `label, options: {value,label}[], placeholder?, hint?, error?, size?` plus select props |
| `Checkbox` | `label, description?, error?` plus input props |
| `Alert` | `tone, title?, icon?, action?, children` |
| `Badge` | `tone: neutral \| info \| success \| warning \| danger \| transit \| brand \| loyalty`, `variant: soft \| solid \| outline`, `icon?, dot?` |
| `Tabs` | `tabs: {id,label,count?}[], value, onChange, variant: underline \| pill` |
| `useToast()` | `toast({ tone, title, description?, action? })`. Bottom right, 5 seconds; danger toasts stay. |
| `Logo` | `height=36` (minimum 28) |
| `ProductCard` | `name, price?, originalPrice?, image?, category?, categoryIcon?, stock?, rxRequired?, onAdd?, onUpload?, note?, warrantyMonths?, brand?, isNew?`. Use the `PRODUCT_GRID` class for the 4/3/2 column grid. |
| `StaffTopBar` | Navy top bar with branch picker, name, Profile and Sign out |
| `RouteGuard`, `AccessGuard` | See above |
| `CARD` | The card recipe: `bg-surface-raised border border-line rounded-lg shadow-1 p-5` |

Formatting helpers in `src/lib/format.ts`: `formatLKR(1250)` gives "Rs. 1,250.00", `formatDate("2026-11-04")` gives "4 Nov 2026", `formatPhone("0771234567")` gives "077 123 4567".

## Storage keys

| Key | Where | What |
|---|---|---|
| `mz.session` | `localStorage` with "Keep me signed in", otherwise `sessionStorage` | The signed-in user and `activeBranchId` |
| `mz.accounts` | `localStorage` | Customers who registered in the browser |
| `mz.customerProfiles` | `localStorage` | Their registration details |
| `mz.cart` | `localStorage` | Storefront cart lines `{productId, qty}` |

To reset the prototype, clear site data in the browser.

## Images

Product and category photos are in `public/images/` (`products/p01.jpg` to `p24.jpg`, `categories/<id>.jpg`). They are free-licence photos from Wikimedia Commons, credited in `public/images/CREDITS.md`. Branded products use a generic photo of the same product type. `ProductCard` falls back to the category icon if an image is missing or fails to load. The header logo loads with `priority`; product and category images lazy-load.

## Still to confirm

- Opening hours and WhatsApp number (`src/data/site.ts`, hidden while `null`)
- Locations of Branch 3 and Branch 4 (`src/data/branches.ts`, shown as "Details coming soon")
- The real Facebook page URL (`site.facebook` is a placeholder)
- `/modules` is a temporary page for the team. Remove it before the final demo.
