---
id: doc-1
title: Session handoff
type: other
created_date: '2026-09-25 18:18'
updated_date: '2026-09-27 21:56'
---
# session-handoff

Read this first on every fresh session, then derive the state from the tasks
(`backlog task list --plain`), Git and evidence; they win when they disagree
with this document. Rewritten in place at the end of every session.

**Written:** 2026-09-28, D24 agreed (the Viewer as a guided journey) and split into TASK-24..36; nothing built yet; v12 still current

## Where things stand
- v12 current (86182b2): History fixes. v11 (7889ba0): `night-shift allow` (D23).
- 2026-09-28: the owner reviewed the whole Viewer journey as a lazy,
  forgetful new user and agreed D24 (docs/decisions.md): one `Owner state`
  per night (Running, New, Needs answers, Ready to save, Waiting for an
  agent, Done) coloured by whose turn it is; an `Inbox` of `Night Report`
  cards; a step track; a Save for the next agent gate (the words "hand
  over" misled the owner); a "let's discuss" answer; file references with
  Show in folder; a desktop notification; keyboard; an open-proposals
  indicator. Docs reviewed by context-reviewer: R1-R3 FINDINGS, all fixed;
  R4 PASS, its Minors fixed.
- GitHub issue #3 (multi-select questions, from the first real Adopter night)
  is filed as TASK-36, an undecided Idea.
- The testing repository's history copies were stale (26-b without answers,
  its follow-up copy missing); refreshed and committed there (0012298, local
  only, no remote). It still runs the v7 skills.

## Next, in order
1. Build D24 in dependency order: TASK-24 (owner states) first, then
   TASK-25 (Inbox), TASK-26 (report page), TASK-28 (save gate), TASK-33
   (notification); TASK-29 carries the one file-shape version change and
   TASK-30 and TASK-26 ship in the same release.
2. The owner decides TASK-36 (multi-select), TASK-22 (preflight) and
   TASK-21 (install from a fresh clone).
3. Trends leaves the navigation (TASK-25); its future stays in TASK-15.

## Watch out
- Releases: the branch and the tag must not share a name.
- Reviewer subagents must set NIGHT_SHIFT_ROOT in the same command as the
  CLI, or they write to the owner's real `~/.night-shift/`.
- Known gap (Note, v10): the opened night ignores a follow-up file that
  exists but cannot be read; its Create button then fails with 409.
- The testing repository's husky pre-commit hook failed when the history
  commit ran from Git Bash here but passed from PowerShell; a night's own
  history commit could hit the same. Unconfirmed: TASK-37 (triage).
