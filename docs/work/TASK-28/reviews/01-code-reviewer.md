# Review round 1: TASK-28

Snapshot: `c3f335d..bccc942` on feat/save-gate (code in a14c4e9). HEAD is bccc942 and the tree is clean.
Lead lenses: 1 wiring, 2 correctness
Coverage:
1. Wiring: a gate save goes through `putDetail`, then `allItems`, `deckItems` and `deckNights`, so the Inbox, report and Next-night views refresh. Checked for decks opened from a card, Start my morning and Review answers.
2. Correctness: two defects, M1 and M2.
3. Integrity: a duplicate follow-up gets a 409 from the server and the button is disabled while busy. `needsHandOver` agrees with `buildFollowUp`: a deck night always has questions, so the 422 cannot fire from the gate.
4. Contracts: `taken` is a required field and web and server ship together. Refs are keyed `<night>/<Ax>`, and follow-up id equals night id.
5. Tests and evidence: the new `taken` asserts would fail without the server code. Screenshots of the gate, the confirmation and the lock match the code.
6. Failure handling: see m3.
7. Simplicity: see m4.
8. Repo and docs: design.md is updated, line endings are LF, and the commit scope is clean.

## Findings
### M1 Material: the gate reports "All clear, saved" for nights that are still running
Anchor: web/src/Gate.tsx:17-21 and 39-43
- **Scenario:** Start my morning includes running nights that have open questions (`inMorning` keeps running nights, and `openItems` takes every loaded detail). Either the owner answers only a night that is still running, for example one paused at a usage limit, or they answer it next to a closed night and save the closed one.
- **Expected:** The gate says the running night is not saved yet, and that it can be saved once the night ends. Answers in a running night reach no agent until a follow-up exists.
- **Actual:** `closed` silently drops `status === 'open'` nights. `toSave` is then empty, so the gate shows "All clear. Everything you answered is saved for the next agent." and fires confetti. Once the night closes it becomes `ready_to_save` again.
- **Impact:** This is the very misunderstanding D24's gate exists to remove. It shows the owner a wrong state.
- **Smallest fix:** For nights in the deck with `status === 'open'`, add one line such as "Still running: blog. Save it for the next agent once it ends." Count them against `allSaved`, or change the heading and copy while any exist.

### M2 Material: Enter on the gate closes the deck without saving
Anchor: web/src/QuestionDeck.tsx:139-141
- **Scenario:** The owner walks the deck with Enter (Enter is Save), lands on "One step left" and presses Enter again. Or they tab to "Save for the next agent" and press Enter.
- **Expected:** Enter carries out the gate's main action (Save, when exactly one night is pending), or at least does not leave the gate.
- **Actual:** Nothing on the gate has focus, so the window handler runs `onClose()`. In the tabbed case the click also fires, so the save goes through but the deck is already gone and the confirmation with the phrases is never shown.
- **Impact:** The keyboard path skips the explicit gate. D24 also says the whole morning works from the keyboard. The evidence script (gate.mjs) walks with Enter but clicks the gate, so this path was never exercised.
- **Smallest fix:** When `finished`, let Enter close only if `allSaved`. Otherwise do nothing or trigger the single SaveCard, and never intercept Enter when the target is a button.

### m3 Minor: a failed gate save leaves a stale card
Anchor: web/src/Gate.tsx:80-82
- **Scenario:** A follow-up was created in another tab, or the follow-up file exists but cannot be read (`followUpOf` returns null).
- **Actual:** The card shows "a follow-up for X already exists", keeps the Save button, and never reloads the detail.
- **Fix:** On a 409, reload the night (the deck's `onConflict`).

### m4 Minor: `unfinished` repeats the predicate of `unfinishedTasks`
Anchor: Gate.tsx:10 and src/types.ts:274
- **Issue:** The same filter now lives in two places, and the comment in types.ts says it must match `buildFollowUp`.
- **Fix:** Export one filter and derive the count from it.

### m5 Minor: returning to the gate loses the confirmation
Anchor: Gate.tsx:16 and QuestionDeck.tsx:176-178
- **Scenario:** After saving, the owner clicks a progress segment and then comes back to the gate.
- **Actual:** The Gate remounts and `savedNow` resets. The night just saved moves to "Already saved earlier", the phrases disappear, and the confetti fires again.
- **Fix:** Keep `savedNow` in QuestionDeck.

### m6 Minor: the report's Save shows no confirmation
Anchor: web/src/Report.tsx:162-172
- **Issue:** This is the other way to save, and after saving it shows no "nothing runs yet" message and no phrases to copy.
- **Fix:** After a save, reuse `Saved` from Gate.tsx.

### N1 Note
- "Already saved earlier" lists only `repo.name`, so two nights from one repository show as "blog, blog".
- The evidence logs record the wrong heading: `gate heading: Nights` is the Inbox's first h2, not the gate's. The screenshots are the real proof.

## Checks rerun
- `npm run typecheck`: exit 0.
- `npm test`: exit 0, 36 passed and 0 failed.

I did not rerun the web build, because it writes into `web/dist` in the source tree.

## Evidence inspected
- At bccc942: web/src/Gate.tsx, QuestionDeck.tsx, App.tsx, Report.tsx; src/server.ts, src/types.ts, src/followup.ts; tests/server.test.ts:180-265; docs/design.md; decisions.md D24; the TASK-28 task file; skills/start-night-shift/SKILL.md.
- In `.local/evidence/2026-09-28-save-gate/`: gate.mjs, r2/01-gate-1440.png, r2/03-copied-1440.png, r4/lock-1440.png, and the logs.

## Limitations
- I did not drive a browser. M1 and M2 come from reading the code, but the paths are direct.
- I did not watch the videos. I did not check the 390-wide screenshots beyond their logs (scrollWidth=390).

## Verdict: FINDINGS
