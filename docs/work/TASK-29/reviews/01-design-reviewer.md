# Design review round 1: TASK-29 / TASK-30 (feat/file-shapes @ a4ea92e)

**Images inspected:**
- The author's set in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-shapes\`: 01-discuss-card-read-{1440,390} and r2-{1440,390}/02–06. These were taken at 16:17–16:18. The last web fix, b76bfca, was committed at 16:20, so they probably show the uncommitted working tree.
- My own screenshots, taken on a4ea92e (the Viewer reported "dev · a4ea92e") against a scratch copy: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-shapes-design-r1b\`, `...-design-r1d\` and `...-design-r1e\`. The r1b and r1d folders came from runs that stopped partway, so they hold only some shots. I also created an empty `...-design-r1` folder by mistake and could not delete it.
- I stopped the one Viewer I started (port 4951).

**First impression:** The file list and the "let's discuss" option read well. But the plans card's "Discuss: work on the follow-up" takes me to a report that says "Every question answered" and gives me nothing to do.

## Findings

### D1 Blocking: the discuss card lands on a report with no next step, and the report contradicts itself
Image: `...-design-r1d\01-plans-report-full-1440.png`, `...-design-r1b\04-discuss-button-lands-1440.png`, `...-design-r1e\01-plans-report-390.png`
- **Where:** report header and "What needs you".
- **Problem:** The card's main button says "Discuss: work on the follow-up" and opens the report. The header pill says "Needs answers", but "What needs you" shows a "0" ring with "Every question answered, 1 of 1", and its action is "Review answers". Nothing says the next step is a day session. The only clue is a small "Let's discuss" pill further down. The owner cannot act without reading the whole page. Fails criteria 1 and 5.
- **Fix:** When the follow-up has open discuss items, add a row to "What needs you", for example: "1 point to talk through. Tell an agent here: 'work on the follow-up'". Show the note in that row. The Next night page already uses this wording.

### D2 Blocking: after a refused save, the note field is hidden under the error
Image: `...-design-r1e\04-save-no-note-390.png`; the author's `r2-390\04` and `r2-1440\04` show the same.
- **Where:** sticky footer.
- **Problem:** Pressing Save on "let's discuss" with no note shows the error. The error makes the footer taller, and the footer covers the textarea: at 390 wide the textarea sits at y 591–670 and the footer starts at y 563. Focus stays on Save because `setFocusNote(true)` only matters when the textarea first mounts. The owner is told to write a note but cannot see where. Fails criterion 4 (error state).
- **Fix:** On refusal, focus the textarea through a ref and call `scrollIntoView`, or scroll it into view above the footer.

### D3 Note: "Open" on a Markdown file downloads it
Image: `r2-1440\02-files-1440.png`
- **Problem:** `/questions/Q1/files/2` is served as `application/octet-stream` with `content-disposition: attachment`. Tapping "Open" downloads notes.md instead of opening it.
- **Fix:** Label the button "Download", or show .md and .txt files as text in the viewer.

### D4 Note: the media viewer header breaks on a phone
Image: `r2-390\03-view-390.png`
- **Problem:** "Actual size" and "Open in new tab" wrap onto three lines, the close button is squeezed into a narrow pill, and the title "Concept A" disappears. `Evidence.tsx` did not change in this diff, so the fault is older. This feature is the first to send the owner there from a phone.
- **Fix:** File a follow-up task: at phone width, use icon-only buttons and truncate the title.

### D5 Nit: the file list pushes the options below the fold on a phone
Image: `r2-390\02-files-390.png`
- **Problem:** Three file rows fill the first screen at 390 wide. The "Your answer" line in the footer softens this.
- **Fix:** Put the buttons on the same line as the path, or collapse the list after two files.

### D6 Nit: the discuss button wraps on a phone
Image: `01-discuss-card-read-390.png`
- **Problem:** "Discuss: work on the follow-up" wraps to two lines inside the pill.
- **Fix:** A shorter label, such as "Talk it through", would fit on one line.

### D7 Nit: the saved-answer summary marks discuss as done
Image: `r2-1440\06-after-save-1440.png`
- **Problem:** "Let's discuss" gets a green check, as if it were a settled answer.
- **Fix:** Use an amber or "discuss" icon for these answers.

What passes: the dashed amber discuss option, the placeholder in the required note, the note getting focus when discuss is tapped (textarea stays visible at 390), the Next night item with the note, file rows at 1440, and no sideways scrolling at 390 or 1440.

## Verdict: FINDINGS
