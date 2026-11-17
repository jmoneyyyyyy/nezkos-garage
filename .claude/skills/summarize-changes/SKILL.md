---
name: summarize-changes
description: Summarize all uncommitted changes into a single-line commit message. Use when the user wants a one-line summary of their changes for a commit.
---

# Summarize changes into a one-line commit message

1. Run `git status --short` and `git diff HEAD` to see staged and unstaged
   changes. Include untracked files from the status output, reading them if
   their purpose isn't clear from the name.
2. Ignore noise such as `package-lock.json` churn unless it is the only change.
3. Write one line, imperative mood (e.g. "Add timing belt service type"),
   under about 72 characters, no trailing period.
4. Cover the overall intent, not a list of files. If the changes are unrelated,
   name the main one and don't enumerate the rest.
5. Match the repo's style: `git log --oneline -5` shows short, plain,
   sentence-case messages.
6. Output only the line. Do not commit, stage, or push unless asked.
