// The life of a night: start (the plan), record (one task at a time), ask, feedback, close;
// recovery of nights whose session died; the history copy that git keeps. The tool is the only
// writer of a night's status and metrics; the Viewer writes only answers, notes and `sent`.

import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import type { Block, Check, Feedback, Night, Option, PlanInput, Question, Session, Task } from './types.ts';
import { BLOCK_TYPES, OUTCOMES, countOutcomes } from './types.ts';
import {
  StoreError,
  evidenceDir,
  followUpFile,
  historyDir,
  listFollowUpIds,
  listNightIds,
  loadNight,
  localDate,
  localIso,
  nightDir,
  nightFile,
  nightProblems,
  planFile,
  readPlanInput,
  registerRepo,
  nightShapeProblems,
  parseJson,
  saveNight,
  taskProblems,
  writeJson,
} from './store.ts';
import { applyNightToFollowUps, checkRef, openItems } from './followup.ts';
import { findTranscript, measure } from './meter.ts';
import { commitPath, ensureGitignore } from './repo.ts';

const STALE_MS = 24 * 60 * 60 * 1000;

// ------------------------------------------------------------------ sessions

// The Claude Code session this command runs in, from the variables Claude Code gives its tools.
export function currentSession(env: NodeJS.ProcessEnv = process.env): Session | null {
  const id = env.CLAUDE_CODE_SESSION_ID;
  if (!id) return null;
  const pid = Number(env.CLAUDE_PID);
  return { harness: 'claude-code', id, pid: Number.isInteger(pid) && pid > 0 ? pid : null, transcript: findTranscript(id, env.CLAUDE_CONFIG_DIR) };
}

function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

// A night's session still runs while its process lives and its log moved within a day (a session
// paused at a usage limit keeps its process). Without a session to check, a night counts as
// running for a day after its file last changed.
export function sessionRunning(repo: string, n: Night, now = Date.now()): boolean {
  const mtime = (f: string | null) => (f && fs.existsSync(f) ? fs.statSync(f).mtimeMs : 0);
  const last = Math.max(mtime(nightFile(repo, n.night)), mtime(n.session?.transcript ?? null));
  if (n.session?.pid && !pidAlive(n.session.pid)) return false;
  return now - last < STALE_MS;
}

// ------------------------------------------------------------------ reading input

// The agent hands JSON; tolerate the common slips (a path given from the repository root).
function relEvidence(repo: string, id: string, p: string): string {
  const dir = nightDir(repo, id);
  const full = path.isAbsolute(p) ? p : fs.existsSync(path.resolve(dir, p)) ? path.resolve(dir, p) : path.resolve(repo, p);
  const rel = path.relative(dir, full).split(path.sep).join('/');
  return rel.startsWith('..') ? p : rel;
}

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function normaliseBlock(repo: string, id: string, raw: unknown): Block {
  if (!raw || typeof raw !== 'object') throw new StoreError('an evidence block must be an object');
  const b = { ...(raw as Record<string, unknown>) };
  if (!BLOCK_TYPES.includes(b.type as never)) throw new StoreError(`unknown block type ${JSON.stringify(b.type)}; the blocks are ${BLOCK_TYPES.join(', ')}. Missing one? Log it: night-shift feedback`);
  for (const k of ['path', 'before', 'after']) if (typeof b[k] === 'string') b[k] = relEvidence(repo, id, b[k] as string);
  return b as unknown as Block;
}

function openNight(repo: string): Night {
  const open = listNightIds(repo)
    .map((id) => loadNight(repo, id).night)
    .filter((n) => n.status === 'open');
  if (!open.length) throw new StoreError('no open night; start one first: night-shift start', 409);
  return open[open.length - 1];
}

function nextStep(n: Night): string {
  const t = n.tasks.find((x) => x.outcome === null && !x.unplanned);
  if (t) return `Next: work on ${t.id} "${t.title}"; when it ends, record it: night-shift record (outcome, checks, evidence).`;
  return 'Next: every task has an outcome. Log any friction with night-shift feedback, then close: night-shift close --summary "<one or two sentences>".';
}

// ------------------------------------------------------------------ start

export interface StartResult {
  night: Night;
  messages: string[];
}

