---
id: doc-1
title: Session handoff
type: other
created_date: '2026-09-25 18:18'
updated_date: '2026-09-27 00:30'
---
# session-handoff

Read this first on every fresh session, then derive the state from the tasks
(`backlog task list --plain`), Git and evidence; they win when they disagree
with this document. Rewritten in place at the end of every session.

**Written:** 2026-09-27, v12 released (History dots + repository badge, design review R3 PASS); v11 before it; first real unattended CVgen night launched (claude, owner asleep)

## Where things stand
- v12 current (86182b2): History fixes only. v11 (7889ba0): `night-shift allow` (D23). Review
  code R1 FINDINGS (F1 Material: rules unproven live) -> fixed; R2 PASS,
  its two Minors fixed. Proof: headless Claude Code with only the generated
  rules (user settings off, dontAsk) runs the tool via Bash and PowerShell
  and writes .night-shift/input.json, launcher and checkout form alike;
  writes elsewhere stay denied (.local/evidence/2026-09-27-allow-proof/).
- CVgen: v10 skills (unchanged in v11), `night-shift allow` run
  (3 rules added to its settings.local.json, nothing else touched).
- 2026-09-27 ~00:20: a headless CVgen night was launched from a supervising
  session (claude -p, --permission-mode auto) on the owner's approved
  decisions of 2026-09-25. Its record is CVgen's first real night: read it
  in the Viewer, and log any friction it filed.
- Since v7: v8 feedback issues, v9 `forget`, v10 Morning as an inbox (D22).

## Next, in order
1. Read the first real CVgen night; turn its friction into tasks. Observed
   already: agents chain commands (`night-shift status; echo ---; ...`),
   which a prefix rule does not match (R2-4); auto mode covered it tonight.
2. The owner uses v11 for real and decides what the trial left open:
   TASK-22 (preflight for unattended permissions) and TASK-21 (installing a
   tagged release from a fresh clone).
3. Trends is still a placeholder; what it measures is the owner's call.

## Watch out
- Releases: the branch and the tag must not share a name (`v7` did; the
  tag push failed until the merged branch was deleted).
- Reviewer subagents must set NIGHT_SHIFT_ROOT in the same command as the
  CLI, or they write to the owner's real `~/.night-shift/`.
- Known gap (Note, v10): the opened night ignores a follow-up file that
  exists but cannot be read; its Create button then fails with 409.
