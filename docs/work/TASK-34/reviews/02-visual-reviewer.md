# Visual review round 2: TASK-34

**Verdict: FINDINGS.** V1, V2 and V3 are fixed. I found one new Blocking issue (V8): pressing Enter on the "Open" link of a question's file saves that question's answer instead of opening the file.

Viewer: `dev · 06598b8` on port 4921, from worktree `night-shift.worktrees/ci`, built with `npm run build` first.

Data, all fresh, in the scratchpad `...\d05d2575-...\scratchpad\kb34r2\` (`kb34r2-pristine` is a reset copy):
- `owner-states/setup.ts`
- the round-1 `extra.ts` (`payments` 3 questions, `support` 2)
- a new `design` night (`r2k/extra2.ts`) with one question pointing at two files: `logo-a.png`, which has a View button, and `brief.md`, which has an Open link.

That makes 8 questions across 5 nights (journey (a) ran before `design` was added, on 7 questions). Screenshots are in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-keyboard-r2\`. The scripts are in `scratchpad\r2k\`.

## Journeys
- **(a) 1440, whole morning by keyboard:** walked to the end. I used Tab and Enter on Start my morning, then Enter, N in the middle, 1 then Enter, D with a typed note and Ctrl+Enter, Enter, Enter, and N on the last waiting question. That N opened "One step left", which lists "Which chat widget? not answered: the next agent asks again". Then S three times reached All clear, and Enter went back to the Inbox. On disk:
  - `support` Q2 has no answer.
  - The `payments` discuss answer has its note.
  - Three follow-ups were written.
  - Screenshots: `a-05-last-waiting.png`, `a-06-gate.png`, `a-09-gate-s3.png`.
- **(b) round-1 repro steps:**
  - V1 fixed: N on the first question, then Enter on the rest, reached the gate without going back to the skipped question, and the gate lists it (`b-01-v1-gate.png`).
  - V2 fixed: Tab onto Not now, then Enter, skips the question and saves nothing (`b2-02-v2-after.png`).
  - V3 fixed: D, Esc, 2, D again, then typing "not sure" puts the text in the note (`b2-04-v3-typed.png`).
  - Also checked: going back with the arrows to a skipped question and pressing N moves on; answering that skipped question with 3 and Enter saves it.
- **(c) Enter on focused controls:** broke at the Open link (V8). Everything else did its own job:
  - Close closed the deck.
  - Next and Previous moved.
  - "use it" picked the recommended answer, with no save.
  - "+ add a note" opened the note with the cursor in it.
  - View opened the image, and Esc closed only the image, with focus back on View.
  - Show in folder sent only its own request (I stubbed it so no folder window opened).
  - An answer option focused plus Enter saved that option (1 request).
  - On the gate, Enter on the second night's Save saved that night; Enter on a Copy row copied; Enter on Back to the Inbox left.
- **Greek layout:** the keys ν, δ and σ (the letters on the N, D and S keys) did Not now, discuss with the cursor in the note, and the gate save.
- **(d) 390 touch:** tapped through to the end with one Not now and one discuss. No sideways scrolling, no key hints visible (`d-01` to `d-06`).

## Findings

### V8 Blocking: Enter on a file's "Open" link saves the answer
Journey/step: (c), question "Which logo?", Tab onto Open next to `docs/brief.md`, then Enter - Width: 1440 - Saw: `POST .../design/.../answer` wrote "Round" to disk, the deck moved on (0/8 became 1/8), and no tab opened. It is the only link in the deck. - Expected: Enter opens the file, like a click does, and saves nothing. - Screenshot: `c2-02-open-focused.png`, `c2-03-after-open-enter.png` - Fix: widen the `ownButton` guard in `QuestionDeck.tsx` to take in focused links too:
```ts
const t = e.target as HTMLElement;
const own = !!scroller.current?.contains(t) && (t.matches('a[href]') || (t instanceof HTMLButtonElement && !t.hasAttribute('data-option')));
```
Add the case to `tests/ui/deck.test.ts`.

### V9 Note: a Not now in an already-saved night is not named on the gate
Journey/step: (a), N on `blog`'s "Which newsletter provider?". That night was saved on an earlier day. The gate shows only "Already saved earlier: blog … Your answers there reach the next agent", and does not name the skipped question. This is true but vague. Screenshot: `a-06-gate.png` (scroll) and the text dump in the run.

### V5 (deferred to TASK-40), unchanged
Focus still falls to the page body after Next, Previous, a save or Esc from the note. Tab then goes through the Inbox behind the deck first, and a touch test's `getByRole('button', {name: /^Save/})` also finds the Inbox's Save behind it. It is not worse than round 1.

## Console
Clean in every run: no errors, no failed requests, no responses of 400 or above.

## Verdict: FINDINGS
V8 is Blocking. The Viewer on port 4921 is stopped.
