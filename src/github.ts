// Feedback to the Night Shift Repo: with the GitHub CLI when it is installed and logged in (one
// click sends every ticked entry), otherwise as pre-filled "new issue" links the developer submits
// in the browser. A person always reads an entry before it leaves the machine.

import { spawnSync } from 'node:child_process';
import type { Feedback } from './types.ts';

export const ISSUES_REPO = () => process.env.NIGHT_SHIFT_ISSUES_REPO || 'jimzord12/night-shift';
const GH = () => process.env.NIGHT_SHIFT_GH || 'gh';

function gh(args: string[]) {
  return spawnSync(GH(), args, { encoding: 'utf8', windowsHide: true, timeout: 30_000 });
}

export function ghReady(): boolean {
  const r = gh(['auth', 'status']);
  return !r.error && r.status === 0;
}

export function issueTitle(f: Feedback): string {
  return `[${f.kind}] ${f.title}`;
}

// What each kind means, so a maintainer reading the issue does not need the skill open.
const KIND_MEANING: Record<string, string> = {
  'missing-block': 'a proof or note the agent needed has no evidence block',
  'confusing-rule': 'a rule or a message of the tool was unclear',
  'bad-fit': "Night Shift got in the way of the repository's own way of working",
  'tool-bug': 'the night-shift tool misbehaved',
  other: 'something else',
};

// The issue as a maintainer reads it: the agent's words first, then the facts as a list. The
// repository's name stays out: it may be private.
export function issueBody(f: Feedback, context: { repo: string; night: string; version: string }): string {
  const line = (s: string) => s.replace(/\r?\n/g, ' ');
  // A code block the agent left open would swallow everything after it.
  const fences = f.body.split(/\r?\n/).filter((l) => /^\s*```/.test(l)).length;
  return [
    '## What the agent ran into',
    '',
    fences % 2 ? `${f.body}\n${'`'.repeat(3)}` : f.body,
    '',
    '## Details',
    '',
    `- **Kind:** \`${f.kind}\`, ${line(KIND_MEANING[f.kind] ?? KIND_MEANING.other)}`,
    ...(f.tags.length ? [`- **Tags:** ${f.tags.map((t) => `\`${line(t)}\``).join(' ')}`] : []),
    `- **Night:** \`${context.night}\``,
    `- **Night Shift:** \`${line(context.version)}\``,
    '',
    '<sub>Logged by an agent during an unattended night. Its developer read it in the Night Shift Viewer and chose to send it.</sub>',
  ].join('\n');
}

// GitHub refuses new-issue links much past 8 KB; a long entry (non-Latin text triples in size once
// encoded) is cut, and the issue says where the full text is.
const MAX_URL = 8000;

export function newIssueUrl(f: Feedback, context: { repo: string; night: string; version: string }): string {
  const url = (body: string) => `https://github.com/${ISSUES_REPO()}/issues/new?${new URLSearchParams({ title: issueTitle(f), body: issueBody({ ...f, body }, context), labels: 'proposal' }).toString()}`;
  let full = url(f.body);
  for (let keep = Math.floor(f.body.length * 0.8); full.length > MAX_URL && keep > 0; keep = Math.floor(keep * 0.8)) {
    full = url(`${f.body.slice(0, keep)}…\n\n_Cut to fit a GitHub link; the full text is in the night file (${context.night})._`);
  }
  return full;
}

// Creates one issue; retries without the label when the label does not exist on the repository.
export function createIssue(f: Feedback, context: { repo: string; night: string; version: string }): { url: string } {
  const base = ['issue', 'create', '--repo', ISSUES_REPO(), '--title', issueTitle(f), '--body', issueBody(f, context)];
  let r = gh([...base, '--label', 'proposal']);
  if (r.status !== 0 && /label/i.test(`${r.stderr}${r.stdout}`)) r = gh(base);
  if (r.error || r.status !== 0) throw new Error(`gh issue create failed: ${(r.stderr || r.stdout || r.error?.message || '').trim().split('\n').slice(-1)[0]}`);
  const url = r.stdout.trim().split('\n').find((l) => /^https?:\/\//.test(l.trim()))?.trim();
  return { url: url ?? `https://github.com/${ISSUES_REPO()}/issues` };
}
