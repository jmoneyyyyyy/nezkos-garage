---
name: update-documentation
description: Update README.md, CLAUDE.md, and any other markdown documentation files to reflect the currently staged git changes. Use whenever the user asks to update the docs, update the readme, sync documentation with my changes, or document what I staged, even if they don't name specific files. Does nothing when nothing is staged.
---

# Update documentation from staged changes

1. Check for staged changes first: `git diff --cached --name-only`.
   If the output is empty, stop and say there are no staged changes, so
   nothing was updated. Do not fall back to unstaged or committed changes;
   the user stages what they want documented.
2. Read the staged diff with `git diff --cached`. Ignore noise such as
   `package-lock.json` churn and pure file moves, unless that is the whole
   change (a rename still matters if docs mention the old path).
3. Find the docs to consider: `README.md`, `CLAUDE.md`, and any other
   tracked `*.md` outside `node_modules` and `.claude/skills`
   (`git ls-files '*.md'`). If a staged change touches a skill's folder,
   check whether the docs mention that skill. Read each doc fully before
   deciding anything.
4. Analyze first, edit second. For each staged change, find where it already
   belongs in the docs: the section that lists features, status, commands,
   data model, folder layout, conventions, or deployment. Most changes
   land in an existing section, and some land in none because the docs
   don't cover that level of detail (a small bug fix, a refactor inside one
   file). Leave those docs alone; an unchanged doc is a fine outcome.
5. Edit with the smallest change that makes the docs true:
   - Match the surrounding pattern: same heading level, bullet vs. prose,
     tense, tone, line wrapping, and level of detail as the neighboring
     entries. A new bullet should look like its siblings.
   - Don't over-explain or re-engineer. Add the fact (a route, command,
     field, file, or behavior), not the story of how it was built. Don't
     restructure sections, reword untouched text, or add new sections unless
     the change has no home at all.
   - Fix anything the change made wrong, such as renamed paths, removed
     features, changed commands, or counts. Stale docs are worse than
     missing ones.
   - Update `CLAUDE.md` "Status" and layout lists when a feature or folder is
     added or removed, and keep user-facing wording in the README's voice.
     Leave README sections like "Lessons learned" alone unless the change
     clearly belongs there.
6. Do not commit, and do not stage the doc edits. The user decides when
   to stage them.
7. Report in a few lines: which files changed and what was added or
   corrected in each, plus any docs you considered and left alone. If
   nothing needed updating, say so.
