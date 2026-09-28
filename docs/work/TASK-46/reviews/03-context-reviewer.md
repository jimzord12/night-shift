Context review, TASK-46 (D31), round 3. Snapshot: b273f6f..bdd05d5 in C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci. I checked the round-2 fixes (95ea2e8..bdd05d5) and then re-read the whole scope.

The principle I held the diff against: an agent records every choice it takes that belongs to the owner, and never takes one silently. It asks only when it should not take the choice itself. A disagreement reaches the next agent. Routine technical choices are not recorded. A day session is attended, so it asks.

**Round-2 fixes: verified.**
1. The ask-or-decide split is now one rule (SKILL.md:136-139) and matches :168-171. The old "never guess" line and the trailing "ask instead" are gone.
2. `disagreed` is in the item-kind list (design.md:367-370). Its fields match `schemas/follow-up.schema.json` (`question`, `owner_note`, `agent_decision`) and `disagreement()` in `src/followup.ts:136`.
3. The Viewer section now has the deck cards, the Report rows and the gate.
4. The glossary's Needs answers is fixed.
5, 7, 8, 9 and 10 are fixed. For 6, the examples now say @3, but see the wrap point below.

The CLI help (`decide … (task, decision, why)`), the `agent_decisions[]` fields (`review`, `note`, `reviewed_at`, nullable `task`), AGENTS.md's writer rule and version line, LF endings (0 CR in all six files) and public hygiene all check out.

**Material**

1. `skills/start-night-shift/SKILL.md:136-153`: the ask example contradicts the new rule. The rule says to ask only "when the task cannot go on without it", and otherwise to decide and record. The example question then says "Both work; they differ in effort and risk." By the rule's own test, the task can go on, so an agent should decide rather than ask. Taken literally, "cannot go on" almost never holds, because an unattended agent can always pick an option. Agents will then decide choices that are costly or hard to undo, which is the case the example shows as one to ask about. This file is copied into every `Adopter`, so the ambiguity spreads. Smallest fix is to sharpen the discriminator, and D31 or design.md can say the same in a clause:
   "When the task cannot go on without it, or a wrong choice would be costly to undo, ask, then move on to the next task; otherwise take it, record it with `decide` (below) and carry on."
   The two examples then line up: pdfkit vs jsPDF is cheap to undo, and the Safari fix carries risk. The other option is to replace the ask example with one where the agent lacks the information.

**Minor**

2. Three overview rows still list only questions and feedback:
   - `docs/design.md:69` (Part 3 Record: "questions and feedback as they arise")
   - `docs/design.md:92` ("questions and feedback were recorded as they arose")
   - `docs/design.md:395` (the skill table: "questions, feedback, close")

   Add "decisions" to each.
3. `docs/design.md:426-427`: the list of next-step buttons on the Inbox card lacks the new labels "Review N decisions" and "Answer N · review M" (`web/src/Inbox.tsx:143-144`).
4. `skills/start-night-shift/SKILL.md:3`: the description still says "ask the developer instead of guessing". It is what makes the skill load, and it now half-states the rule. Suggest "ask or record each decision taken for the developer".
5. Wrap drift on lines added in this task:
   - `docs/design.md:247` (106 chars; the round-2 rewrap made this line longer)
   - `docs/decisions.md:446` (92)
   - `skills/start-night-shift/SKILL.md:32` (87)
   - `skills/do-night-shift-follow-up/SKILL.md:11-12` (ragged break before "items")

**Note**

6. The ask-or-decide split lives only in the night skill. Neither D31 nor design.md states it, although it changes how agents behave in every `Adopter` (they used to ask about every owner choice). One clause in D31 would stop a later session from treating it as undecided.

Verdict: FINDINGS
