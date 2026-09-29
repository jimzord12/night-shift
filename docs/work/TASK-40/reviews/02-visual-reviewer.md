# Visual review round 2: TASK-40 batch 1 (05aacae)

Verdict: FINDINGS. Walked on the `morning` sandbox at 1440 and 390; re-walked on a clean build of
05aacae after the checkout's build changed mid-review. Screenshots kept privately.

Works: Tab and Shift+Tab stay in the deck; the Esc sequence with a note warns then leaves, focus
back on Start my morning; answer everything then Back to the Inbox; the media viewer from a
question and from the report keeps Tab, Enter under it does nothing, Esc closes only it and the
focus returns; multiple choice with Space and Enter; the moon buttons' accent ring; no sideways
scroll.

## Findings

- V1 Blocking: X and the gate's leave button never leave with an unsaved note; every press warns
  again. On a phone there is no Esc.
- V2 Blocking: the gate's warning renders at the top of a long gate, off-screen (y=-165 at 1440,
  y=-678 at 390); nothing visible changes.
- V3 Blocking (already in v21): a click on the picture or the video closes the viewer; in the
  deck the next Enter then saved the preselected answer.
- V4 Note (pre-existing): the viewer's header is cramped at 390.
- V5 Note: focus stops once on the page itself (Tab from Save, Esc in the note); harmless.
- V6 Nit: the warning says "leave again (Esc)" on a phone.
- V7 Note (outside this batch): closing the report's task drawer drops the focus.

Console clean apart from the PDF iframe's `net::ERR_ABORTED` in headless Chromium.
