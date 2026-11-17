# Garage Log

Personal web app for tracking maintenance on family vehicles.

## Stack
- `ui/`: React + TypeScript, built with Vite
- Data and auth: Firebase (Firestore + Google sign-in), accessed directly
  from the browser. There is no backend server.
- Server state: TanStack Query
- Hosting: AWS Amplify, auto-deploys on push to `main` (config in `amplify.yml`)

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
  in `ui/src/features/vehicles/types.ts`

## Conventions
- Feature code goes in `ui/src/features/<feature>/` (api.ts, hooks.ts, components)
- Use `import type` for type-only imports (verbatimModuleSyntax is on)
- Firestore rejects `undefined`; omit optional fields or rely on
  `ignoreUndefinedProperties`

## Security
- Authorization is enforced by Firestore rules, not the client. Any change
  to the data shape needs a matching update to the rules.
- Never commit secrets, service account keys, or `.env` files.

## Gotchas
- New deploy domains must be added to Firebase → Authentication →
  Authorized domains, or Google sign-in fails.