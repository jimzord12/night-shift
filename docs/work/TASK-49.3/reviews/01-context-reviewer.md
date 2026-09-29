# Context review round 1: TASK-49.3 (feat/sandbox-kit, 8356f75)

Verdict: FINDINGS

Checked: the diff, AGENTS.md, both reviewer files and the glossary in full, scripts/sandbox.ts and
its docs output; searched AGENTS.md, CLAUDE.md, docs/practices/, docs/owner.md, .claude/agents/ and
backlog/README.md for the old recipes. LF everywhere; no real names or private paths.

## Material

- M1 `sandbox shot` does not write to `.local/evidence/`, but both reviewer briefs read as if it
  does (design-reviewer.md:31-33, visual-reviewer.md:33-35, 40). It writes to the sandbox's
  shots/ (scripts/sandbox.ts:159), which a re-run (scripts/sandbox.ts:117) or clean deletes.
- M2 AGENTS.md:83: the `examples/sample-repo/` Layout row still says "for the `Viewer` and
  reviewers; serve a copy", the recipe this change retires.

## Minor

- m1 `npm run sandbox stop` with no scenario stops every sandbox, including others'
  (visual-reviewer.md:38, design-reviewer.md:35; scripts/sandbox.ts:207); write
  `stop <scenario>`.
- m2 AGENTS.md:152 is 80 characters; rewrap.
- m3 AGENTS.md:152 uses the new term lowercase without backticks; write "a `Sandbox`".

## Notes

- N1 examples/sample-repo/README.md:17-24 could say `npm run sandbox` is the quicker way.
- N2 the visual-reviewer fallback dropped how to register the lead's copied data; the sandbox docs
  line is probably enough.
- N3 `shot` uses 1280 px for laptop; the visual reviewer walks at 1440.
- N4 `shot` needs Chromium installed once; neither the sandbox docs nor the briefs say so.
- N5 Commands, the docs rule, the release test and the Layout row for scripts/sandbox.ts are
  accurate; no decision entry needed.
