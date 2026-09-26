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

export function issueBody(f: Feedback, context: { repo: string; night: string; version: string }): string {
  return [f.body, '', '---', `Kind: ${f.kind}${f.tags.length ? ` · Tags: ${f.tags.join(', ')}` : ''}`, `From a night (${context.night}) in a repository using Night Shift ${context.version}. Reviewed by its developer before sending.`].join('\n');
}

export function newIssueUrl(f: Feedback, context: { repo: string; night: string; version: string }): string {
  const q = new URLSearchParams({ title: issueTitle(f), body: issueBody(f, context), labels: 'proposal' });
  return `https://github.com/${ISSUES_REPO()}/issues/new?${q.toString()}`;
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
