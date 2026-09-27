---
id: doc-1
title: Session handoff
type: other
created_date: '2026-09-25 18:18'
updated_date: '2026-09-27 23:24'
---
# session-handoff

Read this first on every fresh session, then derive the state from the tasks
(`backlog task list --plain`), Git and evidence; they win when they disagree
with this document. Rewritten in place at the end of every session.

**Written:** 2026-09-28, after the first night here (2026-09-28-a): TASK-24 built and reviewed, TASK-37 answered; both on branch `night/2026-09-28`, not merged; v12 still current

## Where things stand
- v12 current (86182b2). `main` is at af507d8.
- Night 2026-09-28-a ran on the installed release and is closed (2 done).
  Its branch `night/2026-09-28` is pushed (last commit: the night's
  history). The Meter writes the session's cost into
  `.night-shift/history/` when the session ends: the next session commits
  that on the night branch first (docs/practices/git.md).
- TASK-24 (Ready): one `Owner state` per night, coloured by whose turn it
  is, on Morning chips, the report and History; a grey "Stopped early: N
  tasks never started" only when it cost work. Review: 4 rounds x code,
  design, visual reviewers; round 4 all PASS, notes only
  (docs/work/TASK-24/reviews, dispositions on the task). Blocked tasks
  are amber now, partial blue, failed red; `--color-blocked` became
  `--color-broken`, `--color-failed` became `--color-agent` (blue).
- TASK-37 (Ready): the Git Bash hook failure was the testing repository's
  own suite (751 tests in its pre-commit hook) with a load-sensitive 5 s
  test that timed out on a cold run; not the shell, not Night Shift.
  Recorded as a limitation with a workaround.
- Night feedback F1 (tool-bug): a failed history commit keeps only the
  hook's last line. Waits for the owner in the Viewer; not a task yet.
- Evidence tools for the Viewer, reusable: `.local/evidence/2026-09-28-owner-states/`
  (`setup.ts` builds one synthetic night per state, `setup.ts <dir> waiting`
  an all-waiting sample; `shots.mjs`, `unreadable-walk.mjs`; Playwright
  from the sibling agentic-wave checkout).

## Next, in order
1. The owner opens night 2026-09-28-a in the Viewer (restart `night-shift view`
   is not needed: it reads files). Once seen, a day session commits the
   Meter's history on the night branch, merges `night/2026-09-28` into
   `main` with `npm run check`, moves TASK-24 and TASK-37 to Done, and
   cuts a release (CHANGELOG entry: owner states, colours, unreadable nights).
2. Then D24 in order: TASK-25 (Inbox; it also owns the phone scroll target
   and the chip-row heading, review notes V7/D1/D2), TASK-26 (report page;
   the truncated "Not started" in the phone grid), TASK-28 (save gate),
   TASK-33 (notification); TASK-29 carries the file-shape version change
   and the discuss clause of the owner state.
3. The owner decides TASK-36 (multi-select), TASK-22 (preflight) and
   TASK-21 (install from a fresh clone), and whether F1 becomes a task.

## Watch out
- Releases: the branch and the tag must not share a name.
- Reviewer subagents must set NIGHT_SHIFT_ROOT in the same command as the
  CLI, or they write to the owner's real `~/.night-shift/`.
- In this shell, `cd <dir> && <cmd>` chains sometimes fail silently (the
  command rewrite hook); use `cd <dir>; <cmd>` or absolute paths.
- Known gap (Note, v10): a follow-up file that exists but cannot be read
  shows the night as Waiting for an agent and its Create button fails
  with 409. Kept deliberately in TASK-24 (round 1, m2).
- Code review notes left open on TASK-24 (N1-N4, round 4): harmless races
  and a local helper; see the report before touching App.tsx's error state.
