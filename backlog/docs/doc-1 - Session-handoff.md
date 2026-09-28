---
id: doc-1
title: Session handoff
type: other
created_date: '2026-09-25 18:18'
updated_date: '2026-09-28 12:30'
---
# session-handoff

Read this first on every fresh session, then derive the state from the tasks
(`backlog task list --plain`), Git and evidence; they win when they disagree
with this document. Rewritten in place at the end of every session.

**Written:** 2026-09-28, end of the day session after night 2026-09-28-a: v14 released and current (the Inbox and the Night Report page)

## Where things stand
- v14 current (179e4d0) and switched to; `night-shift install .` re-run.
  A running `night-shift view` shows v14 after a restart. The owner has
  not yet looked at v14 on real nights: that is the open check.
- v14 (D27, TASK-25, TASK-26, both Done): Morning became the Inbox (three
  numbers, Start my morning across all open questions, one card per night
  that is running or the owner's turn, a strip for the rest); each night
  opens on its own Night Report page at `#/night/<repo>/<night>` with
  ← Inbox; navigation is Inbox, Next night, History. Three review rounds
  (code, design, visual), all PASS; reports in docs/work/TASK-25/reviews.
- Part of TASK-31 shipped with it (Start my morning and the numbers); its
  time estimate and the rest stay queued.
- Branches `feat/inbox-report`, `feat/next-night-tab` and
  `night/2026-09-28` are merged; delete them when convenient. A local
  backup tag `backup/feat-next-night-tab-20260928-1030` must never be
  pushed; prune after 30 days.
- This session was the night's session too: the `Meter` writes its cost
  into `.night-shift/history/` when it ends. If `git status` shows it, the
  next session commits it with
  `git commit --only -m "night-shift: history of 2026-09-28-a" -- .night-shift/history`.
- Night feedback F1 (a failed history commit keeps only the hook's last
  line) waits for the owner in the Viewer.
- Evidence tools for the Viewer, under
  `.local/evidence/2026-09-28-owner-states/`: `setup.ts` (synthetic night
  per state and item kind, an unreadable night, a tall compare pair),
  `shots-inbox.mjs`, `r3-fix-walk/` (`walk.mjs` failure walk, `gets.mjs`
  fetch counts, `direct.mjs`). Playwright loads from the agentic-wave
  checkout beside this one.

## Next, in order
1. The owner's look at v14; fix what they find first.
2. D24 in order: TASK-28 (save gate at the end of the deck), TASK-33
   (desktop notification), TASK-27 (step track), TASK-29 (let's discuss;
   carries the file-shape version change). TASK-39 (one-sentence summary)
   and TASK-40 (Viewer polish left from the Inbox review) are small.
3. The owner decides TASK-36 (multi-select), TASK-22 (preflight), TASK-21
   (install from a fresh clone), and whether F1 becomes a task.

## Watch out
- The public repository names no real project: check notes and reports
  before pushing.
- Releases: the branch and the tag must not share a name.
- Reviewer subagents must set NIGHT_SHIFT_ROOT in the same command as the
  CLI, or they write to the owner's real `~/.night-shift/`. Give a visual
  reviewer a committed snapshot: it builds from `git archive` when the
  tree changes under it.
- In this shell, `cd <dir> && <cmd>` chains sometimes fail silently (the
  command rewrite hook), and heredocs with quotes break: use `cd <dir>;
  <cmd>` and write scripts to the scratchpad.
- Deleting anything under `.local/` needs the owner's go (the permission
  settings block it).
- Open review notes: TASK-38 round 2 M1 (a crashed night hides its items
  until a reload), M2 (skipped_follow_ups and the sort untested); TASK-40
  holds the Inbox review's deferred notes.
