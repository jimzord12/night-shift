import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DEAD_PID, TASKS, evidenceFile, git, gitRepo, plan, session } from './helpers.ts';
import { ask, close, copyHistory, feedback, onSessionEnd, record, recover, start, status } from '../src/night.ts';
import { createFollowUp, openItems, resolveItem } from '../src/followup.ts';
import { StoreError, forgetRepo, listRepos, loadNight, markRead, nightFile, readNight, readViewerState, registerRepo, saveNight } from '../src/store.ts';
import { commitPath, ensureGitignore } from '../src/repo.ts';

const NOW = new Date('2026-09-26T23:10:00');

function refused(fn: () => unknown, pattern: RegExp) {
  assert.throws(fn, (e: unknown) => e instanceof StoreError && pattern.test(e.message));
}

test('a whole night: plan, records, a question, feedback, close, history committed', () => {
  const repo = gitRepo();
  const s = start(repo, plan(TASKS), session(), NOW);
  const id = s.night.night;
  assert.equal(id, '2026-09-26-a');
  assert.match(s.messages.join('\n'), /Next: work on T1/);
  assert.ok(listRepos().some((r) => path.resolve(r.path) === path.resolve(repo)));
  assert.match(fs.readFileSync(path.join(repo, '.gitignore'), 'utf8'), /^\.night-shift\/\*$/m);

  const shot = evidenceFile(repo, id, 'invoice.svg');
  const r1 = record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'image', path: shot, caption: 'Invoice' }, { type: 'command', command: 'npm test', exit_code: 0, excerpt: '12 passed' }] });
  assert.match(r1.message, /Recorded T1 as done \(2\/2 checks met\), 2 evidence block\(s\)\. Next: work on T2/);

  const q = ask(repo, { task: 'T2', ask: 'Which fix for the login loop?', options: [{ label: 'Relax the cookie' }, { label: 'Own-domain login' }], recommended: 'a' });
  assert.equal(q.question.id, 'Q1');
  record(repo, { task: 'T2', outcome: 'blocked', checks: [false], blocked_by: 'Q1' });
  record(repo, { unplanned: true, title: 'Fix crash on an empty cart name', outcome: 'done', why: 'Found while testing T1', evidence: [{ type: 'command', command: 'npm test', exit_code: 0, excerpt: 'ok' }] });
  feedback(repo, { kind: 'missing-block', title: 'Compare two PDFs', body: 'An image pair lost the text.' });

  const c = close(repo, 'Invoices shipped. Login blocked on your decision.', new Date('2026-09-27T04:22:00'));
  assert.match(c.message, /1 not started/);
  const n = loadNight(repo, id).night;
  assert.equal(n.status, 'complete');
  assert.deepEqual(n.tasks.map((t) => [t.id, t.outcome]), [['T1', 'done'], ['T2', 'blocked'], ['T3', 'not_started'], ['U1', 'done']]);
  assert.equal(n.metrics, null);
  // The history copy is committed, and only it.
  assert.match(git(repo, 'log', '-1', '--name-only', '--format=%s'), /night-shift: history of 2026-09-26-a\s+\.night-shift\/history\/2026-09-26-a\.json/);
  assert.equal(git(repo, 'status', '--porcelain', '--', '.night-shift/history'), '');
  // A repository's own formatter may rewrite the committed copy; that is not a change to copy back.
  const copy = path.join(repo, '.night-shift', 'history', `${id}.json`);
  fs.writeFileSync(copy, JSON.stringify(JSON.parse(fs.readFileSync(copy, 'utf8'))));
  git(repo, 'commit', '-q', '-am', 'format');
  assert.equal(copyHistory(repo), false);
  assert.equal(git(repo, 'status', '--porcelain', '--', '.night-shift/history'), '');
});

