# Context review round 3: TASK-22 (feat/start-check, d6bf436)

Verdict: FINDINGS. Round 2's findings fixed as described.

## Material

1. docs/glossary.md:20: the `Start check` row points to "step 3"; the checks are now step 2.
2. src/night.ts:129 (StartCheckFailed) against SKILL.md:65-67, D33 and the CLI docs: the refusal
   is now the last thing the agent reads, and it says "then run every check again and start once
   all pass" with no "stop"; an agent whose developer left may retry and notify again each time.
   Fix: "… and stop; once it is fixed, run every check again and start when all pass."

## Minor

3. SKILL.md:59-64: a command refused permission never ran and has no exit code, but the schema
   needs an integer and a non-empty excerpt; record it with exit code 1 and the prompt.
4. design.md:411: the Skills table order should be "start checks, follow-ups, plan".
5. decisions.md:487-490: the sentence reads as if the tool tells the developer and stops.
6. Ragged wraps: design.md:509-510, decisions.md:493-494, src/notify.ts:1.
7. TASK-50 labels: one label "enhancement viewer"; set `viewer` only.

## Notes

- SKILL.md:38 "Before anything else" sits after step 1; "Before the follow-ups and the plan".
- src/cli.ts:54-55 drops "or waits for a permission" and "when on"; close enough.
- Consistent: the failure order across skill, design, D33, CLI docs and notify output; the
  guard runs before "the plan has no tasks"; enforcement for anything newer than @2; the check
  commit identical everywhere; cross-references; LF and final newlines; no private names.
- CHANGELOG entry expected at the release.
