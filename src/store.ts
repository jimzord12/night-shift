// The project's .night-shift folder: project.json and questions/. Validation against the JSON
// Schemas in schemas/, plus the checks a schema cannot express (the id matches the file name,
// recommended ids exist, an answer fits its kind). The app writes only the `answer` field, and
// only over the exact file version the owner saw (the hash guard).

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import type { Answer, Project, Question, QuestionEntry } from './types.ts';

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
const validateProjectSchema = ajv.compile(JSON.parse(fs.readFileSync(path.join(SCHEMAS, 'project.schema.json'), 'utf8')));
const validateQuestionSchema = ajv.compile(JSON.parse(fs.readFileSync(path.join(SCHEMAS, 'question.schema.json'), 'utf8')));

function schemaProblems(errors: typeof validateQuestionSchema.errors): string[] {
  // oneOf failures repeat once per branch; keep each message once.
  return [...new Set((errors ?? []).map((e) => `${e.instancePath || '(root)'} ${e.message ?? 'is invalid'}`))];
}

// JSON.parse that tolerates the byte-order mark Windows tools (PowerShell 5.1) put in UTF-8 files.
export function parseJson(text: string): unknown {
  return JSON.parse(text.replace(/^﻿/, ''));
}

export function dataDir(projectDir: string): string {
  return path.join(path.resolve(projectDir), '.night-shift');
}

export function loadProject(dir: string): Project {
  const file = path.join(dir, 'project.json');
  if (!fs.existsSync(file)) throw new StoreError(`${file} does not exist; see \`night-shift docs binding\``, 404);
  let data: unknown;
  try {
    data = parseJson(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new StoreError(`${file} is not valid JSON: ${(error as Error).message}`);
  }
  if (!validateProjectSchema(data)) throw new StoreError(`${file}: ${schemaProblems(validateProjectSchema.errors).join('; ')}`);
  return data as Project;
}

const hashOf = (text: string) => crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);

export function questionsDir(dir: string): string {
  return path.join(dir, 'questions');
}

export function readQuestion(dir: string, file: string): QuestionEntry {
  const full = path.join(questionsDir(dir), file);
  const text = fs.readFileSync(full, 'utf8');
  const entry: QuestionEntry = { file, hash: hashOf(text), question: null, problems: [] };
  let data: unknown;
  try {
    data = parseJson(text);
  } catch (error) {
    entry.problems.push(`not valid JSON: ${(error as Error).message}`);
    return entry;
  }
  if (!validateQuestionSchema(data)) {
    entry.problems.push(...schemaProblems(validateQuestionSchema.errors));
    return entry;
  }
  const q = data as Question;
  entry.problems.push(...semanticProblems(q, file, dir));
  if (!entry.problems.length) entry.question = q;
  return entry;
}

function optionIds(q: Question): string[] {
  return q.kind === 'confirm' ? ['yes', 'no'] : (q.options ?? []).map((o) => o.id);
}

function semanticProblems(q: Question, file: string, dir: string): string[] {
  const problems: string[] = [];
  if (`${q.id}.json` !== file) problems.push(`id "${q.id}" does not match the file name ${file}`);
  if (!q.id.startsWith(`${q.shift}-`)) problems.push(`id "${q.id}" does not start with its shift "${q.shift}-"`);
  const needsOptions = q.kind === 'one' || q.kind === 'many' || q.kind === 'rank';
  if (needsOptions && (q.options?.length ?? 0) < 2) problems.push(`kind ${q.kind} needs at least two options`);
  if (!needsOptions && q.options?.length) problems.push(`kind ${q.kind} takes no options`);
  const ids = optionIds(q);
  if (new Set(ids).size !== ids.length) problems.push('option ids repeat');
  if (q.kind !== 'text') {
    for (const r of q.recommended) if (!ids.includes(r)) problems.push(`recommended "${r}" is not an option`);
  }
  const recProblem = valueProblem(q, q.recommended);
  if (recProblem) problems.push(`recommended: ${recProblem}`);
  if (q.answer && q.answer.status === 'answered') {
    const p = valueProblem(q, q.answer.value);
    if (p) problems.push(`answer: ${p}`);
  }
  for (const img of [...(q.images ?? []), ...(q.options ?? []).flatMap((o) => (o.image ? [o.image] : []))]) {
    const full = path.resolve(dir, img);
    if (!full.startsWith(path.resolve(dir) + path.sep)) problems.push(`image ${img} leaves the .night-shift folder`);
    else if (!fs.existsSync(full)) problems.push(`image ${img} does not exist`);
  }
  return problems;
}

