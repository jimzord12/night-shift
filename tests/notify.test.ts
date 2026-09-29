import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { TASKS, gitRepo, plan, session } from './helpers.ts';
import { ask, start, decide } from '../src/night.ts';
import { readNotify } from '../src/notify.ts';
import { registerRepo } from '../src/store.ts';

const cli = path.resolve('src/cli.ts');
const run = (repo: string, args: string[], input?: string) => spawnSync(process.execPath, [cli, ...args], { cwd: repo, input, encoding: 'utf8', env: process.env, windowsHide: true });

// The developer's own command stands in for the desktop: a real process that writes down what it got.
function recorder(): { command: string; seen: () => string[] } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-notify-'));
  const out = path.join(dir, 'seen.txt');
  const script = path.join(dir, 'record.mjs');
  fs.writeFileSync(script, `import fs from 'node:fs';\nfs.appendFileSync(${JSON.stringify(out)}, [process.env.NIGHT_SHIFT_TITLE, process.env.NIGHT_SHIFT_TEXT, process.env.NIGHT_SHIFT_URL].join(' | ') + '\\n');\n`);
  return { command: `"${process.execPath}" "${script}"`, seen: () => (fs.existsSync(out) ? fs.readFileSync(out, 'utf8').trim().split('\n') : []) };
}

test('notifications: off by default and when turned off, closing a night raises nothing', () => {
  const repo = gitRepo('shop');
  const r = recorder();
  assert.equal(readNotify().enabled, false);
  assert.equal(run(repo, ['notify', 'off', '--command', r.command]).status, 0);
  start(repo, plan(TASKS), session(), new Date('2026-09-26T23:10:00'));
  const closed = run(repo, ['close', '--summary', 'Nothing shipped tonight.']);
  assert.equal(closed.status, 0, closed.stderr);
  assert.doesNotMatch(closed.stdout, /Notified/);
  assert.deepEqual(r.seen(), []);
});

test('notifications: on, a closed night and a night ended by the session hook each raise one, linking to the report', () => {
  const repo = gitRepo('blog');
  const r = recorder();
  const on = run(repo, ['notify', 'on', '--port', '4790', '--command', r.command]);
  assert.match(on.stdout, /Notifications are on/);
  const id = registerRepo(repo).id;

  const first = start(repo, plan(TASKS), session(), new Date('2026-09-26T23:10:00')).night.night;
  ask(repo, { task: 'T2', ask: 'Which login fix?', options: [{ label: 'Relax the cookie' }, { label: 'Own-domain login' }], recommended: 'a' });
  decide(repo, { task: 'T1', decision: 'Keep the login cookie at 14 days', why: 'The task did not say.' });
  const closed = run(repo, ['close', '--summary', 'Login waits for your decision.']);
  assert.match(closed.stdout, /Notified: blog: night finished\./);
  assert.deepEqual(r.seen(), [`blog: night finished | 1 question, 1 decision for you · 3 not started | http://127.0.0.1:4790/#/night/${id}/${first}`]);

  // The session ends without a close: the hook marks the night interrupted and says so.
  const second = start(repo, plan(TASKS), session('session-2'), new Date('2026-09-27T23:10:00')).night.night;
  const hook = run(repo, ['meter'], JSON.stringify({ session_id: 'session-2', cwd: repo }));
  assert.equal(hook.status, 0, hook.stderr);
  assert.equal(r.seen()[1], `blog: night stopped early | nothing to answer · 3 not started | http://127.0.0.1:4790/#/night/${id}/${second}`);

  // Turned off again: the next night ends in silence.
  run(repo, ['notify', 'off']);
  start(repo, plan(TASKS), session('session-3'), new Date('2026-09-28T23:10:00'));
  run(repo, ['close', '--summary', 'Quiet night.']);
  assert.equal(r.seen().length, 2);
});

test('notifications: a failing notification never fails the close or the session hook', () => {
  const repo = gitRepo('api');
  const failing = `"${process.execPath}" -e "process.exit(3)"`;
  assert.equal(run(repo, ['notify', 'on', '--command', failing]).status, 0);
  start(repo, plan(TASKS), session(), new Date('2026-09-26T23:10:00'));
  const closed = run(repo, ['close', '--summary', 'Nothing shipped.']);
  assert.equal(closed.status, 0, closed.stderr);
  assert.match(closed.stdout, /The notify command failed \(exit 3\)/);
  assert.doesNotMatch(closed.stdout, /Notified/);
  start(repo, plan(TASKS), session('session-2'), new Date('2026-09-27T23:10:00'));
  const hook = run(repo, ['meter'], JSON.stringify({ session_id: 'session-2', cwd: repo }));
  assert.equal(hook.status, 0, hook.stderr);
  assert.match(hook.stdout, /closed as interrupted.*The notify command failed \(exit 3\)/);
  const test = run(repo, ['notify', 'test']);
  assert.equal(test.status, 1);
});

test('notifications: a night that a failed start check stops raises one, for a developer who has left (D33)', () => {
  const repo = gitRepo('late');
  const r = recorder();
  const planFile = path.join(repo, 'plan.json');
  fs.writeFileSync(planFile, JSON.stringify({ schema: 'night-shift/plan@3', tasks: TASKS.slice(0, 1), start_checks: [{ command: 'docker compose ps', exit_code: 1, excerpt: 'Cannot connect to the Docker daemon' }] }));
  run(repo, ['notify', 'off', '--command', r.command]);
  const quiet = run(repo, ['start', '--file', planFile]);
  assert.notEqual(quiet.status, 0);
  assert.deepEqual(r.seen(), []);
  run(repo, ['notify', 'on', '--port', '4791']);
  const refused = run(repo, ['start', '--file', planFile]);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /a start check failed: `docker compose ps`/);
  assert.deepEqual(r.seen(), ['late: the night did not start | A start check failed: docker compose ps. The agent says what to fix. | http://127.0.0.1:4791/']);
  run(repo, ['notify', 'off']);
});
