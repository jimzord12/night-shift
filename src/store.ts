// Files on disk: a repository's .night-shift/ folder (nights, follow-ups, history) and the local
// install's folder (~/.night-shift: the registry of repositories and the Viewer's own state).
// Validation is the JSON Schemas in schemas/ plus the rules a schema cannot express.

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import { insideDir } from './files.ts';
import type { FollowUp, Night, PlanInput, RepoRef } from './types.ts';
import { OUTCOMES } from './types.ts';

export const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const SCHEMAS = path.join(REPO_ROOT, 'schemas');

export class StoreError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const ajv = new Ajv2020.default({ allErrors: true, strict: false, validateFormats: false });
const compile = (name: string) => ajv.compile(JSON.parse(fs.readFileSync(path.join(SCHEMAS, `${name}.schema.json`), 'utf8')));
const planSchema = compile('plan');
const nightSchema = compile('night');
const followUpSchema = compile('follow-up');

type Validator = typeof planSchema;

function schemaProblems(v: Validator, data: unknown): string[] {
  if (v(data)) return [];
  // oneOf failures repeat once per branch; keep each message once.
  return [...new Set((v.errors ?? []).map((e) => `${e.instancePath || '(root)'} ${e.message ?? 'is invalid'}`))];
}

export const planProblems = (data: unknown) => schemaProblems(planSchema, data);
export const followUpSchemaProblems = (data: unknown) => schemaProblems(followUpSchema, data);

// JSON.parse that tolerates the byte-order mark Windows tools (PowerShell 5.1) put in UTF-8 files.
export function parseJson(text: string): unknown {
  return JSON.parse(text.replace(/^﻿/, ''));
}

export const hashOf = (text: string) => crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);

export function writeJson(file: string, data: unknown): string {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const text = `${JSON.stringify(data, null, 2)}\n`;
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
  return text;
}

// ISO 8601 with the machine's own offset, e.g. 2026-09-26T08:41:00+03:00.
export function localIso(d: Date): string {
  const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
  const off = -d.getTimezoneOffset();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${off >= 0 ? '+' : '-'}${pad(Math.trunc(off / 60))}:${pad(off % 60)}`;
}

export const localDate = (d: Date) => localIso(d).slice(0, 10);

// ------------------------------------------------------------------ a repository's folder

export const nsDir = (repo: string) => path.join(path.resolve(repo), '.night-shift');
export const nightsDir = (repo: string) => path.join(nsDir(repo), 'nights');
export const nightDir = (repo: string, id: string) => path.join(nightsDir(repo), id);
export const nightFile = (repo: string, id: string) => path.join(nightDir(repo, id), 'night.json');
export const planFile = (repo: string, id: string) => path.join(nightDir(repo, id), 'plan.json');
export const evidenceDir = (repo: string, id: string) => path.join(nightDir(repo, id), 'evidence');
export const followUpsDir = (repo: string) => path.join(nsDir(repo), 'follow-ups');
export const followUpFile = (repo: string, id: string) => path.join(followUpsDir(repo), `${id}.json`);
export const historyDir = (repo: string) => path.join(nsDir(repo), 'history');

const NIGHT_ID = /^\d{4}-\d{2}-\d{2}-[a-z]+$/;
export const isNightId = (id: string) => NIGHT_ID.test(id);

// Oldest first: the date, then a, b, …, z, aa.
export function sortNightIds(ids: string[]): string[] {
  const key = (id: string) => `${id.slice(0, 10)}-${id.slice(11).padStart(4, ' ')}`;
  return [...ids].sort((a, b) => key(a).localeCompare(key(b)));
}

export function listNightIds(repo: string): string[] {
  const dir = nightsDir(repo);
  if (!fs.existsSync(dir)) return [];
  return sortNightIds(fs.readdirSync(dir).filter((d) => isNightId(d) && fs.existsSync(nightFile(repo, d))));
}

export interface NightRead {
  night: Night | null;
  text: string;
  hash: string;
  problems: string[];
}

export function readNight(repo: string, id: string): NightRead {
  if (!isNightId(id)) throw new StoreError(`bad night id ${JSON.stringify(id)}`);
  const file = nightFile(repo, id);
  if (!fs.existsSync(file)) throw new StoreError(`night ${id} does not exist`, 404);
  const text = fs.readFileSync(file, 'utf8');
  const out: NightRead = { night: null, text, hash: hashOf(text), problems: [] };
  let data: unknown;
  try {
    data = parseJson(text);
  } catch (error) {
    out.problems.push(`not valid JSON: ${(error as Error).message}`);
    return out;
  }
  out.problems.push(...schemaProblems(nightSchema, data));
  if (out.problems.length) return out;
  out.night = data as Night;
  out.problems.push(...nightProblems(out.night, nightDir(repo, id)));
  return out;
}

// A night the tool can work on: valid, or a StoreError that says why not.
export function loadNight(repo: string, id: string): { night: Night; hash: string } {
  const r = readNight(repo, id);
  if (!r.night) throw new StoreError(`${nightFile(repo, id)} is invalid: ${r.problems.join('; ')}`, 422);
  return { night: r.night, hash: r.hash };
}

export function saveNight(repo: string, night: Night): string {
  return hashOf(writeJson(nightFile(repo, night.night), night));
}

// Evidence must be a file inside the night's evidence/ folder.
export function evidenceProblem(dir: string, rel: string): string | null {
  const full = path.resolve(dir, rel);
  if (!insideDir(path.join(dir, 'evidence'), full)) return `${rel} is not inside the night's evidence/ folder`;
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return `${rel} does not exist`;
  return null;
}

