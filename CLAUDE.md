@AGENTS.md

# Claude Code here

Claude Code is the implementation harness for this repository: coding,
testing, review and integration. Everything above applies; this adds only
what is specific to Claude Code.

- Read every file in `.local/preferences/` before the first reply, as
  `AGENTS.md` says. It is the owner's profile; it is never committed.
- Reviewers are subagents in `.claude/agents/`: invoke `code-reviewer`,
  `design-reviewer`, `visual-reviewer`, `research-reviewer` or
  `context-reviewer` fresh every round with the full brief
  (docs/practices/review.md; `context-reviewer` states its own). Subagent definitions load when a session starts.
- `.claude/settings.local.json` (git-ignored) allows routine Git, the
  checks, the CLI and Backlog.md without prompts, and denies what the owner
  keeps (`docs/owner.md`). A denied command is the owner's call: show it and
  ask, never work around it.
