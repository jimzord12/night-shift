// Regression tests for the findings of the first independent review (before v1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BoardError } from '../src/board/adapter.ts';
import { TrelloBoard } from '../src/board/trello.ts';
import { parseOutcome } from '../src/parse.ts';
import { createApp } from '../src/server.ts';
import { listQuestions } from '../src/store.ts';
import { bufferZone, isOpen } from '../src/types.ts';
import type { Question } from '../src/types.ts';

const DEMO = path.resolve(import.meta.dirname, '..', 'examples', 'demo', '.night-shift');
const copyDemo = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'night-shift-test-'));
  fs.cpSync(DEMO, dir, { recursive: true });
  return dir;
};

test('trello: ids that are not Trello ids never reach a signed request', async () => {
  const board = new TrelloBoard('abc123XY');
  await assert.rejects(board.attachment('abc', '../../../members/me/boards?x='), BoardError);
  await assert.rejects(board.attachments('../members/me'), BoardError);
});

test('server: a foreign Host is refused when the port is known', async () => {
  const app = createApp({ dataDir: copyDemo(), version: 'test', port: 4747 });
  assert.equal((await app.request('http://evil.example/api/questions')).status, 403);
  assert.equal((await app.request('http://127.0.0.1:4747/api/questions')).status, 200);
  assert.equal((await app.request('http://localhost:4747/api/questions')).status, 200);
});

test('server: a malformed escape is a 404, not a crash', async () => {
  const app = createApp({ dataDir: copyDemo(), version: 'test' });
  assert.equal((await app.request('/api/files/%E0%A4%A')).status, 404);
});

test('server: media inline, HTML only in an opaque sandbox, everything else downloads', async () => {
  const dir = copyDemo();
  fs.writeFileSync(path.join(dir, 'assets', 'x.html'), '<script>alert(1)</script>');
  fs.writeFileSync(path.join(dir, 'assets', 'x.js'), 'alert(1)');
  fs.writeFileSync(path.join(dir, 'assets', 'clip.mp4'), 'not really a video');
  const app = createApp({ dataDir: dir, version: 'test' });
  const html = await app.request('/api/files/assets/x.html');
  assert.equal(html.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.equal(html.headers.get('content-security-policy'), 'sandbox allow-scripts');
  const js = await app.request('/api/files/assets/x.js');
  assert.equal(js.headers.get('content-type'), 'application/octet-stream');
  assert.equal(js.headers.get('content-disposition'), 'attachment');
  const video = await app.request('/api/files/assets/clip.mp4');
  assert.equal(video.headers.get('content-type'), 'video/mp4');
  const svg = await app.request('/api/files/assets/mark-a.svg');
  assert.equal(svg.headers.get('content-type'), 'image/svg+xml');
  assert.equal(svg.headers.get('content-security-policy'), 'sandbox');
});

test('questions: a preview may be a local asset or a web page; a missing file is a problem', () => {
  const dir = copyDemo();
  const file = path.join(dir, 'questions', '2026-09-25-night-01.json');
  const q = JSON.parse(fs.readFileSync(file, 'utf8'));
  q.options[0].preview = 'assets/marks.svg';
  q.options[1].preview = 'https://example.com/beam';
  q.options[2].preview = 'assets/missing.pdf';
  fs.writeFileSync(file, JSON.stringify(q));
  const entry = listQuestions(dir).find((e) => e.file === '2026-09-25-night-01.json')!;
  assert.deepEqual(entry.problems, ['media assets/missing.pdf does not exist']);
});

test('outcome: prose after the closing fence is not part of the block', () => {
  const o = parseOutcome('```\nnight-shift outcome/1\nshift: 2026-09-25-night\nstatus: shipped\nline: Done.\n```\nThanks, took longer than planned.');
  assert.deepEqual(o?.problems, []);
});

test('questions: a UTF-8 byte-order mark does not make a file invalid', () => {
  const dir = copyDemo();
  const file = path.join(dir, 'questions', '2026-09-25-night-03.json');
  fs.writeFileSync(file, `﻿${fs.readFileSync(file, 'utf8')}`);
  const entry = listQuestions(dir).find((e) => e.file === '2026-09-25-night-03.json')!;
  assert.deepEqual(entry.problems, []);
});

test('buffer zones: idle below low, sweet spot 70-80%, redline from 90%', () => {
  const b = { max: 20, low: 5 };
  const zones = [0, 4, 5, 13, 14, 16, 17, 18, 25].map((n) => `${n}:${bufferZone(n, b)}`);
  assert.deepEqual(zones, ['0:idle', '4:idle', '5:warming', '13:warming', '14:sweet', '16:sweet', '17:hot', '18:redline', '25:redline']);
});

test('a deferred question is still open; a resolved one is not', () => {
  const base = { answer: null, resolved: null } as unknown as Question;
  assert.equal(isOpen(base), true);
  assert.equal(isOpen({ ...base, answer: { at: 'x', status: 'deferred', value: [] } }), true);
  assert.equal(isOpen({ ...base, answer: { at: 'x', status: 'answered', value: ['a'] } }), false);
  assert.equal(isOpen({ ...base, resolved: { at: 'x', into: 'y' } }), false);
});
