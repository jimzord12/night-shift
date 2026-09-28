// Agent decisions (D31, TASK-46): recorded by `night-shift decide`, reviewed by the developer in the
// Viewer, a disagreement handed to the next agent. Real files, real git, the real server.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DEAD_PID, TASKS, gitRepo, plan, session } from './helpers.ts';
import { createApp } from '../src/server.ts';
import { close, decide, record, start } from '../src/night.ts';
import { createFollowUp } from '../src/followup.ts';
import { loadNight, readFollowUp, readNight, registerRepo } from '../src/store.ts';
import { ownerState } from '../src/types.ts';
import type { AgentDecision, NightDetail, Overview } from '../src/types.ts';

const json = { 'Content-Type': 'application/json' };

function refused(fn: () => unknown, pattern: RegExp) {
  assert.throws(fn, (e: Error) => pattern.test(e.message));
}

// A night that took two decisions for the developer and left T1 partial.
function nightWithDecisions(name: string) {
  const repo = gitRepo(name);
  const id = start(repo, plan(TASKS.slice(0, 2)), session('d', DEAD_PID), new Date('2026-09-26T23:10:00')).night.night;
  refused(() => decide(repo, { task: 'T1', decision: 'Used pdfkit', why: '' }), /needs "why"/);
  refused(() => decide(repo, { task: 'T9', decision: 'Used pdfkit', why: 'Smaller' }), /task T9 does not exist/);
  const first = decide(repo, { task: 'T1', decision: 'Generate invoices with pdfkit', why: 'It streams large invoices; jsPDF holds them in memory.' }, new Date('2026-09-27T01:00:00'));
  assert.equal(first.decision.id, 'AD1');
  decide(repo, { task: 'T2', decision: 'Keep the login cookie at 14 days', why: 'The task did not say; 14 days is the framework default.' });
  record(repo, { task: 'T1', outcome: 'partial', checks: [true, { met: false, note: 'no screenshot yet' }] });
  record(repo, { task: 'T2', outcome: 'done', checks: [true], evidence: [{ type: 'command', command: 'npm test', exit_code: 0, excerpt: 'ok' }] });
  close(repo, 'Invoices half done; the login fixed.', new Date('2026-09-27T04:00:00'));
  return { repo, id, ref: registerRepo(repo) };
}

async function review(app: ReturnType<typeof createApp>, repo: string, ref: string, id: string, decision: string, body: { review: 'ok' | 'disagree' | null; note?: string }) {
  const n = loadNight(repo, id);
  const d = n.night.agent_decisions!.find((x) => x.id === decision)!;
  return app.request(`/api/nights/${ref}/${id}/decision`, { method: 'POST', headers: json, body: JSON.stringify({ decision, ...body, baseHash: n.hash, was: { review: d.review, note: d.note } }) });
}

async function summary(app: ReturnType<typeof createApp>, ref: string, id: string) {
  await app.request(`/api/nights/${ref}/${id}/read`, { method: 'POST' });
  return ((await (await app.request('/api/overview')).json()) as Overview).nights.find((n) => n.repo === ref && n.id === id)!;
}

test('decisions the agent took keep the night in the developer\'s turn until reviewed', async () => {
  const { repo, id, ref } = nightWithDecisions('decide');
  const n = loadNight(repo, id).night;
  assert.equal(n.schema, 'night-shift/night@3');
  assert.deepEqual(n.agent_decisions!.map((d: AgentDecision) => [d.id, d.task, d.review]), [['AD1', 'T1', null], ['AD2', 'T2', null]]);
  const app = createApp({ version: 'test' });
  let s = await summary(app, ref.id, id);
  assert.deepEqual([s.questions_open, s.decisions_open, ownerState(s)], [0, 2, 'needs_answers']);
  // A disagreement needs a note; an ok does not.
  assert.equal((await review(app, repo, ref.id, id, 'AD1', { review: 'disagree' })).status, 400);
  // A note kept with "fine" would reach no agent: it is not stored.
  assert.equal((await review(app, repo, ref.id, id, 'AD2', { review: 'ok', note: 'Ask me before adding a dependency.' })).status, 200);
  assert.equal(loadNight(repo, id).night.agent_decisions![1].note, null);
  assert.equal((await review(app, repo, ref.id, id, 'AD1', { review: 'disagree', note: 'Use the browser print to PDF; no library.' })).status, 200);
  s = await summary(app, ref.id, id);
  assert.deepEqual([s.decisions_open, ownerState(s)], [0, 'ready_to_save']);
  // A stale review of a decision that changed since is refused.
  const stale = await app.request(`/api/nights/${ref.id}/${id}/decision`, { method: 'POST', headers: json, body: JSON.stringify({ decision: 'AD2', review: 'disagree', note: 'x', baseHash: 'old', was: { review: null, note: null } }) });
  assert.equal(stale.status, 409);
  // Saved: the disagreement reaches the next agent with the note; the ok does not.
  const f = createFollowUp(repo, loadNight(repo, id).night);
  assert.equal(f.schema, 'night-shift/follow-up@3');
  assert.deepEqual(f.items.map((i) => [i.kind, i.task, i.agent_decision ?? null, i.owner_note ?? null]), [
    ['unfinished', 'T1', null, null],
    ['disagreed', 'T1', 'AD1', 'Use the browser print to PDF; no library.'],
  ]);
});

