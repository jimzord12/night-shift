Context review, round 1, TASK-49.1 (812c092..031a55e, worktree `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci`)

What I expected the change to do: release work becomes three explicit steps (build, install, publish). The old forms (`release v<N>`, `switch`, `install-launchers`) should be gone from every live file. Each of the repository's own scripts answers `docs`, and one short rule in AGENTS.md tells agents to run it, and to give any new script a `docs` answer too. The rule should not cover npm scripts that were never meant to answer `docs`.

## Material

1. **`docs/owner.md:57` still names the old commands.** It reads: "releases (`npm run release v<N>` and `switch`; never during a `Night`)". This is the file that says what agents may do without asking. Both commands now refuse to run, and publishing (pushing a public tag) is not listed as covered. Fix: "releases (`npm run release build`, `install` and `publish`; never during a `Night`)".

2. **`docs/decisions.md:459-475`: D32 does not name the entry it replaces.** Line 4 says a changed mind "names the one it replaces". D10 (`docs/decisions.md:72-77`, "`npm run release vN` checks, exports … tags and pushes") is exactly what D32 changes. Fix: add "Replaces D10's single command (its tags and launcher stand)."

3. **`AGENTS.md:106-108`: "Every script here answers `docs`" reaches too far and does not bind new scripts.** It sits right under a block that lists `npm run check`, `view`, `dev` and `test:ui`, and none of those answer `docs`. `npm run check docs` would pass `docs` on to the last command in the chain, so it runs `vite build … docs`, with `docs` as the build folder. The text also states a fact, where the owner asked for a rule that every script answers `docs`. Fix: "Each script in `scripts/`, and the `night-shift` CLI, answers `docs` (…): run it before using one rather than guessing its verbs; a new script answers it too."

4. **The `check:clean` manual gives a command npm rejects** (`scripts/clean-check.ts:15` and the usage refusal at `:47`). It documents `npm run check:clean [v<N>] [--ref <branch>]`. I tested this with npm 12: without `--`, npm reads `--ref` as its own flag and fails with "EUNKNOWNCONFIG Unknown cli flag: --ref". With `--` the flag reaches the script. Agents are now told to trust this manual. Fix: `npm run check:clean -- [v<N>] [--ref <branch>]` in both places.

## Minor

5. **`AGENTS.md:178`** still says "a night never cuts or switches a release", in the old words. Fix: "never builds, installs or publishes a release".
6. **`AGENTS.md:169`**: "built as a candidate" should be `Candidate`, in backticks, because it is now a glossary term and this file puts glossary terms in backticks.
7. **`docs/glossary.md:38`**: the date column reads "2026-09-25; 2026-09-29". The table's own convention is "2026-09-25; redefined 2026-09-29".
8. **`README.md:50` and `:82`**:
   - Line 50 tells a stranger to run `night-shift docs` after installing v18. v18 has no `docs` command (checked with `git show v18:src/cli.ts`); the smoke script leaves it out for that reason (commit 41774e4).
   - Line 82 still says `night-shift --help` lists every command, so the README now gives two different pointers for the same thing.
   - Fix: point both at one command, and use `docs` once the first release that has it is published.
9. **`README.md` Develop (~line 100)**: `npm ci` moved out of Install and was not added here, so a contributor following the README never installs dependencies before `npm run check` or `npm run dev`. Fix: add `npm ci # once` to that block.

## Note

- `README.md:45`: the hard-coded `v18` will go out of date. The comment "(take the newest tag)" softens this, but the text never says how to find the newest tag (`git ls-remote --tags origin`).
- AGENTS.md "Read when", the "releasing" row (line ~52): it points only to `docs/practices/git.md`, which has no release steps. Adding `npm run release docs` there would state the new rule in the table agents actually use.
- `docs/glossary.md:38`: "A tagged version … before it is published, a `Candidate`" reads slightly against itself, because a candidate has no tag yet. Readable as it stands.
- Checked and fine:
  - All three manuals agree with the code: the verb list, what each verb does, the refusals, and the `candidate` field in `src/version.ts`.
  - They also agree with D32, the README Releases block and the CI workflow.
  - No live references to the old verbs remain outside `owner.md`. The only hits are the rename messages in `release.ts`, their tests, and `backlog/tasks/task-10`, which is a dated record and correctly left alone.
  - Every touched file has LF line endings (0 CR bytes).
  - No real names appear. `jimzord12/night-shift` is the repository's own URL and was already there.
  - `CHANGELOG.md` and the older decision entries are untouched.

Verdict: FINDINGS
