# Visual review round 1: TASK-28

**Viewer:** dev · bccc942 (web built from the clean `feat/save-gate` tree). 13 scratch samples, one per walk, on ports 4862-4874, each made fresh with `setup.ts`. The lock walk ran `hold.ts` on the s12 blog repo, item `2026-09-26-a/A1`. All servers and the hold process are stopped.

**Journeys:**
1. **Start my morning to the end** (1440, 390, 360): the gate lists docs with its answer and T2 (blocked); blog shows as "Already saved earlier". Save shows the confirmation; both copy buttons put the exact phrase on the clipboard and the label changes to "Copied". Back to the Inbox shows docs as "Waiting for an agent" without a reload; Next night goes from 5 to 6. The confetti is one burst: over the text at 0.5 s, faint at 2 s, then gone.
2. **Card "Answer 1 question"** (1440, 390): the gate shows docs only.
3. **"Not now"** (1440, 390): docs is still "Ready to save"; Review answers in the report reaches the gate again.
4. **Blog, follow-up already saved** (1440, 390): the gate says "Already saved earlier: blog". Changing Q1 from Giscus to Utterances rewrote `follow-ups/2026-09-26-a.json` (A1 is now "Utterances").
5. **Locked by a running night** (1440, 390): the lock line names night 2026-09-28-a; options are disabled and there is no Save, only Next. After stopping `hold.ts` and reloading, the Viewer recovered that night ("Stopped early"); A1 went back to open and could be edited and saved; A2 and A3 show as skipped by that night.
6. **Keyboard:** Enter walks the deck and Escape closes both the deck and the gate. It breaks at the gate: see V1.

## Findings

### V1 Blocking: Enter on the gate closes it without saving
Journey 6 (also 1 and 2), 1440. After Enter through the deck, which shows the "Save Enter" hint on every question, the gate appears. One more Enter closes the deck. Nothing is saved, and docs stays "Ready to save". Focus is on `<body>` and the gate shows no key hint. Expected: Enter presses "Save for the next agent" when something is waiting to be saved, and closes only on "All clear". Screenshots: `.local/evidence/2026-09-28-visual-gate-r1/j6-01-gate-1440.png`, `j6-02-after-enter-on-gate-1440.png`. Fix: in `QuestionDeck.tsx` (the `if (finished)` branch), Enter closes only when the gate is All clear; otherwise the gate handles it.

### V2 Note: Enter does nothing on a locked question
Journey 5, 1440 and 390. `save()` returns early when the question is locked, so the keyboard walk stalls. Fix: on a locked question, Enter calls `advance(savedKeys)`. Screenshot: `j5-held-02-deck-0-1440.png`.

### V3 Note: the gate hedges on a night it knows is locked, and celebrates
Journey 5, 390. "All clear. Everything you answered is saved… unless an agent is working on them now", plus confetti, while night 2026-09-28-a holds both items. The same confetti fires on journey 4, where nothing new was saved. Expected: a plain statement, and confetti only when something was saved in this deck. Screenshots: `j5b-held-02-gate-390.png`, `j4-04-gate-1440.png`.

### V4 Note (outside this change): blog still reads "Waiting for an agent" while a night works on it
Journey 5, 1440. The Inbox row and the report badge say "Waiting for an agent"; the saved-for-next-agent list shows "3 open" with no mention of the running night. Screenshots: `j5-held-00-inbox-1440.png`, `j5-held-01-report-1440.png`.

### V5 Note (outside this change): a 409 on the first answer after a fresh start
Journey 4, 1440. POST answer returned 409 "the night changed since you opened it". The first `/api/overview` call writes Meter `metrics` into closed nights that have none, and that races the detail the deck had already loaded. A second Enter saved. Seen only on fresh samples; reproduced 2 of 4 times.

### V6 Nit
- The lock line names the night by its ID "2026-09-28-a" rather than "Night of Mon 28 Sept".
- The report's side card still says "Answer what you can first" when every question is answered (`j3b-01-report-1440.png`).
- Long repository paths wrap mid-word in the confirmation; fine at real path lengths.

## Console
One 409 plus its "Failed to load resource" error (V5, sample-data race). Otherwise clean at every width. No sideways scroll: `scrollWidth` equals the viewport width at 1440, 390 and 360.

## Verdict: FINDINGS
One Blocking: V1. Screenshots and videos of journey 1 are in `.local/evidence/2026-09-28-visual-gate-r1/`.
