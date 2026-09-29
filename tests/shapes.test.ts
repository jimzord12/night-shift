// Version 2 of the file shapes (D24): a one-sentence summary, a task that follows several follow-up
// items, questions that carry files, and "let's discuss". Real files, real git, the real server.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DEAD_PID, TASKS, gitRepo, plan, session } from './helpers.ts';
import { createApp } from '../src/server.ts';
import { SUMMARY_MAX, ask, close, record, start } from '../src/night.ts';
import { createFollowUp, openItems, resolveItem } from '../src/followup.ts';
import { loadNight, readFollowUp, readNight, registerRepo, saveNight } from '../src/store.ts';
import { forTalk, ownerState } from '../src/types.ts';
import type { FollowUp, FollowUpItem, NextNight, NightDetail, Overview } from '../src/types.ts';

const json = { 'Content-Type': 'application/json' };

function refused(fn: () => unknown, pattern: RegExp) {
  assert.throws(fn, (e: Error) => pattern.test(e.message));
}

// A closed night with two questions answered and a follow-up saved: items A1 and A2.
function withFollowUp(name = 'shop') {
  const repo = gitRepo(name);
  const id = start(repo, plan(TASKS.slice(0, 2)), session('s1', DEAD_PID), new Date('2026-09-26T23:10:00')).night.night;
  ask(repo, { task: 'T1', ask: 'Which invoice layout?', options: [{ label: 'Compact' }, { label: 'Detailed' }], recommended: 'a' });
  ask(repo, { task: 'T2', ask: 'Which login fix?', options: [{ label: 'Cookie' }, { label: 'Own domain' }], recommended: 'a' });
  record(repo, { task: 'T1', outcome: 'blocked', checks: [false, false], blocked_by: 'Q1' });
  record(repo, { task: 'T2', outcome: 'blocked', checks: [false], blocked_by: 'Q2' });
  close(repo, 'Both tasks wait for your decisions.', new Date('2026-09-27T04:00:00'));
  return { repo, id, ref: registerRepo(repo) };
}

test('summary: one line of at most 200 characters, refused at close with the reason; nothing is written', () => {
  const repo = gitRepo();
  const id = start(repo, plan(TASKS), session(), new Date('2026-09-26T23:10:00')).night.night;
  const before = fs.readFileSync(path.join(repo, '.night-shift', 'nights', id, 'night.json'), 'utf8');
  refused(() => close(repo, 'x'.repeat(SUMMARY_MAX + 1)), /one sentence of at most 200 characters, on one line \(this one has 201\)/);
  refused(() => close(repo, 'Invoices shipped.\nLogin waits.'), /on one line \(this one has 30 and line breaks\)/);
  assert.equal(fs.readFileSync(path.join(repo, '.night-shift', 'nights', id, 'night.json'), 'utf8'), before);
  assert.equal(close(repo, 'x'.repeat(SUMMARY_MAX)).night.status, 'complete');
  // An older night with a long summary still reads.
  const n = loadNight(repo, id).night;
  n.summary = 'y'.repeat(900);
  saveNight(repo, n);
  assert.deepEqual(readNight(repo, id).problems, []);
});

