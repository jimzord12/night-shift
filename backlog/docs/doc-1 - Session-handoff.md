---
id: doc-1
title: Session handoff
type: other
created_date: '2026-09-25 18:18'
updated_date: '2026-09-26 19:00'
---
# session-handoff

Read this first on every fresh session, then derive the state from the tasks
(`backlog task list --plain`), Git and evidence; they win when they disagree
with this document. Rewritten in place at the end of every session.

**Written:** 2026-09-26, v8-v10 released after the owner read the v7 report (claude, attended)

## Where things stand
- v10 released and current (55fd855). Since v7: feedback issues read
  better and were tested with a real issue (v8), `night-shift forget` (v9),
  and Morning as an inbox with Closed / Stopped early and the developer's
  side Needs you / Handed over / Nothing left (v10, D22, TASK-23).
- The trial repository is registered in the owner's install and runs the
  installed `night-shift`; its two nights are in `examples/sample-repo/`.
- v10 review loops ended on PASS: code R3, visual R2, design R3.

## Next, in order
1. The owner uses v10 for real and decides what the trial left open:
   TASK-22 (preflight for unattended permissions) and TASK-21 (installing a
   tagged release from a fresh clone).
2. Trends is still a placeholder; what it measures is the owner's call.

## Watch out
- Releases: the branch and the tag must not share a name (`v7` did; the
  tag push failed until the merged branch was deleted).
- Reviewer subagents must set NIGHT_SHIFT_ROOT in the same command as the
  CLI, or they write to the owner's real `~/.night-shift/`.
- Known gap (Note, v10): the opened night ignores a follow-up file that
  exists but cannot be read; its Create button then fails with 409.
