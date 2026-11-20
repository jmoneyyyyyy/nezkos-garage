---
name: pr-description
description: Write a short pull request description (business context, actual changes, how it fits the end-to-end flow) from the changes made. Use whenever the user asks for a PR description, PR summary, PR body, or "write up these changes", even if they don't say "pull request".
---

# Write a PR description

1. Find the changes to cover, in this order, and use the first that has any:
   - Uncommitted changes: `git status --short` and `git diff HEAD`
     (read untracked files if their purpose isn't clear from the name).
   - Commits on the current branch not on the base: `git log --oneline main..HEAD`
     and `git diff main...HEAD`. Use `origin/main` if the branch is `main`.
   - If neither exists, ask which commits or range to describe.
   If the user names a range or branch, use that instead.
2. Ignore noise such as `package-lock.json` churn and pure file moves, unless
   that is the whole change. For a refactor, say what moved and why rather than
   listing files.
3. Read the code behind the diff when the intent isn't clear. A reviewer
   needs the why, which the diff alone doesn't show.
4. Write exactly these three sections, each a mini paragraph of 2-4 sentences:

   ## Business context
   Why this is needed and who it helps, in plain language a non-engineer would
   follow. Say what problem or goal prompted it, not how it was built.

   ## Actual changes
   What changed, grouped by purpose rather than by file. Name the key files
   or components in backticks, and call out anything a reviewer should watch
   (new dependency, moved files, deleted code, changed behavior).

   ## How it fits into the end-to-end flow
   Where the change sits in the app's path: Google sign-in, landing page or
   `/vehicles`, adding or editing a vehicle, maintenance history, data stored
   in Firestore, deploy through Amplify. Say which step it touches and what the
   user sees before and after. If it needs a manual step to ship (e.g. an
   Amplify setting), say so.

5. Keep it scannable. No bullet lists inside the sections, no restating the
   commit log, and no filler such as "this PR". If a section has nothing real
   to say, give one honest sentence instead of padding.
6. Output only the description. Do not create or push a PR, commit, or edit
   files unless asked. If asked to open the PR, end the body with the
   attribution line required for pull requests in this session.
