# Context review round 2: TASK-49.3 (feat/sandbox-kit, 58f1957)

Verdict: PASS

Round-1 findings M1, M2, m1-m3, N1, N3, N4 verified fixed; the new NIGHT_SHIFT_SANDBOX lines match
the tool; no stale copy-and-serve recipe left in the agent context; LF endings; no private names.

## Minor

- r1 visual-reviewer.md:26-28 promises separate sandboxes never "stop or rebuild each other", but
  every start runs `npm run build`, which empties the shared web/dist (emptyOutDir). Say they never
  stop or replace each other's scenarios; a second agent on the same checkout starts with
  `--no-build`.
- r2 visual-reviewer.md:26-27, design-reviewer.md:34-35 read as "set once"; environment variables
  do not carry between shell calls here. Say "on every sandbox command, `stop` included".

## Notes

- n1 docs/practices/evidence.md could name the sandbox in one sentence (optional).
- n2 design-reviewer.md:33 gives only the laptop `shot`; mention `--phone`.
- n3 the AGENTS.md sample-repo row could say the sandbox reuses its screenshots.
- n4 code spans split across lines (sample README:17-18, visual-reviewer.md:36-37).
- n5 sample README:4 "for the Viewer, reviewers" is still true enough.
