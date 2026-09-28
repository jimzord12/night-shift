# Visual review round 5: TASK-29 (with TASK-30, 39, 41, 44)

**Viewer:** `dev · cfa72f3`. I ran two fresh data sets, both built the same way: the owner-states setup, then the shapes setup, then `held.ts`.
- Port 4951 served the 1440 walk. Its data is in `scratchpad\vr5test`.
- Port 4952 served the 390 walk. Its data is in `scratchpad\vr5m`.

I drove both in headless Chromium, using the agentic-wave copy of Playwright. At 390 the browser was set as a phone with touch. I first checked that the built bundle contains the new "Waits for your talk about" text.

**Journeys:**
- **(a) Report: walked to the end at both widths.** Inbox → the invoices night of 27 Sept ("New / Read the report") → its Report.
  - "What needs you" shows "1 point to talk through" with the question, the owner's note, "No night works on these" and a copyable `work on the follow-up`.
  - "Saved for the next agent" shows A1 with "Let's discuss". A2 and A3 each carry an amber "Waits for your talk" chip.
  - Opening the task shows its question and "→ Let's discuss".
  - The older night of 26 Sept reads Done, 0 open, with both items "carried".
  - Verdict: it is clear which items wait for the talk and what to say.
- **(b) Next night: walked to the end at both widths.** The invoices group has A1 with the discuss line. A2 ("Which invoice layout? → Detailed") and A3 ("Where do invoices live? → Cookie session") each say "Waits for your talk about this task: no night works on it until then." It wraps cleanly at 390.
- **(c) Answering the design question: walked to the end at both widths.**
  - Start answering → key 0 selects "I'm not sure, let's discuss" and focuses the note → typed a note → Ctrl+Enter.
  - The "One step left" gate lists the answer as "Let's discuss". Save for the next agent works.
  - Without a reload, the Report shows "1 point to talk through" with my note, the Saved confirmation and A1 "Let's discuss".
  - The Inbox updates on its own: the design card reads "Needs answers / Talk it through", questions go 3→2, and Next night goes 9→10.
- **(d) The invoices card, with nothing else resolved: walked at both widths.** Before it is opened it reads "New / Read the report". Once read it reads "Needs answers / Talk it through", and the button opens its Report. Start my morning skips it and goes straight to docs/blog.

## Findings

### V11 Note: the Next night count still includes items no night will pick up
- **Where:** journeys b and c, at 1440 and 390.
- **Saw:** "Next night 10" and "10 for the next night". Five of those ten are discuss or held items (invoices 3, plans 1, design 1), and each of them says "no night works on this". The page intro still reads "What the next night in each repository will pick up".
- **Expected:** the count matches what a night will actually plan.
- **Screenshot:** `w1440-b01-next-night.png`
- **Fix:** leave held and discuss items out of the badge and stat, or word the intro as "... will pick up, or wait for your talk". This is the optional half of V9, but it now covers half the list.

### V12 Note: the Saved confirmation offers "start night shift" when nothing is left for a night
- **Where:** journey c, after Save on design, at 1440 and 390.
- **Saw:** "Nothing runs yet... say one of the phrases: `start night shift` / `work on the follow-up`". The same screen says "No night works on these", and the only open item is a discuss item.
- **Expected:** when every open item waits for a talk, offer only `work on the follow-up`.
- **Screenshot:** `w1440-c07-report-after-save.png`, `w390-c07-report-after-save.png`
- **Fix:** hide the start-night-shift phrase when the saved follow-up has no item a night can plan.

### V13 Note: the Report's held rows drop the question
- **Where:** journey a, at both widths.
- **Saw:** the Report says "Add PDF invoices to the checkout → Detailed" and "→ Cookie session", which leaves the owner guessing what each choice was about. Next night shows the question for the same items.
- **Screenshot:** `w1440-a03-report-invoices27-settled.png`
- **Fix:** show the item's `question` in the Report row, as Next night does.

### V14 Nit: the state reads "Needs answers" when every question is answered
- **Where:** journeys a, c and d.
- **Saw:** the pill and step track say "Needs answers" directly above "Every question answered, 1 of 1". After the save, the step track steps back from "Ready to save" to "Needs answers".
- **Screenshot:** `w390-a03-report-invoices27-settled.png`
- **Fix:** a later wording pass, for example "Needs you". Round 2 already accepted this label, so I am not re-judging it.

Nit: "No night works on these" is plural under "1 point".

## Console
Clean on every journey at both widths: no console errors or warnings, no page errors, no failed requests, no HTTP 4xx/5xx. The overflow probe found no sideways scroll on any screen.

## Verdict: PASS
No Blocking findings; V11–V13 are Notes and V14 is a Nit.

**Evidence:** 36 screenshots in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-file-shapes-r5\`. The scripts (`vr5-*.mjs`) and both data sets are in the session scratchpad. Both Viewers I started (4951, 4952) are stopped and the ports are free.

**Side note:** my first set-up, in scratch folder `vr5\`, registered only design, plans and invoices. The owner-states step printed nothing there. A clean re-run in a new folder produced all 13 repositories. This is probably environmental and has nothing to do with the change.