test('plan: one task follows two follow-up items, and closing the night settles both', async () => {
  const { repo, id } = withFollowUp();
  const app = createApp({ version: 'test' });
  for (const [q, a] of [['Q1', 'b'], ['Q2', 'a']]) {
    const res = await app.request(`/api/nights/${registerRepo(repo).id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: q, answer: a, baseHash: loadNight(repo, id).hash }) });
    assert.equal(res.status, 200);
  }
  createFollowUp(repo, loadNight(repo, id).night);
  const s = start(repo, plan([{ ...TASKS[0], follow_up: [`${id}/A1`, `${id}/A2`] }]), session('s2', DEAD_PID), new Date('2026-09-27T23:10:00'));
  assert.match(s.messages.join('\n'), /T1 follows 2026-09-26-a\/A1: the developer chose "Detailed"/);
  assert.match(s.messages.join('\n'), /T1 follows 2026-09-26-a\/A2: the developer chose "Cookie"/);
  assert.deepEqual(loadNight(repo, s.night.night).night.tasks[0].follow_up, [`${id}/A1`, `${id}/A2`]);
  record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'command', command: 'npm test', exit_code: 0, excerpt: 'ok' }] });
  close(repo, 'Both decisions carried out.');
  assert.deepEqual(readFollowUp(repo, id).items.map((i) => [i.id, i.status, i.resolved?.by]), [['A1', 'done', s.night.night], ['A2', 'done', s.night.night]]);
  // The same item twice is refused.
  refused(() => start(repo, plan([{ ...TASKS[0], follow_up: [`${id}/A1`, `${id}/A1`] }]), session('s3', DEAD_PID)), /does not match|appears twice/);
});

test('questions carry files from inside the repository only', () => {
  const repo = gitRepo();
  fs.mkdirSync(path.join(repo, 'design', 'concepts'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'design', 'concepts', 'a.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  fs.writeFileSync(path.join(path.dirname(repo), 'secret.txt'), 'not yours');
  start(repo, plan(TASKS), session(), new Date('2026-09-26T23:10:00'));
  const base = { task: 'T1', ask: 'Which concept do we keep?', options: [{ label: 'A' }, { label: 'B' }], recommended: 'a' };
  const q = ask(repo, { ...base, files: ['design/concepts/a.svg', { path: './design/concepts/a.svg', caption: 'Concept A' }] }).question;
  assert.deepEqual(q.files, [{ path: 'design/concepts/a.svg' }, { path: 'design/concepts/a.svg', caption: 'Concept A' }]);
  refused(() => ask(repo, { ...base, files: ['../secret.txt'] }), /file "\.\.\/secret\.txt" is outside the repository; a question can point only at files inside it/);
  refused(() => ask(repo, { ...base, files: [path.join(path.dirname(repo), 'secret.txt')] }), /is outside the repository/);
  refused(() => ask(repo, { ...base, files: ['design/concepts/missing.svg'] }), /does not exist in the repository/);
  // A refused question writes nothing.
  const night = fs.readdirSync(path.join(repo, '.night-shift', 'nights'))[0];
  assert.equal(loadNight(repo, night).night.questions.length, 1);
});

test("let's discuss: needs a note, becomes a discuss item no night acts on, and makes the night the developer's turn", async () => {
  const { repo, id, ref } = withFollowUp('blog');
  const app = createApp({ version: 'test' });
  const answer = (q: string, a: string | null, note = '') =>
    app.request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: q, answer: a, note, baseHash: loadNight(repo, id).hash }) });
  const bare = await answer('Q1', 'discuss');
  assert.equal(bare.status, 400);
  assert.match(((await bare.json()) as { error: string }).error, /let's discuss needs a note/);
  assert.equal((await answer('Q1', 'discuss', 'Which layout did the client sign off?')).status, 200);
  assert.equal((await answer('Q2', 'a')).status, 200);
  const f = createFollowUp(repo, loadNight(repo, id).night);
  assert.equal(f.schema, 'night-shift/follow-up@3');
  assert.deepEqual(f.items.map((i) => [i.id, i.kind, i.owner_note ?? null]), [['A1', 'discuss', 'Which layout did the client sign off?'], ['A2', 'decision', null]]);
  // A saved decision can turn into a point to discuss, and back, until an agent takes it on.
  assert.equal((await answer('Q2', 'discuss', 'Is the own domain ready?')).status, 200);
  assert.deepEqual([readFollowUp(repo, id).items[1].kind, readFollowUp(repo, id).items[1].decision ?? null], ['discuss', null]);
  assert.equal((await answer('Q2', 'a')).status, 200);
  assert.deepEqual([readFollowUp(repo, id).items[1].kind, readFollowUp(repo, id).items[1].decision_label], ['decision', 'Cookie']);

  // A night may not plan or skip it, and need not: it is left for a day session.
  refused(() => start(repo, plan([{ ...TASKS[0], follow_up: `${id}/A1` }, { ...TASKS[1], follow_up: `${id}/A2` }]), session('s2', DEAD_PID)), /A1 is one the developer wants to discuss/);
  refused(() => start(repo, plan([{ ...TASKS[1], follow_up: `${id}/A2` }], { skipped_follow_ups: [{ follow_up: `${id}/A1`, reason: 'later' }] }), session('s2', DEAD_PID)), /wants to discuss/);
  const s = start(repo, plan([{ ...TASKS[1], follow_up: `${id}/A2` }]), session('s2', DEAD_PID), new Date('2026-09-27T23:10:00'));
  assert.match(s.messages.join('\n'), /Left for a day session with the developer \(they want to discuss\): 2026-09-26-a\/A1 "/);
  record(repo, { task: 'T2', outcome: 'done', checks: [true], evidence: [{ type: 'command', command: 'npm test', exit_code: 0, excerpt: 'ok' }] });
  close(repo, 'Login fixed.');
  assert.deepEqual(openItems(repo).map((o) => [o.ref, o.item.kind]), [[`${id}/A1`, 'discuss']]);

  // Only the discuss item is left open: the night is the developer's turn again.
  await app.request(`/api/nights/${ref.id}/${id}/read`, { method: 'POST' });
  const o = (await (await app.request('/api/overview')).json()) as Overview;
  const n = o.nights.find((x) => x.repo === ref.id && x.id === id)!;
  assert.deepEqual([n.follow_up_open, n.follow_up_discuss], [1, 1]);
  assert.equal(ownerState(n), 'needs_answers');
  const d = (await (await app.request(`/api/nights/${ref.id}/${id}`)).json()) as NightDetail;
  assert.equal(d.night.schema, 'night-shift/night@3');
  // A discuss answer is a valid night file.
  assert.deepEqual(readNight(repo, id).problems, []);
});

test("let's discuss on a night still running: the file stays valid and the agent can close it", async () => {
  const repo = gitRepo('live-discuss');
  const id = start(repo, plan(TASKS.slice(0, 1)), session('live', process.pid), new Date('2026-09-26T23:10:00')).night.night;
  ask(repo, { task: 'T1', ask: 'Which layout?', options: [{ label: 'Compact' }, { label: 'Detailed' }], recommended: 'a' });
  const ref = registerRepo(repo);
  const res = await createApp({ version: 'test' }).request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: 'Q1', answer: 'discuss', note: 'Which one did the client see?', baseHash: loadNight(repo, id).hash }) });
  assert.equal(res.status, 200);
  assert.deepEqual(readNight(repo, id).problems, []);
  record(repo, { task: 'T1', outcome: 'blocked', checks: [false, false], blocked_by: 'Q1' });
  assert.equal(close(repo, 'The layout waits for a talk.').night.status, 'complete');
});

test('a partial task that followed two decisions carries both to the next agent', async () => {
  const { repo, id, ref } = withFollowUp('carry');
  const app = createApp({ version: 'test' });
  for (const [q, a] of [['Q1', 'b'], ['Q2', 'a']]) {
    await app.request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: q, answer: a, baseHash: loadNight(repo, id).hash }) });
  }
  createFollowUp(repo, loadNight(repo, id).night);
  const s = start(repo, plan([{ ...TASKS[0], follow_up: [`${id}/A1`, `${id}/A2`] }]), session('s2', DEAD_PID), new Date('2026-09-27T23:10:00'));
  assert.equal(fs.readFileSync(path.join(repo, '.night-shift', 'nights', s.night.night, 'plan.json'), 'utf8').includes('"night-shift/plan@3"'), true);
  record(repo, { task: 'T1', outcome: 'partial', checks: [true, { met: false, note: 'the download is left' }] });
  close(repo, 'Half the invoices.');
  const next = createFollowUp(repo, loadNight(repo, s.night.night).night);
  assert.deepEqual(next.items.map((i) => [i.task, i.kind, i.decision_label, i.left ?? null]), [
    ['T1', 'decision', 'Detailed', ['Screenshot attached: the download is left']],
    ['T1', 'decision', 'Cookie', null],
  ]);
});

test('version 1 files still read: a night, a plan and a follow-up written before version 2', () => {
  const { repo, id } = withFollowUp('legacy');
  const n = loadNight(repo, id).night as unknown as { schema: string };
  n.schema = 'night-shift/night@1';
  saveNight(repo, n as never);
  assert.deepEqual(readNight(repo, id).problems, []);
  const f = createFollowUp(repo, loadNight(repo, id).night);
  const file = path.join(repo, '.night-shift', 'follow-ups', `${id}.json`);
  fs.writeFileSync(file, JSON.stringify({ ...f, schema: 'night-shift/follow-up@1' }));
  assert.equal(readFollowUp(repo, id).schema, 'night-shift/follow-up@1');
  const s = start(repo, JSON.stringify({ schema: 'night-shift/plan@1', tasks: [{ ...TASKS[0], follow_up: `${id}/A1` }, { ...TASKS[1], follow_up: `${id}/A2` }] }), session('s2', DEAD_PID));
  assert.equal(s.night.schema, 'night-shift/night@3');
});

test("a question's files: served from the repository and shown in the file manager, and nothing else", async () => {
  const repo = gitRepo('design');
  fs.mkdirSync(path.join(repo, 'concepts'));
  fs.writeFileSync(path.join(repo, 'concepts', 'a.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  fs.writeFileSync(path.join(repo, 'README.md'), '# not listed');
  start(repo, plan(TASKS), session(), new Date('2026-09-26T23:10:00'));
  const night = fs.readdirSync(path.join(repo, '.night-shift', 'nights'))[0];
  ask(repo, { task: 'T1', ask: 'Which concept?', options: [{ label: 'A' }, { label: 'B' }], recommended: 'a', files: [{ path: 'concepts/a.svg', caption: 'Concept A' }] });
  const shown: string[] = [];
  // The file manager is the operating system's: a recorder stands in for it.
  const app = createApp({ version: 'test', reveal: (f) => shown.push(f) });
  const id = registerRepo(repo).id;
  const base = `/api/nights/${id}/${night}/questions/Q1/files`;
  const res = await app.request(`${base}/0`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('Content-Type') ?? '', /svg/);
  assert.match(await res.text(), /<svg/);
  assert.equal((await app.request(`${base}/1`)).status, 404);
  // Notes open as readable text, not a download.
  fs.writeFileSync(path.join(repo, 'concepts', 'notes.md'), '# Concepts');
  const q = loadNight(repo, night).night;
  q.questions[0].files = [...(q.questions[0].files ?? []), { path: 'concepts/notes.md' }];
  saveNight(repo, q);
  const md = await app.request(`${base}/1`);
  assert.deepEqual([md.status, md.headers.get('Content-Type'), md.headers.get('Content-Disposition'), md.headers.get('Content-Security-Policy')], [200, 'text/plain; charset=utf-8', null, 'sandbox']);
  assert.equal(await md.text(), '# Concepts');
  assert.equal((await app.request(`/api/nights/${id}/${night}/questions/Q9/files/0`)).status, 404);
  assert.equal((await app.request(`${base}/0/reveal`, { method: 'POST' })).status, 200);
  assert.deepEqual(shown, [path.join(fs.realpathSync.native(repo), 'concepts', 'a.svg')]);
  // A file that moved away since the question was asked is gone, not guessed.
  fs.rmSync(path.join(repo, 'concepts', 'a.svg'));
  assert.equal((await app.request(`${base}/0/reveal`, { method: 'POST' })).status, 404);
  assert.equal(shown.length, 1);
  // A night file edited by hand to point outside the repository is served nothing and shows nothing.
  fs.writeFileSync(path.join(path.dirname(repo), 'secret.txt'), 'not yours');
  const n = loadNight(repo, night).night;
  n.questions[0].files = [{ path: '../secret.txt' }];
  saveNight(repo, n);
  assert.equal((await app.request(`${base}/0`)).status, 404);
  assert.equal((await app.request(`${base}/0/reveal`, { method: 'POST' })).status, 404);
  assert.equal(shown.length, 1);
});

test("the day skill raises discuss items first; the night skill leaves them out and keeps the summary to one sentence", () => {
  const day = fs.readFileSync('skills/do-night-shift-follow-up/SKILL.md', 'utf8');
  assert.match(day, /Redo that part their way/);
  assert.match(day, /When a choice that belongs to the developer comes up while you work, ask\nthem in the conversation/);
  assert.match(day, /Raise every `discuss` item with the developer first, before any other\nwork/);
  const night = fs.readFileSync('skills/start-night-shift/SKILL.md', 'utf8');
  assert.match(night, /A `discuss` item is one the developer wants to talk through:\nleave it out of the plan entirely/);
  // D31: every decision taken on the developer's behalf is recorded, never taken silently.
  assert.match(night, /\*\*Record every decision you take on the developer's behalf\*\*/);
  assert.match(night, /\{\{cli\}\} decide --file \.night-shift\/input\.json/);
  assert.match(night, /close with \*\*one\nsentence\*\*/);
  assert.match(night, /"schema": "night-shift\/plan@3"/);
  // D33: the night proves it can work before it starts, and stops when it cannot.
  assert.match(night, /\*\*When a check fails or stopped for a permission, do not start the\nnight\.\*\*/);
});

test('an answer saves when only other parts of the night changed since it was opened (TASK-44)', async () => {
  const { repo, id, ref } = withFollowUp('meter');
  const app = createApp({ version: 'test' });
  const seen = loadNight(repo, id);
  // The Meter measures the night after the developer opened it.
  const n = structuredClone(seen.night);
  n.metrics = { source: 'claude-code', harness_version: null, session_id: 's1', measured_at: '2026-09-27T09:00:00+03:00', duration_min: { total: 42, model: null, tools: null }, models: {}, cost_usd: 1.5, sub_agents: [], lines: { added: null, removed: null } };
  saveNight(repo, n);
  const post = (bodyObj: object) => app.request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify(bodyObj) });
  // Without what the developer saw, the old rule holds: a conflict.
  assert.equal((await post({ question: 'Q1', answer: 'b', baseHash: seen.hash })).status, 409);
  // With it, the answer saves and the metrics stay.
  const ok = await post({ question: 'Q1', answer: 'b', baseHash: seen.hash, was: { answer: null, note: null } });
  assert.equal(ok.status, 200);
  assert.deepEqual([loadNight(repo, id).night.questions[0].answer, loadNight(repo, id).night.metrics?.cost_usd], ['b', 1.5]);
  // The same question changed meanwhile (another tab): still a conflict, and nothing is written.
  const stale = await post({ question: 'Q1', answer: 'a', baseHash: seen.hash, was: { answer: null, note: null } });
  assert.equal(stale.status, 409);
  assert.equal(loadNight(repo, id).night.questions[0].answer, 'b');
  // Same answer seen, but its note changed meanwhile: a conflict too.
  const noted = loadNight(repo, id);
  assert.equal((await post({ question: 'Q1', answer: 'b', note: 'from tab one', baseHash: noted.hash, was: { answer: 'b', note: null } })).status, 200);
  const stillSeen = await post({ question: 'Q1', answer: 'a', baseHash: noted.hash, was: { answer: 'b', note: null } });
  assert.equal(stillSeen.status, 409);
  assert.deepEqual([loadNight(repo, id).night.questions[0].answer, loadNight(repo, id).night.questions[0].note], ['b', 'from tab one']);
});

test('a carried task that ends on a new question keeps the decisions it carried', async () => {
  const { repo, id, ref } = withFollowUp('carry-q');
  const app = createApp({ version: 'test' });
  for (const [q, a] of [['Q1', 'b'], ['Q2', 'a']]) {
    await app.request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: q, answer: a, baseHash: loadNight(repo, id).hash }) });
  }
  const first = createFollowUp(repo, loadNight(repo, id).night);
  assert.equal(first.schema, 'night-shift/follow-up@3');
  const s = start(repo, plan([{ ...TASKS[0], follow_up: [`${id}/A1`, `${id}/A2`] }]), session('s2', DEAD_PID), new Date('2026-09-27T23:10:00'));
  ask(repo, { task: 'T1', ask: 'Which PDF library?', options: [{ label: 'pdfkit' }, { label: 'jsPDF' }], recommended: 'a' });
  record(repo, { task: 'T1', outcome: 'blocked', checks: [false, false], blocked_by: 'Q1' });
  close(repo, 'The invoices wait for a library.');
  const unanswered = createFollowUp(repo, loadNight(repo, s.night.night).night);
  assert.deepEqual(unanswered.items.map((i) => [i.kind, i.decision_label ?? i.question]), [['waiting', 'Which PDF library?'], ['decision', 'Detailed'], ['decision', 'Cookie']]);
  // Answered later, the question's item turns into a decision and the carried ones stay.
  const res = await app.request(`/api/nights/${ref.id}/${s.night.night}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: 'Q1', answer: 'a', baseHash: loadNight(repo, s.night.night).hash }) });
  assert.equal(res.status, 200);
  assert.deepEqual(readFollowUp(repo, s.night.night).items.map((i) => [i.kind, i.decision_label]), [['decision', 'pdfkit'], ['decision', 'Detailed'], ['decision', 'Cookie']]);
});

