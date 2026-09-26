import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { transcript } from './helpers.ts';
import { findTranscript, measure, priceOf } from '../src/meter.ts';

test('with a cost record: Claude Code\'s own totals, per model, durations and lines', () => {
  const m = measure(transcript({ costState: true, subAgent: true }), 'session-1');
  assert.equal(m.cost_usd, 18.4);
  assert.deepEqual(m.duration_min, { total: 312, model: 176, tools: 10 });
  assert.deepEqual(m.lines, { added: 1177, removed: 118 });
  assert.deepEqual(m.models['claude-opus-5'].tokens, { input: 4_200_000, output: 380_000, reasoning: 96_000, cache_read: 51_000_000, cache_write: 1_900_000 });
  assert.equal(m.harness_version, '2.1.3');
  assert.deepEqual(m.sub_agents, [{ type: 'general-purpose', model: 'claude-haiku-4-5', purpose: 'Review round 1' }]);
});

test('without a cost record: messages counted once each, sub-agents included, priced from the table', () => {
  const m = measure(transcript({ subAgent: true }), 'session-1');
  // m1 is logged twice but counts once; the cut-off last line is skipped.
  assert.deepEqual(m.models['claude-opus-5'].tokens, { input: 30, output: 400, reasoning: 100, cache_read: 2000, cache_write: 400 });
  assert.deepEqual(m.models['claude-haiku-4-5'].tokens, { input: 1000, output: 1000, reasoning: 0, cache_read: 1000, cache_write: 200 });
  // opus: (30*5 + 400*25 + 2000*0.5 + 400*5*2) / 1e6 = 0.01515 → 0.02; haiku: (1000 + 5000 + 100 + 400) / 1e6 → 0.01
  assert.equal(m.models['claude-opus-5'].cost_usd, 0.02);
  assert.equal(m.cost_usd, 0.03);
  assert.deepEqual(m.duration_min, { total: 151, model: null, tools: null });
  assert.deepEqual(m.lines, { added: null, removed: null });
});

test('an unknown model makes the total unknown, never a guess', () => {
  assert.equal(priceOf('claude-future-9', { input: 1, output: 1, reasoning: 0, cacheRead: 0, cacheWrite5m: 0, cacheWrite1h: 0 }), null);
  assert.equal(priceOf('claude-sonnet-5', { input: 1_000_000, output: 1_000_000, reasoning: 0, cacheRead: 0, cacheWrite5m: 0, cacheWrite1h: 0 }), 12);
});

test('no log at all: every metric is unknown', () => {
  const m = measure(null, 'x');
  assert.equal(m.cost_usd, null);
  assert.deepEqual(m.models, {});
  assert.deepEqual(m.duration_min, { total: null, model: null, tools: null });
  assert.equal(measure(path.join(os.tmpdir(), 'nope.jsonl'), 'x').harness_version, null);
});

test('the session log is found by id under any project folder of the config directory', () => {
  const config = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-config-'));
  const dir = path.join(config, 'projects', 'C--work-shop');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'abc-123.jsonl'), '');
  assert.equal(findTranscript('abc-123', config), path.join(dir, 'abc-123.jsonl'));
  assert.equal(findTranscript('missing', config), null);
  assert.equal(findTranscript('../escape', config), null);
});
