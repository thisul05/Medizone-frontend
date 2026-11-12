# Medizone FE

Frontend prototype for the IS3610 group assignment: an information system for Medizone Pharmacy.
Frontend only: use mock data, no backend.

**Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS

## Run it

```bash
git clone <repo-url>
cd Medizone-frontend
npm install
npm run dev
```

Open http://localhost:3000. Use Node 22 (`nvm use` reads `.nvmrc`).

## Modules and folders

| # | Module | Page folder | Owner |
|---|---|---|---|
| 1 | Login, roles, home | `src/app/login`, `src/app/home` | |
| 2 | Admin dashboard | `src/app/admin` | |
| 3 | Products and inventory | `src/app/inventory` | |
| 4 | Prescriptions and orders | `src/app/orders` | |
| 5 | Customers and loyalty | `src/app/customers` | |
| 6 | Suppliers and purchases | `src/app/suppliers` | |
| 7 | Delivery, returns and warranty | `src/app/delivery` | |
| 8 | Billing and payments | `src/app/billing` | |
| 9 | Staff and payroll | `src/app/staff` | |
| 10 | Reports and forecasting | `src/app/reports` | |

Write the owner's name in the last column once modules are assigned.

## Folder structure

```
src/
  app/<module>/page.tsx       pages of each module (add more routes as subfolders)
  components/<module>/        components used only by that module
  components/shared/          components used by several modules
  data/                       mock data, one file per module (<module>.ts)
  lib/                        helpers
  types/                      shared TypeScript types
```

`src/app/page.tsx` is a temporary index page that links to every module. It will be replaced when the UI is finalized.

## Working on your module

1. Create your branch: `git checkout -b feature/<module>`.
2. Build your pages and components inside your own folders.
3. Install any package you need yourself and list it in your pull request.
4. Run `npm run lint` and `npm run build`, then open a pull request.

Read `CONTRIBUTING.md` before your first pull request.