test('an older follow-up takes version 2 when an answer flows into it; "discuss" is no option id', async () => {
  const { repo, id, ref } = withFollowUp('old-follow-up');
  createFollowUp(repo, loadNight(repo, id).night);
  const file = path.join(repo, '.night-shift', 'follow-ups', `${id}.json`);
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('night-shift/follow-up@3', 'night-shift/follow-up@1'));
  const res = await createApp({ version: 'test' }).request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: 'Q1', answer: 'discuss', note: 'Talk first', baseHash: loadNight(repo, id).hash }) });
  assert.equal(res.status, 200);
  assert.equal(readFollowUp(repo, id).schema, 'night-shift/follow-up@3');
  const live = gitRepo('reserved');
  start(live, plan(TASKS.slice(0, 1)), session('r', process.pid));
  refused(() => ask(live, { task: 'T1', ask: 'Who decides?', options: [{ id: 'discuss', label: 'Discuss with the team' }, { label: 'Me' }], recommended: 'b' }), /"discuss" is reserved/);
});

test("a task the developer wants to discuss holds its carried decisions with it; an answer given first is carried too", async () => {
  const setup = async (name: string, answer: string, note = '') => {
    const { repo, id, ref } = withFollowUp(name);
    const app = createApp({ version: 'test' });
    for (const [q, a] of [['Q1', 'b'], ['Q2', 'a']]) {
      await app.request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: q, answer: a, baseHash: loadNight(repo, id).hash }) });
    }
    createFollowUp(repo, loadNight(repo, id).night);
    const s = start(repo, plan([{ ...TASKS[0], follow_up: [`${id}/A1`, `${id}/A2`] }]), session('s2', DEAD_PID), new Date('2026-09-27T23:10:00'));
    ask(repo, { task: 'T1', ask: 'Which PDF library?', options: [{ label: 'pdfkit' }, { label: 'jsPDF' }], recommended: 'a' });
    record(repo, { task: 'T1', outcome: 'blocked', checks: [false, false], blocked_by: 'Q1' });
    close(repo, 'The invoices wait for a library.');
    // The developer answers first and saves after: the usual order.
    const res = await app.request(`/api/nights/${ref.id}/${s.night.night}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: 'Q1', answer, note, baseHash: loadNight(repo, s.night.night).hash }) });
    assert.equal(res.status, 200);
    return { repo, app, ref, night: s.night.night, f: createFollowUp(repo, loadNight(repo, s.night.night).night) };
  };
  const decided = await setup('carry-first', 'a');
  assert.deepEqual(decided.f.items.map((i) => [i.kind, i.decision_label]), [['decision', 'pdfkit'], ['decision', 'Detailed'], ['decision', 'Cookie']]);

  const talk = await setup('carry-talk', 'discuss', 'Is a library even needed?');
  assert.deepEqual(talk.f.items.map((i) => [i.kind, i.decision_label ?? null]), [['discuss', null], ['decision', 'Detailed'], ['decision', 'Cookie']]);
  // No night works on the task or its decisions until the talk; a plan without them is accepted.
  refused(() => start(talk.repo, plan([{ ...TASKS[0], follow_up: `${talk.night}/A2` }]), session('s3', DEAD_PID)), /belongs to task T1, which the developer wants to discuss first/);
  const next = start(talk.repo, plan([TASKS[2]]), session('s4', DEAD_PID), new Date('2026-09-28T23:10:00'));
  assert.match(next.messages.join('\n'), new RegExp(`Left for a day session .*${talk.night}/A1.*${talk.night}/A2.*${talk.night}/A3`));
  record(talk.repo, { task: 'T3', outcome: 'done', checks: [true, true], evidence: [{ type: 'command', command: 'npm test', exit_code: 0, excerpt: 'ok' }] });
  close(talk.repo, 'Framework upgraded.');
  // The night is the developer's turn: everything open waits for the talk.
  await talk.app.request(`/api/nights/${talk.ref.id}/${talk.night}/read`, { method: 'POST' });
  const n = ((await (await talk.app.request('/api/overview')).json()) as Overview).nights.find((x) => x.repo === talk.ref.id && x.id === talk.night)!;
  assert.deepEqual([n.follow_up_open, n.follow_up_discuss, ownerState(n)], [3, 3, 'needs_answers']);
  // The Next night page says which items wait for the talk.
  const nn = (await (await talk.app.request('/api/next-night')).json()) as NextNight;
  assert.deepEqual(nn.repos.find((r) => r.repo.id === talk.ref.id)!.items.map((i) => [i.item.kind, i.held]), [['discuss', true], ['decision', true], ['decision', true]]);
  // Talked through by day: the decisions are the next night's work again.
  resolveItem(talk.repo, `${talk.night}/A1`, 'done', 'day', 'Talked it through: pdfkit');
  const after = (await (await talk.app.request('/api/next-night')).json()) as NextNight;
  assert.deepEqual(after.repos.find((r) => r.repo.id === talk.ref.id)!.items.map((i) => [i.item.kind, i.held]), [['decision', false], ['decision', false]]);
  refused(() => start(talk.repo, plan([TASKS[1]]), session('s5', DEAD_PID)), new RegExp(`${talk.night}/A2`));
  assert.equal(start(talk.repo, plan([{ ...TASKS[0], follow_up: [`${talk.night}/A2`, `${talk.night}/A3`] }]), session('s6', DEAD_PID), new Date('2026-09-29T23:10:00')).night.status, 'open');
});

test('a question asked again hands over its new answer, not the earlier one as well', async () => {
  const { repo, id, ref } = withFollowUp('reask');
  const app = createApp({ version: 'test' });
  await app.request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: 'Q1', answer: 'b', baseHash: loadNight(repo, id).hash }) });
  createFollowUp(repo, loadNight(repo, id).night);
  const s = start(repo, plan([{ ...TASKS[0], follow_up: `${id}/A1` }], { skipped_follow_ups: [{ follow_up: `${id}/A2`, reason: 'not tonight' }] }), session('s2', DEAD_PID), new Date('2026-09-27T23:10:00'));
  ask(repo, { task: 'T1', ask: 'Which invoice layout?', options: [{ label: 'Compact' }, { label: 'Detailed' }], recommended: 'a' });
  record(repo, { task: 'T1', outcome: 'blocked', checks: [false, false], blocked_by: 'Q1' });
  close(repo, 'The layout question came back.');
  await app.request(`/api/nights/${ref.id}/${s.night.night}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: 'Q1', answer: 'a', baseHash: loadNight(repo, s.night.night).hash }) });
  const f = createFollowUp(repo, loadNight(repo, s.night.night).night);
  assert.deepEqual(f.items.map((i) => [i.kind, i.decision_label]), [['decision', 'Compact']]);
});