test('outcome rules are enforced and nothing is written when a record is refused', () => {
  const repo = gitRepo();
  const { night } = start(repo, plan(TASKS), session(), NOW);
  const before = fs.readFileSync(nightFile(repo, night.night), 'utf8');
  refused(() => record(repo, { task: 'T1', outcome: 'done', checks: [true, false], evidence: [{ type: 'link', url: 'https://example.com' }] }), /done needs every check met/);
  refused(() => record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'note', text: 'trust me' }] }), /evidence block that is not a note/);
  refused(() => record(repo, { task: 'T1', outcome: 'done', checks: [true] }), /2 done_when line/);
  refused(() => record(repo, { task: 'T1', outcome: 'partial', checks: [true, false] }), /unmet check needs a note/);
  refused(() => record(repo, { task: 'T2', outcome: 'blocked', checks: [false] }), /blocked needs blocked_by/);
  refused(() => record(repo, { task: 'T2', outcome: 'blocked', checks: [false], blocked_by: 'Q9' }), /Q9 is not a question/);
  refused(() => record(repo, { task: 'T3', outcome: 'failed', checks: [false, false] }), /failed needs why/);
  refused(() => record(repo, { task: 'T3', outcome: 'skipped', checks: [false, false] }), /skipped needs a reason/);
  refused(() => record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'image', path: 'evidence/missing.png' }] }), /does not exist/);
  refused(() => record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'image', path: '../../../README.md' }] }), /not inside the night's evidence/);
  refused(() => record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'table', rows: [] }] }), /unknown block type "table"/);
  refused(() => record(repo, { task: 'T9', outcome: 'done' }), /no task T9/);
  // Shapes the schema rejects are refused too, before any rule runs, so the file never goes bad.
  refused(() => record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'link', url: 'https://example.com', caption: 'x' }] }), /not recorded: .*additional properties \("caption"\)/);
  refused(() => record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'command', command: 'npm test', exit_code: 0 }] }), /not recorded: .*excerpt/);
  refused(() => record(repo, { task: 'T3', outcome: 'failed', checks: [false, false], why: 'x'.repeat(5000) }), /not recorded: \/tasks\/2\/why/);
  refused(() => ask(repo, { ask: 'Which?', options: [{ id: 'opt1', label: 'One' }, { id: 'opt2', label: 'Two' }], recommended: 'opt1' }), /question was not added/);
  refused(() => ask(repo, { ask: 'Which?', options: 'abcdefg'.split('').map((l) => ({ label: l })), recommended: 'a' }), /question was not added/);
  refused(() => feedback(repo, { title: 'x'.repeat(5000), body: 'too long a title' }), /feedback was not logged/);
  refused(() => close(repo, 'x'.repeat(5000)), /night was not closed: \/summary/);
  // Malformed input is a refusal that names what to send, never a crash.
  refused(() => record(repo, null as never), /send one JSON object/);
  refused(() => record(repo, { unplanned: true, title: 5 as never, outcome: 'done' }), /unplanned task needs a title/);
  refused(() => ask(repo, { ask: 5 as never, options: [{ label: 'a' }, { label: 'b' }], recommended: 'a' }), /needs "ask"/);
  refused(() => ask(repo, { ask: 'Which?', options: [null as never, { label: 'b' }], recommended: 'a' }), /each option is an object/);
  assert.equal(fs.readFileSync(nightFile(repo, night.night), 'utf8'), before);
  // A task never reached may be recorded without checks.
  assert.equal(record(repo, { task: 'T3', outcome: 'not_started' }).task.checks.length, 0);
  // A path given from the repository root is accepted and stored relative to the night.
  evidenceFile(repo, night.night, 'a.svg');
  const r = record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'image', path: `.night-shift/nights/${night.night}/evidence/a.svg` }] });
  assert.deepEqual(r.task.evidence, [{ type: 'image', path: 'evidence/a.svg' }]);
  refused(() => close(repo, ''), /needs a summary/);
});

