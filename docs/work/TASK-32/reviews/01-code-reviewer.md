# Review round 1: TASK-32

Snapshot: `git diff f02fe39 a77089e` in the `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\explain` worktree (HEAD a77089e, clean). The TASK-32 files are Explainer.tsx (new), App.tsx, Gate.tsx, Inbox.tsx, Report.tsx, docs/design.md and the task-32 record. The merges d1977ce and 978a546 only bring in TASK-28 files, so they are out of scope.
Lead lenses: 1 wiring, 2 correctness (keyboard, focus, autoplay, reduced motion)
Coverage:
1. Wiring was checked in depth. `explain()` dispatches a window CustomEvent. `useExplainRequests` in App receives it, and App renders the overlay last in the DOM at z-50, above the deck at z-40. The header ?, the gate's SaveCard, the Report's Save row, the outcome counts and the stopped-early line all reach it. The empty Inbox renders `HowItWorks autoplay` only when `!overview.nights.length`. The acceptance criterion is met.
2. Correctness was checked in depth. The window capture listener calls `stopPropagation` on every key. This does stop the deck's window bubble listener (QuestionDeck.tsx:181) and the TaskDrawer's (Report.tsx:249). Button activation still works because default actions are not prevented. Focus returns to `activeElement` captured at mount, and this is safe under StrictMode's double effect. Autoplay is on only with `autoplay && !reduced` and stops on any step. Finding m1 is a gap.
3. Data integrity: n/a. The change is read-only UI; the one write path it touches is covered in m1.
4. Contracts: n/a. There is no API, schema or file-shape change.
5. Tests and evidence: no automated test, because the repo has no web test harness; the Playwright walk log is the evidence. See M1.
6. Failure handling: n/a. The change does no I/O.
7. Simplicity: a single event bus instead of threaded callbacks is justified and small. It sits in its own module.
8. Repo and docs: design.md has the paragraph, D24 already names the explainer, all files use LF, and scope is limited to the task.

## Findings

### M1 Material: two visible changes have no clear screenshot
Anchor: web/src/Gate.tsx:172-177; web/src/Report.tsx:63
- **Scenario:** the gate's Save button went from `w-full` to `flex-1` with a new ? beside it, and the stopped-early line got a ? too.
- **Expected:** a screenshot of each at 390 and 1440, per review.md ("a visible change nobody looked at is Material").
- **Actual:**
  - r2/*/05-gate-help only shows the gate blurred behind the overlay.
  - The sample night has no `not_started` task, so the stopped-early ? appears in no screenshot.
  - r2/1440/03-report caught the Report header mid-`pop-in`, so it is invisible; the outcome-count ? shows only faded at 390.
- **Impact:** the Save row in the owner's main journey was never seen at phone width.
- **Smallest fix:** one screenshot of the gate before pressing ? at both widths, plus a Report screenshot taken after the animation settles, on a night that stopped early.

### m1 Minor: the dialog does not hold focus, so keys can press buttons hidden behind it
Anchor: web/src/Explainer.tsx:143-157, 101-118
- **Scenario:** open the gate's ?, press Shift+Tab, then Enter.
- **Expected:** focus stays in the `aria-modal` dialog.
- **Actual:** focus moves to the deck's last button, "Not now, back to the Inbox" (Gate.tsx:107). Enter's default action is not prevented, so the deck closes behind the overlay. Tabbing forward past the end reaches the header nav behind both layers.
- **Impact:** low. It needs a keyboard user and deliberate tabbing, and no data is written from the gate order.
- **Smallest fix:** in the existing capture handler, wrap Tab and Shift+Tab within `panel`, or set `inert` on the app body while the overlay is open.

### N1 Note: some places with these terms have no ?
The Inbox card's "Save for the next agent" button (Inbox.tsx:132), its stopped-early line (Inbox.tsx:151) and History's stopped-early line (Views.tsx:102) have no ?. The Inbox is where the owner first meets the terms. This is a scope choice.

### N2 Note: reduced motion only turns off autoplay
With reduced motion set, `pop-in` on each step, the 1.12 scale and glow, and the ring's dasharray transition all still run; styles.css:187 covers only `.cta`. The task asked only about autoplay.

### N3 Note: one sentence could mislead
Step 2 says tasks that never started "carry over to the next one". That reads as automatic, while step 4 says saving is what carries them. "...they can carry over once you save" would be clearer.

### N4 Note: small interaction details
- A text-selection drag from the panel onto the backdrop closes the overlay.
- The page behind still scrolls through the overlay.
- The autoplaying `aria-live` region updates every 6 s with no pause except taking a step.

## Checks rerun
- `npm run typecheck`: exit 0. Output in `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r1-TASK-32\typecheck.log`
- `npm test`: exit 0, 37 pass, 0 fail. Output in `test.log` in the same folder.
- `vite build --config web/vite.config.ts --outDir <scratch>/dist`: exit 0. Output in `build.log`; the worktree's web/dist was not touched.
- `git status` afterwards: clean.

## Evidence inspected
- a77089e: Explainer.tsx, App.tsx, Gate.tsx, Inbox.tsx, Report.tsx, QuestionDeck.tsx:97-191, Evidence.tsx:27-42, ui.tsx, styles.css, main.tsx, docs/design.md:419-432, docs/decisions.md:308-312, and the task-32 record.
- `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-explainer\r2\{1440,390}\`: 01, 03, 04 and 05 png, and both log.txt files. The files are dated 15:28-15:29, just before the a77089e commit at 15:29:46; their header shows dev · 978a546.

## Limitations
- I did not drive a browser. Focus return, reduced motion and Safari click-focus behaviour were reasoned from the code, not observed; the walk log does not assert focus return.
- The evidence lives in the main checkout's `.local`, not in the worktree.

## Verdict: FINDINGS