// The one place that knows what a value must look like for each kind.
export function valueProblem(q: Question, value: string[]): string | null {
  const ids = optionIds(q);
  switch (q.kind) {
    case 'confirm':
    case 'one':
      if (value.length !== 1 || !ids.includes(value[0])) return `pick exactly one of ${ids.join(', ')}`;
      return null;
    case 'many': {
      const min = q.min ?? 1;
      const max = q.max ?? ids.length;
      if (value.some((v) => !ids.includes(v))) return `unknown option in ${value.join(', ')}`;
      if (new Set(value).size !== value.length) return 'an option is picked twice';
      if (value.length < min || value.length > max) return `pick between ${min} and ${max}`;
      return null;
    }
    case 'rank':
      if (value.length !== ids.length || new Set(value).size !== ids.length || value.some((v) => !ids.includes(v))) return 'rank every option exactly once';
      return null;
    case 'text':
      if (value.length !== 1 || !value[0].trim()) return 'write one non-empty answer';
      return null;
  }
}

export function listQuestions(dir: string): QuestionEntry[] {
  const qdir = questionsDir(dir);
  if (!fs.existsSync(qdir)) return [];
  return fs
    .readdirSync(qdir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => readQuestion(dir, f));
}

export interface AnswerInput {
  status: 'answered' | 'deferred';
  value: string[];
  note?: string;
  baseHash: string;
}

export function saveAnswer(dir: string, id: string, input: AnswerInput, now = new Date()): QuestionEntry {
  if (!/^[\w-]+$/.test(id)) throw new StoreError(`bad question id ${JSON.stringify(id)}`);
  const file = `${id}.json`;
  const full = path.join(questionsDir(dir), file);
  if (!fs.existsSync(full)) throw new StoreError(`question ${id} does not exist`, 404);
  const current = readQuestion(dir, file);
  if (current.hash !== input.baseHash) throw new StoreError('the question changed since you opened it; showing the new version', 409);
  if (!current.question) throw new StoreError(`question ${id} is invalid: ${current.problems.join('; ')}`, 422);
  const q = current.question;
  if (q.resolved) throw new StoreError('this question is already resolved; its answer can no longer change', 409);
  if (input.status !== 'answered' && input.status !== 'deferred') throw new StoreError('status must be answered or deferred');
  const value = input.status === 'deferred' ? [] : input.value;
  if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) throw new StoreError('value must be a list of strings');
  if (input.status === 'answered') {
    const p = valueProblem(q, value);
    if (p) throw new StoreError(p);
  }
  const answer: Answer = { at: localIso(now), status: input.status, value };
  if (input.note?.trim()) answer.note = input.note.trim();
  // Only `answer` changes; every other field is written back exactly as the asker left it.
  const raw = parseJson(fs.readFileSync(full, 'utf8')) as Record<string, unknown>;
  raw.answer = answer;
  const tmp = `${full}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(raw, null, 2)}\n`);
  fs.renameSync(tmp, full);
  return readQuestion(dir, file);
}

// ISO 8601 with the machine's own offset, e.g. 2026-09-26T08:41:00+03:00.
export function localIso(d: Date): string {
  const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
  const off = -d.getTimezoneOffset();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${off >= 0 ? '+' : '-'}${pad(Math.trunc(off / 60))}:${pad(off % 60)}`;
}