test('one night at a time: a running night refuses a second start; a dead one is recovered as interrupted', () => {
  const repo = gitRepo();
  start(repo, plan(TASKS), session('a', process.pid), NOW);
  refused(() => start(repo, plan(TASKS), session('a', process.pid), NOW), /already open in this session/);
  refused(() => start(repo, plan(TASKS), session('b', process.pid), NOW), /still running in another session/);
  refused(() => record(gitRepo(), { task: 'T1', outcome: 'done' }), /no open night/);

  const other = gitRepo();
  const first = start(other, plan(TASKS), session('gone', DEAD_PID), NOW).night.night;
  record(other, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'link', url: 'https://example.com/pr/1' }] });
  const second = start(other, plan(TASKS), session('new', process.pid), new Date('2026-09-27T23:00:00'));
  assert.match(second.messages.join('\n'), new RegExp(`Night ${first} had stopped without closing`));
  const n = loadNight(other, first).night;
  assert.equal(n.status, 'interrupted');
  assert.equal(n.summary, null);
  assert.deepEqual(n.tasks.map((t) => t.outcome), ['done', 'not_started', 'not_started']);
  assert.equal(second.night.night, '2026-09-27-a');
});

test('the session-end hook closes only its own session\'s night, then measures it', async () => {
  const { transcript } = await import('./helpers.ts');
  const repo = gitRepo();
  const log = transcript({ costState: true });
  const id = start(repo, plan(TASKS), session('mine', process.pid, log), NOW).night.night;
  assert.deepEqual(onSessionEnd(repo, 'someone-else', null), []);
  assert.equal(loadNight(repo, id).night.status, 'open');
  const done = onSessionEnd(repo, 'mine', log);
  assert.deepEqual(done, [`night ${id} closed as interrupted`, `night ${id} measured`]);
  const n = loadNight(repo, id).night;
  assert.equal(n.status, 'interrupted');
  assert.equal(n.metrics?.cost_usd, 18.4);
  assert.equal(n.metrics?.duration_min.total, 312);
  // A second session end changes nothing.
  assert.deepEqual(onSessionEnd(repo, 'mine', log), []);
});

test('recovery measures a closed night whose session has ended, and leaves a running one alone', async () => {
  const { transcript } = await import('./helpers.ts');
  const repo = gitRepo();
  const log = transcript();
  const id = start(repo, plan([TASKS[1]]), session('s', process.pid, log), NOW).night.night;
  record(repo, { task: 'T2', outcome: 'skipped', checks: [false], reason: 'Fixed yesterday' });
  close(repo, 'Nothing to do.');
  assert.deepEqual(recover(repo), []);
  assert.equal(loadNight(repo, id).night.metrics, null); // the session still runs
  const n = loadNight(repo, id).night;
  n.session = session('s', DEAD_PID, log);
  saveNight(repo, n);
  recover(repo);
  assert.equal(loadNight(repo, id).night.metrics?.harness_version, '2.1.3');
});