export function nextNightId(repo: string, now: Date): string {
  const day = localDate(now);
  const taken = new Set(listNightIds(repo));
  for (let i = 0; ; i++) {
    let letters = '';
    let k = i;
    do {
      letters = String.fromCharCode(97 + (k % 26)) + letters;
      k = Math.floor(k / 26) - 1;
    } while (k >= 0);
    const id = `${day}-${letters}`;
    if (!taken.has(id) && !fs.existsSync(nightDir(repo, id))) return id;
  }
}

export function start(repo: string, planText: string, session: Session | null = currentSession(), now = new Date()): StartResult {
  const messages: string[] = [];
  messages.push(...recover(repo, now));
  for (const id of listNightIds(repo)) {
    const n = loadNight(repo, id).night;
    if (n.status !== 'open') continue;
    if (session && n.session?.id === session.id) throw new StoreError(`night ${id} is already open in this session; keep working on it (night-shift status shows where it stands)`, 409);
    throw new StoreError(`night ${id} is still running in another session; one night at a time per repository`, 409);
  }
  const plan: PlanInput = readPlanInput(planText);
  const ids = plan.tasks.map((t) => t.id);
  if (!ids.length && !plan.skipped_follow_ups?.length) throw new StoreError('the plan has no tasks');
  if (new Set(ids).size !== ids.length) throw new StoreError('task ids repeat in the plan');

  // Every open follow-up item is either taken on as a task or skipped with a reason.
  const refs = [...plan.tasks.flatMap((t) => (t.follow_up ? [t.follow_up] : [])), ...(plan.skipped_follow_ups ?? []).map((s) => s.follow_up)];
  if (new Set(refs).size !== refs.length) throw new StoreError('a follow-up item appears twice in the plan');
  for (const ref of refs) {
    const { item } = checkRef(repo, ref);
    if (item.status !== 'open') throw new StoreError(`follow-up item ${ref} is ${item.status}, not open`);
  }
  const missing = openItems(repo).filter((o) => !refs.includes(o.ref));
  if (missing.length) {
    throw new StoreError(
      `open follow-up items are not in the plan: ${missing.map((o) => `${o.ref} "${o.item.title}"`).join('; ')}. Check each against the code, then either plan it as a task with "follow_up": "<ref>" or list it under "skipped_follow_ups" with a reason (for example, already fixed).`,
    );
  }

  const id = nextNightId(repo, now);
  const startedAt = localIso(now);
  writeJson(planFile(repo, id), { ...plan, night: id, started_at: startedAt });
  const night: Night = {
    schema: 'night-shift/night@1',
    night: id,
    status: 'open',
    started_at: startedAt,
    ended_at: null,
    summary: null,
    session,
    tasks: plan.tasks.map((t) => ({ id: t.id, title: t.title, source: t.source, ...(t.follow_up ? { follow_up: t.follow_up } : {}), done_when: t.done_when, outcome: null, checks: [], evidence: [] })),
    skipped_follow_ups: plan.skipped_follow_ups ?? [],
    questions: [],
    feedback: [],
    metrics: null,
  };
  fs.mkdirSync(evidenceDir(repo, id), { recursive: true });
  saveNight(repo, night);
  registerRepo(repo, now);
  if (ensureGitignore(repo)) messages.push('Added the Night Shift lines to .gitignore.');
  const h = refreshHistory(repo, true, id);
  if (h) messages.push(h);
  messages.push(`Night ${id} is open with ${night.tasks.length} task(s)${session ? '' : ' (no Claude Code session found: metrics will be unknown)'}.`);
  messages.push(`Evidence goes in ${path.relative(repo, evidenceDir(repo, id)).split(path.sep).join('/')}/ and is referenced as evidence/<file>.`);
  messages.push(nextStep(night));
  return { night, messages };
}

// ------------------------------------------------------------------ record, ask, feedback

export interface RecordInput {
  task?: string;
  unplanned?: boolean;
  title?: string;
  outcome: string;
  checks?: (boolean | { met: boolean; note?: string })[];
  evidence?: unknown[];
  blocked_by?: string;
  why?: string;
  reason?: string;
}

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

