# Contributing

## Branches
- `main` is protected. Never push to it directly.
- One branch per module: `feature/<module>` (for example `feature/inventory`).
- Fix branches: `fix/<short-description>`.

## Commits
Short messages in the present tense, prefixed with the module:
- `inventory: add product list`
- `billing: add invoice view`

## Pull requests
1. Run `git pull origin main` into your branch first.
2. Fill in the PR template.
3. Ask one teammate to review. Merge only after approval.

## Your folders
Edit only the folders of your own module:
- Pages: `src/app/<module>/`
- Components: `src/components/<module>/`
- Mock data: `src/data/<module>.ts`

Shared folders (`src/components/shared`, `src/lib`, `src/types`): add to them through a pull request, and tell the group in the chat. Do not rewrite someone else's file.

## Packages
Install a package only when your module needs it, and write it in your PR under "New packages".
Commit both `package.json` and `package-lock.json`. After a teammate's PR with a new package is merged, run `npm install`.

## Before you push
```bash
npm run lint
npm run build
```