test('a carried question asked again as the second question of the task replaces the earlier answer too', async () => {
  const { repo, id, ref } = withFollowUp('reask-second');
  const app = createApp({ version: 'test' });
  await app.request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: 'Q1', answer: 'b', baseHash: loadNight(repo, id).hash }) });
  createFollowUp(repo, loadNight(repo, id).night);
  start(repo, plan([{ ...TASKS[0], follow_up: `${id}/A1` }], { skipped_follow_ups: [{ follow_up: `${id}/A2`, reason: 'not tonight' }] }), session('s2', DEAD_PID), new Date('2026-09-27T23:10:00'));
  ask(repo, { task: 'T1', ask: 'Which PDF library?', options: [{ label: 'pdfkit' }, { label: 'jsPDF' }], recommended: 'a' });
  ask(repo, { task: 'T1', ask: 'Which invoice layout?', options: [{ label: 'Compact' }, { label: 'Detailed' }], recommended: 'a' });
  record(repo, { task: 'T1', outcome: 'blocked', checks: [false, false], blocked_by: 'Q1' });
  const night = close(repo, 'Two questions came back.').night;
  const f = createFollowUp(repo, night);
  assert.deepEqual(f.items.map((i) => [i.kind, i.question]), [['waiting', 'Which PDF library?'], ['waiting', 'Which invoice layout?']]);
});

