# Design review round 1: TASK-28

Images inspected:
- Author's shots, taken at 14:09–14:12 just before a14c4e9: `.local/evidence/2026-09-28-save-gate/r2/01-03-*-1440.png`, `r4/01-03-*-390.png` and `r4/lock-1440.png`.
- My own shots at bccc942, on a fresh setup.ts sample in a scratch NIGHT_SHIFT_ROOT, served on port 4811, in `.local/evidence/2026-09-28-design-gate-r1/`: `00-inbox-390`, `q0/q1-390`, `01-gate-390(-bottom)`, `02-saved-390(-bottom)`, `03-copied-390`, `04-inbox-after-390`, `05/06/07-*-1440|390` (the lock, held with hold.ts). The scratch server and hold process are stopped.

First impression: the gate is good. After the last question I see one step and one glowing button, and it says nothing runs yet. The locked question, though, looks like a normal question whose buttons don't work.

## Findings

### D1 Blocking: the locked question does not look locked
Image: `06-lock-1440.png`, `06-lock-390.png` (and `r4/lock-1440.png`). Where: the option cards and the status pill.
Problem: the options are disabled (a click on "Utterances" times out), but they look exactly like live ones: same colours, same hover style, no lock icon. The only signal is a small grey pill in lowercase with a raw id: "answered · locked: the night 2026-09-28-a is working on it now; change it after that night closes". An owner who reads little taps Utterances, nothing happens, and it reads as a bug. This fails criterion 1 (at a glance). At 390 the pill wraps to three lines inside a fully rounded pill and turns into a blob (criterion 3).
Fix:
- Dim the options that are not chosen and give them a not-allowed cursor.
- Put a lock icon on the chosen option or the pill.
- Write the line as a sentence in the house date style, for example "Locked: the night of Mon 28 Sept is working on this. You can change it once it ends."
- Use a normal rounded box (not a pill) when the text wraps.

### D2 Note: "All clear" leads with the celebration, not the one thing left
Image: `02-saved-390.png`, `r2/02-saved-1440.png`. "All clear" is honest about the owner's queue, and "Nothing runs yet" is in the first viewport, so this does not block. But with confetti, a lazy reader's takeaway is "done". Fix: make the subtitle carry the fact, for example "Saved. Nothing runs until you start an agent."

### D3 Note: the long repository path
Image: `02-saved-390-bottom.png`. The path wraps mid-word, which makes it hard to read and to copy by hand. Nit: add a Copy button for the path, like the phrases have, or show it on its own line with `~` shortened.

### D4 Note: the copy phrase splits at 390
Image: `02-saved-390-bottom.png`. "work on the follow-up" breaks as "follow-" / "up". Nit: `white-space: nowrap` on the phrase.

### D5 Note: two meanings of "Save" in one flow
Image: `q1-390.png`, then `01-gate-390`. A question's primary button is "Save", and the gate's is "Save for the next agent". Nit: consider "Next" or "Keep answer" on the question.

### D6 Note: gate button below the fold on phone
Image: `r4/01-gate-390.png`. At 390×800 the primary button only peeks in at the bottom. Nit: shorten the gate's lead paragraph on narrow screens.

Other checks: "One step left" is honest; Copy/Copied is clear; no sideways scrolling (scrollWidth 390); house style fits; "Already saved earlier: blog" is accurate; the Inbox after saving has no amber card for docs, which is correct.

## Verdict: FINDINGS
One Blocking finding (D1, the locked question). D2–D6 are Notes.
