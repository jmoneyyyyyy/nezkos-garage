# Nezko's Garage

Personal web app for tracking maintenance on family vehicles.

## Stack
- `ui/`: React + TypeScript, built with Vite
- Data and auth: Firebase (Firestore + Google sign-in), accessed directly
  from the browser. There is no backend server.
- Server state: TanStack Query
- Routing: React Router (`ui/src/routes.tsx`); `AppLayout` renders the shared
  `Header` plus the matched page via `<Outlet />`. Routes: `/` (landing,
  public), `/vehicles` (signed-in only); guards are in `ui/src/components/routing/RouteGuards.tsx`
- Hosting: AWS Amplify, auto-deploys on push to `main` (config in `amplify.yml`)
- Domain: `nezkos-garage.com`, registered and managed in Route 53

## Status
- Built: Google sign-in, add vehicle form, vehicle list
- Not built yet: vehicle detail page and maintenance history (add/edit/delete)

## Commands (run from `ui/`)
- `npm run dev`: local dev server
- `npm run build`: type-check (`tsc -b`) and build; must pass before pushing
- `npm run lint`

## Data model
- Firestore collection `vehicles`; each doc has an `owners` array of uids
  and an embedded `maintenance` array
- Maintenance entry dates are `"YYYY-MM-DD"` strings, not Timestamps
- Entry ids come from `newId()` in `ui/src/lib/id.ts`
- Service types live in `MAINTENANCE_TYPES` / `MAINTENANCE_LABELS`
  in `ui/src/types/vehicle.ts`

## Conventions
- Code is organized by layer under `ui/src/`:
  `components/<area>/` (layout, common, routing, vehicles), `pages/` (one per
  route), `hooks/`, `context/`, `api/` (Firestore calls), `types/`, `lib/`
  (helpers, firebase), `styles/`. User-facing text lives in `Constants.ts`
- Use `import type` for type-only imports (verbatimModuleSyntax is on)
- Firestore rejects `undefined`; omit optional fields or rely on
  `ignoreUndefinedProperties`

## Deployment
- Every push to `main` triggers an Amplify build; a failed build leaves the
  live site on the last good version
- Build settings are in `amplify.yml` at the repo root (app root is `ui`,
  output is `dist`)
- DNS and the