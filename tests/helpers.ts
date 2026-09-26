// Shared set-up for the tests: real temporary git repositories and a private install folder, so
// every test runs the tool against real files and real git, never against mocks.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { Session } from '../src/types.ts';

// The install folder (registry, Viewer state) lives in a temporary folder for the whole run.
process.env.NIGHT_SHIFT_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-root-'));

export function git(repo: string, ...args: string[]): string {
  const r = spawnSync('git', args, { cwd: repo, encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout;
}

export function gitRepo(name = 'shop'): string {
  const dir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-repo-')), name);
  fs.mkdirSync(dir);
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'config', 'user.email', 'test@example.com');
  git(dir, 'config', 'user.name', 'Test');
  git(dir, 'config', 'commit.gpgsign', 'false');
  fs.writeFileSync(path.join(dir, 'README.md'), '# shop\n');
  git(dir, 'add', '.');
  git(dir, 'commit', '-q', '-m', 'first');
  return dir;
}

// An odd number is never a Windows process id, and far above the usual Linux range.
export const DEAD_PID = 999_999;

export function session(id = 'session-1', pid: number | null = process.pid, transcript: string | null = null): Session {
  return { harness: 'claude-code', id, pid, transcript };
}

export const plan = (tasks: object[], extra: object = {}) => JSON.stringify({ schema: 'night-shift/plan@1', tasks, ...extra });

export const TASKS = [
  { id: 'T1', title: 'Add PDF invoices to the checkout', source: 'backlog TASK-42', done_when: ['Checkout offers an invoice download', 'Screenshot attached'] },
  { id: 'T2', title: 'Fix the login redirect loop', source: 'developer prompt', done_when: ['Login lands on the account page'] },
  { id: 'T3', title: 'Upgrade the framework', source: 'developer prompt', done_when: ['Build passes', 'All tests pass'] },
];

export function evidenceFile(repo: string, night: string, name: string, body = '<svg xmlns="http://www.w3.org/2000/svg"/>'): string {
  const file = path.join(repo, '.night-shift', 'nights', night, 'evidence', name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  return `evidence/${name}`;
}

// A Claude Code session log as the Meter reads it: assistant messages with usage (one logged
// twice, as Claude Code does for multi-block messages), a cut-off line, and optionally a
// cost-state entry and a sub-agent.
export function transcript(opts: { costState?: boolean; subAgent?: boolean } = {}): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-log-'));
  const file = path.join(dir, 'session-1.jsonl');
  const usage = (input: number, output: number, thinking: number) => ({
    input_tokens: input,
    output_tokens: output,
    output_tokens_details: { thinking_tokens: thinking },
    cache_read_input_tokens: 1000,
    cache_creation_input_tokens: 200,
    cache_creation: { ephemeral_1h_input_tokens: 200, ephemeral_5m_input_tokens: 0 },
  });
  const lines: object[] = [
    { type: 'user', timestamp: '2026-09-26T20:00:00.000Z', version: '2.1.0' },
    { type: 'assistant', timestamp: '2026-09-26T20:01:00.000Z', version: '2.1.0', message: { id: 'm1', model: 'claude-opus-5[1m]', usage: usage(10, 100, 40) } },
    { type: 'assistant', timestamp: '2026-09-26T20:01:00.000Z', version: '2.1.0', message: { id: 'm1', model: 'claude-opus-5[1m]', usage: usage(10, 100, 40) } },
    { type: 'assistant', timestamp: '2026-09-26T22:31:00.000Z', version: '2.1.3', message: { id: 'm2', model: 'claude-opus-5', usage: usage(20, 300, 60) } },
  ];
  if (opts.costState) {
    lines.push({
      type: 'cost-state',
      totalCostUSD: 18.4012,
      totalDuration: 18_720_000,
      totalAPIDuration: 10_560_000,
      totalToolDuration: 600_000,
      totalLinesAdded: 1177,
      totalLinesRemoved: 118,
      modelUsage: { 'claude-opus-5[1m]': { inputTokens: 4_200_000, outputTokens: 380_000, thinkingTokens: 96_000, cacheReadInputTokens: 51_000_000, cacheCreationInputTokens: 1_900_000, costUSD: 18.4012 } },
    });
  }
  fs.writeFileSync(file, `${lines.map((l) => JSON.stringify(l)).join('\n')}\n{"type":"assistant","message":{"id":"cut`);
  if (opts.subAgent) {
    const sub = path.join(dir, 'session-1', 'subagents');
    fs.mkdirSync(sub, { recursive: true });
    fs.writeFileSync(path.join(sub, 'agent-a1.jsonl'), `${JSON.stringify({ type: 'assistant', timestamp: '2026-09-26T21:00:00.000Z', message: { id: 's1', model: 'claude-haiku-4-5', usage: usage(1000, 1000, 0) } })}\n`);
    fs.writeFileSync(path.join(sub, 'agent-a1.meta.json'), JSON.stringify({ agentType: 'general-purpose', description: 'Review round 1', model: 'haiku' }));
  }
  return file;
}
