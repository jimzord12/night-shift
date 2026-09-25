# The Night Shift contract

What agents write and the app reads. Two files live in the project; the rest
lives on the board. Every path inside these files is relative to the
project's `.night-shift/` folder. Validate with `night-shift check <project>`.

```text
<project>/.night-shift/        git-ignored, local only
  project.json                 who the project is, which board (schemas/project.schema.json)
  questions/<id>.json          one question and its answer (schemas/question.schema.json)
  assets/                      images that questions show
```

## project.json

```json
{
  "schema": "project/1",
  "name": "Lighthouse",
  "accent": "#7C5CFF",
  "repo": "https://github.com/example/lighthouse",
  "buffer": { "target": 15, "low": 5 },
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
