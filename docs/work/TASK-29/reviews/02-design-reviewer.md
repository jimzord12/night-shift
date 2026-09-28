# Design review round 2: TASK-29 / TASK-30 (feat/file-shapes @ 6d06ec1)

**Images inspected:**
- The author's screenshots in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-shapes\`: r3-1440 (01–07), r3-390 (01–07) and r3\plans-report-{1440,390}.png. They were taken at 16:37–16:38, and the Viewer in them shows "dev · 752a372". So they show the working tree just before commit 6d06ec1 (16:38:46).
- To confirm the committed head, I took my own screenshots on a scratch copy with the Viewer reporting "dev · 6d06ec1". They are in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-shapes-design-r2\`: 01-inbox, 02-plans-report (both at 390 and 1440), and 03–07 at 390 (the deck, the refused save, a long note, and the gate after saving). No sideways scrolling at either width.
- I stopped the one Viewer I started (port 4953).

**First impression:** Now the plans card says "Talk it through", and the report opens with "1 point to talk through", my own note, and the exact words to say to an agent. I know what to do without reading further.

## Findings

Both round 1 Blocking findings are fixed:
- **D1 (the discuss card had no next step):** fixed. The top row of "What needs you" names the point, shows the note, and gives the phrase with a Copy button. The Inbox card button reads "Talk it through" once the report has been opened. It reads "Read the report" while the night is still New, which is fine.
- **D2 (the note was hidden after a refused save):** fixed. After the refusal at 390, the textarea has focus and sits at y 520–599, fully above the footer and the error (my 05-refused-390.png).
- **D7 (discuss marked as done):** fixed. The gate now shows the amber "?" instead of a green tick.

### D8 Note: the talk-through instruction says "with you there" twice
Image: `...-design-r2\02-plans-report-390.png`
- **Where:** the "1 point to talk through" row.
- **Problem:** The text reads "Open Claude Code in this folder, with you there, and say:", and the caption under the command says "now, with you there". At 390 wide the command also breaks after "work on the".
- **Fix:** Drop the caption in this row, or drop "with you there" from the sentence.

### D9 Nit: the report's status and the answered-questions row disagree slightly
Image: `...-design-r2\02-plans-report-1440.png`
- **Problem:** The status pill on the report reads "Needs answers", while the row below reads "Every question answered, 1 of 1". The talk-through row above now explains why the night still needs the owner, so this no longer blocks acting. A calmer pill label such as "Needs a talk" would read truer.

### D10 Nit: the gate's full-page capture cuts the "Not now" button
Image: `...-design-r2\07-after-save-390.png`
- **Problem:** "Not now, back to the report" is cut at the edge of the viewport. This comes from taking a full-page screenshot of a fixed overlay, not a real layout fault. I note it only so nobody misreads the image.

Deferred to TASK-40, as the task records: D3 (fixed), D4 and D5. Not re-judged here.

## Verdict: PASS