// The rules a schema cannot express. Used on every read, so a hand-edited file shows its problems.
export function nightProblems(n: Night, dir: string): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const qids = new Set(n.questions.map((q) => q.id));
  for (const t of n.tasks) {
    if (ids.has(t.id)) problems.push(`task ${t.id} appears twice`);
    ids.add(t.id);
    problems.push(...taskProblems(t, qids, dir).map((p) => `${t.id}: ${p}`));
  }
  for (const q of n.questions) {
    const opts = q.options.map((o) => o.id);
    if (new Set(opts).size !== opts.length) problems.push(`${q.id}: option ids repeat`);
    if (!opts.includes(q.recommended)) problems.push(`${q.id}: recommended "${q.recommended}" is not an option`);
    if (q.answer !== null && !opts.includes(q.answer)) problems.push(`${q.id}: answer "${q.answer}" is not an option`);
    if (q.task !== null && !ids.has(q.task)) problems.push(`${q.id}: task ${q.task} does not exist`);
    for (const o of q.options) if (o.image) {
      const p = evidenceProblem(dir, o.image);
      if (p) problems.push(`${q.id}: option ${o.id}: ${p}`);
    }
  }
  if (n.status === 'complete' && !n.summary) problems.push('a complete night needs a summary');
  if (n.status !== 'open' && n.tasks.some((t) => t.outcome === null)) problems.push('a closed night has a task without an outcome');
  return problems;
}

export function taskProblems(t: Night['tasks'][number], questionIds: Set<string>, dir: string): string[] {
  const problems: string[] = [];
  for (const b of t.evidence) {
    const paths = b.type === 'compare' ? [b.before, b.after] : 'path' in b ? [b.path] : [];
    for (const p of paths) {
      const why = evidenceProblem(dir, p);
      if (why) problems.push(why);
    }
    if (b.type === 'command' && b.excerpt.split('\n').length > 25) problems.push('a command excerpt is longer than 25 lines; keep the lines that prove the point');
  }
  if (t.outcome === null) return problems;
  if (!t.unplanned && t.outcome !== 'not_started' && t.checks.length !== t.done_when.length) problems.push(`has ${t.checks.length} checks for ${t.done_when.length} done_when lines`);
  const met = t.checks.filter((c) => c.met).length;
  switch (t.outcome) {
    case 'done':
      if (t.checks.some((c) => !c.met)) problems.push('done needs every check met; use partial');
      if (!t.evidence.some((b) => b.type !== 'note')) problems.push('done needs at least one evidence block that is not a note');
      break;
    case 'partial':
      if (!t.unplanned && met === 0) problems.push('partial needs at least one check met; use failed or blocked');
      if (t.checks.some((c) => !c.met && !c.note?.trim())) problems.push('partial: every unmet check needs a note saying what is left');
      break;
    case 'blocked':
      if (!t.blocked_by) problems.push('blocked needs blocked_by naming a question');
      else if (!questionIds.has(t.blocked_by)) problems.push(`blocked_by ${t.blocked_by} is not a question in this night`);
      break;
    case 'failed':
      if (!t.why?.trim()) problems.push('failed needs why');
      break;
    case 'skipped':
      if (!t.reason?.trim()) problems.push('skipped needs a reason');
      break;
    case 'not_started':
      break;
  }
  if (t.unplanned && !t.why?.trim()) problems.push('an unplanned task needs why');
  if (!OUTCOMES.includes(t.outcome)) problems.push(`unknown outcome ${String(t.outcome)}`);
  return problems;
}