export function record(repo: string, input: RecordInput, now = new Date()): { night: Night; task: Task; message: string } {
  if (!isObject(input)) throw new StoreError('send one JSON object: { "task": "T1", "outcome": "done", "checks": [...], "evidence": [...] }');
  const n = openNight(repo);
  if (!OUTCOMES.includes(input.outcome as never)) throw new StoreError(`outcome must be one of ${OUTCOMES.join(', ')}`);
  let task: Task;
  const index = input.task ? n.tasks.findIndex((t) => t.id === input.task) : -1;
  if (index >= 0) {
    task = { ...n.tasks[index] };
  } else if (input.unplanned) {
    if (!text(input.title)) throw new StoreError('an unplanned task needs a title');
    const existing = input.task ? n.tasks.find((t) => t.id === input.task && t.unplanned) : undefined;
    const nextU = `U${n.tasks.filter((t) => t.unplanned).length + 1}`;
    task = existing ? { ...existing } : { id: nextU, title: text(input.title), unplanned: true, done_when: [], outcome: null, checks: [], evidence: [] };
    task.title = text(input.title);
  } else {
    throw new StoreError(input.task ? `night ${n.night} has no task ${input.task}; for work you did not plan, send "unplanned": true with a title and why` : 'say which task: "task": "T1" (or "unplanned": true)');
  }
  const checks: Check[] = [];
  const given = Array.isArray(input.checks) ? input.checks : [];
  const exempt = task.unplanned || (input.outcome === 'not_started' && !given.length);
  if (!exempt && given.length !== task.done_when.length) {
    throw new StoreError(`${task.id} has ${task.done_when.length} done_when line(s); send one check per line, in order: ${task.done_when.map((d, i) => `${i + 1}. ${d}`).join(' ')}`);
  }
  given.forEach((c, i) => {
    const met = typeof c === 'boolean' ? c : !!c?.met;
    const note = typeof c === 'object' && text(c?.note) ? text(c?.note) : undefined;
    checks.push({ done_when: task.done_when[i] ?? `check ${i + 1}`, met, ...(note ? { note } : {}) });
  });
  task.outcome = input.outcome as Task['outcome'];
  task.checks = checks;
  task.evidence = (Array.isArray(input.evidence) ? input.evidence : []).map((b) => normaliseBlock(repo, n.night, b));
  for (const k of ['blocked_by', 'why', 'reason'] as const) {
    const v = text(input[k]);
    if (v) task[k] = v;
    else delete task[k];
  }
  task.recorded_at = localIso(now);
  const tasks = [...n.tasks];
  const at = tasks.findIndex((t) => t.id === task.id);
  if (at >= 0) tasks[at] = task;
  else tasks.push(task);
  const shape = nightShapeProblems({ ...n, tasks });
  if (shape.length) throw new StoreError(`${task.id} was not recorded: ${shape.join('; ')}`);
  const problems = taskProblems(task, new Set(n.questions.map((q) => q.id)), nightDir(repo, n.night));
  if (problems.length) throw new StoreError(`${task.id} was not recorded: ${problems.join('; ')}`);
  n.tasks = tasks;
  saveNight(repo, n);
  const met = checks.filter((c) => c.met).length;
  const summary = `Recorded ${task.id} as ${task.outcome}${checks.length ? ` (${met}/${checks.length} checks met)` : ''}${task.evidence.length ? `, ${task.evidence.length} evidence block(s)` : ''}.`;
  return { night: n, task, message: `${summary} ${nextStep(n)}` };
}

export interface AskInput {
  task?: string | null;
  ask: string;
  why?: string;
  options: (Partial<Option> & { label: string })[];
  recommended: string;
}

