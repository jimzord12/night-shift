// Parsers for the two text formats agents write on the board: the card header and the outcome
// comment (docs/contract.md). Both are forgiving about spacing and strict about values, and
// report problems instead of throwing, so one sloppy card never hides the others.

import type { CardHeader, CardKind, OutcomeStatus, Size } from './types.ts';
import { OUTCOME_STATUSES } from './types.ts';

const HEADER = /^\s*night-shift:\s*(.*)$/m;

export function parseHeader(desc: string): CardHeader | null {
  const m = HEADER.exec(desc);
  if (!m) return null;
  const header: CardHeader = { touches: [], problems: [] };
  for (const token of m[1].trim().split(/\s+/).filter(Boolean)) {
    const eq = token.indexOf('=');
    if (eq < 1) {
      header.problems.push(`"${token}" is not key=value`);
      continue;
    }
    const key = token.slice(0, eq);
    const value = token.slice(eq + 1);
    if (key === 'kind') {
      if (value === 'build' || value === 'explore') header.kind = value as CardKind;
      else header.problems.push(`kind must be build or explore, got "${value}"`);
    } else if (key === 'size') {
      if (value === 'S' || value === 'M' || value === 'L') header.size = value as Size;
      else header.problems.push(`size must be S, M or L, got "${value}"`);
    } else if (key === 'touches') {
      header.touches = value.split(',').map((t) => t.trim().replace(/\\/g, '/').replace(/\/+$/, '')).filter(Boolean);
    } else {
      header.problems.push(`unknown key "${key}"`);
    }
  }
  if (!header.kind) header.problems.push('kind is missing');
  if (!header.size) header.problems.push('size is missing');
  if (!header.touches.length) header.problems.push('touches is missing');
  return header;
}

// Two touch lists collide when one path equals or contains the other.
export function touchesOverlap(a: string[], b: string[]): boolean {
  const within = (x: string, y: string) => x === y || x.startsWith(`${y}/`);
  return a.some((x) => b.some((y) => within(x, y) || within(y, x)));
}

export interface RawEvidence {
  kind: 'image' | 'compare' | 'pdf' | 'link';
  files: string[];
  url?: string;
  caption?: string;
}

export interface ParsedOutcome {
  shift?: string;
  status?: OutcomeStatus;
  line?: string;
  review?: string;
  commits: string[];
  evidence: RawEvidence[];
  questions: string[];
  problems: string[];
}

const MARKER = /^\s*night-shift outcome\/1\s*$/;
export const SHIFT_ID = /^(\d{4}-\d{2}-\d{2})-(night|day)$/;
const list = (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean);

export function isOutcome(text: string): boolean {
  return text.split(/\r?\n/).some((l) => MARKER.test(l));
}

export function parseOutcome(text: string): ParsedOutcome | null {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => MARKER.test(l));
  if (start < 0) return null;
  const out: ParsedOutcome = { commits: [], evidence: [], questions: [], problems: [] };
  for (const raw of lines.slice(start + 1)) {
    const line = raw.trim();
    // The block ends at a closing code fence; prose after it is the builder's own note.
    if (line.startsWith('```')) break;
    if (!line) continue;
    const colon = line.indexOf(':');
    if (colon < 1) {
      out.problems.push(`"${line}" is not key: value`);
      continue;
    }
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    switch (key) {
      case 'shift':
        if (SHIFT_ID.test(value)) out.shift = value;
        else out.problems.push(`shift must look like 2026-09-25-night, got "${value}"`);
        break;
      case 'status':
        if ((OUTCOME_STATUSES as string[]).includes(value)) out.status = value as OutcomeStatus;
        else out.problems.push(`status must be one of ${OUTCOME_STATUSES.join(', ')}, got "${value}"`);
        break;
      case 'line':
        out.line = value;
        break;
      case 'review':
        out.review = value;
        break;
      case 'commits':
        out.commits.push(...list(value));
        break;
      case 'questions':
        out.questions.push(...list(value));
        break;
      case 'evidence': {
        const ev = parseEvidence(value);
        if (typeof ev === 'string') out.problems.push(ev);
        else out.evidence.push(ev);
        break;
      }
      default:
        out.problems.push(`unknown key "${key}"`);
    }
  }
  if (!out.shift) out.problems.push('shift is missing');
  if (!out.status) out.problems.push('status is missing');
  if (!out.line) out.problems.push('line is missing');
  return out;
}

function parseEvidence(value: string): RawEvidence | string {
  const bar = value.indexOf('|');
  const body = (bar >= 0 ? value.slice(0, bar) : value).trim();
  const caption = bar >= 0 ? value.slice(bar + 1).trim() || undefined : undefined;
  const [kind, ...rest] = body.split(/\s+/);
  switch (kind) {
    case 'image':
    case 'pdf':
      if (rest.length !== 1) return `evidence ${kind} takes one file name, got "${body}"`;
      return { kind, files: rest, caption };
    case 'compare':
      if (rest.length !== 2) return `evidence compare takes two file names (before after), got "${body}"`;
      return { kind, files: rest, caption };
    case 'link':
      if (rest.length !== 1 || !/^https?:\/\//.test(rest[0])) return `evidence link takes one http(s) URL, got "${body}"`;
      return { kind, files: [], url: rest[0], caption };
    default:
      return `evidence kind must be image, compare, pdf or link, got "${kind ?? ''}"`;
  }
}
