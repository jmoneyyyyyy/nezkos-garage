# Nezko's Garage

Personal web app for tracking maintenance on family vehicles.

## Stack
- Repo root: React + TypeScript, built with Vite
- Data and auth: Firebase (Firestore + Google sign-in), accessed directly
  from the browser. There is no backend server; the only server-side piece is
  the daily price-checker Lambda (see Price checker)
- Server state: TanStack Query
- Routing: React Router (`src/components/routing/AppRoutes.tsx`); `AppLayout` renders the shared
  `Header` plus the matched page via `<Outlet />`. Routes: `/` (landing,
  public), `/vehicles`, `/funds`, `/wishlist` (signed-in only; `TabNav` shows them as tabs); guards are in `src/components/routing/RouteGuards.tsx`
- Hosting: AWS Amplify, auto-deploys on push to `main` (config in `amplify.yml`, managed in amplify)
- Domain: `nezkos-garage.com`, registered and managed in Route 53

## Status
- Built: Google sign-in, vehicle list, add/edit/delete vehicles, vehicle photos,
  maintenance history (add/edit/delete)
- Wish list per vehicle, with a daily Lambda price checker and a price drop notice
- Funds page: loan calculator (amount, APR, term, payments made) with monthly payment,
  principal left, total interest, and a chart of interest vs. principal per payment
- Not built yet: TBD

## Commands
- `npm run dev`: local dev server
- `npm run build`: type-check (`tsc -b`) and build; must pass before pushing
- `npm run lint`
- `npm test`: Vitest (jsdom + Testing Library); tests sit next to the code as `*.test.ts(x)`.
  The Lambda's parsing tests are `lambda/price-checker/price.test.mjs` (its runtime deps are
  stubbed via `test.alias` in `vite.config.ts`)

## Data model
- Firestore collection `vehicles`; each doc has an `owners` array of uids
  and embedded `maintenance` and `wishlist` arrays (wishlist items: id, name, link, price, plus
  checker-written optional `currentPrice`, `lastCheckedAt`, `priceError`)
- Maintenance entry dates are `"YYYY-MM-DD"` strings, not Timestamps
- Entry ids come from `newId()` in `src/utils/newId.ts`
- Service types live in `MAINTENANCE_TYPES` / `MAINTENANCE_LABELS`
  in `src/types/vehicle.ts`

## Conventions
- Code is organized by layer under `src/`:
  `components/<area>/` (layout, common, routing, vehicles, wishlist, funds), `pages/` (each route's
  `*Page.tsx`), `hooks/` (`useVehicles`, `useWishlist`, `useAuth`, `useLocalStorageState`), `context/`, `services/` (Firestore calls:
  `vehicles.ts`, `wishlist.ts`), `types/`, `lib/` (Firebase setup), `utils/`
  (helpers, firebase), `styles/`. User-facing text lives in `Constants.ts`
- The loan calculator is client-side only: math in `utils/loan.ts` (`loanInputValidity` is the
  one place for input limits), chart helpers in `utils/chartScale.ts`, and the four inputs are
  kept in `localStorage` via `useLocalStorageState`, not Firestore
- Confirmations (e.g. deletes) use `ConfirmModal` (`components/common/`, built on `Modal`), not
  `window.confirm`; the caller keeps the open state. jsdom lacks `<dialog>.showModal()`, so tests
  that render a `Modal` shim it at the top of the test file
- Use `import type` for type-only imports (verbatimModuleSyntax is on)
- Firestore rejects `undefined`; omit optional fields or rely on
  `ignoreUndefinedProperties`

## Deployment
- Every push to `main` triggers an Amplify build; a failed build leaves the
  live site on the last good version
- Build settings are in `amplify.yml` managed in amplify

## Price checker
- AWS Lambda in `lambda/price-checker/` (Node.js, ES modules, `firebase-admin`),
  triggered daily by EventBridge Scheduler; not deployed by Amplify
- Reads the Firebase service account JSON from Parameter Store (env var
  `SA_PARAM`); never commit it
- For each wishlist item with a link, fetches the page, reads the price from
  JSON-LD, and writes `currentPrice` + `lastCheckedAt` (or `priceError`) back in
  a transaction, merging by item id
- `price` is what the user wants to pay; the UI shows a price drop notice when
  `currentPrice < price`, and a red notice from `priceError`:
  HTTP 401/403/429 = "blocks automated checks", HTTP 404/410 = "page is gone" (`src/utils/priceCheckStatus.ts`)
- `updateWishListItem` keeps the checker's fields unless the link changed
- Deploy by hand: zip `index.mjs`, `package.json`, `node_modules`, upload in the
  Lambda console
- Admin SDK bypasses Firestore rules, so keep the Lambda role limited to
  Parameter Store read and logs