export function ask(repo: string, input: AskInput): { night: Night; question: Question; message: string } {
  if (!isObject(input)) throw new StoreError('send one JSON object: { "ask": "...", "options": [...], "recommended": "a" }');
  const n = openNight(repo);
  if (!text(input.ask)) throw new StoreError('a question needs "ask"');
  if (!Array.isArray(input.options) || input.options.length < 2) throw new StoreError('a question needs at least two options; every question has a recommended answer');
  if (input.options.some((o) => !isObject(o))) throw new StoreError('each option is an object: { "label": "...", "detail": "..." }');
  const options: Option[] = input.options.map((o, i) => ({
    id: o.id ?? String.fromCharCode(97 + i),
    label: String(o.label ?? '').trim(),
    ...(o.detail ? { detail: o.detail } : {}),
    ...(typeof o.image === 'string' && o.image ? { image: relEvidence(repo, n.night, o.image) } : {}),
  }));
  const rec = String(input.recommended ?? '');
  const recommended = options.find((o) => o.id === rec)?.id ?? options.find((o) => o.label === rec)?.id ?? rec;
  const q: Question = {
    id: `Q${n.questions.length + 1}`,
    task: input.task ?? null,
    ask: text(input.ask),
    ...(text(input.why) ? { why: text(input.why) } : {}),
    options,
    recommended,
    answer: null,
    note: null,
  };
  const trial = { ...n, questions: [...n.questions, q] };
  const shape = nightShapeProblems(trial);
  if (shape.length) throw new StoreError(`the question was not added: ${shape.join('; ')}`);
  const problems = nightProblems(trial, nightDir(repo, n.night)).filter((p) => p.startsWith(`${q.id}:`));
  if (problems.length) throw new StoreError(`the question was not added: ${problems.join('; ')}`);
  n.questions.push(q);
  saveNight(repo, n);
  const blocked = q.task ? ` If ${q.task} cannot go on without it, record it: outcome blocked, "blocked_by": "${q.id}", and move to the next task.` : '';
  return { night: n, question: q, message: `${q.id} added; the developer answers it in the Viewer.${blocked} ${nextStep(n)}` };
}

const FEEDBACK_KINDS = ['missing-block', 'confusing-rule', 'bad-fit', 'tool-bug', 'other'];

export function feedback(repo: string, input: { kind?: string; title: string; tags?: string[]; body: string }): { night: Night; item: Feedback; message: string } {
  const n = openNight(repo);
  if (!text(input?.title) || !text(input?.body)) throw new StoreError('feedback needs a title and a body');
  const kind = input.kind ?? 'other';
  if (!FEEDBACK_KINDS.includes(kind)) throw new StoreError(`kind must be one of ${FEEDBACK_KINDS.join(', ')}`);
  const item: Feedback = { id: `F${n.feedback.length + 1}`, kind, title: text(input.title), tags: (Array.isArray(input.tags) ? input.tags : []).map(String), body: text(input.body), sent: null };
  const shape = nightShapeProblems({ ...n, feedback: [...n.feedback, item] });
  if (shape.length) throw new StoreError(`the feedback was not logged: ${shape.join('; ')}`);
  n.feedback.push(item);
  saveNight(repo, n);
  return { night: n, item, message: `${item.id} logged; the developer decides in the Viewer whether it goes to GitHub. ${nextStep(n)}` };
}

export function status(repo: string): string {
  const ids = listNightIds(repo);
  const open = ids.map((id) => loadNight(repo, id).night).filter((n) => n.status === 'open');
  if (!open.length) {
    const items = openItems(repo);
    const last = ids.length ? ids[ids.length - 1] : null;
    return [`No night is open.${last ? ` The last one was ${last}.` : ''}`, items.length ? `${items.length} open follow-up item(s): ${items.map((o) => o.ref).join(', ')}.` : 'No open follow-up items.', 'Start a night with: night-shift start (the plan as JSON).'].join('\n');
  }
  const n = open[open.length - 1];
  const lines = [`Night ${n.night} is open (started ${n.started_at}).`];
  for (const t of n.tasks) lines.push(`  ${t.id} ${t.outcome ?? '…'}  ${t.title}`);
  if (n.questions.length) lines.push(`Questions: ${n.questions.map((q) => q.id).join(', ')}`);
  if (n.feedback.length) lines.push(`Feedback: ${n.feedback.length} item(s)`);
  lines.push(nextStep(n));
  return lines.join('\n');
}

// ------------------------------------------------------------------ close and recovery

function finish(repo: string, n: Night, as: 'complete' | 'interrupted', now: Date): Night {
  for (const t of n.tasks) {
    if (t.outcome === null) {
      t.outcome = 'not_started';
      t.checks = [];
    }
  }
  n.status = as;
  n.ended_at = localIso(now);
  applyNightToFollowUps(repo, n, now);
  saveNight(repo, n);
  copyHistory(repo);
  return n;
}

