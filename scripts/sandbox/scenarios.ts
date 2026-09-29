// The sandbox's named scenarios (TASK-49.3): each builds real repositories with nights in them
// through the tool's own code (start, record, ask, decide, close, the Viewer's API for a morning),
// so what the Viewer shows is what a real night would leave. The sandbox, the UI tests and reviewer
// briefs build from here; NIGHT_SHIFT_ROOT must already point at a throwaway install folder.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ask, close, decide, feedback, record, recover, start } from '../../src/night.ts';
import { openItems } from '../../src/followup.ts';
import { createApp } from '../../src/server.ts';
import { evidenceDir, readNight, registerRepo } from '../../src/store.ts';
import { PLAN_SCHEMA } from '../../src/types.ts';
import type { RepoRef, Session } from '../../src/types.ts';

const MEDIA = path.join(import.meta.dirname, 'media');

// An odd number is never a Windows process id, and far above the usual Linux range: a session
// that has ended.
const ENDED: Session = { harness: 'claude-code', id: 'sandbox-ended', pid: 999_999, transcript: null };
// No process to check: a night counts as running for a day after its file last changed.
const RUNNING: Session = { harness: 'claude-code', id: 'sandbox-running', pid: null, transcript: null };

export interface Built {
  repos: RepoRef[];
  // Viewer paths worth opening first, for example "#/night/<repo id>/<night id>".
  open: string[];
}

export interface Scenario {
  name: string;
  about: string;
  build(base: string): Built | Promise<Built>;
}

