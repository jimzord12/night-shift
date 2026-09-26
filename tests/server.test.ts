import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DEAD_PID, TASKS, evidenceFile, gitRepo, plan, session } from './helpers.ts';
import { createApp } from '../src/server.ts';
import { ask, close, feedback, onSessionEnd, record, start } from '../src/night.ts';
import { loadNight, markRead, readFollowUp, registerRepo } from '../src/store.ts';
import { buildFollowUp, resolveItem } from '../src/followup.ts';
import { issueBody, newIssueUrl } from '../src/github.ts';
import { inMorning, needsHandOver, ownerSide } from '../src/types.ts';
import type { NightDetail, Overview } from '../src/types.ts';

const NOW = new Date('2026-09-26T23:10:00');
const json = { 'Content-Type': 'application/json' };

// A repository with one closed night: a done task with a picture, a blocked one with a question,
// and one feedback entry.
function closedNight(name = 'shop') {
  const repo = gitRepo(name);
  const id = start(repo, plan(TASKS.slice(0, 2)), session('s', DEAD_PID), NOW).night.night;
  const shot = evidenceFile(repo, id, 'invoice.svg');
  record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'image', path: shot }] });
  ask(repo, { task: 'T2', ask: 'Which fix?', options: [{ label: 'Cookie' }, { label: 'Own domain' }], recommended: 'a' });
  record(repo, { task: 'T2', outcome: 'blocked', checks: [false], blocked_by: 'Q1' });
  feedback(repo, { kind: 'missing-block', title: 'Compare PDFs', body: 'Needed it.' });
  close(repo, 'Invoices shipped; login waits for you.');
  return { repo, id, ref: registerRepo(repo) };
}

test('overview: every registered repository\'s nights, newest first, with counts and read marks', async () => {
  const a = closedNight('alpha');
  const b = gitRepo('beta');
  start(b, plan(TASKS), session('live', process.pid), new Date('2026-09-27T01:00:00'));
  const app = createApp({ version: 'test' });
  const o = (await (await app.request('/api/overview')).json()) as Overview;
  const mine = o.nights.filter((n) => n.repo === a.ref.id || n.repo === registerRepo(b).id);
  assert.deepEqual(mine.map((n) => [n.status, n.running]), [['open', true], ['complete', false]]);
  const night = mine[1];
  assert.deepEqual([night.counts.done, night.counts.blocked, night.questions_open, night.feedback_unsent, night.read], [1, 1, 1, 1, false]);
  assert.equal((await app.request(`/api/nights/${a.ref.id}/${a.id}/read`, { method: 'POST' })).status, 200);
  const again = (await (await app.request('/api/overview')).json()) as Overview;
  assert.equal(again.nights.find((n) => n.repo === a.ref.id && n.id === a.id)?.read, true);
});

test('morning inbox: a night stays while unread or needing the developer, and leaves once read and handed over', async () => {
  const { ref, id, repo } = closedNight();
  const app = createApp({ version: 'test' });
  const summary = async () => {
    const o = (await (await app.request('/api/overview')).json()) as Overview;
    const n = o.nights.find((x) => x.repo === ref.id && x.id === id);
    assert.ok(n);
    return n;
  };
  let n = await summary();
  assert.deepEqual([n.hand_over, n.questions_open, ownerSide(n), inMorning(n)], [true, 1, 'needs_you', true]);
  await app.request(`/api/nights/${ref.id}/${id}/read`, { method: 'POST' });
  assert.equal(inMorning(await summary()), true, 'read, but the blocked task is not handed over');

  // Handed over with the question unanswered: still waiting for the developer's answer.
  await app.request(`/api/nights/${ref.id}/${id}/follow-up`, { method: 'POST' });
  n = await summary();
  assert.deepEqual([n.hand_over, n.follow_up, n.questions_open, inMorning(n)], [false, true, 1, true]);
  await app.request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: 'Q1', answer: 'b', baseHash: loadNight(repo, id).hash }) });
  n = await summary();
  assert.deepEqual([ownerSide(n), inMorning(n)], ['handed_over', false]);

  // A night with every task done and no question has nothing to hand over: reading it is enough.
  const other = gitRepo('clean');
  const clean = start(other, plan(TASKS.slice(0, 1)), session('s2', DEAD_PID), NOW).night.night;
  record(other, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'command', command: 'npm test', exit_code: 0, excerpt: 'ok' }] });
  close(other, 'All done.');
  const otherRef = registerRepo(other);
  const cleanSummary = async () => {
    const o = (await (await app.request('/api/overview')).json()) as Overview;
    const found = o.nights.find((x) => x.repo === otherRef.id && x.id === clean);
    assert.ok(found);
    return found;
  };
  n = await cleanSummary();
  assert.deepEqual([n.hand_over, ownerSide(n), inMorning(n)], [false, 'nothing', true]);
  await app.request(`/api/nights/${otherRef.id}/${clean}/read`, { method: 'POST' });
  assert.equal(inMorning(await cleanSummary()), false);
});

