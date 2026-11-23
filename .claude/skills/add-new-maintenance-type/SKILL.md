---
name: add-service-type
description: Add a new maintenance service type (e.g. "timing_belt") to the Nezko's Garage app. Use when the user wants a new option in the service type dropdown.
---

# Add a new maintenance service type

Service types are defined in `ui/src/types/vehicle.ts`.

1. Add the snake_case key to the `MAINTENANCE_TYPES` array, before `"other"`.
2. Add a matching human-readable label to `MAINTENANCE_LABELS`.
3. Keep both in the same order so the dropdown reads consistently.
4. Run `npm run build` from `ui/` to confirm the types still compile
   (`MAINTENANCE_LABELS` is a `Record`, so a missing label is a compile error).
5. Do not change Firestore rules. They don't enumerate types.