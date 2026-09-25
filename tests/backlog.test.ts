import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/server.ts';
import type { Overview } from '../src/types.ts';

// The fixture was written by the Backlog.md 1.52 CLI (task create / task edit --comment), so these
// tests read the files exactly as a real project's backlog/ holds them.
const DEMO = path.resolve(import.meta.dirname, '..', 'examples', 'backlog-demo');

function copy() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'night-shift-backlog-'));
  fs.cpSync(DEMO, root, { recursive: true });
  return root;
}

function app(root = copy()) {
  return createApp({ dataDir: path.join(root, '.night-shift'), version: 'test' });
}

async function overview(a = app()): Promise<Overview> {
  const res = await a.request('/api/overview');
  assert.equal(res.status, 200);
  return (await res.json()) as Overview;
}

test('backlog: queue holds labelled open tasks in status, ordinal order, with collisions', async () => {
  const o = await overview();
  assert.equal(o.boardError, null);
  // TASK-7 has the lowest ordinal but its status comes later in config.yml; TASK-5 is labelled but Done.
  assert.deepEqual(o.queue.map((c) => c.id), ['TASK-1', 'TASK-3', 'TASK-2', 'TASK-7']);
  assert.equal(o.queue[3].list, 'In Progress');
  assert.equal(o.queue[0].name, 'TASK-1: Filter the catalogue by colour and size');
  assert.equal(o.queue[0].list, 'To Do');
  assert.deepEqual(o.queue[0].header, { kind: 'build', size: 'M', touches: ['src/search', 'tests/search'], problems: [] });
  assert.deepEqual(o.queue[0].collidesWith, ['TASK-2']);
  assert.equal(o.queue[1].header?.kind, 'explore');
});

test('backlog: outcome comments become shifts; a later comment replaces an earlier one', async () => {
  const o = await overview();
  assert.deepEqual(o.shifts.map((s) => s.id), ['2026-09-25-night']);
  assert.deepEqual(o.shifts[0].counts, { shipped: 1, 'needs-eyes': 0, blocked: 1, skipped: 0 });
  const csv = o.shifts[0].outcomes.find((x) => x.card.id === 'TASK-6')!;
  assert.equal(csv.status, 'blocked');
  assert.equal(csv.line, 'Blocked on the date format of the export.');
  assert.deepEqual(csv.questions, ['2026-09-25-night-01']);
  const checkout = o.shifts[0].outcomes.find((x) => x.card.id === 'TASK-5')!;
  assert.equal(checkout.review, 'PASS (2 rounds)');
  assert.equal(checkout.evidence[0].kind, 'compare');
  assert.equal(checkout.evidence[0].before, '/api/attachment/TASK-5/checkout-before.svg');
  assert.equal(checkout.evidence[0].src, '/api/attachment/TASK-5/checkout-after.svg');
  assert.deepEqual(checkout.problems, []);
  assert.equal(checkout.card.url, 'https://github.com/example/lighthouse/blob/HEAD/backlog/tasks/task-5%20-%20Say-what-went-wrong-at-checkout.md');
  assert.equal(checkout.commits[0].url, 'https://github.com/example/lighthouse/commit/4f2a9c1');
});

test('backlog: attachments are served from .night-shift/attachments/<task>; nothing outside it', async () => {
  const a = app();
  const att = await a.request('/api/attachment/TASK-5/checkout-after.svg');
  assert.equal(att.status, 200);
  assert.equal(att.headers.get('content-type'), 'image/svg+xml');
  for (const url of ['/api/attachment/TASK-5/..%2F..%2Fproject.json', '/api/attachment/..%2Fquestions/2026-09-25-night-01.json', '/api/attachment/TASK-5/missing.svg']) {
    assert.notEqual((await a.request(url)).status, 200, url);
  }
});

test('backlog: an attachment id that names a folder is a board error, not a crash', async () => {
  const root = copy();
  fs.mkdirSync(path.join(root, '.night-shift', 'attachments', 'TASK-5', 'sub'));
  const res = await app(root).request('/api/attachment/TASK-5/sub');
  assert.equal(res.status, 502);
  assert.match(((await res.json()) as { error: string }).error, /has no attachment sub/);
});

test('backlog: a missing evidence file is reported on the outcome', async () => {
  const root = copy();
  fs.rmSync(path.join(root, '.night-shift', 'attachments', 'TASK-5', 'checkout-before.svg'));
  const o = await overview(app(root));
  const checkout = o.shifts[0].outcomes.find((x) => x.card.id === 'TASK-5')!;
  assert.equal(checkout.evidence[0].missing, true);
  assert.deepEqual(checkout.problems, ['attachment checkout-before.svg, checkout-after.svg is not on the card']);
});

test('backlog: a wrong board.path is a board error that names the setting, questions still load', async () => {
  const root = copy();
  const file = path.join(root, '.night-shift', 'project.json');
  const project = JSON.parse(fs.readFileSync(file, 'utf8'));
  project.board.path = '../no-such-backlog';
  fs.writeFileSync(file, JSON.stringify(project));
  const o = await overview(app(root));
  assert.match(o.boardError ?? '', /board\.path/);
  const q = await app(root).request('/api/questions');
  assert.equal(q.status, 200);
});

test('backlog: board.path defaults to ../backlog', async () => {
  const root = copy();
  const file = path.join(root, '.night-shift', 'project.json');
  const project = JSON.parse(fs.readFileSync(file, 'utf8'));
  delete project.board.path;
  fs.writeFileSync(file, JSON.stringify(project));
  const o = await overview(app(root));
  assert.equal(o.boardError, null);
  assert.equal(o.queue.length, 4);
});
