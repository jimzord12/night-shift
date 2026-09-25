import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHeader, parseOutcome, touchesOverlap } from '../src/parse.ts';

test('card header: all fields', () => {
  const h = parseHeader('night-shift: kind=build size=M touches=src/a,src/b/\n\nrest of the card');
  assert.deepEqual(h, { kind: 'build', size: 'M', touches: ['src/a', 'src/b'], problems: [] });
});

test('card header: missing and bad fields are problems, not errors', () => {
  const h = parseHeader('night-shift: kind=sometimes touches=x colour=red');
  assert.ok(h);
  assert.deepEqual(h.problems, ['kind must be build or explore, got "sometimes"', 'unknown key "colour"', 'kind is missing', 'size is missing']);
});

test('card header: absent', () => {
  assert.equal(parseHeader('just a description'), null);
});

test('touches overlap when one path contains the other', () => {
  assert.equal(touchesOverlap(['src/search'], ['src/search/index.ts']), true);
  assert.equal(touchesOverlap(['src/search'], ['src/searchbar']), false);
  assert.equal(touchesOverlap(['a'], ['b', 'a']), true);
});

test('outcome: full comment inside a code fence', () => {
  const o = parseOutcome(['```', 'night-shift outcome/1', 'shift: 2026-09-25-night', 'status: shipped', 'review: PASS (2 rounds)', 'line: It works.', 'commits: abc1234, def5678', 'evidence: compare b.png a.png | Page 1', 'evidence: link https://x.test/run | CI', 'questions: 2026-09-25-night-01', '```'].join('\n'));
  assert.ok(o);
  assert.deepEqual(o.problems, []);
  assert.equal(o.status, 'shipped');
  assert.deepEqual(o.commits, ['abc1234', 'def5678']);
  assert.deepEqual(o.evidence, [
    { kind: 'compare', files: ['b.png', 'a.png'], caption: 'Page 1' },
    { kind: 'link', files: [], url: 'https://x.test/run', caption: 'CI' },
  ]);
  assert.deepEqual(o.questions, ['2026-09-25-night-01']);
});

test('outcome: missing required keys and bad values are reported', () => {
  const o = parseOutcome('night-shift outcome/1\nstatus: done\nevidence: compare only-one.png\nmood: good');
  assert.ok(o);
  assert.deepEqual(o.problems, [
    'status must be one of shipped, needs-eyes, blocked, skipped, got "done"',
    'evidence compare takes two file names (before after), got "compare only-one.png"',
    'unknown key "mood"',
    'shift is missing',
    'status is missing',
    'line is missing',
  ]);
});

test('outcome: an ordinary comment is not an outcome', () => {
  assert.equal(parseOutcome('Looks good to me'), null);
});
