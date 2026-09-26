# The local folder

Read this before replying to the owner for the first time in a session, and
before saving a draft or scratch evidence. `.local/` holds agent context
that must never reach the repository: the owner's personal preferences,
planning drafts and scratch proof (D18).

## Layout

```text
.local/                            git-ignored; also in .git/info/exclude
  preferences/                     the owner's personal profile: read every file, every session
    owner-profile.md
  planning/<topic>/                drafts not yet promoted to a doc or a task
  evidence/<yyyy-mm-dd>-<slug>/    scratch proof: numbered screenshots, logs, walk scripts
```

`.gitignore` holds `/.local/`; every new clone also adds it to
`.git/info/exclude`, so it stays ignored if `.gitignore` is ever edited
carelessly:

```sh
echo "/.local/" >> .git/info/exclude
```

## Preferences

- **Read every Markdown file in `.local/preferences/`** before the first
  reply of a session, together with the shared owner file
  ([docs/owner.md](../owner.md)). Missing folder: use the owner file alone.
- **Precedence:** what the owner says in the session, then
  `.local/preferences/`, then the owner file. The newer, more personal
  source wins on how to talk; the owner file still holds who decides what.
- Never copy its contents into a commit, a task, a report, a log or a
  public document. Quote a rule's effect, not the file.
- Agents may update it when the owner states a lasting preference ("from
  now on…"); write the date beside the rule.

The shared owner file says **what the owner decides and how every agent
talks to any owner of this repository**; the profile says **who this owner is
personally**: background, reading habits, tone, language.

## Planning

- A topic too early for a task or a doc starts as
  `.local/planning/<topic>/` with a `README.md` that says what it is and
  what it is **not**: "Reading this authorizes nothing."
- When the owner accepts it, promote it: a decision entry, a doc, or
  Backlog.md tasks. Then delete the draft or mark its README "promoted to …".

## Evidence

Scratch proof that should not be committed lives in
`.local/evidence/<yyyy-mm-dd>-<slug>/`, one folder per checkpoint, files
numbered by step (`01-load.png`, `02-answer.png`), plus `notes.md` with the
revision checked and what was seen. Evidence the owner or a later reviewer
needs is linked from the task or committed next to the work instead
([evidence.md](evidence.md)).

## Never

- `git clean -x` or `-X`: they wipe `.local/` with everything else ignored
  ([git.md](git.md)).
- Deleting anything under `.local/` without the owner's go: nothing
  restores it.