test('morning inbox: a night stopped early with work left needs a hand-over; a read mark from while it ran does not count', async () => {
  const repo = gitRepo('stopped');
  const id = start(repo, plan(TASKS.slice(0, 2)), session('mine', process.pid), NOW).night.night;
  record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'command', command: 'npm test', exit_code: 0, excerpt: 'ok' }] });
  const ref = registerRepo(repo);
  const app = createApp({ version: 'test' });
  const summary = async () => {
    const o = (await (await app.request('/api/overview')).json()) as Overview;
    const n = o.nights.find((x) => x.repo === ref.id && x.id === id);
    assert.ok(n);
    return n;
  };
  // Opened while it runs: read, and nothing to hand over yet.
  markRead(ref.id, id, new Date('2026-09-26T23:30:00'));
  let n = await summary();
  assert.deepEqual([n.running, n.read, n.hand_over, inMorning(n)], [true, true, false, false]);

  onSessionEnd(repo, 'mine', null, new Date('2026-09-27T02:00:00'));
  const night = loadNight(repo, id).night;
  assert.equal(night.status, 'interrupted');
  // The Viewer's rule and the follow-up builder agree on whether there is anything to hand over.
  assert.equal(needsHandOver(night, null), buildFollowUp(night).items.length > 0);

  n = await summary();
  assert.deepEqual([n.read, n.questions_open, n.hand_over, ownerSide(n), inMorning(n)], [false, 0, true, 'needs_you', true]);
  markRead(ref.id, id, new Date('2026-09-27T08:00:00'));
  assert.equal(inMorning(await summary()), true, 'read, but T2 is not handed over');
  assert.equal((await app.request(`/api/nights/${ref.id}/${id}/follow-up`, { method: 'POST' })).status, 200);
  n = await summary();
  assert.deepEqual([n.hand_over, ownerSide(n), inMorning(n)], [false, 'handed_over', false]);
  // A follow-up file that no longer reads still blocks a second one, so it is not asked for again.
  fs.writeFileSync(path.join(repo, '.night-shift', 'follow-ups', `${id}.json`), '{ broken');
  n = await summary();
  assert.deepEqual([n.follow_up, n.hand_over, inMorning(n)], [true, false, false]);
});

test('answers: round trip, a stale write is refused, an unknown option is refused', async () => {
  const { ref, id, repo } = closedNight();
  const app = createApp({ version: 'test' });
  const d = (await (await app.request(`/api/nights/${ref.id}/${id}`)).json()) as NightDetail;
  const post = (b: object) => app.request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify(b) });
  assert.equal((await post({ question: 'Q1', answer: 'z', baseHash: d.hash })).status, 400);
  const ok = await post({ question: 'Q1', answer: 'b', note: 'we own the domain', baseHash: d.hash });
  assert.equal(ok.status, 200);
  const q = loadNight(repo, id).night.questions[0];
  assert.deepEqual([q.answer, q.note], ['b', 'we own the domain']);
  assert.equal((await post({ question: 'Q1', answer: 'a', baseHash: d.hash })).status, 409);
});