// ------------------------------------------------------------------ follow-ups

export function listFollowUpIds(repo: string): string[] {
  const dir = followUpsDir(repo);
  if (!fs.existsSync(dir)) return [];
  return sortNightIds(fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).filter(isNightId));
}

export function readFollowUp(repo: string, id: string): FollowUp {
  if (!isNightId(id)) throw new StoreError(`bad follow-up id ${JSON.stringify(id)}`);
  const file = followUpFile(repo, id);
  if (!fs.existsSync(file)) throw new StoreError(`follow-up ${id} does not exist`, 404);
  let data: unknown;
  try {
    data = parseJson(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new StoreError(`${file} is not valid JSON: ${(error as Error).message}`, 422);
  }
  const problems = followUpSchemaProblems(data);
  if (problems.length) throw new StoreError(`${file} is invalid: ${problems.join('; ')}`, 422);
  return data as FollowUp;
}

export const saveFollowUp = (repo: string, f: FollowUp) => writeJson(followUpFile(repo, f.id), f);

export function readPlanInput(text: string): PlanInput {
  let data: unknown;
  try {
    data = parseJson(text);
  } catch (error) {
    throw new StoreError(`the plan is not valid JSON: ${(error as Error).message}`);
  }
  const problems = planProblems(data);
  if (problems.length) throw new StoreError(`the plan does not match night-shift/plan@1: ${problems.join('; ')}`);
  return data as PlanInput;
}

// ------------------------------------------------------------------ the local install

export const installRoot = () => path.resolve(process.env.NIGHT_SHIFT_ROOT || path.join(os.homedir(), '.night-shift'));
const registryFile = () => path.join(installRoot(), 'repos.json');
const viewerFile = () => path.join(installRoot(), 'viewer.json');

interface RegistryEntry {
  id: string;
  name: string;
  path: string;
  added: string;
}

function readRegistry(): RegistryEntry[] {
  try {
    const data = parseJson(fs.readFileSync(registryFile(), 'utf8')) as { repos?: RegistryEntry[] };
    return Array.isArray(data.repos) ? data.repos.filter((r) => typeof r.id === 'string' && typeof r.path === 'string') : [];
  } catch {
    return [];
  }
}

const samePath = (a: string, b: string) => (process.platform === 'win32' ? path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase() : path.resolve(a) === path.resolve(b));

// Registers a repository with the local install (idempotent) and returns its entry.
export function registerRepo(repo: string, now = new Date()): RepoRef {
  const full = path.resolve(repo);
  const repos = readRegistry();
  const found = repos.find((r) => samePath(r.path, full));
  if (found) return { ...found, missing: false };
  const base = path.basename(full).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'repo';
  let id = base;
  for (let i = 2; repos.some((r) => r.id === id); i++) id = `${base}-${i}`;
  const entry = { id, name: path.basename(full), path: full, added: localIso(now) };
  writeJson(registryFile(), { repos: [...repos, entry] });
  return { ...entry, missing: false };
}

export function listRepos(): RepoRef[] {
  return readRegistry().map((r) => ({ id: r.id, name: r.name, path: r.path, missing: !fs.existsSync(r.path) }));
}

export function findRepo(id: string): RepoRef {
  const r = listRepos().find((x) => x.id === id);
  if (!r) throw new StoreError(`no registered repository ${JSON.stringify(id)}`, 404);
  if (r.missing) throw new StoreError(`repository ${r.name} is no longer at ${r.path}`, 404);
  return r;
}

interface ViewerState {
  read: Record<string, string>;
}

export function readViewerState(): ViewerState {
  try {
    const data = parseJson(fs.readFileSync(viewerFile(), 'utf8')) as Partial<ViewerState>;
    return { read: data.read && typeof data.read === 'object' ? data.read : {} };
  } catch {
    return { read: {} };
  }
}

export function markRead(repoId: string, night: string, now = new Date()): void {
  const state = readViewerState();
  state.read[`${repoId}/${night}`] = localIso(now);
  writeJson(viewerFile(), state);
}