test('follow-ups: built from answers, the next plan must cover every open item, outcomes settle them', () => {
  const repo = gitRepo();
  const id = start(repo, plan(TASKS), session('a', DEAD_PID), NOW).night.night;
  ask(repo, { task: 'T2', ask: 'Which fix?', options: [{ label: 'Cookie' }, { label: 'Own domain' }], recommended: 'a' });
  ask(repo, { ask: 'Rename the shop?', options: [{ label: 'Yes' }, { label: 'No' }], recommended: 'b' });
  record(repo, { task: 'T1', outcome: 'partial', checks: [true, { met: false, note: 'screenshot missing' }] });
  record(repo, { task: 'T2', outcome: 'blocked', checks: [false], blocked_by: 'Q1' });
  record(repo, { task: 'T3', outcome: 'skipped', checks: [false, false], reason: 'Not wanted' });
  close(repo, 'Half done.');
  // The developer answers Q1 in the Viewer (only answer and note change) and leaves Q2 open.
  const n = loadNight(repo, id).night;
  n.questions[0].answer = 'b';
  n.questions[0].note = 'We own the domain already.';
  saveNight(repo, n);

  const f = createFollowUp(repo, loadNight(repo, id).night);
  assert.deepEqual(f.items.map((i) => [i.id, i.kind, i.task]), [['A1', 'unfinished', 'T1'], ['A2', 'decision', 'T2'], ['A3', 'waiting', null]]);
  assert.deepEqual(f.items[0].left, ['Screenshot attached: screenshot missing']);
  assert.equal(f.items[1].decision_label, 'Own domain');
  assert.equal(f.items[1].owner_note, 'We own the domain already.');
  refused(() => createFollowUp(repo, loadNight(repo, id).night), /already exists/);

  const later = new Date('2026-09-27T23:00:00');
  refused(() => start(repo, plan([{ ...TASKS[1], follow_up: `${id}/A2` }]), session('b'), later), /open follow-up items are not in the plan: .*A1.*A3/);
  const s2 = start(
    repo,
    plan([{ ...TASKS[0], follow_up: `${id}/A1` }, { ...TASKS[1], follow_up: `${id}/A2` }], { skipped_follow_ups: [{ follow_up: `${id}/A3`, reason: 'Asked again below' }] }),
    session('b'),
    later,
  );
  assert.match(s2.messages.join('\n'), /T2 follows 2026-09-26-a\/A2: the developer chose "Own domain" \(note: We own the domain already\.\)/);
  // The history of the first night, its answer and its follow-up are committed at this start.
  assert.match(git(repo, 'log', '-1', '--name-only', '--format=%s'), /update the history before 2026-09-27-a[\s\S]*follow-ups\/2026-09-26-a\.json/);
  evidenceFile(repo, s2.night.night, 'shot.svg');
  record(repo, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'image', path: 'evidence/shot.svg' }] });
  close(repo, 'Carried on.');
  // T2 was planned for A2 but never reached: A2 stays open with the developer's decision, and the
  // night's own follow-up does not repeat it.
  assert.deepEqual(openItems(repo).map((o) => o.ref), [`${id}/A2`]);
  const after = JSON.parse(fs.readFileSync(path.join(repo, '.night-shift', 'follow-ups', `${id}.json`), 'utf8'));
  assert.deepEqual(after.items.map((i: { status: string }) => i.status), ['done', 'open', 'skipped']);
  refused(() => createFollowUp(repo, loadNight(repo, s2.night.night).night), /nothing to follow up/);

  // A third night reaches it and fails: the item is carried, and the new follow-up keeps the decision.
  const s3 = start(repo, plan([{ ...TASKS[1], follow_up: `${id}/A2` }]), session('c'), new Date('2026-09-28T23:00:00'));
  record(repo, { task: 'T2', outcome: 'failed', checks: [false], why: 'Safari still loops' });
  close(repo, 'Tried the login fix.');
  const carried = JSON.parse(fs.readFileSync(path.join(repo, '.night-shift', 'follow-ups', `${id}.json`), 'utf8')).items[1];
  assert.equal(carried.status, 'carried');
  assert.equal(carried.resolved.reason, `T2 ended failed in ${s3.night.night}`);
  const f3 = createFollowUp(repo, loadNight(repo, s3.night.night).night);
  assert.deepEqual(
    { kind: f3.items[0].kind, label: f3.items[0].decision_label, note: f3.items[0].owner_note, left: f3.items[0].left },
    { kind: 'decision', label: 'Own domain', note: 'We own the domain already.', left: ['failed: Safari still loops', 'Login lands on the account page'] },
  );
  refused(() => resolveItem(repo, `${id}/A9`, 'done', 'day', undefined), /no item A9/);
});

