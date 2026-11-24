# Nezko's Garage

Personal web app for tracking maintenance on family vehicles.

## Stack
- Repo root: React + TypeScript, built with Vite
- Data and auth: Firebase (Firestore + Google sign-in), accessed directly
  from the browser. There is no backend server.
- Server state: TanStack Query
- Routing: React Router (`src/components/routing/AppRoutes.tsx`); `AppLayout` renders the shared
  `Header` plus the matched page via `<Outlet />`. Routes: `/` (landing,
  public), `/vehicles`, `/funds`, `/wishlist` (signed-in only; `TabNav` shows them as tabs); guards are in `src/components/routing/RouteGuards.tsx`
- Hosting: AWS Amplify, auto-deploys on push to `main` (config in `amplify.yml`, managed in amplify)
- Domain: `nezkos-garage.com`, registered and managed in Route 53

## Status
- Built: Google sign-in, vehicle list, add/edit/delete vehicles, vehicle photos,
  maintenance history (add/edit/delete)
- Not built yet: TBD

## Commands
- `npm run dev`: local dev server
- `npm run build`: type-check (`tsc -b`) and build; must pass before pushing
- `npm run lint`

## Data model
- Firestore collection `vehicles`; each doc has an `owners` array of uids
  and embedded `maintenance` and `wishlist` arrays (wishlist items: id, name, link, price)
- Maintenance entry dates are `"YYYY-MM-DD"` strings, not Timestamps
- Entry ids come from `newId()` in `src/lib/id.ts`
- Service types live in `MAINTENANCE_TYPES` / `MAINTENANCE_LABELS`
  in `src/types/vehicle.ts`

## Conventions
- Code is organized by layer under `src/`:
  `components/<area>/` (layout, common, routing, vehicles), `pages/` (one per
  route), `hooks/`, `context/`, `api/` (Firestore calls), `types/`, `lib/`
  (helpers, firebase), `styles/`. User-facing text lives in `Constants.ts`
- Use `import type` for type-only imports (verbatimModuleSyntax is on)
- Firestore rejects `undefined`; omit optional fields or rely on
  `ignoreUndefinedProperties`

## Deployment
- Every push to `main` triggers an Amplify build; a failed build leaves the
  live site on the last good version
- Build settings are in `amplify.yml` managed in amplify