# Design review round 1: TASK-34

Images inspected:
- `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\.local\evidence\2026-09-28-keyboard\out3\question.png` and `out3\discuss-note.png`, plus `out2\gate.png` and `out2\all-clear.png`, all at 1280x800. They were taken 19:13 to 19:15. Commit 6d26cce landed at 19:16:52, and the diff matches exactly what the images show, so they are current. I did not play the webm.
- My own phone-width captures (390x844, on synthetic scratch data from `video.ts` with taps instead of keys) are in `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\.local\evidence\2026-09-28-keyboard-design-review\out\`: `question.png`, `discuss-note.png`, `gate.png` and `all-clear.png`. They ran against the `web/dist` built at 19:17:47, after the commit.

First impression: on a laptop I can see which key does what without reading anything. On my phone nothing changed.

## Findings

### D1 Note: hints are quiet, findable and consistent
The hints look the same everywhere: the option chips (1, 2, D), N on the moon button, Enter on Save, S on the gate CTA and Enter on "Back to the Inbox" all use the one global `kbd` token. The chips on dark sit at `white/40`, and those on the accent buttons get a `white/40` border. The note hint uses `text-xs white/40`, the same register as the existing "Esc closes". Nothing looks borrowed, and it fits D12.

### D2 Note: each hint does what it says
I traced each hint through `QuestionDeck.tsx` lines 164 to 208:
- **1, 2 and D:** 1 and 2 pick an option. D picks discuss, opens the note and focuses it, and does not type the letter into the note.
- **N and Enter:** N leaves the question for now. Enter saves, and Ctrl+Enter saves from inside the note. Esc blurs the note.
- **S:** clicks only the first save card, and only that card shows the S chip.
- **Enter on the gate:** the chip appears only when the gate is clear, which is the only time Enter leaves.
- **Leftovers:** the old meanings (D for Not now, 0 for discuss) are gone from the UI, and no doc or help text still describes them.

### D3 Note: hidden at phone width, no sideways scroll
Every new hint carries `hidden sm:inline` or `hidden sm:block`. My 390px captures show none of them: no chips on the options, no note hint, no S on the gate CTA. Nothing overflows.

### D4 Note: the S chip is heavier than the other chips
Image: `out2\gate.png`. Where: the "Save for the next agent" button. Problem: the chip picks up the `.cta` bold weight and larger size, so S reads heavier than the Enter chip on the deck's Save. Fix, optional: add `font-normal` to that `kbd`.

### D5 Note: the note hint is faint
Image: `out3\discuss-note.png`. Where: the hint under the textarea. Problem: `white/40` at `text-xs` is dim. It is still readable on a laptop, and it matches the other secondary hints. Fix: none needed.

### D6 Note (not this change): the progress counter can mislead
Image: `out3\question.png`. Where: the progress counter. Problem: it reads "1 / 2" while the second question is on screen, so it counts answered questions but reads like a position. Fix: none in this task; worth a look separately.

## Verdict: PASS

No Blocking findings. D4 and D5 are optional polish; D6 is outside this task.