test('a review changed after the save follows into the follow-up, until an agent works on it', async () => {
  const { repo, id, ref } = nightWithDecisions('decide-after');
  const app = createApp({ version: 'test' });
  await review(app, repo, ref.id, id, 'AD1', { review: 'ok' });
  await review(app, repo, ref.id, id, 'AD2', { review: 'ok' });
  createFollowUp(repo, loadNight(repo, id).night);
  const items = () => readFollowUp(repo, id).items.map((i) => [i.id, i.kind, i.status, i.owner_note ?? null]);
  assert.deepEqual(items(), [['A1', 'unfinished', 'open', null]]);
  // Changed to a disagreement: a new item; taken back: skipped; disagreed again: the same item reopens.
  assert.equal((await review(app, repo, ref.id, id, 'AD2', { review: 'disagree', note: 'Seven days.' })).status, 200);
  assert.deepEqual(items(), [['A1', 'unfinished', 'open', null], ['A2', 'disagreed', 'open', 'Seven days.']]);
  const detail = (await (await review(app, repo, ref.id, id, 'AD2', { review: 'ok' })).json()) as NightDetail;
  assert.equal(detail.follow_up!.items[1].status, 'skipped');
  await review(app, repo, ref.id, id, 'AD2', { review: 'disagree', note: 'Thirty days.' });
  assert.deepEqual(items(), [['A1', 'unfinished', 'open', null], ['A2', 'disagreed', 'open', 'Thirty days.']]);
  // A night working on it now holds the review; once it has worked on it, the review is final.
  const next = start(repo, plan([{ ...TASKS[0], follow_up: [`${id}/A1`, `${id}/A2`] }]), session('live', process.pid), new Date('2026-09-27T23:10:00'));
  // The next agent is told what the developer disagrees with, and why.
  assert.match(next.messages.join(' '), /T1 follows [0-9a-z-]+\/A2: the developer disagrees with a decision an agent took \("Keep the login cookie at 14 days"\): Thirty days\./);
  const held = await review(app, repo, ref.id, id, 'AD2', { review: 'ok' });
  assert.equal(held.status, 409);
  assert.match(((await held.json()) as { error: string }).error, /working on this right now/);
  assert.equal(readFollowUp(repo, id).items[1].status, 'open');
});

test('a night started by an older release cannot take a decision; version 2 files still read', () => {
  const repo = gitRepo('decide-old');
  const id = start(repo, plan(TASKS.slice(0, 1)), session('o', DEAD_PID), new Date('2026-09-26T23:10:00')).night.night;
  const file = path.join(repo, '.night-shift', 'nights', id, 'night.json');
  const old = JSON.parse(fs.readFileSync(file, 'utf8'));
  old.schema = 'night-shift/night@2';
  delete old.agent_decisions;
  fs.writeFileSync(file, JSON.stringify(old, null, 2));
  assert.equal(loadNight(repo, id).night.schema, 'night-shift/night@2');
  refused(() => decide(repo, { task: 'T1', decision: 'Used pdfkit', why: 'Smaller' }), /started by an older release/);
});

test('a night that finished everything but a disagreement still hands over', async () => {
  const repo = gitRepo('decide-done');
  const id = start(repo, plan(TASKS.slice(0, 1)), session('d', DEAD_PID), new Date('2026-09-26T23:10:00')).night.night;
  decide(repo, { task: 'T1', decision: 'Keep the login cookie at 14 days', why: 'The task did not say.' });
  record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'command', command: 'npm test', exit_code: 0, excerpt: 'ok' }] });
  close(repo, 'Done.', new Date('2026-09-27T04:00:00'));
  const ref = registerRepo(repo);
  const app = createApp({ version: 'test' });
  let s = await summary(app, ref.id, id);
  assert.deepEqual([s.hand_over, ownerState(s)], [false, 'needs_answers']);
  await review(app, repo, ref.id, id, 'AD1', { review: 'disagree', note: 'Seven days.' });
  s = await summary(app, ref.id, id);
  assert.deepEqual([s.hand_over, ownerState(s)], [true, 'ready_to_save']);
  assert.deepEqual(createFollowUp(repo, loadNight(repo, id).night).items.map((i) => [i.kind, i.owner_note]), [['disagreed', 'Seven days.']]);
});

test('a disagreement a later night carried unfinished keeps the decision and the note', async () => {
  const { repo, id, ref } = nightWithDecisions('decide-carry');
  const app = createApp({ version: 'test' });
  await review(app, repo, ref.id, id, 'AD1', { review: 'ok' });
  await review(app, repo, ref.id, id, 'AD2', { review: 'disagree', note: 'Seven days.' });
  createFollowUp(repo, loadNight(repo, id).night);
  const next = start(repo, plan([{ ...TASKS[1], follow_up: [`${id}/A2`] }], { skipped_follow_ups: [{ follow_up: `${id}/A1`, reason: 'later' }] }), session('n', DEAD_PID), new Date('2026-09-27T23:10:00')).night.night;
  record(repo, { task: 'T2', outcome: 'failed', why: 'the cookie is not changed yet', checks: [false] });
  close(repo, 'Ran out of time.', new Date('2026-09-28T04:00:00'));
  assert.equal(readFollowUp(repo, id).items[1].status, 'carried');
  const f = createFollowUp(repo, loadNight(repo, next).night);
  assert.deepEqual(f.items.map((i) => [i.kind, i.task, i.question, i.owner_note, i.left]), [['disagreed', 'T2', 'Keep the login cookie at 14 days', 'Seven days.', ['failed: the cookie is not changed yet', 'Login lands on the account page']]]);
});

test('a version 2 night file with agent decisions is reported, not read as version 3', () => {
  const { repo, id } = nightWithDecisions('decide-v2');
  const file = path.join(repo, '.night-shift', 'nights', id, 'night.json');
  const old = JSON.parse(fs.readFileSync(file, 'utf8'));
  old.schema = 'night-shift/night@2';
  fs.writeFileSync(file, JSON.stringify(old, null, 2));
  assert.ok(readNight(repo, id).problems.includes('agent decisions need a night-shift/night@3 night file'));
});
