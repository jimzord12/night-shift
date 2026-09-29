# Context review round 1: TASK-22 (feat/start-check, aa5fa09)

Verdict: FINDINGS

## Blocking

1. SKILL.md:60-61, 83; design.md:217; decisions.md:483: the documented commit check
   `git commit --dry-run --allow-empty -m "start check"` exits 1 on a clean tree (git 2.47:
   `--allow-empty` does not apply to a dry run), so an agent following step 3 is refused every
   night, or writes an exit code it did not get. A dry run also skips hooks and signing. Fix: a
   real empty commit on the night's branch.

## Material

2. SKILL.md:62-69: "waits for a permission" is not actionable alone; a command allowed once passes
   the check and prompts again at night. A check that asked for approval counts only after the
   developer allows the command for good and the check runs again without a prompt; say that
   "start once every check passes" means run the checks again.
3. SKILL.md:60 with the exit-code-0 rule: a suite already red (tonight's job is to fix it) is
   treated like tests that cannot run. Say the check proves the runner runs; run one passing test
   file when the suite is known to be red.
4. Stale current-version pointers: design.md:180 "The plan stays at version 2."; AGENTS.md:164
   versioning rule; glossary.md:19 `Plan` row.
5. design.md:183-188: the start behaviour sits under "The files"; the Lifecycle **Start** bullet
   (76-87) is untouched. Add a clause there; keep only the shape note under the files.
6. glossary.md: no `Start check` entry although the term is in the CLI docs, the tool's output and
   D33.

## Minor

7. decisions.md:496 ends without a newline.
8. SKILL.md:71-72: no blank line after the `## 4.` heading.
9. design.md:188 "the stored plan says `@3`" is cryptic.
10. design.md:405 the Skills table does not mention the start checks.

## Notes

- src/night.ts:146 `}  const ids` on one line (formatting).
- design.md:422 could point to step 3.
- scripts/clean/smoke.sh:30 uses plan@2: valid, exercises the older path.
- A check that fails after the developer left means no night and nothing in the Viewer; follows
  from D33 (the owner's choice), worth knowing.
- Fine: step renumbering, the "step 5" reference, the refusal wording, agreement between D33,
  design and the CLI text; no real names.
