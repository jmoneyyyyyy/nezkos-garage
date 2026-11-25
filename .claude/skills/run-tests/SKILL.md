---
name: run-tests
description: Run the Vitest suite with `npm test` and report the result. Use whenever the user asks to run the tests, check that tests pass, verify a change didn't break anything, or says "run tests", "npm test", or "are the tests green", even if they don't name the command.
---

# Run the test suite

1. Run `npm test` from the repo root. It runs Vitest once (`vitest run`) and
   exits, so it is safe to run in the foreground.
2. If the user named a file or test (e.g. "just the vehicles service tests" or the
   "price drop" test), narrow the run instead of running everything:
   - a file: `npx vitest run src/services/vehicles.test.ts`
   - a test name: `npx vitest run -t "price drop"`
3. Report the outcome in one or two lines: files and tests passed or failed
   (e.g. "9 files, 49 tests passed").
4. On failure, list each failing test with its file and the assertion message,
   then say what you think is wrong. Read the failing test and the code under
   test before guessing, and say whether the bug looks like the code or the
   test. Do not edit anything unless asked.
5. Do not use `npm run test:watch`; it never exits.

Tests sit next to the code as `*.test.ts(x)`. The Lambda's parsing tests are
`lambda/price-checker/price.test.mjs`.
