# Medizone-frontend
Strategic information system proposal and prototype for "Medizone (pvt) ltd"

Frontend prototype for the IS3610 group assignment: an information system for Medizone Pharmacy
(four branches). Frontend only: all data is mock data stored in `src/data`.

**Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS

## Run it

```bash
git clone <repo-url>
cd medizone-fe
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Use Node 22 (`nvm use` reads `.nvmrc`).

## Demo login

There is no real backend. On the login page, pick a role. Each role sees a different sidebar.
Staff roles also get a **branch selector** in the top bar (All branches, or one branch).

| Role | Can open |
|---|---|
| Owner | every module |
| Senior pharmacist assistant | every module |
| Pharmacist assistant | home, prescriptions and orders, customers, delivery, billing |
| Purchasing manager | home, inventory, suppliers |
| Accountant clerk | home, billing, staff and payroll, reports |
| Customer | home, prescriptions and orders |

Roles, labels and sidebar rules live in `src/types/index.ts` and `src/lib/nav.ts`.

## Modules and folders

| # | Module | Folder | Owner |
|---|---|---|---|
| 1 | Login, roles, home, branch selector | `src/app/login`, `src/app/(app)/home` | |
| 2 | Admin dashboard | `src/app/(app)/admin` | |
| 3 | Products and inventory (AI: expiry and reorder alerts) | `src/app/(app)/inventory` | |
| 4 | Prescriptions and orders | `src/app/(app)/orders` | |
| 5 | Customers and loyalty (AI: refill reminders) | `src/app/(app)/customers` | |
| 6 | Suppliers and purchases | `src/app/(app)/suppliers` | |
| 7 | Delivery, returns and warranty | `src/app/(app)/delivery` | |
| 8 | Billing and payments | `src/app/(app)/billing` | |
| 9 | Staff and payroll | `src/app/(app)/staff` | |
| 10 | Reports and forecasting | `src/app/(app)/reports` | |

Write the owner's name in the last column once modules are assigned.

## Shared building blocks

- `src/components/ui`: `Button`, `Card`, `Input`, `Badge`, `Table`, `Modal`, `PageHeader`
- `src/components/layout`: `Sidebar`, `Topbar`, `BranchSelector`
- `src/lib/auth.tsx`: fake login. `useAuth()` gives `user`, `login`, `logout`
- `src/lib/branch.tsx`: `useBranch()` gives `selected` (`"all"` or a branch id such as `"b1"`)
- `src/lib/nav.ts`: sidebar items and which roles can see them
- `src/data/branches.ts`: the four branches (replace the placeholder names)
- `src/types/index.ts`: shared types

Use these instead of writing your own buttons and tables, so every module looks the same.

## Writing your module

1. Work only in your folder under `src/app/(app)/<module>/` and put your mock data in `src/data/<module>.ts`.
2. Replace the placeholder `page.tsx`. Add more routes as subfolders (for example `inventory/new/page.tsx`).
3. Give every record a `branchId` and filter it with `useBranch().selected`, so the branch selector works.
4. Match your screens to your Figma wireframes.

## Rules

Read `CONTRIBUTING.md` before your first pull request.
