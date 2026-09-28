# Visual review round 1: TASK-29 / TASK-30 (file shapes v2, Viewer side)

Viewer: `dev · a4ea92e` on the first run, then `dev · 752a372` (the author committed mid-review; that commit touched no `web/` files). Port 4971, fresh scratch data from both setup scripts for every run. Playwright came from agentic-wave, headless Chromium. I did not press Show in folder. Instead I called its endpoint with a missing index: 404 "no such file", and no window opened.

Journeys:
1. **Files: walked to the end, one break.** At both widths the deck lists 3 files, View opens each svg in the media viewer, and Esc returns to the deck. The markdown file's "Open" does not open anything readable (V1).
2. **Let's discuss: walked to the end, three defects.** The refusal and message work. The gate and the report drawer both show "Let's discuss". But key 0 corrupts the note (V2) and focus does not go to the note (V3).
3. **Plans card: walked to the end.** "New / Read the report" becomes "Needs answers / Discuss: work on the follow-up" after reading, and the button opens the report. Checked at both widths.
4. **Regression: walked to the end.** Ordinary answers save by click plus Enter, and Start my morning ends on the "One step left" gate at both widths.

## Findings

### V1 Blocking: the markdown file's "Open" downloads instead of opening
Journey/step: 1, the `concepts/notes.md` row. Width: both.
- Saw: the server sends `.md` as `application/octet-stream` with `Content-Disposition: attachment`, so the `_blank` tab stays blank and the file downloads. There is nothing to read, and on a phone it lands in Downloads.
- Expected: the markdown opens readable in a new tab.
- Screenshot: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-file-shapes\w1440-06-deck-after-files.png` (the headers were checked with `curl -I`).
- Fix: add `.md` and `.txt` to `src/files.ts` as `text/plain; charset=utf-8`, and add `text/plain` to `INLINE` in `src/server.ts` (the sandbox CSP stays).

### V2 Blocking: key 0 types "0" into the note, which gets past the required-note rule
Journey/step: 2, press 0. Width: 1440.
- Saw: the note box opens focused and already holds "0". On the a4ea92e run, pressing Esc then Enter saved `answer: "discuss", note: "0"` to the night file.
- Expected: an empty note, so Save is refused until the owner writes one.
- Screenshot: `...\w1440j2-02-discuss-key0.png`
- Fix: call `e.preventDefault()` in the `'0'` branch of the deck's keydown handler.

### V3 Blocking: after a refused Save, focus does not go to the note, and on a phone the note is hidden
Journey/step: 2, Save with an empty note. Width: both.
- Saw: the message appears, but focus stays on Save (click) or on the page body (Enter). `setFocusNote` only works through `autoFocus` when the box first appears, and here it is already showing.
  - At 1440 the box is half behind the footer.
  - At 390 it is fully behind it (box top 635, footer top 608). The message asks for a note the owner cannot see.
- Expected: the note box is focused and scrolled into view.
- Screenshots: `...\w1440j2-04-discuss-click-refused.png`, `...\w390j2-04-discuss-click-refused.png`
- Fix: put a ref on the textarea and call `ref.current?.focus()` in the refusal branch (its onFocus handler already scrolls it into view).

### V4 Note: fixed during the review
At a4ea92e every discuss answer showed a red "This night file has problems: Q1: answer "discuss" is not an option" banner in the report. 752a372 removed it, and I confirmed the banner is gone. Screenshot: `...\w1440k0-design-report-full.png`

### V5 Note: a missing file shows a broken image
A file deleted after the question was asked still offers View, and the viewer shows the browser's broken-image icon rather than a "file not found" message. This is the shared media viewer. Screenshot: `...\w1440m-02-missing-file.png`

### V6 Note: the plans report contradicts itself and gives no next step
The badge says "Needs answers" while the section says "Every question answered". Nothing says what "work on the follow-up" means, which is to start a day session. Screenshot: `...\w1440j3-03-plans-report.png`

### V7 Nit: at 1440 x 900 the discuss choice starts below the fold
With three files listed, "I'm not sure, let's discuss" sits behind the sticky footer. Screenshot: `...\w1440-02-deck-design-files.png`

### V8 Nit: the media viewer's header is cramped at 390
The buttons wrap into blobs, the Close button is squeezed into an oval, and the caption is dropped. Screenshot: `...\w390-03-media-0.png`

## Console
Clean on every journey at both widths: no errors, warnings, page errors or failed requests. The only 404 and console error came from my own missing-file probe (V5).

## Verdict: FINDINGS
Three Blocking: V1, V2 and V3. Evidence is in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-file-shapes\` (47 files). The Viewer I started is stopped and port 4971 is free.
