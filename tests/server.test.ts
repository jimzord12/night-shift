import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DEAD_PID, TASKS, evidenceFile, gitRepo, plan, session } from './helpers.ts';
import { createApp } from '../src/server.ts';
import { ask, close, feedback, record, start } from '../src/night.ts';
import { loadNight, registerRepo } from '../src/store.ts';
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

test('a foreign Host is refused when the port is known', async () => {
  const app = createApp({ version: 'test', port: 4747 });
  assert.equal((await app.request('http://evil.example/api/overview')).status, 403);
  assert.equal((await app.request('http://127.0.0.1:4747/api/overview')).status, 200);
  assert.equal((await app.request('http://localhost:4747/api/nope')).status, 404);
});