test('a point to discuss without a task holds only itself', () => {
  const item = (id: string, kind: FollowUpItem['kind'], task?: string) => ({ id, kind, status: 'open', title: id, done_when: [], ...(task ? { task } : {}) }) as FollowUpItem;
  const f = { items: [item('A1', 'discuss'), item('A2', 'decision'), item('A3', 'decision', 'T1'), item('A4', 'discuss', 'T1'), item('A5', 'decision', 'T2')] } as FollowUp;
  assert.deepEqual(f.items.map((i) => forTalk(f, i)), [true, false, true, true, false]);
});

test('a waiting question stays open and answerable when the task that followed it ends without asking again', async () => {
  const { repo, id, ref } = withFollowUp('still-waiting');
  createFollowUp(repo, loadNight(repo, id).night);
  start(repo, plan([{ ...TASKS[0], follow_up: `${id}/A1` }], { skipped_follow_ups: [{ follow_up: `${id}/A2`, reason: 'not tonight' }] }), session('s2', DEAD_PID), new Date('2026-09-27T23:10:00'));
  record(repo, { task: 'T1', outcome: 'partial', checks: [true, { met: false, note: 'the layout still waits' }] });
  const second = close(repo, 'Half the invoices; the layout question still stands.').night;
  assert.deepEqual(readFollowUp(repo, id).items.map((i) => [i.kind, i.status]), [['waiting', 'open'], ['waiting', 'skipped']]);
  // The next night must plan it or skip it, and the developer can still answer it where it was asked.
  refused(() => start(repo, plan([TASKS[2]]), session('s3', DEAD_PID)), new RegExp(`${id}/A1`));
  const res = await createApp({ version: 'test' }).request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: 'Q1', answer: 'b', baseHash: loadNight(repo, id).hash }) });
  assert.equal(res.status, 200);
  assert.deepEqual(readFollowUp(repo, id).items.map((i) => [i.kind, i.decision_label ?? null, i.status]), [['decision', 'Detailed', 'open'], ['waiting', null, 'skipped']]);
  // Answered before the second night is saved: the answer stays where it was given, not copied, so
  // changing it later leaves one decision.
  assert.deepEqual(createFollowUp(repo, second).items.map((i) => [i.kind, i.decision_label ?? null]), [['unfinished', null]]);
  // The next night takes on the answered question with the work left, and is told the answer.
  const t = start(repo, plan([{ ...TASKS[0], follow_up: [`${id}/A1`, `${second.night}/A1`] }]), session('s4', DEAD_PID), new Date('2026-09-28T23:10:00'));
  assert.match(t.messages.join('\n'), new RegExp(`T1 follows ${id}/A1: the developer chose "Detailed"`));
});

test('a waiting question asked again by the next night is carried there and locked where it was first asked', () => {
  const { repo, id } = withFollowUp('asked-again');
  createFollowUp(repo, loadNight(repo, id).night);
  start(repo, plan([{ ...TASKS[0], follow_up: `${id}/A1` }], { skipped_follow_ups: [{ follow_up: `${id}/A2`, reason: 'not tonight' }] }), session('s2', DEAD_PID), new Date('2026-09-27T23:10:00'));
  ask(repo, { task: 'T1', ask: 'Which invoice layout?', options: [{ label: 'Compact' }, { label: 'Detailed' }], recommended: 'a' });
  record(repo, { task: 'T1', outcome: 'blocked', checks: [false, false], blocked_by: 'Q1' });
  close(repo, 'The layout question is asked again.');
  assert.equal(readFollowUp(repo, id).items[0].status, 'carried');
});
