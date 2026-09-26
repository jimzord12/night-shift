---
id: doc-1
title: Session handoff
type: other
created_date: '2026-09-25 18:18'
updated_date: '2026-09-26 14:34'
---
# session-handoff

Read this first on every fresh session, then derive the state from the tasks
(`backlog task list --plain`), Git and evidence; they win when they disagree
with this document. Rewritten in place at the end of every session.

**Written:** 2026-09-26, v6 retired, v7 built, trialled and released (claude, unattended)

## Where things stand
- v7 released and current (b680823): files of a fixed shape, the
  `night-shift` tool, two skills, the Meter and the `Viewer` (D20, D21).
  TASK-18, 19 and 20 are Done. The v6 model is gone from the repository.
- The trial repository (a throwaway todo-list copy, outside this repo) is
  registered in the owner's install and runs the installed `night-shift`.
  Its two nights and follow-ups are also in `examples/sample-repo/`.
- Review loops ended on PASS: code R6, context R4, visual R7, design R7.

## Next, in order
1. The owner uses v7 for real and decides what the trial left open:
   TASK-22 (preflight for unattended permissions) and TASK-21 (installing a
   tagged release from a fresh clone).
2. Trends is still a placeholder; what it measures is the owner's call.

## Watch out
- Releases: the branch and the tag must not share a name (`v7` did; the
  tag push failed until the merged branch was deleted).
- Reviewer subagents must set NIGHT_SHIFT_ROOT in the same command as the
  CLI, or they write to the owner's real `~/.night-shift/`.
- Not verified: sending feedback with `gh` (it creates public issues).
