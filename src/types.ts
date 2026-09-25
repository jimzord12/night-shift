// The shapes the server sends to the web app. Types only: the web app imports this file too.

export type Kind = 'confirm' | 'one' | 'many' | 'rank' | 'text';

export interface Option {
  id: string;
  label: string;
  detail?: string;
  image?: string;
}

export interface Answer {
  at: string;
  status: 'answered' | 'deferred';
  value: string[];
  note?: string;
}

export interface Resolved {
  at: string;
  into: string;
}

export interface Question {
  schema: 'question/1';
  id: string;
  shift: string;
  card?: string;
  blocking?: boolean;
  topic?: string;
  question: string;
  why?: string;
  kind: Kind;
  options?: Option[];
  min?: number;
  max?: number;
  recommended: string[];
  because: string;
  images?: string[];
  answer: Answer | null;
  resolved: Resolved | null;
}

// A question still waits for the owner when it has no answer or was put off ("not now").
export function isOpen(q: Question): boolean {
  return !q.resolved && (!q.answer || q.answer.status === 'deferred');
}

// One file in questions/: a valid question, or the problems that make it invalid.
export interface QuestionEntry {
  file: string;
  hash: string;
  question: Question | null;
  problems: string[];
}

export interface TrelloBoard {
  type: 'trello';
  id: string;
  readyLabel: string;
  doneLists?: string[];
}

export interface FileBoard {
  type: 'file';
  path: string;
  readyLabel: string;
  doneLists?: string[];
}

export interface Project {
  schema: 'project/1';
  name: string;
  accent?: string;
  repo?: string;
  buffer?: { target?: number; low?: number };
  board: TrelloBoard | FileBoard;
}

export type CardKind = 'build' | 'explore';
export type Size = 'S' | 'M' | 'L';

export interface CardHeader {
  kind?: CardKind;
  size?: Size;
  touches: string[];
  problems: string[];
}

export interface QueueCard {
  id: string;
  name: string;
  url: string;
  list: string;
  header: CardHeader | null;
  // Other queued cards whose touches overlap this one's: never run in parallel with them.
  collidesWith: string[];
}

export type OutcomeStatus = 'shipped' | 'needs-eyes' | 'blocked' | 'skipped';
export const OUTCOME_STATUSES: OutcomeStatus[] = ['shipped', 'needs-eyes', 'blocked', 'skipped'];

export interface Evidence {
  kind: 'image' | 'compare' | 'pdf' | 'link';
  // Resolved URLs the browser can load (attachments are proxied by the server).
  src?: string;
  before?: string;
  caption?: string;
  // The name the comment used, kept for messages when the attachment is missing.
  name?: string;
  missing?: boolean;
}

export interface Outcome {
  card: { id: string; name: string; url: string };
  date: string;
  shift: string;
  status: OutcomeStatus;
  line: string;
  review?: string;
  commits: { sha: string; url?: string }[];
  evidence: Evidence[];
  questions: string[];
  problems: string[];
}

export interface Shift {
  id: string;
  kind: 'night' | 'day';
  date: string;
  counts: Record<OutcomeStatus, number>;
  outcomes: Outcome[];
}

export interface Overview {
  version: string;
  project: Project;
  buffer: { target: number; low: number };
  queue: QueueCard[];
  shifts: Shift[];
  boardError: string | null;
  loadedAt: string;
}
