# Visual review round 2: TASK-29 / TASK-30 (file shapes v2, Viewer side)

Viewer: `dev · 6d06ec1`, port 4981. I checked that the built bundle contains "Talk it through" and no longer contains "Discuss: work on the follow-up". The data came fresh from both setup scripts (owner-states `setup.ts` plus shapes `setup.ts`) before every walk, in the scratchpad under `vrs2\`. Playwright was the agentic-wave copy, in headless Chromium, at 1440x900 and at 390x844 with touch. I did not press Show in folder.

Journeys:
1. **Files: walked to the end at both widths.** Both svg files open in the media viewer and Esc returns to the deck. The markdown file's Open now shows a new tab with `text/plain; charset=utf-8`, no attachment header, and the text reads "# Concepts / A is calmer, B is louder.". No sideways scroll.
2. **Let's discuss: walked to the end at both widths.**
   - Key 0 focuses the note, and the note stays empty.
   - After Esc, Enter is refused with the message. So are Ctrl+Enter and a click on Save with a blank note. Each time focus lands on the textarea and the textarea sits above the footer: bottom 599 vs footer 608 at 390, bottom 716 vs 754 at 1440.
   - With a note, it saves `answer: "discuss"` and the note to `night.json`.
   - The gate shows an amber "?" and "Let's discuss".
   - Extension walk: I pressed Save on the design report. Without a reload, it shows "1 point to talk through" with the question, my note, the phrase and Copy. The card flips to Needs answers / "Talk it through", which opens the report.
3. **Plans card: walked to the end at both widths.** "New / Read the report" → report → "1 point to talk through" block → back to the Inbox. The card now reads "Needs answers / Talk it through", and the button opens the report. Copy puts `work on the follow-up` on the clipboard and the button shows "Copied".
4. **Regression: walked to the end at both widths.** Ordinary answers save with a click plus Enter, and Start my morning ends on the "One step left" gate.

## Findings

Round-1 V1, V2, V3 and V6 are confirmed fixed (steps and numbers above). V5, V7 and V8 are deferred to TASK-40 and I did not re-judge them.

### V9 Note: the Next night page promises that a night will pick up a discuss item
Journey/step: after the discuss save (2b), Next night tab. Width: 1440.
- Saw: the header says "What the next night in each repository will pick up. It starts when you tell an agent there: 'start night shift'…". Directly under it, design and plans each list one item tagged "Let's discuss". Both are counted in the "Next night 7" badge and in "7 for the next night". The report says "No night works on these."
- Expected: the two screens agree. Discuss items should read as waiting on a day session with the owner.
- Screenshot: `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-file-shapes-r2\w1440jn-02-next-night.png`
- Fix: under a discuss item on Next night, add a line such as "No night works on this: say 'work on the follow-up' with you there". Optionally, leave a follow-up whose open items are all discuss out of the Next night count.

### V10 Nit: the markdown tab renders small on a phone
Journey/step: 1, the notes.md Open. Width: 390.
- Saw: it is a raw `text/plain` page on a 980px layout viewport. The text is small but readable, and it wraps.
- Screenshot: `...\w390-05-md-tab.png`
- Fix: none needed now. A later pass could render markdown in the media viewer.

## Console
Clean on every journey at both widths: no console errors or warnings, no page errors, no failed requests, no HTTP responses of 400 or above. The overflow probe found no sideways scroll on any screen.

## Verdict: PASS
There are no Blocking findings: all three round-1 Blocking findings (V1, V2, V3) are fixed. V9 is a Note on wording, and V10 is a Nit.

Evidence: 61 files in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-file-shapes-r2\`. The scripts are in the session scratchpad under `vrs2\` (`j1`, `j2`, `j2b`, `j3`, `jn`, `jc.mjs`). The only Viewer I started (port 4981) is stopped, and the port is free.
