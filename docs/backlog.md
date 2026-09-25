# Backlog

This repository has no task board of its own yet: this file is the single
list of open work for night-shift itself. Take an item, do it, delete its line
in the same commit (git history keeps it). Newest ideas at the bottom of their
section. Adopting projects track their own work on their own boards.

## Before the first real Night Shift (the trial's real test)

- **Outcome helper.** Builders must post the `night-shift outcome/1` comment
  and upload evidence as card attachments; today they need the project's own
  board tooling for that. Add `night-shift outcome <project> <card> --status …
  --line … --evidence image:after.png …` that posts through the board adapter
  (Trello: comment + attachment upload), so every project gets it for free.
- **Question helper.** `night-shift ask <project> --kind one --question …` that
  picks the next id for the shift, writes the file and validates it; and
  `night-shift resolve <project> <id> --into <url>` for the asker's side.
- **Adoption helper.** `night-shift init <project>`: writes
  `.night-shift/project.json` from prompts or flags, adds `.night-shift/` to
  `.gitignore`, copies the binding template to `docs/night-shift.md`, and
  offers the practice files and agent templates.
- **Run a first night and record the friction** as entries here (what the
  builders could not find, what the Morning Review lacked).

## Known gaps

- Copying a single practice file into a project breaks its relative links to
  sibling practices (review.md links evidence.md, idea-loop.md links
  proposals.md). Make the links absolute GitHub URLs or install all
  practices together.
- `night-shift docs` prints only protocol, contract and binding; allow
  `night-shift docs practices/<name>` and `templates/<name>` (the name check
  in src/cli.ts is `^[a-z-]+$`).
- No CI: add a GitHub Actions workflow that runs `npm ci && npm run check` on
  push to main (Node 24).
- The web UI has no tests beyond typecheck and build; add a few component or
  Playwright checks for the question deck (the owner's most-used screen).
- The fixes after the first review, the practices port and the media viewer
  had one independent review each; no second round was run on the fix
  batches. Run one fresh review of v5 against docs/practices/review.md.
- The POSIX launcher (`~/.night-shift/bin/night-shift`) was written but only
  the `.cmd` launcher was exercised (Windows).
- `npm run release` prints Node's DEP0190 warning (npm spawned with
  `shell: true` on Windows); cosmetic.

## Ideas

- One app for several projects (a project switcher), instead of one
  `serve` per project.
- An end-of-night summary notification as a binding slot with a generic
  command hook (`night-shift notify …`), instead of each project wiring its
  own.
- A Day Shift screen: the lead's proposed cards shown for a quick
  approve/reorder before they get the Night-ready label.
- History charts: shipped/blocked per night over time.

## Notes that are not bugs

- Screenshots taken through the browser automation tool at high DPI show a
  dark band across the top after scrolling; the page itself has content
  there (checked with `elementFromPoint`). It is the capture, not the app.
