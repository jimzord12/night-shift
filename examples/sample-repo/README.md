# Sample repository

The Night Shift files of a real trial on a small todo-list web app, kept for
the `Viewer`, reviewers and anyone who wants to see what a night looks like.
Only the `.night-shift/` folder is here; the app itself is not. Local paths
were replaced and the app's name was painted out of the screenshots.

- `nights/2026-09-26-a`: the first night. Git commits and Docker needed
  permission prompts nobody could answer, so one task ended partial and
  three blocked on questions. The questions carry the developer's answers.
- `follow-ups/2026-09-26-a.json`: the answers handed to the next night.
- `nights/2026-09-26-b`: the second night. It finished all four follow-up
  items with screenshots as proof and blocked a new task on one question.
- `follow-ups/2026-09-26-b.json`: that answer, resolved later by an agent
  working by day.

To look at it in the `Viewer` without touching your own install, serve a
copy (the tool writes to it, and needs a git repository):

```sh
cp -r examples/sample-repo /tmp/sample-repo && git -C /tmp/sample-repo init -q
NIGHT_SHIFT_ROOT=/tmp/ns-root node src/cli.ts install /tmp/sample-repo
NIGHT_SHIFT_ROOT=/tmp/ns-root node src/cli.ts view --port 4799
```