test('one folder registers once, whichever spelling of its path is given', () => {
  const short = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-reg-'));
  const long = fs.realpathSync.native(short);
  const a = registerRepo(short);
  const b = registerRepo(long);
  assert.equal(a.id, b.id);
  if (process.platform === 'win32') assert.equal(registerRepo(long.toUpperCase()).id, a.id);
  assert.equal(listRepos().filter((r) => r.id === a.id).length, 1);
});

test('forget: a repository leaves the registry with its read marks; its files stay', () => {
  const keep = gitRepo('keep');
  const gone = gitRepo('gone');
  const other = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-forget-'));
  const k = registerRepo(keep);
  const g = registerRepo(gone);
  const o = registerRepo(other);
  markRead(g.id, '2026-09-26-a');
  markRead(k.id, '2026-09-26-a');
  assert.equal(forgetRepo(g.id).id, g.id);
  assert.equal(forgetRepo(other).id, o.id); // by path, in the spelling it was given
  const ids = listRepos().map((r) => r.id);
  assert.ok(ids.includes(k.id) && !ids.includes(g.id) && !ids.includes(o.id));
  assert.deepEqual(Object.keys(readViewerState().read).filter((key) => key.startsWith(`${g.id}/`) || key.startsWith(`${k.id}/`)), [`${k.id}/2026-09-26-a`]);
  assert.ok(fs.existsSync(path.join(gone, 'README.md')));
  refused(() => forgetRepo(g.id), /no registered repository "gone"; registered: /);
});
test('status reads the open night and says the next step', () => {
  const repo = gitRepo();
  assert.match(status(repo), /No night is open/);
  start(repo, plan(TASKS), session(), NOW);
  record(repo, { task: 'T1', outcome: 'failed', checks: [false, false], why: 'The PDF library crashes' });
  const s = status(repo);
  assert.match(s, /T1 failed/);
  assert.match(s, /Next: work on T2/);
});

test('a hand-edited night file shows its problems instead of breaking', () => {
  const repo = gitRepo();
  const id = start(repo, plan(TASKS), session(), NOW).night.night;
  const file = nightFile(repo, id);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.tasks[0].outcome = 'done';
  data.tasks[0].checks = [{ done_when: 'x', met: true }];
  fs.writeFileSync(file, `﻿${JSON.stringify(data)}`);
  const r = readNight(repo, id);
  assert.ok(r.night);
  assert.ok(r.problems.some((p) => /T1: has 1 checks for 2 done_when lines/.test(p)));
  fs.writeFileSync(file, '{ not json');
  assert.match(readNight(repo, id).problems[0], /not valid JSON/);
});

test('git: the ignore lines replace an old bare entry; a history commit never takes staged work', () => {
  const repo = gitRepo();
  fs.writeFileSync(path.join(repo, '.gitignore'), 'node_modules/\n.night-shift/\n');
  assert.equal(ensureGitignore(repo), true);
  assert.equal(fs.readFileSync(path.join(repo, '.gitignore'), 'utf8'), 'node_modules/\n\n# Night Shift: its working files stay local; the history of nights is committed.\n.night-shift/*\n!.night-shift/history/\n');
  assert.equal(ensureGitignore(repo), false);
  fs.writeFileSync(path.join(repo, 'work.txt'), 'the developer\'s work');
  git(repo, 'add', 'work.txt');
  fs.mkdirSync(path.join(repo, '.night-shift', 'history'), { recursive: true });
  fs.writeFileSync(path.join(repo, '.night-shift', 'history', 'x.json'), '{}');
  fs.writeFileSync(path.join(repo, '.night-shift', 'scratch.json'), '{}');
  assert.equal(commitPath(repo, '.night-shift/history', 'history').committed, true);
  assert.equal(git(repo, 'show', '--name-only', '--format=', 'HEAD').trim(), '.night-shift/history/x.json');
  assert.match(git(repo, 'status', '--porcelain'), /^A {2}work\.txt/m);
});
