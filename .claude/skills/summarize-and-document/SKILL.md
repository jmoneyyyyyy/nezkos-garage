---
name: summarize-and-document
description: Run both the summarize-changes and update-documentation skills in one go, producing a one-line commit message and updating the README/markdown docs for the staged changes. Use whenever the user asks to summarize and document, wants a commit message and doc updates together, or says "get this ready to commit", even if they don't name either skill.
---

# Summarize changes and update documentation

This skill only combines two existing skills, so it doesn't repeat their
rules. Each one stays the single source of truth for its own behavior.

1. Invoke the `update-documentation` skill first. It stops on its own when
   nothing is staged, and in that case skip its edits but carry on to step 2.
2. Then invoke the `summarize-changes` skill. Running it second means the doc
   edits already exist, but the commit line should still describe the code
   change that was staged, not the doc tweaks that followed from it. Mention
   docs only if they are the whole change.
3. Final output: first the short report from `update-documentation` (files
   changed, or that nothing was staged or needed updating), then the
   commit-message code block from `summarize-changes` last, so it is easy to
   copy. Add nothing else.
4. Do not commit, stage, or push. The doc edits stay unstaged for the user to
   review and stage along with their other changes.