export function close(repo: string, summary: string, now = new Date()): { night: Night; message: string } {
  const n = openNight(repo);
  if (!text(summary)) throw new StoreError('closing needs a summary: one or two sentences the developer reads first in the morning');
  n.summary = text(summary);
  const trial = structuredClone(n);
  for (const t of trial.tasks) if (t.outcome === null) t.outcome = 'not_started';
  trial.status = 'complete';
  trial.ended_at = localIso(now);
  const problems = [...nightShapeProblems(trial), ...nightProblems(trial, nightDir(repo, n.night))];
  if (problems.length) throw new StoreError(`the night was not closed: ${problems.join('; ')}`);
  finish(repo, n, 'complete', now);
  const c = commitPath(repo, '.night-shift/history', `night-shift: history of ${n.night}`);
  const counts = countOutcomes(n.tasks);
  const tally = OUTCOMES.filter((o) => counts[o]).map((o) => `${counts[o]} ${o.replace('_', ' ')}`).join(', ');
  return {
    night: n,
    message: `Night ${n.night} closed: ${tally || 'no tasks'}. ${c.committed ? 'Its history copy is committed.' : `History: ${c.message}.`} Next: commit your own work as you normally would, then end the session; the Meter adds the cost when the session ends.`,
  };
}

// Closes open nights whose session is gone and measures closed nights still without metrics.
// Never commits: the next night start commits the history.
export function recover(repo: string, now = new Date()): string[] {
  const out: string[] = [];
  for (const id of listNightIds(repo)) {
    let n: Night;
    try {
      n = loadNight(repo, id).night;
    } catch {
      continue;
    }
    if (sessionRunning(repo, n, now.getTime())) continue;
    if (n.status === 'open') {
      finish(repo, n, 'interrupted', now);
      out.push(`Night ${id} had stopped without closing; it is now marked interrupted.`);
    }
    if (n.metrics === null && n.session) {
      n.metrics = measure(n.session.transcript ?? findTranscript(n.session.id), n.session.id, now);
      saveNight(repo, n);
      copyHistory(repo);
    }
  }
  return out;
}

// The session-end hook: close this session's open night as interrupted, then measure. Nights of
// other sessions are left alone.
export function onSessionEnd(repo: string, sessionId: string, transcript: string | null, now = new Date()): string[] {
  const out: string[] = [];
  for (const id of listNightIds(repo)) {
    let n: Night;
    try {
      n = loadNight(repo, id).night;
    } catch {
      continue;
    }
    if (n.session?.id !== sessionId) continue;
    if (n.status === 'open') {
      finish(repo, n, 'interrupted', now);
      out.push(`night ${id} closed as interrupted`);
    }
    if (n.metrics === null) {
      n.metrics = measure(transcript && fs.existsSync(transcript) ? transcript : (n.session.transcript ?? findTranscript(sessionId)), sessionId, now);
      saveNight(repo, n);
      copyHistory(repo);
      out.push(`night ${id} measured`);
    }
  }
  return out;
}

// ------------------------------------------------------------------ history

// Copies every night file and follow-up file into history/ (only what changed). Returns true when
// something changed. "Changed" means the data, not the text: a repository's own formatter (a
// pre-commit prettier, say) may reformat the committed copy, and that must not look like a change.
export function copyHistory(repo: string): boolean {
  const dir = historyDir(repo);
  let changed = false;
  const same = (to: string, text: string) => {
    try {
      return isDeepStrictEqual(parseJson(fs.readFileSync(to, 'utf8')), parseJson(text));
    } catch {
      return false;
    }
  };
  const put = (from: string, to: string) => {
    const text = fs.readFileSync(from, 'utf8');
    if (fs.existsSync(to) && same(to, text)) return;
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.writeFileSync(to, text);
    changed = true;
  };
  for (const id of listNightIds(repo)) {
    const n = loadNight(repo, id).night;
    if (n.status === 'open') continue;
    put(nightFile(repo, id), path.join(dir, `${id}.json`));
  }
  for (const id of listFollowUpIds(repo)) put(followUpFile(repo, id), path.join(dir, 'follow-ups', `${id}.json`));
  return changed;
}

// At a night start: bring the history copies up to date (metrics, answers and follow-ups arrive
// after a night's own commit) and commit them on the current branch.
export function refreshHistory(repo: string, commit: boolean, forNight: string): string | null {
  copyHistory(repo);
  if (!commit || !fs.existsSync(historyDir(repo))) return null;
  const c = commitPath(repo, '.night-shift/history', `night-shift: update the history before ${forNight}`);
  return c.committed ? 'Committed the updated history of earlier nights.' : null;
}
