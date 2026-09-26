import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { gitRepo } from './helpers.ts';
import { install } from '../src/install.ts';
import { listRepos } from '../src/store.ts';

const CLI = path.resolve(import.meta.dirname, '..', 'src', 'cli.ts');

test('install adds the skills and the hook, keeps existing settings, and is idempotent', () => {
  const repo = gitRepo();
  fs.mkdirSync(path.join(repo, '.claude'));
  fs.writeFileSync(path.join(repo, '.claude', 'settings.json'), JSON.stringify({ permissions: { allow: ['Bash(npm test)'] }, hooks: { SessionEnd: [{ hooks: [{ type: 'command', command: 'echo bye' }] }] } }));
  const out = install(repo, 'ns');
  assert.match(out.join('\n'), /Added the start-night-shift skill/);
  const skill = fs.readFileSync(path.join(repo, '.claude', 'skills', 'start-night-shift', 'SKILL.md'), 'utf8');
  assert.match(skill, /^name: start-night-shift$/m);
  assert.match(skill, /ns start <<'EOF'/);
  assert.doesNotMatch(skill, /\{\{cli\}\}/);
  assert.ok(fs.existsSync(path.join(repo, '.claude', 'skills', 'do-night-shift-follow-up', 'SKILL.md')));
  const settings = JSON.parse(fs.readFileSync(path.join(repo, '.claude', 'settings.json'), 'utf8'));
  assert.deepEqual(settings.permissions, { allow: ['Bash(npm test)'] });
  assert.deepEqual(settings.hooks.SessionEnd, [{ hooks: [{ type: 'command', command: 'echo bye' }] }, { hooks: [{ type: 'command', command: 'ns meter' }] }]);
  assert.ok(listRepos().some((r) => path.resolve(r.path) === path.resolve(repo)));
  // Again: nothing changes but the registration line.
  assert.deepEqual(install(repo, 'ns').filter((l) => !/Registered|Ready/.test(l)), []);
  // Moving from a checkout to an installed release replaces the old hook instead of adding one.
  const other = gitRepo();
  install(other, 'node "C:/dev/night-shift/src/cli.ts"');
  install(other, 'night-shift');
  const again = JSON.parse(fs.readFileSync(path.join(other, '.claude', 'settings.json'), 'utf8'));
  assert.deepEqual(again.hooks.SessionEnd.map((e: { hooks: { command: string }[] }) => e.hooks[0].command), ['night-shift meter']);
});

// The real CLI, as an agent and the hook run it: JSON on stdin, messages on stdout, exit codes.
function cli(repo: string, args: string[], stdin = '', env: Record<string, string> = {}) {
  return spawnSync(process.execPath, [CLI, ...args], { cwd: repo, input: stdin, encoding: 'utf8', env: { ...process.env, CLAUDE_CODE_SESSION_ID: '', ...env }, windowsHide: true });
}

test('the command line: start, record, close through stdin; refusals exit 1 with the reason', () => {
  const repo = gitRepo();
  const plan = JSON.stringify({ schema: 'night-shift/plan@1', tasks: [{ id: 'T1', title: 'Say hello', source: 'developer prompt', done_when: ['Hello is printed'] }] });
  const s = cli(repo, ['start'], plan);
  assert.equal(s.status, 0, s.stderr);
  assert.match(s.stdout, /no Claude Code session found: metrics will be unknown/);
  const bad = cli(repo, ['record'], JSON.stringify({ task: 'T1', outcome: 'done', checks: [true] }));
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /refused: T1 was not recorded: done needs at least one evidence block/);
  const ok = cli(repo, ['record', '--json', JSON.stringify({ task: 'T1', outcome: 'done', checks: [true], evidence: [{ type: 'command', command: 'node hello.js', exit_code: 0, excerpt: 'hello' }] })]);
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(cli(repo, ['status']).stdout, /T1 done/);
  const closed = cli(repo, ['close', '--summary', 'Said hello.']);
  assert.equal(closed.status, 0, closed.stderr);
  assert.match(closed.stdout, /closed: 1 done/);
  assert.equal(cli(repo, ['close']).status, 2);
  // The hook never fails the harness, even with nothing to do or bad input.
  const hook = cli(repo, ['meter'], '{ not json');
  assert.equal(hook.status, 0);
  assert.equal(cli(repo, ['check']).status, 0);
});
