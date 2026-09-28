# Review round 2: TASK-28

Snapshot: feat/save-gate at e947ab9 (the tree is clean). I read the whole change `c3f335d..e947ab9`, focusing on this round's `bccc942..e947ab9`.
Lead lenses: 2 correctness, 6 failure handling
Coverage:
1. Wiring: a gate save calls `onSavedNow`, then App `putDetail`, `allItems`, `deckItems` and `deckNights`, so the Gate re-derives its state. `Saved` is reused by the Report's `NeedsYou`, which is always rendered.
2. Correctness: M1 and M2 from round 1 are fixed. `running` is counted against `clear`, the Save button is autofocused, and window Enter ignores buttons and closes only when `clear`. Enter on a locked question advances. See m3, m4 and N1.
3. Data integrity: no new writes. A duplicate save still gets a 409 from the server (`createFollowUp`).
4. Contracts: `unfinishedList` and `unfinishedTasks` now share one filter. `taken` is always present in `detail()` (server.ts:176-178).
5. Tests and evidence: no new tests; the deck has no UI tests yet (TASK-8). In r5, `keys.mjs` and `log.txt` show a focused Save, Enter saving, "Answers kept" naming crm, and the deck staying open. `lock-390.png` shows the lock box, the dimmed option and the icon. The "All clear, then Enter closes" path is not in r5; I checked it by reading the code only.
6. Failure handling: see m1 and m2.
7. Simplicity: `gateState` is shared between the Gate and the deck, and `Saved` is reused rather than copied. Good.
8. Repo and docs: LF, `git diff --check` clean. TASK-44 and the TASK-40 note are filed. design.md does not mention the running-night case (N2).

## Findings

### m1 Minor: a gate Save hangs on "Saving…" when a follow-up file exists but cannot be read
Anchor: web/src/Gate.tsx:110
- **Scenario:** `followUpOf` returns null for an unreadable follow-up file (server.ts:65-71). This is the second case round-1 m3 named; App.tsx:54 handles it for the Inbox. The Gate still lists the night under `toSave`. Save gets a 409 "already exists", `onConflict` reloads successfully, and the code returns.
- **Actual:** the reloaded detail still has `follow_up: null`. The same SaveCard (same key) stays mounted with `busy=true`: a disabled "Saving…" button forever, and no message. Before this round it showed the error.
- **Impact:** a rare, silent hang. "Not now" still works.
- **Fix:** after `onConflict` returns true, still call `setError(message)` and `setBusy(false)`. The card unmounts anyway if the night really was saved.

### m2 Minor: the Report's Save has no reload on a 409 (the sibling of round-1 m3)
Anchor: web/src/Report.tsx:139-147
- **Scenario:** the follow-up was saved in another tab, then the owner presses Save on the report.
- **Actual:** the error "already exists" shows, and the Save row stays until a reload.
- **Fix:** do the same thing the gate does, or record why not.

### m3 Minor: "Your answers there reach the next agent" can be false
Anchor: web/src/Gate.tsx:79-80
- **Scenario:** the owner uses Review answers on a night whose follow-up items were all worked (every question is locked).
- **Actual:** the gate says "Already saved earlier: blog (…). Your answers there reach the next agent", but no open item is left.
- **Fix:** add that sentence only when `followUpOpen(d.follow_up) > 0`.

### m4 Minor: with two nights to save, Enter stops working after the first Save
Anchor: web/src/Gate.tsx:70
- **Scenario:** two nights are to save. The first Save unmounts its card, and focus falls to `body`. `autoFocus` does not move to the second card, which stays mounted.
- **Actual:** Enter does nothing until the owner presses Tab. Nothing is lost.
- **Fix:** focus the next SaveCard's button after a save, for example with a ref or a key on the index.

### N1 Note
- Enter does nothing on "Answers kept" (running nights only), and no hint says so. This is intended by the dispositions; Escape works.
- The confetti fires again when the owner goes back to a question and returns to the gate, because the Gate remounts.
- A locked last question's Enter/Done goes to the gate even when earlier questions are unhandled. `save()` goes back to them instead.
- Report `NeedsYou` keeps `justSaved` if the route switches straight from one loaded night to another. That is unlikely.

### N2 Note
The gate section of docs/design.md does not mention that a running night is named and never counts as clear.

## Checks rerun
- `npm run typecheck`: exit 0.
- `npm test`: exit 0, 36 passed and 0 failed.
- `npx vite build --config web/vite.config.ts --outDir <scratchpad>/r2-review/dist --emptyOutDir`: exit 0.
- Logs are in `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r2-review\`. The tree was still clean afterwards.

## Evidence inspected
- At e947ab9: web/src/Gate.tsx, QuestionDeck.tsx, Report.tsx, App.tsx (onConflict, putDetail, allItems, deckItems), ui.tsx; src/types.ts:271-281; src/server.ts:65-241; src/followup.ts:48-61; docs/design.md; TASK-28, TASK-40 and TASK-44 files; the round-1 reports.
- In `.local/evidence/2026-09-28-save-gate/`: keys.mjs and hold2.ts, plus r5/log.txt, k1-gate.png, k2-after-save.png and lock-390.png (written 14:31-14:32; the commit is 14:33).

## Limitations
- I did not drive a browser myself; m1 and m4 come from reading the code.
- I cannot prove r5 was built from e947ab9 itself. Only the timestamps match.

## Verdict: PASS
There is no Blocking or Material finding. M1, M2, V1 and D1 from round 1 are resolved. m1 is a partial regression of the round-1 m3 fix and should be fixed or recorded.
