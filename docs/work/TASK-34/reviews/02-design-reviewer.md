# Design review round 2: TASK-34

Images inspected: `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\ci\.local\evidence\2026-09-28-keyboard\out4\question.png`, `discuss-note.png`, `gate.png` and `all-clear.png`, all at 1280x800 and written 19:35:51 to 19:36:00. Commit 06598b8 landed at 19:34:32, so the images show that head. I compared them with `out3\discuss-note.png` from round 1 and read the web part of the 06598b8 diff (`web/src/QuestionDeck.tsx`, `web/src/Gate.tsx`). I took no new phone captures: every changed chip is still `hidden sm:inline`, so phone width is the same as my round-1 captures.

First impression: with the cursor in my note, the Save button now shows the keys that actually work, and it agrees with the hint under the note.

## Findings

### D1 Note: the Save hint now tells the truth in the note
Image: `out4\discuss-note.png`. Where: the Save button. The chip reads "Ctrl+Enter" while the textarea has focus and "Enter" otherwise (`question.png`). The state follows the textarea's focus and blur, so Esc, which blurs the note, flips it back to "Enter". Round 1 had a small lie here: `out3` showed "Enter" while plain Enter only added a new line. That is fixed.

### D2 Note: the S chip weight is fixed
Image: `out4\gate.png`. The chip now has `font-normal` and reads at the same weight as the other chips. My round-1 D4 is closed.

### D3 Nit: the footer shifts when the cursor enters the note
Image: `out4\discuss-note.png` against `question.png`. Where: the footer buttons. Save grows from about 180px to about 229px, so "Not now" moves about 48px left each time the note gains or loses focus. It is a small jump and happens only on focus changes. Fix, optional: give the chip a `min-w`, or accept it.

### D4 Nit: the same shortcut is written two ways
Image: `out4\discuss-note.png`. The hint under the note shows two keys, `Ctrl` + `Enter`. The button shows one chip, `Ctrl+Enter`. Either form is readable, and the button form is the compact choice for a tight footer. Fix, optional: none needed.

### D5 Note: no overflow at the `sm` breakpoint
In the 1280px capture the footer measures about 125 + 159 + 229px plus gaps, roughly 530px. The narrowest width that shows chips (640px) leaves about 590px of content width, so the longer chip still fits on one line. Below 640px the chips are hidden, as before.

### D6 Note: nothing else changed on screen
`question.png` and `all-clear.png` match round 1 apart from the star background. Round-1 D6 (the progress counter reads "1 / 2" on the second question) is still outside this task.

## Verdict: PASS

No Blocking findings. D3 and D4 are optional polish.
