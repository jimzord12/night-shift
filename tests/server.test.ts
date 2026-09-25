import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/server.ts';
import type { Overview, QuestionEntry } from '../src/types.ts';

const DEMO = path.resolve(import.meta.dirname, '..', 'examples', 'demo', '.night-shift');

function app() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'night-shift-test-'));
  fs.cpSync(DEMO, dir, { recursive: true });
  return createApp({ dataDir: dir, version: 'test' });
}

test('overview: queue with collisions, shifts newest first, evidence resolved', async () => {
  const res = await app().request('/api/overview');
  assert.equal(res.status, 200);
  const o = (await res.json()) as Overview;
  assert.equal(o.boardError, null);
  assert.deepEqual(o.queue.map((c) => c.id), ['c-search', 'c-search-speed', 'c-hero', 'c-emails']);
  assert.deepEqual(o.queue[0].collidesWith, ['c-search-speed']);
  assert.deepEqual(o.shifts.map((s) => s.id), ['2026-09-25-night', '2026-09-24-night']);
  assert.deepEqual(o.shifts[0].counts, { shipped: 1, 'needs-eyes': 1, blocked: 1, skipped: 0 });
  const checkout = o.shifts[0].outcomes.find((x) => x.card.id === 'c-checkout')!;
  assert.equal(checkout.evidence[0].kind, 'compare');
  assert.equal(checkout.evidence[0].before, '/api/attachment/c-checkout/checkout-before.svg');
  assert.equal(checkout.commits[0].url, 'https://github.com/example/lighthouse/commit/4f2a9c1');
  assert.deepEqual(checkout.problems, []);
});

test('attachments and question images are served; paths outside .night-shift are not', async () => {
  const a = app();
  const att = await a.request('/api/attachment/c-checkout/checkout-after.svg');
  assert.equal(att.status, 200);
  assert.equal(att.headers.get('content-type'), 'image/svg+xml');
  assert.equal((await a.request('/api/files/assets/mark-a.svg')).status, 200);
  assert.equal((await a.request('/api/files/..%2F..%2Fpackage.json')).status, 404);
  assert.equal((await a.request('/api/files/%2E%2E/project.json')).status, 404);
});

test('answer round trip, then a stale write is refused', async () => {
  const a = app();
  const list = (await (await a.request('/api/questions')).json()) as QuestionEntry[];
  const q = list.find((e) => e.file === '2026-09-25-night-01.json')!;
  const post = (baseHash: string) =>
    a.request('/api/questions/2026-09-25-night-01/answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'answered', value: ['beam'], note: '', baseHash }) });
  const ok = await post(q.hash);
  assert.equal(ok.status, 200);
  assert.deepEqual(((await ok.json()) as QuestionEntry).question?.answer?.value, ['beam']);
  const stale = await post(q.hash);
  assert.equal(stale.status, 409);
});

test('unknown API paths answer 404 JSON', async () => {
  const res = await app().request('/api/nope');
  assert.equal(res.status, 404);
});