function git(repo: string, ...args: string[]): void {
  const r = spawnSync('git', args, { cwd: repo, encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
}

// A small git repository with one commit, registered with the sandbox's install folder.
function repo(base: string, name: string): string {
  const dir = path.join(base, name);
  fs.mkdirSync(dir, { recursive: true });
  const real = fs.realpathSync.native(dir);
  git(real, 'init', '-q', '-b', 'main');
  git(real, 'config', 'user.email', 'sandbox@example.test');
  git(real, 'config', 'user.name', 'Sandbox');
  git(real, 'config', 'commit.gpgsign', 'false');
  fs.writeFileSync(path.join(real, 'README.md'), `# ${name}\n`);
  git(real, 'add', '.');
  git(real, 'commit', '-q', '-m', 'first');
  return real;
}

// A night's clock: `days` before today at the given hour.
function at(days: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const plan = (tasks: { id: string; title: string; done_when: string[]; follow_up?: string | string[] }[], extra: object = {}) =>
  JSON.stringify({ schema: PLAN_SCHEMA, tasks: tasks.map((t) => ({ source: 'developer prompt', ...t })), ...extra });

// Media files copied into a night's evidence folder, named as the blocks cite them.
function media(repoDir: string, night: string, ...names: string[]): void {
  const dir = evidenceDir(repoDir, night);
  fs.mkdirSync(dir, { recursive: true });
  for (const n of names) fs.copyFileSync(path.join(MEDIA, n), path.join(dir, n));
}

const TODO_TASKS = [
  { id: 'T1', title: 'Export a list as a CSV file', done_when: ['The list page offers Export CSV', 'The file opens in a spreadsheet'] },
  { id: 'T2', title: 'Give tasks a priority', done_when: ['Each task shows low, normal or high', 'The priority is editable'] },
  { id: 'T3', title: 'Archive completed tasks instead of deleting them', done_when: ['Clear completed archives', 'Archived tasks can be seen'] },
  { id: 'T4', title: 'Email a daily summary of tasks due', done_when: ['Each user gets one email a day'] },
  { id: 'T5', title: 'Update the README setup section', done_when: ['The steps match how the app runs'] },
  { id: 'T6', title: 'Upgrade the date library', done_when: ['Build passes', 'All tests pass'] },
];

// A closed night with every outcome, every kind of evidence, questions of every kind, agent
// decisions and feedback: the Night Report and the deck in full. Returns the night id.
function fullNight(dir: string, days = 1): string {
  const id = start(dir, plan(TODO_TASKS), ENDED, at(days, 23, 10)).night.night;
  media(dir, id, 'clear-completed-dialog.png', 'clear-completed-after.png', 'dashboard-counts.png', 'archive-flow.webm', 'email-design.pdf');
  decide(dir, { task: 'T1', decision: 'CSV columns: title, due date, done, priority; file named after the list.', why: 'The prompt named no columns; these are the ones the list page shows.' });
  record(dir, {
    task: 'T1',
    outcome: 'done',
    checks: [true, true],
    evidence: [
      { type: 'command', command: 'pnpm test -- export', exit_code: 0, excerpt: '12 passed (12)\nexport.test.ts  ✓ writes a header row\nexport.test.ts  ✓ quotes commas' },
      { type: 'image', path: 'evidence/dashboard-counts.png', caption: 'The list page with Export CSV' },
    ],
  });
  decide(dir, { task: 'T2', decision: 'New tasks default to normal priority, shown as a small badge.', why: 'The prompt did not say a default; normal changes nothing for existing tasks.' });
  record(dir, {
    task: 'T2',
    outcome: 'partial',
    checks: [true, { met: false, note: 'editing works on desktop; the phone layout still hides the picker' }],
    evidence: [{ type: 'compare', before: 'evidence/clear-completed-dialog.png', after: 'evidence/clear-completed-after.png', caption: 'Before and after: the priority badge' }],
  });
  fs.writeFileSync(path.join(dir, 'archive-notes.md'), '# Archive\n\nKeep for 30 days, or keep for ever?\n');
  const q1 = ask(dir, {
    task: 'T3',
    ask: 'Can archived tasks be restored, and are they ever deleted for good?',
    why: 'It decides what happens to users’ data and is costly to undo.',
    options: [
      { label: 'Restore any time, keep for ever', detail: 'Simplest; the table grows.' },
      { label: 'Restore within 30 days, then delete', detail: 'Needs a nightly clean-up job.' },
    ],
    recommended: 'b',
    files: [{ path: 'archive-notes.md', caption: 'What I found' }],
  }).question.id;
  record(dir, { task: 'T3', outcome: 'blocked', checks: [true, false], blocked_by: q1, evidence: [{ type: 'video', path: 'evidence/archive-flow.webm', caption: 'Clear completed now archives' }] });
  record(dir, {
    task: 'T4',
    outcome: 'failed',
    checks: [false],
    why: 'There is no scheduler in this app; a daily job needs one.',
    evidence: [
      { type: 'pdf', path: 'evidence/email-design.pdf', caption: 'The email I would send' },
      { type: 'link', url: 'https://example.com/scheduler-options', label: 'Scheduler options' },
    ],
  });
  record(dir, { task: 'T5', outcome: 'done', checks: [true], evidence: [{ type: 'command', command: 'git diff --stat README.md', exit_code: 0, excerpt: ' README.md | 14 +++++++-------' }, { type: 'note', text: 'The setup section now lists the local database and its port.' }] });
  ask(dir, {
    task: 'T6',
    ask: 'Which badge colour for high priority?',
    options: [
      { label: 'Red', image: 'evidence/clear-completed-dialog.png' },
      { label: 'Amber', image: 'evidence/clear-completed-after.png' },
    ],
    recommended: 'b',
  });
  record(dir, { task: 'T6', outcome: 'skipped', checks: [false, false], reason: 'Waits for the priority work to settle.' });
  decide(dir, { task: null, decision: 'Ran the whole test suite once at the end instead of after every task.', why: 'It takes eleven minutes; the targeted tests ran after each task.' });
  feedback(dir, { kind: 'confusing-rule', title: 'record wants one check per done_when line', tags: ['record'], body: 'A task with a long done_when list needs a long checks array; easy to miscount.' });
  close(dir, 'Export and the README shipped; priority is half done; the archive waits for your answer.', at(days - 1, 6, 40));
  recover(dir);
  return id;
}

function ref(dir: string): RepoRef {
  return registerRepo(dir);
}

// The Viewer's own API, in process: a morning answered and saved the way the developer does it.
async function morning(r: RepoRef, night: string, answers: Record<string, { answer: string; note?: string }>, reviews: Record<string, { review: 'ok' | 'disagree'; note?: string }>, save: boolean): Promise<void> {
  const app = createApp({ version: 'sandbox' });
  const post = async (what: string, body: object) => {
    const hash = readNight(r.path, night).hash;
    const res = await app.request(`/api/nights/${r.id}/${night}/${what}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, baseHash: hash }) });
    if (!res.ok) throw new Error(`${what}: ${res.status} ${await res.text()}`);
  };
  for (const [question, a] of Object.entries(answers)) await post('answer', { question, ...a });
  for (const [decision, d] of Object.entries(reviews)) await post('decision', { decision, ...d });
  if (save) await post('follow-up', {});
}

// A full night two days ago, its morning answered, reviewed and saved.
async function savedMorning(base: string): Promise<{ dir: string; r: RepoRef; night: string }> {
  const dir = repo(base, 'todo');
  const night = fullNight(dir, 2);
  const r = ref(dir);
  const n = readNight(dir, night).night!;
  const [q1, q2] = n.questions.map((q) => q.id);
  const [d1, d2] = (n.agent_decisions ?? []).map((d) => d.id);
  await morning(r, night, { [q1]: { answer: 'b' }, [q2]: { answer: 'discuss', note: 'Neither: can we match the brand colours?' } }, { [d1]: { review: 'ok' }, [d2]: { review: 'disagree', note: 'Default to low, not normal.' } }, true);
  return { dir, r, night };
}

export const SCENARIOS: Scenario[] = [
  {
    name: 'empty',
    about: 'one repository with Night Shift and no nights yet: the empty Inbox',
    build(base) {
      return { repos: [ref(repo(base, 'todo'))], open: ['#/'] };
    },
  },
  {
    name: 'morning',
    about: 'one closed night to read and answer: every outcome, every evidence block, two questions (one with a file, one with pictures), three agent decisions, feedback',
    build(base) {
      const dir = repo(base, 'todo');
      const id = fullNight(dir);
      const r = ref(dir);
      return { repos: [r], open: ['#/', `#/night/${r.id}/${id}`] };
    },
  },
  {
    name: 'two-nights',
    about: 'two repositories, each with a closed night waiting: Start my morning walks both, the save screen lists two nights',
    build(base) {
      const a = repo(base, 'todo');
      fullNight(a);
      const b = repo(base, 'shop');
      start(b, plan([{ id: 'T1', title: 'Fix the login redirect loop', done_when: ['Login lands on the account page'] }, { id: 'T2', title: 'Add PDF invoices', done_when: ['Checkout offers an invoice'] }]), ENDED, at(1, 22, 30));
      const q = ask(b, { task: 'T1', ask: 'Which login fix?', why: 'Both work; one needs a DNS change.', options: [{ label: 'Relax the cookie' }, { label: 'Own-domain login' }], recommended: 'a' }).question.id;
      record(b, { task: 'T1', outcome: 'blocked', checks: [false], blocked_by: q });
      decide(b, { task: 'T2', decision: 'Invoices as PDF, A4, one page per order.', why: 'The prompt did not say a size.' });
      record(b, { task: 'T2', outcome: 'done', checks: [true], evidence: [{ type: 'command', command: 'npm test', exit_code: 0, excerpt: 'ok 41' }] });
      close(b, 'Invoices shipped; login waits for you.', at(0, 5, 50));
      recover(b);
      return { repos: [ref(a), ref(b)], open: ['#/'] };
    },
  },
  {
    name: 'running',
    about: 'a night still running: two tasks recorded, the rest to go (Watch it run)',
    build(base) {
      const dir = repo(base, 'todo');
      const id = start(dir, plan(TODO_TASKS.slice(0, 4)), RUNNING, new Date(Date.now() - 90 * 60_000)).night.night;
      media(dir, id, 'dashboard-counts.png');
      record(dir, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'command', command: 'pnpm test', exit_code: 0, excerpt: '12 passed' }] });
      decide(dir, { task: 'T2', decision: 'Priority defaults to normal.', why: 'Changes nothing for existing tasks.' });
      record(dir, { task: 'T2', outcome: 'done', checks: [true, true], evidence: [{ type: 'image', path: 'evidence/dashboard-counts.png', caption: 'Priorities on the list' }] });
      const r = ref(dir);
      return { repos: [r], open: ['#/', `#/night/${r.id}/${id}`] };
    },
  },
  {
    name: 'interrupted',
    about: 'a night whose session ended before it closed: stopped early, tasks never started',
    build(base) {
      const dir = repo(base, 'todo');
      const id = start(dir, plan(TODO_TASKS.slice(0, 5)), ENDED, at(1, 23, 0)).night.night;
      record(dir, { task: 'T1', outcome: 'done', checks: [true, true], evidence: [{ type: 'command', command: 'pnpm test -- export', exit_code: 0, excerpt: '12 passed' }] });
      const q = ask(dir, { task: 'T2', ask: 'Priority as a word or a colour?', options: [{ label: 'A word' }, { label: 'A colour' }], recommended: 'a' }).question.id;
      record(dir, { task: 'T2', outcome: 'blocked', checks: [false, false], blocked_by: q });
      recover(dir);
      const r = ref(dir);
      return { repos: [r], open: ['#/', `#/night/${r.id}/${id}`] };
    },
  },
  {
    name: 'follow-up',
    about: 'a morning answered and saved (a decision kept, one disagreed, an answer, a let’s discuss): what the Next night tab will hand over',
    async build(base) {
      const { r } = await savedMorning(base);
      return { repos: [r], open: ['#/next', '#/'] };
    },
  },
  {
    name: 'second-night',
    about: 'the saved morning above, then a second closed night that took the disagreed decision and the answer and skipped the rest: follow-up items resolved by a night',
    async build(base) {
      const { dir, r } = await savedMorning(base);
      const open = openItems(dir).filter((o) => o.item.kind !== 'discuss');
      const take = open.filter((o) => o.item.kind === 'disagreed' || o.item.kind === 'decision').slice(0, 2);
      const skip = open.filter((o) => !take.includes(o));
      const id = start(
        dir,
        plan(
          take.map((o, i) => ({ id: `T${i + 1}`, title: `Follow up: ${o.item.title}`, done_when: o.item.done_when.length ? o.item.done_when : ['Done as the developer asked'], follow_up: o.ref })),
          { skipped_follow_ups: skip.map((o) => ({ follow_up: o.ref, reason: 'Left for after the archive work, as the plan says.' })) },
        ),
        ENDED,
        at(1, 23, 5),
      ).night.night;
      for (const [i, o] of take.entries()) record(dir, { task: `T${i + 1}`, outcome: 'done', checks: (o.item.done_when.length ? o.item.done_when : ['x']).map(() => true), evidence: [{ type: 'command', command: 'pnpm test', exit_code: 0, excerpt: '44 passed' }, { type: 'note', text: `Done your way: ${o.item.owner_note ?? o.item.decision_label ?? o.item.title}.` }] });
      close(dir, 'Redid the priority default your way and carried out the archive answer.', at(0, 4, 30));
      recover(dir);
      return { repos: [r], open: ['#/', `#/night/${r.id}/${id}`, '#/next'] };
    },
  },
  {
    name: 'broken',
    about: 'a night file that cannot be read (a stray character): Cannot be read, and History lists the problem',
    build(base) {
      const dir = repo(base, 'todo');
      const id = fullNight(dir);
      const file = path.join(dir, '.night-shift', 'nights', id, 'night.json');
      fs.writeFileSync(file, `${fs.readFileSync(file, 'utf8')}x`);
      return { repos: [ref(dir)], open: ['#/', '#/history'] };
    },
  },
];

export const scenario = (name: string): Scenario | undefined => SCENARIOS.find((s) => s.name === name);

// Every scenario's repositories side by side in one install folder: a whole Viewer to walk.
export async function buildAll(base: string): Promise<Built> {
  const all: Built = { repos: [], open: ['#/'] };
  for (const s of SCENARIOS) {
    const b = await s.build(path.join(base, s.name));
    all.repos.push(...b.repos);
  }
  return all;
}
