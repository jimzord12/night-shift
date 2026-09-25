# The Night Shift contract

What agents write and the app reads. Two files live in the project; the rest
lives on the board. Every path inside these files is relative to the
project's `.night-shift/` folder. Validate with `night-shift check <project>`.

```text
<project>/.night-shift/        git-ignored, local only
  project.json                 who the project is, which board (schemas/project.schema.json)
  questions/<id>.json          one question and its answer (schemas/question.schema.json)
  assets/                      images that questions show
  attachments/<task id>/       evidence files, for the `backlog` adapter only (below)
```

## project.json

```json
{
  "schema": "project/1",
  "name": "Lighthouse",
  "accent": "#7C5CFF",
  "repo": "https://github.com/example/lighthouse",
  "buffer": { "max": 20, "low": 5 },
  "board": { "type": "trello", "id": "abc123XY", "readyLabel": "Night-ready", "doneLists": ["Done"] }
}
```

`board.type` picks the adapter. `trello` reads the credentials from the
`TRELLO_API_KEY` and `TRELLO_API_TOKEN` environment variables of the shell
that runs `night-shift serve`; they never reach the browser. `file` reads a
`board.json` (below) and exists for demos and tests.

## questions/&lt;id&gt;.json

The id is `<shift>-<nn>`, and the file is named after it.

```json
{
  "schema": "question/1",
  "id": "2026-09-25-night-03",
  "shift": "2026-09-25-night",
  "card": "csv-export",
  "blocking": true,
  "topic": "Orders",
  "question": "Which date format does the CSV export use?",
  "why": "The card does not say; accountants and spreadsheets disagree.",
  "kind": "one",
  "options": [
    { "id": "iso", "label": "2026-09-25", "detail": "ISO: sorts correctly everywhere" },
    { "id": "eu", "label": "25/09/2026" },
    { "id": "both", "label": "Both columns" }
  ],
  "recommended": ["iso"],
  "because": "Every spreadsheet reads ISO dates and sorts them right.",
  "answer": null,
  "resolved": null
}
```

| Kind | `options` | `recommended` | `answer.value` |
|---|---|---|---|
| `confirm` | omitted (yes/no) | `["yes"]` or `["no"]` | `["yes"]` or `["no"]` |
| `one` | 2 or more | one id | one id |
| `many` | 2 or more; `min`/`max` optional | the ids | the ids |
| `rank` | 2 or more | every id, in order | every id, in order |
| `text` | omitted | one suggested answer | one string |

### Media

