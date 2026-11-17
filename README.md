# Nezko's Garage Log

A personal web app for recording and tracking maintenance and modifications on the family vehicles. Sign in with Google, add a vehicle, and keep a dated history of every service, repair, and mod, with mileage, cost, and notes.

## Features

- Google sign-in; each user only sees vehicles they own
- Add, edit, and delete vehicles (name, make, model, year, mileage, color, trim, VIN, license plate)
- Optional vehicle photo, resized in the browser before saving
- Per-vehicle maintenance log: add, edit, and delete entries
- Predefined service types (oil change, brake pads, spark plugs, and so on) plus `repair`, `modification`, and `other`

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 19 + TypeScript |
| Build tooling | Vite, ESLint |
| Server state | TanStack Query (with React Query Devtools) |
| Database | Cloud Firestore |
| Auth | Firebase Authentication (Google provider) |
| Hosting | AWS Amplify (auto-deploys on push to `main`) |

There is no backend server. The browser talks directly to Firebase, and access control is enforced by Firestore security rules.

## Architecture

### Data model

A single Firestore collection, `vehicles`. Each document holds the vehicle details, an `owners` array of user uids, and the maintenance history as an embedded `maintenance` array:

```
vehicles/{vehicleId}
  name, make, model, year, mileage, color
  trim?, vin?, licensePlate?, photo?   (photo is a JPEG data URL)
  owners: string[]                     (uids allowed to access the vehicle)
  maintenance: [
    { id, type, date, mileage?, cost?, details? }
  ]
  createdAt, updatedAt                 (server timestamps)
```

Notes:

- Maintenance dates are `"YYYY-MM-DD"` strings, not Timestamps.
- Entry ids come from `newId()` in [ui/src/lib/id.ts](ui/src/lib/id.ts).
- Embedding keeps each vehicle's history in a single read. The trade-off is Firestore's 1MB document limit, which the photo shares with the maintenance records. That is why photos are scaled down to at most 800px and re-encoded as JPEG in [ui/src/lib/image.ts](ui/src/lib/image.ts).
- Adding an entry uses `arrayUnion`. Editing or deleting an entry runs in a Firestore transaction (read the array, change it, write it back) so concurrent edits don't clobber each other.

### State management

- **Server state:** TanStack Query. Reads go through the `useVehicles(uid)` query (key `["vehicles", uid]`). Every create, update, and delete is a mutation that invalidates that key on success, so the list refetches.
- **Auth state:** the `useAuth` hook wraps Firebase's `onAuthStateChanged` and exposes `user`, `loading`, `signIn`, and `signOut`.
- **UI state:** local component state (modals, forms). There is no global client store.

### Authorization

Firestore rules, not the client, decide who can read or write a vehicle, based on the `owners` array. The client query filters with `where("owners", "array-contains", uid)`. Any change to the data shape needs a matching update to the rules.

## Project layout

```
ui/
  src/
    main.tsx          App entry: QueryClientProvider + devtools
    App.tsx           Signed-out / signed-in shell
    firebase.ts       Firebase app, Firestore, and Auth setup
    Constants.ts      UI strings
    auth/             useAuth hook
    vehicles/         Vehicle feature
      api.ts            Firestore reads and writes
      hooks.ts          TanStack Query hooks wrapping api.ts
      types.ts          Types, MAINTENANCE_TYPES, MAINTENANCE_LABELS
      *.tsx             VehicleList, VehicleCard, forms, modals, maintenance UI
    components/       Shared components (Modal)
    lib/              id.ts, image.ts helpers
    theme.css         Garage theme
```

## Getting started

Requires Node.js and npm. Run everything from `ui/`:

```sh
cd ui
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production. Must pass before pushing |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the production build locally |

## Deployment

Pushing to `main` triggers an automatic build and deploy on AWS Amplify.

When adding a new deploy domain, add it under Firebase Console → Authentication → Settings → Authorized domains, or Google sign-in will fail on that domain.

## Security

- Never commit secrets, service account keys, or `.env` files.
- The Firebase web config in `ui/src/firebase.ts` identifies the project and is not a secret. Data access is protected by Firestore rules and Authentication.
