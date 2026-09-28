---
id: TASK-29
title: Let the owner answer a question with let's discuss
status: Review
assignee:
  - '@claude'
created_date: '2026-09-27 21:42'
updated_date: '2026-09-28 13:50'
labels:
  - viewer
  - skills
  - cli
dependencies:
  - TASK-24
priority: high
type: feature
ordinal: 29000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
D24. The owner often does not understand a question or its options (for example: which logo direction do we keep?) and today can only pick, with the recommendation preselected and a hidden optional note, which invites rubber-stamping. Add a peer answer, I'm not sure, let's discuss, that needs a note. It is saved as a follow-up item of kind discuss: no unattended night acts on it; the day skill (do-night-shift-follow-up) raises it with the owner in the terminal first. The question's why shows up front in the deck. File-shape change to the night and follow-up files (update the owner's Adopters, CHANGELOG).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Choosing let's discuss without a note cannot be saved; with a note it saves and the follow-up carries a discuss item (test on real files, screenshot)
- [ ] #2 A night's plan may not work a discuss item as a task, and the day skill tells the agent to raise discuss items with the owner before anything else (test and skill text)
- [ ] #3 A follow-up whose open items are all discuss shows Needs answers, amber, as a card, with the next step work on the follow-up (test on real files, screenshot)
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Acceptance criteria verified; the final summary records the checks run, their results and what remains unverified.
- [ ] #2 npm run check passes on the integrated revision; a visible change has a screenshot someone looked at.
- [ ] #3 Review gate passed (docs/practices/review.md) or the small-change path recorded in the commit.
- [ ] #4 Docs, glossary, decisions and CHANGELOG are current; discovered work is tracked here without duplicates.
<!-- DOD:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
D24: the three file-shape changes (TASK-26 summary headline, TASK-29 discuss kind, TASK-30 file references) land together as one versioned change under the AGENTS.md rule. This task carries the version change (the new discuss kind and TASK-30's file references both break older readers; TASK-30 depends on this task); TASK-26 and TASK-30 ship in the same release. The summary limit applies to new nights only, so older night files stay valid.

tests/ui/deck.test.ts (TASK-8) clicks through the deck; update it if this changes what it clicks.

Built on feat/file-shapes with TASK-30, 39, 41, 44 (one versioned change: schemas @2, writers emit @2, @1 still read). Web: the deck offers I'm not sure, let's discuss (key 0), a note is required client and server side; the answer flows into a discuss follow-up item; a card whose follow-up only waits on a talk reads Needs answers with 'Discuss: work on the follow-up'. Evidence: .local/evidence/2026-09-28-shapes/{1440,390,r2-1440,r2-390} (log.txt: no note refused with the message, with a note saved as discuss; the plans card Needs answers after read).

Review round 1 (docs/work/TASK-29/reviews/01-code-reviewer.md, covering TASK-29, 30, 39, 41, 44): code FINDINGS. Dispositions: B1 fixed (a discuss answer is valid in nightProblems; tests: no problems after the answer, and a running night with a discuss answer closes). M1 fixed (a carried task keeps one decision item per followed decision, the work left on the first; test with a partial outcome). m1 fixed: plan.json is stamped plan@2, and a follow-up takes @2 when an answer flows into it (a night@1 with a discuss answer is refused by an older release as a problem, not misread). m2 fixed: tests for a hand-edited path outside the repository (404, nothing shown) and for a note changed meanwhile (409). m3 fixed (cli, glossary, AGENTS.md name @2). N2 filed as a spike (cross-site POSTs). N1, N3, N4 no action.

Review round 1 design and visual (01-design-reviewer.md, 01-visual-reviewer.md): FINDINGS. Dispositions: design D1 / visual V6 Blocking fixed: What needs you shows 'N point(s) to talk through' with the question, the owner's note and the phrase 'work on the follow-up'; the card button reads 'Talk it through' (design D6). Design D2 / visual V3 Blocking fixed: a refused discuss save focuses the note and scrolls it above the footer (focus TEXTAREA, note bottom 555 < footer top 564 at 390). Visual V1 / design D3 fixed: .md and .txt are served as inline text/plain (sandboxed), and Open shows them in a new tab (test). Visual V2 Blocking fixed: key 0 no longer types into the note (note empty after 0, then refused). Design D7 fixed: a discuss answer gets the amber ? on the gate, not a green tick. Visual V4 closed by 752a372. Deferred to TASK-40: design D4 / visual V8 (the media viewer header at 390), visual V5 (a missing file shows a broken image), design D5 / visual V7 (the file list pushes the options down). Evidence: .local/evidence/2026-09-28-shapes/r3-{1440,390}/ and r3/plans-report-*.png.

Review round 2 (02-*): code FINDINGS, design PASS, visual PASS. Dispositions: code M1 fixed (a carried task that ends on a new question keeps every decision it carried, after the question's item; test with the question unanswered and then answered). m1: correction of the round-1 disposition: a night@1 file answered 'let's discuss' is not refused by an older release; it shows a problem and an older follow-up may treat it as a decision. The Viewer keeps not writing schema (one writer per field); docs/design.md now states the limit and the CHANGELOG will. m2 fixed (tests: an @1 follow-up takes @2 when an answer flows in; .md is served with CSP sandbox). m3 fixed (ask refuses the option id 'discuss'). N1 no action. Design D8 fixed (one 'with you there'); D9, D10 no action. Visual V9 fixed: Next night says under a discuss item that no night works on it, with the phrase (.local/evidence/2026-09-28-shapes/r4/next-night-discuss-*.png); V10 no action.
<!-- SECTION:NOTES:END -->
