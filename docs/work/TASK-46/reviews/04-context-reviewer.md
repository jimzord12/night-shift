Context review, TASK-46 (D31), round 4. Snapshot: b273f6f..2f17f60 in C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci. I read the round-3 fixes (bdd05d5..2f17f60), then the whole scope again, then the files that restate it.

**The principle I checked against:** an owner's choice is never taken silently. At night, the agent asks when the task cannot go on without the choice, or when a wrong choice would be costly to undo. Otherwise it decides and records with `decide`. Routine technical choices are not recorded. A day session is attended, so the agent asks there. A disagreement reaches the next agent.

**Round-3 fixes: all verified**
- **M1:** The discriminator is the same in `skills/start-night-shift/SKILL.md:136-139` and D31 (`docs/decisions.md:447-451`). D31 names D24. The pdfkit decide example is cheap to undo and fits the rule. The Safari ask example also fits, loosely (see finding 3).
- **Minors 2-4:** Done. The design.md overview rows (69, 92, 395) now include decisions. The Inbox buttons (design.md:426-427) match `web/src/Inbox.tsx:143-144` exactly. The skill description now reads "ask or record".
- **Day skill:** It tells the agent to ask (`do-night-shift-follow-up/SKILL.md:44-45`). That matches the amended AC#3.
- **Other checks:** CLI help, glossary `Agent decision` and `Owner state`, and the AGENTS.md writer and version lines all check out. All six files have 0 CR bytes. The diff has no real names.

**Material**

1. **`docs/practices/task-flow.md:102-103`: this practice still states the old rule.**
   - It reads: "A question the task does not answer blocks it (`blocked` on a question to the owner); it is never guessed."
   - It describes the `start-night-shift` skill in this repository's own nights (D25). Agents read it under "Creating, taking or closing work".
   - It now contradicts D31 and the skill: an agent following it blocks on choices it should decide and record. No round caught this, because the file sits outside the diff scope.
   - Smallest fix: "A choice the task leaves to the owner is never taken silently: the task is `blocked` on a question when it cannot go on without it or a wrong choice would be costly to undo; otherwise the agent decides and records it (`night-shift decide`, D31)."

**Minor**

2. **`docs/decisions.md:447-451`: D31's ask-or-decide sentence has no scope.** A day session is attended, and `decide` needs an open night, so the day skill asks instead. A later reader of D31 alone would apply decide-and-record in the day too. Fix: "A choice … is never taken silently: during a night the agent asks when …"; optionally add "(a day session asks)".

3. **`skills/start-night-shift/SKILL.md:145`: the ask example's `why` does not name the test that makes it a question.** "Both work; they differ in effort and risk" describes almost any choice, including the pdfkit one that the skill says to decide. This file is copied into every `Adopter`, where agents copy it. Fix: state the discriminator. For example: "Both work; the quick fix loosens a cookie setting on every page, which is costly to get wrong."

4. **`skills/do-night-shift-follow-up/SKILL.md:44-45`: the new sentence has two problems.**
   - As written, it states that a choice comes up, rather than saying what to do when one does.
   - It sits under "See what is open", but it concerns the work in section 2.
   - Fix: "When a choice that belongs to the developer comes up while you work, ask them in the conversation; they are around." Moving it to section 2 is optional.

5. **Wrap drift introduced by the round-3 rewraps:**
   - `docs/design.md:93` (90 chars)
   - `docs/design.md:249` (100)
   - `docs/design.md:370` (a lone "part). Once")
   - `docs/decisions.md:451` (39, ragged)
   - `skills/start-night-shift/SKILL.md:33` (91)

**Note**

6. **`docs/decisions.md:450`:** "(before, it asked about every such choice)" amends D1's "never guess a decision" (line 12). D20 retired that protocol, so naming D1 is optional.
7. **`SKILL.md:170` and the glossary `Agent decision` entry:** both list "a step you would otherwise have asked about" as a thing to decide. Next to the new ask rule, "if the developer were here" would make clear which asking is meant. This is optional; the wording is the owner's.

Verdict: FINDINGS