test('follow-up: created once from a closed night', async () => {
  const { ref, id, repo } = closedNight();
  const app = createApp({ version: 'test' });
  const res = await app.request(`/api/nights/${ref.id}/${id}/follow-up`, { method: 'POST' });
  assert.equal(res.status, 200);
  const d = (await res.json()) as NightDetail;
  assert.deepEqual(d.follow_up?.items.map((i) => [i.kind, i.task]), [['waiting', 'T2']]);
  assert.ok(fs.existsSync(path.join(repo, '.night-shift', 'follow-ups', `${id}.json`)));
  assert.equal((await app.request(`/api/nights/${ref.id}/${id}/follow-up`, { method: 'POST' })).status, 409);

  // An answer given after the follow-up exists follows into its open item.
  const answer = async (a: string | null, note = '') =>
    app.request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: 'Q1', answer: a, note, baseHash: loadNight(repo, id).hash }) });
  assert.equal((await answer('b', 'We own it')).status, 200);
  const item = () => readFollowUp(repo, id).items[0];
  assert.deepEqual([item().kind, item().decision, item().decision_label, item().owner_note], ['decision', 'b', 'Own domain', 'We own it']);
  // Once an agent has worked on the item, the answer can no longer change, and nothing is written.
  resolveItem(repo, `${id}/A1`, 'done', 'day', undefined);
  const before = fs.readFileSync(path.join(repo, '.night-shift', 'nights', id, 'night.json'), 'utf8');
  const refused = await answer('a');
  assert.equal(refused.status, 409);
  assert.match(((await refused.json()) as { error: string }).error, /worked on by day/);
  assert.equal(fs.readFileSync(path.join(repo, '.night-shift', 'nights', id, 'night.json'), 'utf8'), before);
});

test('answers after the follow-up: a running night on the item blocks a change; a settled waiting question is no longer open', async () => {
  const { ref, id, repo } = closedNight();
  const app = createApp({ version: 'test' });
  await app.request(`/api/nights/${ref.id}/${id}/follow-up`, { method: 'POST' });
  const answer = (a: string) =>
    app.request(`/api/nights/${ref.id}/${id}/answer`, { method: 'POST', headers: json, body: JSON.stringify({ question: 'Q1', answer: a, baseHash: loadNight(repo, id).hash }) });
  // A night took the waiting item on and is still running: the answer must wait for it.
  const live = start(repo, plan([{ ...TASKS[1], follow_up: `${id}/A1` }]), session('live', process.pid), new Date('2026-09-27T23:00:00'));
  assert.match(live.messages.join('\n'), /T2 follows 2026-09-26-a\/A1: no answer yet; ask again/);
  const busy = await answer('b');
  assert.equal(busy.status, 409);
  assert.match(((await busy.json()) as { error: string }).error, /working on this right now/);
  assert.equal(loadNight(repo, id).night.questions[0].answer, null);
  // That night settles it. The old copy of the question is no longer open, and an answer there,
  // which would reach no agent, is refused with the reason.
  record(repo, { task: 'T2', outcome: 'done', checks: [true], evidence: [{ type: 'command', command: 'npm test', exit_code: 0, excerpt: 'ok' }] });
  close(repo, 'Login fixed.');
  const overview = (await (await app.request('/api/overview')).json()) as Overview;
  assert.equal(overview.nights.find((n) => n.repo === ref.id && n.id === id)?.questions_open, 0);
  const late = await answer('b');
  assert.equal(late.status, 409);
  assert.match(((await late.json()) as { error: string }).error, /handed over unanswered and it was settled in night/);
  assert.equal(loadNight(repo, id).night.questions[0].answer, null);
});

