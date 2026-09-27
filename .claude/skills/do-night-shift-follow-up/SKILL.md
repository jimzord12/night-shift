---
name: do-night-shift-follow-up
description: Work through a Night Shift follow-up by day - the decisions the developer made and the unfinished work from a night - and mark each item done or skipped. Use when the user says "work on the follow-up", "do the night shift follow-up", "pick up the follow-up", or asks you to act on the answers they gave to a night's questions.
---

# Do a Night Shift follow-up

After a night, the developer answers its questions in the Night Shift Viewer
and creates a follow-up: one item per unfinished task, with the decision
they made, plus decisions about no particular task. This skill works those
items outside a night, with the developer around.

Run the tool as: `night-shift`

## 1. See what is open

```bash
night-shift follow-up list
night-shift follow-up show <follow-up id>
```

Each item has a `kind`:

- `decision`: the developer answered the question; `decision_label` and
  `owner_note` say what they chose and why. Follow it. One carried from an
  earlier night that did not finish it also has `left`.
- `unfinished`: a task that ended partial, failed or not started; `left`
  says what remains.
- `waiting`: a question still without an answer. Ask the developer now,
  in the conversation, before working on it.

## 2. Check before you fix

The developer may have fixed an item by other means since the night.
Look at the real code first. Then do the work the repository's normal way
(its tests, review and commits), and check the item's `done_when` lines.

## 3. Mark each item

```bash
night-shift follow-up resolve <follow-up id>/A1 --status done
night-shift follow-up resolve <follow-up id>/A2 --status skipped --reason "Already fixed in commit 4e1a9c2"
```

An item left open is picked up by the next night: its plan must either take
it on or skip it with a reason.
