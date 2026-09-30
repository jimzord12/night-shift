# Code review round 4: TASK-40 batch 1 (base 5a2df7d, head 23f29b7)

Verdict: PASS. Lead lenses: the arming model (`warned = message === LEAVE_WARNING`) and stale
closures; whether each new test step fails with its fix reverted.

Lens 1: every path that sets or clears `message` traced; no path drops a note without the warning
on screen. Another message replacing the warning makes a later leave warn again (the safe side).
The window keydown is a discrete update that commits and re-subscribes before the next input, so
a stale `warned=true` would need two keydowns in one task. Pointer-down on a leave control sets no
state, so the click's closure is current. Every way out reaches its second attempt.

Lens 2 (six mutations): the repeat guard, the Enter/Space narrowing, the root `stopPropagation`
and the pointer-down exemption each fail a test; dropping `if (pressLeave) return` (M2) and
narrowing to Enter only (M5) do not.

## Findings

- R4-1 Minor (QuestionDeck.tsx:261, :265): Space on a leave control and Enter on a clicked one are
  untested (M2, M5 pass). Behaviour is correct by probe.
- R4-2 Minor (Report.tsx:325, predates the diff): a held Esc in the drawer's media viewer closes
  the drawer too. Ignore the repeat.
- R4-3 Note: Enter on a gate with something left to save keeps the warning; it stays visible.

Checks: `npm run check` 87/87; `npm run test:ui` 9/9; mutations M1-M6; probes P1-P4.
