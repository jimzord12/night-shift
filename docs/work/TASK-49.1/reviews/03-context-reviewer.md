Context review, round 3, TASK-49.1 (812c092..f9a25d7; round-2 fixes in 7cb0af0..f9a25d7). Worktree `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci`.

What I expected before reading the diff: releases are three separate verbs (D32). Every script agents run prints its manual when given `docs`, and AGENTS.md sends agents to it and binds new scripts. No live file names the old commands. The manuals match the code, including the round-2 offline and half-published tag handling.

## Round-2 fixes: all verified

- **M1** `CHANGELOG.md:3` now reads "One entry per release tag (`npm run release publish vN`); tags are never moved." The entries below it are untouched.
- **Minor 2** `AGENTS.md:106-109` now names `npm run release`, `npm run check:clean` and the `night-shift` CLI, and binds "a new script agents run". `smoke.sh` is no longer covered by mistake. `npm run check:clean docs` works without `--` (I ran it).
- **Minor 3** `AGENTS.md:179-181`: rewrapped, and every line is within the paragraph's width.
- **Note taken:** the release manual (`scripts/release.ts:43-44`) now ends its maintainer steps with `npm run check:clean`. This agrees with the check:clean manual ("once per release, after npm run release publish") and with the Commands block at `AGENTS.md:102`.
- Minor 1 (README `night-shift docs` before v19 exists) was settled as "v19 published right after the merge". I accept that and am not raising it again.

## The manuals against the round-2 code

- **build.** The new offline refusal for a candidate with a local tag (`release.ts:125`) explains itself and names the next step. It does not contradict "a candidate may be built again": online, the candidate is still rebuilt.
- **install.** Checking origin's tag first (`:171`) changes nothing the manual claims.
- **publish.** Taking origin's tag when it was pushed from another clone at the same commit (`:195-197`) fits "tag the commit a candidate v<N> was built from and push the tag" and "a publish that stopped half way is finished by running publish again".
- **CLI.** `night-shift docs` matches `src/cli.ts`.
- **check:clean.** The manual matches `clean-check.ts`.

## Minor

1. **`docs/decisions.md:466`: D32 still says "Every script answers `docs`".** Round 2 narrowed AGENTS.md away from this wording because `scripts/clean/smoke.sh` does not answer `docs`. D32 is new in this change, so it can still be corrected; it is not yet a dated record. As written, the decision and AGENTS.md disagree on scope, and an agent who reads D32 as the "why" will expect `smoke.sh docs` to work. Smallest fix: "Every script agents run (`npm run release`, `npm run check:clean`, the `night-shift` CLI) answers `docs` with its manual".

## Note

- **`docs/owner.md:57` is 86 characters.** This is the same drift that round 2 flagged in AGENTS.md. Line 53 of the same list was already 83 characters before this change, so it is Note only. Rewrap if convenient.
- **`docs/glossary.md:39`: `Candidate` is defined as "not yet tagged".** After a rejected push, a candidate is tagged locally and still carries `candidate: true`. "Not yet published" would be exact. It still reads correctly as it stands.
- **The `build` manual line (`release.ts:24`) says "from its tag when the tag is published".** Offline, with no candidate built, a tag that exists only locally is also built as a published release. This is an edge case, and origin cannot confirm the tag either way, so I am not asking for a change.
- **`src/cli.ts:280`: the unknown-command error still points at `night-shift --help`.** `--help` still works, so nothing is broken. `docs` would be the fuller pointer. This is product code, left to the code reviewer.
- **Checked and fine:**
  - No live references to the old verbs remain. The only hits are D10 and D25's body text (dated records, left alone), the rename table in `release.ts` and its tests.
  - `docs/practices/`, `docs/design.md`, `.claude/agents/`, `skills/` and `backlog/README.md` need no change.
  - Origin holds only `v*` tags, so the README's `git tag --sort=-v:refname | head -1` returns the newest release.
  - The `Candidate` row's date column ("2026-09-29, owner") follows the table's convention.
  - All ten touched files have 0 CR bytes.
  - No real names appear. `jimzord12/night-shift` is the repository's own URL.

Verdict: PASS
