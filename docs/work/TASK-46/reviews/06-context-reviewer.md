Context review, TASK-46 (D31), round 6. Snapshot: b273f6f..2005f23 in C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci, with the round-5 fixes in af12da5..2005f23. docs/work was skipped as the brief asked.

**The principle I checked against:** an owner's choice is never taken silently. During a night, the agent asks when the task cannot go on without the choice, or when a wrong choice would be costly to undo. Otherwise it decides and records the choice with `decide`. Routine technical choices are not recorded. A day session asks.

**Round-5 fixes: all verified**
- **M1, README:** `README.md:17-18` now reads "When a choice is yours, it asks, or takes it and records it for you to review." The Viewer bullet at :20 now names reviewing the agent's decisions. Both match D31 and the skill.
- **Note 3, Explainer:** `web/src/Explainer.tsx:27` now says the same thing as the README. No wording remains that drops decisions.
- **Rewraps changed no words:** I ran `git diff --word-diff=porcelain af12da5..2005f23` over docs/decisions.md, docs/design.md and skills/. It reports no word added or removed; only line breaks moved. The rewrapped lines at `docs/design.md:94`, `:250` and `:370` and `docs/decisions.md:452` are now within about 80 characters.
- **decisions.md is append-only:** across the whole range, no existing line is removed. D31 is still the last entry and names D1 and D24.
- **Line endings:** 0 CR bytes in all nine files in scope. No real names appear in the round-5 diff.

**Sweep for the old "always ask / never guess" rule**

I searched the whole repository for guess, ask instead, choice/decision is yours, blocked on a question and never taken silently. I excluded node_modules, `.night-shift/history`, docs/work and web/dist. What remains is all correct or out of scope:
- **`docs/decisions.md:12` (D1):** a dated record. D31 names it, so it is correctly left unedited.
- **`docs/design.md:362`:** "asks again instead of guessing" is about `waiting` items. That question was already judged to be the owner's, so the text is correct.
- **`skills/start-night-shift/SKILL.md:3`:** "ask or record each decision taken for the developer instead of guessing" is consistent with D31.
- **`.claude/skills/start-night-shift/SKILL.md:3,134`:** these installed copies still have "Never guess a decision". AGENTS.md says they refresh at release plus `night-shift install .`, so they are out of scope. After the next release, confirm the reinstall happened.
- **`examples/sample-repo/.night-shift/nights/2026-09-26-{a,b}/night.json`:** these are records of a real trial ("You asked me not to guess"). They are dated data, not guidance.
- **`docs/owner.md:69`, `docs/practices/owner.md:29` and `AGENTS.md:140`:** "Ask the owner only for decisions that are theirs" is about day-session conduct with the owner. It does not conflict with D31, which is scoped to a night.
- **`docs/practices/task-flow.md` and `skills/do-night-shift-follow-up/SKILL.md:48-49`:** the round-4 fixes hold.

**Minor**

1. **`skills/start-night-shift/SKILL.md:171-172`: the round-5 reflow left a short line.**
   - Line 171 is now "about. Write to", and line 172 carries on with "`.night-shift/input.json` (`task` may be …".
   - A reader will notice it but will not misread it. The file is copied into every `Adopter`.
   - Smallest fix: join the two lines and reflow the paragraph as one, from "**Record every decision…" to "particular task):", at about 76 columns.

**Note**

2. **`web/src/Explainer.tsx:27`:** the step body is now about 20 characters longer. It is a visible Viewer string, so if the owner wants the design gate on text changes, a quick look at the Explainer at phone width would settle it. It is outside my scope.

Verdict: PASS
