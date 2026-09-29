# Context review round 1: TASK-36 (feat/multi-select, f807d97)

Verdict: FINDINGS. The change captures the principle: one question, a recommended set, a set back;
the single-choice path unchanged; older night files still read. The skill, the tool's refusals,
design, D34, the follow-up skill and the version references agree; LF only; no real names.

## Material

1. docs/design.md:275: "An answer is an option id, `"discuss"` (with a note), or `null`." is wrong
   for a multiple-choice question and contradicts the version-4 paragraph above it. Amend in
   place.

## Minor

2. SKILL.md:213 is 100 characters; re-wrap 209-217.
3. docs/design.md:480-481: the deck description says only "the recommendation preselected"; add
   the tick boxes (D34).

## Notes

4. design.md:196-197 narrows it to "keep/drop choices"; the skill also gives "which checks to add".
5. The follow-up lists only the chosen labels; suggest phrasing the question so the chosen set
   reads on its own. Optional.
6. "Multiple-choice question" needs no glossary entry.
7. The CHANGELOG entry comes with the release.
