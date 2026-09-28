# Visual review round 2: TASK-28

Viewer: dev · e947ab9. I built `web/dist` at 14:34 from the clean tree. At 14:48 someone else edited `web/src/{Gate,QuestionDeck,Report,App}.tsx` and `docs/design.md` in the working tree (HEAD is still e947ab9). I did not touch them, and my walks used the 14:34 build. Every run used a fresh `setup.ts` sample in the scratchpad, served on ports 4881-4924. `hold.ts` (blog A1) and `hold2.ts` (crm) were started per run. All servers and holds are stopped.

Journeys (1440 and 390; 360 for layout):
1. **Start my morning** to the end: walked. The gate shows docs, then Save, then the confirmation. All three Copy buttons copy the right text. The Inbox updates without a reload, and Next night goes from 5 to 6.
2. **Card "Answer 1 question":** walked. The gate shows docs only.
3. **"Not now"** on the gate, then the report's **Review answers**: walked. docs stays "Ready to save" and the gate comes back.
4. **blog, follow-up already saved:** walked. Q2 rewrites A2 to a decision, and Q1 changed to Utterances rewrites A1 to "b". The gate says "Nothing new to save here", with no confetti.
5. **Locked question** (hold.ts): walked. The lock box reads "Locked: the night of Mon 28 Sept…". The other option is dimmed with a not-allowed cursor, the chosen one shows a lock icon, and the key 2 is ignored. Enter moves on to the gate, with no confetti.
6. **Keyboard-only morning:** walked. Save is focused on the gate. Enter with nothing focused does not leave while something is still to save. Enter saves, and the next Enter leaves (when opened from the Inbox; see V2).
7. **Running night with a question** (hold2.ts): walked. Before saving, the gate says "Still running: crm (28 Sept)". After the Enter-save it says "Answers kept", with no confetti, and Enter does not leave. With the crm night alone, the gate says "Answers kept".
8. **The report's own Save:** walked. The confirmation and the copy both work.
9. **Back to a question and return to the gate:** walked. The confirmation is kept.

## Findings

### V1 Blocking: the "work on the follow-up" phrase runs into its Copy label on phones
Journey 1 and 8 · Width 390 (report) and 360/375 (gate). The phrase no longer wraps (the D4 fix), so the text runs under "Copy"/"Copied". I measured the overlap:

| Where | 390 | 375 | 360 | 320 |
|---|---|---|---|---|
| Gate | "Copied" touches the text | 8px | 23px | 63px |
| Report | 14px (29px once "Copied") | 29px | 44px | – |

At 320, "start night shift" also overlaps (18px).

Expected: the text and the label never overlap.

Screenshots:
- `.local/evidence/2026-09-28-visual-gate-r2/o-report-phrase-copied-390.png`
- `j1-08-copied-360.png`, `j1-08-copied-390.png`
- `o-phrase-overlap-375.png`

Fix: in `Phrase`, put the two phrase buttons in one column below `sm` (they already stack; the problem is the label width). Or let the phrase wrap only at spaces (`whitespace-normal` with `break-words` off, `hyphens-none`). Or move Copy/Copied under the hint on narrow screens.

### V2 Note: Enter on an "All clear" gate does nothing when the deck was opened from the Night Report
Journey 5 (and 3 and 7b) · 1440. Focus stays on the report's "Start answering"/"Review answers" button behind the overlay. The deck's handler skips Enter when the target is a button, and the browser presses the hidden opener instead. The deck stays open and Escape is needed. From the Inbox the opener unmounts, so the same step works. Screenshot: `j5-05-after-enter-on-gate-1440.png`. Fix: move focus into the deck when it opens, or only exempt buttons that are inside the deck.

### V3 Note: confetti fires again on returning to the gate
Journey 9 · 1440/390. The Gate remounts and `celebrate` is true again. Screenshot: `j9-05-gate-return-390.png`. Fix: keep a "celebrated" flag in QuestionDeck next to `savedNow`.

### V4 Note: with a running night in the deck, Enter never leaves the gate and nothing says so
Journey 7. This is the rule as designed, but the gate shows no Esc hint. Nit: add "Esc to close" beside Back to the Inbox.

### V5 Nit
- A night that only skipped the item reads as "is working on this" (j5: A2 was skipped by the hold night).
- On the report's Save row, "1 unfinished task and 0 questions" (`j8-01-search-report-1440.png`).
- `j5-03-error-*.png` is left over from a first run that clicked the wrong blog night; ignore it.

## Console
Clean in every run: no console errors, no page errors, no failed requests, no 4xx/5xx. The 409 from round 1 (V5 there) did not recur in 20 fresh samples. No sideways scroll: `scrollWidth` equals the viewport at 1440, 390 and 360 on every screen measured.

Videos are in `.local/evidence/2026-09-28-visual-gate-r2/video/` (j1, j6b, j7 at 1440 and 390). Logs are the `j*-<width>.log` files beside the screenshots.

## Verdict: FINDINGS
One Blocking: V1, the phrase overlapping its Copy label at phone width. Round 1's V1 (Enter on the gate) is fixed, and so is D1 (the locked look).
