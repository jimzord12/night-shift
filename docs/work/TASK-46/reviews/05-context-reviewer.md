Context review, TASK-46 (D31), round 5. Snapshot: b273f6f..af12da5 in C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci. I read the round-4 fixes (2f17f60..af12da5) and the touched sections again, then searched the whole repository for the old rule, excluding node_modules, `.night-shift/history` and docs/work.

**The principle I checked against:** a choice that belongs to the owner is never taken silently. During a night, the agent asks when the task cannot go on without the choice, or when a wrong choice would be costly to undo. Otherwise it decides and records the choice with `decide`. Routine technical choices are not recorded. A day session is attended, so the agent asks there.

**Round-4 fixes: all verified**
- **M1:** `docs/practices/task-flow.md:102-105` now states the D31 rule under "In a night". It matches `skills/start-night-shift/SKILL.md:136-139` and the outcome table, where `blocked` needs `blocked_by`.
- **D31 scoped to a night:** `docs/decisions.md:448-451` reads "during a night … a day session asks" and names D1. The entry is still the newest one; no older entry was edited.
- **Ask example:** its `why` now names the cost of undoing a wrong choice (SKILL.md:145). The pdfkit and Safari examples now fall on opposite sides of the rule.
- **Day skill:** the sentence now sits in section 2 and is phrased as an instruction (`do-night-shift-follow-up/SKILL.md:50-51`).
- **"If the developer were here":** it is in the skill (:170) and in the glossary `Agent decision` entry, which spells it "if the `Owner` were there", consistent with the glossary's own terms.
- **Line endings:** 0 CR bytes in all seven files in scope. No real names in the diff.

**Material**

1. **`README.md:17-18` (outside the diff) still states the old rule.**
   - It reads "When it needs a decision, it asks instead of guessing."
   - The Viewer bullet at :19-22 lists answering questions, but not reviewing decisions.
   - This is the public description of what a night file holds and what the Viewer does. After D31, a reader expects every owner choice to come back as a question, and learns nothing about the decision cards or the fact that unreviewed decisions keep the night in the owner's turn.
   - Round 4 found the same kind of leftover restatement in task-flow.md.
   - Smallest fix:
     - :17-18: "When a choice is yours, it asks, or takes it and records it for you to review."
     - :20: "answer the questions and review the agent's decisions with a click".

**Minor**

2. **The round-4 rewraps moved the overflow rather than removing it.** Each short line was joined onto the next, which is now long:
   - `docs/design.md:94` (90 chars)
   - `docs/design.md:250` (105)
   - `docs/design.md:370` (86)
   - `docs/decisions.md:452` (85)
   - `skills/start-night-shift/SKILL.md:171` is now a ragged "here. Not routine"

   Reflow each paragraph as a whole to the surrounding width of about 76.

**Note**

3. **`web/src/Explainer.tsx:27` is a product string with the same claim.** It reads "asks you instead of guessing when a decision is yours." This is the owner-facing explainer in the Viewer. It is code, so it is outside my scope, but it can take the same one-line fix as the README, under code review.
4. **`.claude/skills/start-night-shift/SKILL.md:3,134` still has "Never guess a decision".** These are the installed copies of the skills. As AGENTS.md requires, they refresh on the next release and `night-shift install .`, and are not to be edited by hand. Nothing to do now; it belongs in the release step.
5. **`docs/design.md:362-363`: "asks again instead of guessing" for `waiting` items is correct.** The question was already judged to be the owner's to answer. `docs/decisions.md:12` (D1) is dated and correctly left alone, since D31 now names it.

Verdict: FINDINGS
