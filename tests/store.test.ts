import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { StoreError, listQuestions, loadProject, readQuestion, saveAnswer } from '../src/store.ts';

const DEMO = path.resolve(import.meta.dirname, '..', 'examples', 'demo', '.night-shift');

function copyDemo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'night-shift-test-'));
  fs.cpSync(DEMO, dir, { recursive: true });
  return dir;
}

test('the demo project and all its questions are valid', () => {
  assert.equal(loadProject(DEMO).name, 'Lighthouse (demo)');
  const entries = listQuestions(DEMO);
  assert.equal(entries.length, 6);
  for (const e of entries) assert.deepEqual(e.problems, [], e.file);
});

test('saving an answer changes only the answer field', () => {
  const dir = copyDemo();
  const file = path.join(dir, 'questions', '2026-09-25-night-04.json');
  const before = JSON.parse(fs.readFileSync(file, 'utf8'));
  const entry = readQuestion(dir, '2026-09-25-night-04.json');
  const saved = saveAnswer(dir, '2026-09-25-night-04', { status: 'answered', value: ['colour', 'price'], note: ' ship fast ', baseHash: entry.hash }, new Date('2026-09-26T05:41:00Z'));
  const after = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.deepEqual({ ...after, answer: null }, before);
  assert.deepEqual(after.answer.value, ['colour', 'price']);
  assert.equal(after.answer.note, 'ship fast');
  assert.match(after.answer.at, /^2026-09-26T\d\d:41:00[+-]\d\d:\d\d$/);
  assert.notEqual(saved.hash, entry.hash);
});

test('a stale hash is refused with 409 and nothing is written', () => {
  const dir = copyDemo();
  const file = path.join(dir, 'questions', '2026-09-25-night-02.json');
  const text = fs.readFileSync(file, 'utf8');
  assert.throws(() => saveAnswer(dir, '2026-09-25-night-02', { status: 'answered', value: ['iso'], baseHash: 'stale' }), (e: unknown) => e instanceof StoreError && e.status === 409);
  assert.equal(fs.readFileSync(file, 'utf8'), text);
});

test('values are checked against the kind', () => {
  const dir = copyDemo();
  const hash = (id: string) => readQuestion(dir, `${id}.json`).hash;
  const bad = (id: string, value: string[]) => assert.throws(() => saveAnswer(dir, id, { status: 'answered', value, baseHash: hash(id) }), StoreError);
  bad('2026-09-25-night-02', ['iso', 'eu']); // one: two picks
  bad('2026-09-25-night-03', ['maybe']); // confirm: not yes/no
  bad('2026-09-25-night-04', ['colour', 'size', 'price', 'brand']); // many: over max 3
  bad('2026-09-25-night-05', ['search-speed']); // rank: not every option
  bad('2026-09-25-night-06', ['   ']); // text: empty
  // deferred needs no value
  const d = saveAnswer(dir, '2026-09-25-night-05', { status: 'deferred', value: ['ignored'], baseHash: hash('2026-09-25-night-05') });
  assert.deepEqual(d.question?.answer?.value, []);
});

test('a resolved question can no longer be answered', () => {
  const dir = copyDemo();
  const file = path.join(dir, 'questions', '2026-09-25-night-03.json');
  const q = JSON.parse(fs.readFileSync(file, 'utf8'));
  q.answer = { at: '2026-09-26T08:00:00+03:00', status: 'answered', value: ['yes'] };
  q.resolved = { at: '2026-09-26T09:00:00+03:00', into: 'commit abc1234' };
  fs.writeFileSync(file, JSON.stringify(q));
  const entry = readQuestion(dir, '2026-09-25-night-03.json');
  assert.throws(() => saveAnswer(dir, '2026-09-25-night-03', { status: 'answered', value: ['no'], baseHash: entry.hash }), (e: unknown) => e instanceof StoreError && e.status === 409);
});

test('invalid files are listed with their problems', () => {
  const dir = copyDemo();
  fs.writeFileSync(path.join(dir, 'questions', '2026-09-25-night-07.json'), JSON.stringify({ schema: 'question/1', id: '2026-09-25-night-99', shift: '2026-09-25-night', question: 'x', kind: 'one', options: [{ id: 'a', label: 'A' }], recommended: ['b'], because: 'y', answer: null, resolved: null }));
  fs.writeFileSync(path.join(dir, 'questions', '2026-09-25-night-08.json'), '{ not json');
  const byFile = new Map(listQuestions(dir).map((e) => [e.file, e]));
  assert.deepEqual(byFile.get('2026-09-25-night-07.json')?.problems, [
    'id "2026-09-25-night-99" does not match the file name 2026-09-25-night-07.json',
    'kind one needs at least two options',
    'recommended "b" is not an option',
    'recommended: pick exactly one of a',
  ]);
  assert.match(byFile.get('2026-09-25-night-08.json')!.problems[0], /^not valid JSON/);
});
