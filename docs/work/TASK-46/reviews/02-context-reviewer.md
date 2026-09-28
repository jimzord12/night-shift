Context review, TASK-46 (D31), round 2 overall, my first context round. Snapshot: b273f6f..95ea2e8 in the `ci` worktree.

The principle I held the diff against: an agent records each choice it makes that belongs to the owner, and does not decide silently. A choice the owner disagrees with reaches the next agent to redo. It should cover choices between options, defaults the agent fills in, and steps it would otherwise have asked about. It should not cover routine technical choices. It should also keep "ask when you cannot go on" separate from "decide and record".

The CLI help, `DecideInput`, the schemas, `NIGHT_SCHEMA`/`FOLLOW_UP_SCHEMA` (@3), `ItemKind`, the rule that a disagreement needs a note, LF line endings and public hygiene all check out. Real library names in the example (pdfkit, jsPDF) are fine.

**Material**

1. `skills/start-night-shift/SKILL.md:137` and `:169-187`: the new decision rule sits beside a rule it contradicts. Line 137 still says "**Never guess a decision that belongs to the developer.** Ask". The new paragraph says to take and record "a step you would otherwise have asked about". Its last sentence says to ask only when the task "cannot go on". An agent reading line 137 first will ask about everything; one reading 169 will decide about everything. Fix: change line 137 into a single split: "A choice that belongs to the developer: when the task cannot go on without it, ask (below); otherwise take it, record it with `decide`, and carry on. Never decide silently." Then drop the closing "ask instead" sentence at 186-187.

2. `docs/design.md:361-367`: the list of item kinds, which is where kinds are defined, has no `disagreed`. Only the Version 3 note (178) and the night.json paragraph (245) mention it. Fix: add "`disagreed` (the developer disagrees with an agent decision; `question` holds the decision, `owner_note` what they want instead, `agent_decision` its id; the next agent redoes that part)".

3. `docs/design.md:416-450`: the Viewer section, which describes what this repository builds, does not match D31. "Start my morning" is still "one deck through every open question". The deck (441) still has no decision cards after the questions. The Night Report (430-440) shows no decisions per task or in their own section. The Inbox shows no count. The gate does not list disagreements. Fix: one clause each in items 1-3.

4. `docs/glossary.md:31`: the `Owner state` entry still says **Needs answers** covers only questions (plus the discuss case). `src/types.ts:384` now reads "A question or a decision the agent took waits for you". Fix: add "or an `Agent decision` not yet reviewed".

**Minor**

5. `docs/glossary.md:20,26`: `Night file` does not list `Agent decision`s, and `Follow-up file` ("unfinished tasks plus the `Owner`'s decisions") does not mention disagreements.
6. `docs/design.md:256,338`: the example files still say `night@2` and `follow-up@2`, while the tool writes @3. `design.md:246` is 91 characters, where the surrounding lines wrap at about 78.
7. `skills/start-night-shift/SKILL.md:51-52`: the paragraph breaks after a lone "A". `:183`: `decide` is run inline, while every other command gets its own `bash` block ("then run:"). The skill never says `task` is optional (it may be null).
8. `skills/do-night-shift-follow-up/SKILL.md:3,8-10`: the description and intro still name only decisions and unfinished work. `start-night-shift/SKILL.md:31-32`: the same.
9. `AGENTS.md:155`: the rewrapped line is 80 characters, against the list's wrap of about 72.

**Note**

10. `docs/decisions.md:438-453`: D31 changes the meaning of Needs answers from D24 without naming D24. It does not replace D24, so this is optional, but "(amends D24's Needs answers)" would help the next reader. The Enter/D key detail is UI and could move to design.md.

Verdict: FINDINGS
