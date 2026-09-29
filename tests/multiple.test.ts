// Multiple-choice questions (D34, TASK-36): a keep/drop question takes several options, the
// recommendation and the answer are lists, and the follow-up names every option chosen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEAD_PID, TASKS, gitRepo, plan, session } from './helpers.ts';
import { ask, close, record, start } from '../src/night.ts';
import { createFollowUp } from '../src/followup.ts';
import { StoreError, loadNight, readFollowUp, registerRepo, saveNight } from '../src/store.ts';
import { createApp } from '../src/server.ts';

const KEEP = { task: 'T1', ask: 'Which exports do we keep?', options: [{ label: 'CSV' }, { label: 'PDF' }, { label: 'XML' }] };
const json = { 'content-type': 'application/json' };

test('ask: a multiple-choice question recommends a list, by ids or labels, and refuses a mix-up', () => {
  const repo = gitRepo('ask');
  const id = start(repo, plan(TASKS.slice(0, 1)), session('m', DEAD_PID)).night.night;
  const q = ask(repo, { ...KEEP, multiple: true, recommended: ['a', 'XML'] }).question;
  assert.deepEqual([q.multiple, q.recommended], [true, ['a', 'c']]);
  // An empty recommendation is a real one: keep none of them.
  assert.deepEqual(ask(repo, { ...KEEP, multiple: true, recommended: [] }).question.recommended, []);
  const refused = (input: object, pattern: RegExp) => assert.throws(() => ask(repo, { ...KEEP, ...input } as never), (e: Error) => e instanceof StoreError && pattern.test(e.message));
  refused({ multiple: true, recommended: 'a' }, /recommends a list/);
  refused({ recommended: ['a', 'b'] }, /needs "multiple": true/);
  refused({ multiple: true, recommended: ['a', 'z'] }, /not a list of its options/);
  refused({ multiple: true, recommended: ['a', 'a'] }, /duplicate items/);
  // Only the two good questions were written.
  assert.equal(loadNight(repo, id).night.questions.length, 2);
});

test('ask: a night started by an older release cannot hold a multiple-choice question', () => {
  const repo = gitRepo('older');
  const id = start(repo, plan(TASKS.slice(0, 1)), session('o', DEAD_PID)).night.night;
  const n = loadNight(repo, id).night;
  saveNight(repo, { ...n, schema: 'night-shift/night@3' });
  assert.throws(() => ask(repo, { ...KEEP, multiple: true, recommended: ['a'] }), /older release.*one question per option/);
});

test('the answer: a list of options on a multiple-choice question, and the follow-up names them all', async () => {
  const repo = gitRepo('answer');
  const id = start(repo, plan(TASKS.slice(0, 2)), session('a', DEAD_PID)).night.night;
  ask(repo, { ...KEEP, multiple: true, recommended: ['a', 'b'] });
  ask(repo, { task: 'T2', ask: 'Which formats go away?', options: [{ label: 'Fax' }, { label: 'Telex' }], multiple: true, recommended: ['a', 'b'] });
  record(repo, { task: 'T1', outcome: 'blocked', checks: [false, false], blocked_by: 'Q1' });
  record(repo, { task: 'T2', outcome: 'blocked', checks: [false], blocked_by: 'Q2' });
  close(repo, 'Both wait for you.');
  const ref = registerRepo(repo);
  const app = createApp({ version: 'test' });
  const answer = async (question: string, value: unknown) =>
    app.request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question, answer: value, baseHash: loadNight(repo, id).hash }) });

  // Not a list, a repeat, an unknown option: refused, and nothing is written.
  for (const bad of ['a', ['a', 'a'], ['a', 'z']]) assert.equal((await answer('Q1', bad)).status, 400, JSON.stringify(bad));
  assert.equal(loadNight(repo, id).night.questions[0].answer, null);
  // A list is saved as a list; an empty one means none of them.
  assert.equal((await answer('Q1', ['a', 'c'])).status, 200);
  assert.equal((await answer('Q2', [])).status, 200);
  assert.deepEqual(loadNight(repo, id).night.questions.map((q) => q.answer), [['a', 'c'], []]);

  const f = createFollowUp(repo, loadNight(repo, id).night);
  assert.deepEqual(
    f.items.map((i) => [i.task, i.kind, i.decision, i.decision_label]),
    [
      ['T1', 'decision', 'a,c', 'CSV, XML'],
      ['T2', 'decision', '', 'None of them'],
    ],
  );
  // Changed while still open: the item follows the new choice.
  assert.equal((await answer('Q1', ['b'])).status, 200);
  assert.deepEqual([readFollowUp(repo, id).items[0].decision, readFollowUp(repo, id).items[0].decision_label], ['b', 'PDF']);
});

test('the answer: a one-choice question still refuses a list', async () => {
  const repo = gitRepo('single');
  const id = start(repo, plan(TASKS.slice(0, 1)), session('s', DEAD_PID)).night.night;
  ask(repo, { ...KEEP, recommended: 'a' });
  const ref = registerRepo(repo);
  const res = await createApp({ version: 'test' }).request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: 'Q1', answer: ['a'], baseHash: loadNight(repo, id).hash }) });
  assert.equal(res.status, 400);
});