test('feedback without gh: a pre-filled issue link, and the entry is marked sent', async () => {
  const { ref, id, repo } = closedNight();
  const app = createApp({ version: 'test' });
  const res = await app.request(`/api/nights/${ref.id}/${id}/feedback/send`, { method: 'POST', headers: json, body: JSON.stringify({ ids: ['F1'], via: 'link' }) });
  assert.equal(res.status, 200);
  const body = (await res.json()) as { links: { id: string; url: string }[] };
  const url = new URL(body.links[0].url);
  assert.equal(url.pathname, '/jimzord12/night-shift/issues/new');
  assert.equal(url.searchParams.get('title'), '[missing-block] Compare PDFs');
  assert.equal(url.searchParams.get('labels'), 'proposal');
  // The body: the agent's words under a heading, then the facts as a list; never the repository's name.
  const issue = url.searchParams.get('body') ?? '';
  assert.match(issue, /^## What the agent ran into\n\nNeeded it\.\n\n## Details\n/);
  assert.match(issue, /^- \*\*Kind:\*\* `missing-block`, a proof or note the agent needed has no evidence block$/m);
  assert.match(issue, /^- \*\*Night:\*\* `2026-09-26-a`$/m);
  assert.doesNotMatch(issue, new RegExp(ref.name));
  assert.equal(loadNight(repo, id).night.feedback[0].sent?.via, 'link');
  assert.equal((await app.request(`/api/nights/${ref.id}/${id}/feedback/send`, { method: 'POST', headers: json, body: JSON.stringify({ ids: ['F1'], via: 'link' }) })).status, 400);
});

test('evidence is served from the night\'s evidence folder only, with the media rules', async () => {
  const { ref, id, repo } = closedNight();
  evidenceFile(repo, id, 'x.html', '<script>alert(1)</script>');
  evidenceFile(repo, id, 'x.js', 'alert(1)');
  evidenceFile(repo, id, 'clip.mp4', 'not really a video');
  const app = createApp({ version: 'test' });
  const get = (p: string) => app.request(`/api/files/${ref.id}/${id}/${p}`);
  const svg = await get('evidence/invoice.svg');
  assert.equal(svg.headers.get('content-type'), 'image/svg+xml');
  assert.equal(svg.headers.get('content-security-policy'), 'sandbox');
  const html = await get('evidence/x.html');
  assert.equal(html.headers.get('content-security-policy'), 'sandbox allow-scripts');
  const js = await get('evidence/x.js');
  assert.equal(js.headers.get('content-disposition'), 'attachment');
  assert.equal((await get('evidence/clip.mp4')).headers.get('content-type'), 'video/mp4');
  assert.equal((await get('night.json')).status, 404);
  assert.equal((await get('evidence/..%2Fnight.json')).status, 404);
  assert.equal((await get('%E0%A4%A')).status, 404);
  assert.equal((await app.request(`/api/files/nobody/${id}/evidence/invoice.svg`)).status, 404);
});

test('issue text: an open code block is closed; a long entry is cut to fit a GitHub link', () => {
  const ctx = { repo: 'shop', night: '2026-09-26-a', version: 'test' };
  const f = { id: 'F1', kind: 'tool-bug', title: 'Crash', tags: [], body: 'It printed:\n```\nTypeError', sent: null };
  assert.match(issueBody(f, ctx), /TypeError\n```\n\n## Details/);
  const long = newIssueUrl({ ...f, body: 'Ω'.repeat(4000) }, ctx);
  assert.ok(long.length <= 8000, `${long.length} characters`);
  assert.match(decodeURIComponent(long.replace(/\+/g, ' ')), /Cut to fit a GitHub link; the full text is in the night file \(2026-09-26-a\)/);
});
test('a foreign Host is refused when the port is known', async () => {
  const app = createApp({ version: 'test', port: 4747 });
  assert.equal((await app.request('http://evil.example/api/overview')).status, 403);
  assert.equal((await app.request('http://127.0.0.1:4747/api/overview')).status, 200);
  assert.equal((await app.request('http://localhost:4747/api/nope')).status, 404);
});
