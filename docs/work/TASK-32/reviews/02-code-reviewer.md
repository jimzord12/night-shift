# Review round 2: TASK-32

Snapshot: `git diff f02fe39 42f9163` in `C:\Users\jimzord12\Documents\GitHub\night-shift.worktrees\explain` (HEAD 42f9163, clean). I read the round-2 delta `a77089e..42f9163` line by line: Explainer.tsx, Report.tsx, ui.tsx, the task-32 and task-40 notes, and the stored round-1 reports.
Lead lenses: 2 correctness (the Tab trap beside HowItWorks' capture listener; the phone ring sized from `window.innerWidth`), 6 failure handling
Coverage:
1. Wiring: the changed `?` placements reach the real Report header (stopped-early line, last outcome count) and the gate's SaveCard. `StoppedEarly`'s new `after` prop is optional. Its other callers (Inbox.tsx:92 and 151, Views.tsx:102) are unchanged and put no `?` inside a button.
2. Correctness (deep): both window capture listeners stay registered. The child effect (HowItWorks `onKey`) registers before the parent's `onTab`. `stopPropagation` does not stop other listeners on the same target, so `onTab` always runs. The evidence agrees: 0 of 50 presses left the dialog. `inside` counts the panel itself: Tab from the panel lands on Close, and Shift+Tab wraps to Next. The selector finds 8 controls, none disabled. The phone ring is read again on every render, which includes every step change. The JS breakpoint (<640) matches Tailwind `sm` (40rem). Both mismatched states after a resize fit on screen (see N1).
3. Data integrity: the only write reachable from here is the gate's Save. The Tab path is closed; one non-Tab path remains (m1).
4. Contracts: n/a. There is no API, schema or file-shape change, and the `after` prop is additive.
5. Tests and evidence: there is no web test harness. I read the r3 logs and viewed 04-gate (both widths), 02-report-stopped-early (both), 03-stopped-early-help-390 and 01-ring-step2-390. They show the gate's Save row before `?`, a settled stopped-early report, the 190 px ring, the curly quotes and the note icon. Round-1 M1 is resolved (see N2 on build identity).
6. Failure handling (deep): the explainer does no I/O. One failure path interacts with the modal (m1).
7. Simplicity: the trap is small and lives in the overlay that owns it. A second capture listener beside `onKey` is acceptable.
8. Repo and docs: the round-1 reports are stored verbatim, the dispositions are on the task, the deferred items are on TASK-40, all files are LF, and `git diff --check` is clean.

## Findings

### m1 Minor: a failed save moves focus behind the open dialog, where Enter or Space saves again
Anchor: web/src/Gate.tsx:152 (`setTimeout(() => button.current?.focus(), 0)`) against web/src/Explainer.tsx:97-110
- **Scenario:** press Save on the gate, then press its `?` while it says "Saving…" (the `?` stays enabled). The save fails (a 409 or a server error).
- **Expected:** focus stays in the `aria-modal` dialog.
- **Actual:** the error path focuses the Save button behind the overlay. The trap only acts on Tab. The `onKey` listener stops propagation but does not call `preventDefault`, so Enter or Space clicks Save behind the explainer.
- **Impact:** low. The window is only a local request's duration, and the result is a retry of a save the owner had already asked for, not unintended data.
- **Smallest fix:** in `onTab` (or `onKey`), when focus is outside the panel and the key is Enter or Space, `preventDefault()` and focus the panel. Or record why not.

### N1 Note: the ring size does not follow a resize until the next step
Anchor: web/src/Explainer.tsx:224
Rotating a phone or narrowing a window keeps the old ring until the step changes, while the `sm:size-11` step buttons switch at once. I checked the extremes: a 190 ring with 44 px buttons is 78 px apart with no overlap, and a 260 ring fits at 390 (about 326 px of content). The cost is cosmetic only. A `matchMedia('(min-width: 640px)')` listener would make it exact if TASK-40 touches this.

### N2 Note: the evidence header reads `dev · a77089e`
The r3 screenshots were taken at 16:00-16:01, before the 42f9163 commit (16:01:37), from the uncommitted fix built on a77089e. Every visible change in 42f9163 shows in them, so I accept them as this snapshot. A tree-hash note in the log would remove the doubt next time.

### N3 Note: on the 1440 report the stopped-early `?` sits slightly below the text baseline
This is `inline-block align-middle` inside an `items-start` span. It is the design reviewer's call.

## Checks rerun
Output folder: `C:\Users\jimzord12\AppData\Local\Temp\claude\C--Users-jimzord12-Documents-GitHub-night-shift\d05d2575-8528-4b86-9570-aeb70eeb87b4\scratchpad\r2-TASK-32\`
- `npm run typecheck`: exit 0 (`typecheck.log`)
- `npm test`: exit 0, 37 pass, 0 fail (`test.log`)
- `vite build --config web/vite.config.ts --outDir <scratch>\dist`: exit 0 (`build.log`). The worktree's web/dist was not touched, and `git status` is clean afterwards.

## Evidence inspected
- 42f9163: web/src/Explainer.tsx (whole file), Report.tsx:55-80 and 184, ui.tsx:82-91, Gate.tsx:95-180, App.tsx:190-286, Evidence.tsx:27-38, and the StoppedEarly callers.
- `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-explainer\r3\{1440,390}\`: both log.txt files and six screenshots.
- docs/work/TASK-32/reviews/01-code-reviewer.md and 01-visual-reviewer.md, plus the task-32 record.

## Limitations
- I drove no browser. The listener order and the m1 path are reasoned from DOM dispatch rules and the code, supported by the author's 50-press log.
- Safari's default setting (Tab skips buttons) was not checked. There, the first Tab from the panel may reach a link behind before the trap pulls focus back. Buttons such as the gate's Save are still unreachable.

## Verdict: PASS