An option may carry `image` (a thumbnail picture) and `preview` (the full
asset the owner opens with the option's view button). A question may carry
`images`: media shown above the options. Each is a path relative to
`.night-shift/` or an `http(s)` URL.

```json
{ "id": "hero-a", "label": "Direction A", "image": "assets/hero-a.png", "preview": "assets/hero-a.pdf" }
```

| Asset | Shown as |
|---|---|
| `.png` `.jpg` `.gif` `.webp` `.svg` | picture, fit to screen or at actual size |
| `.mp4` `.webm` `.mov` | video with controls |
| `.pdf` | the browser's PDF reader |
| `.html`, or any other URL | a web page in a sandbox; "Open in new tab" for sites that refuse to be framed |

`preview` defaults to `image`. Local HTML runs in an isolated sandbox that
cannot reach the app; other file types download instead of opening.

The app writes `answer`:

```json
"answer": { "at": "2026-09-26T08:41:00+03:00", "status": "answered", "value": ["iso"], "note": "" }
```

`status: "deferred"` means "not now", with an empty `value`. An answer can be
changed until the asker fills `resolved`:

```json
"resolved": { "at": "2026-09-26T09:05:00+03:00", "into": "https://trello.com/c/AbCd1234" }
```

The app refuses to save an answer over a file that changed since the owner
opened it, and shows the new version instead.

## The card header (on the board)

A line of a Night-ready card's description (by convention the first):

```text
night-shift: kind=build size=M touches=src/search,tests
```

`kind` is `build` or `explore`, `size` is `S`, `M` or `L`, `touches` is a
comma-separated list of paths with no spaces.

## The outcome comment (on the board)

One per card per shift, posted by the builder. The first line is the marker;
then `key: value` lines; order does not matter; `evidence` may repeat.

```text
night-shift outcome/1
shift: 2026-09-25-night
status: shipped
review: PASS (2 rounds)
line: Checkout now says what went wrong and how to fix it.
commits: abc1234, def5678
evidence: compare before.png after.png | The declined-card screen, before and after
evidence: image mobile.png | The same screen on a phone
evidence: pdf report.pdf | The full report
evidence: link https://github.com/o/r/actions/runs/1 | CI run
questions: 2026-09-25-night-03
```

| Key | Required | Value |
|---|---|---|
| `shift` | yes | `<date>-night` or `<date>-day` |
| `status` | yes | `shipped`, `needs-eyes`, `blocked`, `skipped` |
| `line` | yes | one sentence |
| `review` | no | free text, e.g. `PASS (2 rounds)` |
| `commits` | no | short or full hashes, comma-separated |
| `evidence` | no | `image <file>`, `compare <before> <after>`, `pdf <file>` or `link <url>`, then optionally ` \| caption`. Files are card attachments, matched by name. |
| `questions` | no | question ids, comma-separated |

A comment may wrap the block in a code fence; the block ends at the closing
fence (or at the end of the comment), so prose may follow it. If a card gets
two outcomes for the same shift, the newer one wins.

## board.json (the `file` adapter)

```json
{
  "cards": [
    {
      "id": "c1", "name": "search-filters: filter the catalogue by colour and size",
      "url": "https://example.com/c1", "list": "Queued", "labels": ["Night-ready"],
      "desc": "night-shift: kind=build size=M touches=src/search\n\n...",
      "attachments": [{ "name": "after.png", "path": "assets/after.png" }]
    }
  ],
  "comments": [
    { "card": "c1", "date": "2026-09-26T03:10:00Z", "text": "night-shift outcome/1\nshift: ..." }
  ]
}
```

## A Backlog.md board (the `backlog` adapter)

For a project that tracks its work with [Backlog.md](https://github.com/MrLesk/Backlog.md)
(tested with 1.52) in its own repository:

```json
"board": { "type": "backlog", "path": "../backlog", "readyLabel": "night-ready", "doneLists": ["Done"] }
```

`path` is the Backlog.md folder relative to `.night-shift/` (default
`../backlog`). The app reads the task files directly; the CLI is not needed
to serve.

| Board idea | In Backlog.md |
|---|---|
| Card | A task in `backlog/tasks/` (drafts, `completed/` and `archive/` are not read) |
| Card name | `<id>: <title>`, for example `TASK-7: Export orders as CSV` |
| List (stage) | The task's `status`; board order follows `statuses` in `config.yml`, then `ordinal`, then the task number |
| Labels | The task's `labels`; `readyLabel` is one of them |
| Card description | The task's Description section; the `Card Header` is its first line |
| Comments | The task's Comments section: an `Outcome` is a comment |
| Attachments | Files in `.night-shift/attachments/<task id>/`, matched by name |
| Card link | The task file on GitHub or GitLab when `repo` is set |

Posting an Outcome and its evidence:

```sh
backlog task edit TASK-7 --comment "night-shift outcome/1
shift: 2026-09-25-night
status: shipped
line: Accountants can download the orders as a CSV file.
evidence: image after.png | The export button" --comment-author "@builder"
# then copy after.png into .night-shift/attachments/TASK-7/
```

Backlog.md stamps comments to the minute, so within one task a comment
further down the file counts as newer; a corrected Outcome for the same
shift is simply posted again. Backlog.md refuses a comment with a line
holding only `---` (it ends a comment), so an Outcome never uses one.
