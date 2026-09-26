// The file shapes of a night (docs/design.md) and what the Viewer's API sends. Types and small
// pure helpers only: the web app imports this file too.

export const OUTCOMES = ['done', 'partial', 'blocked', 'failed', 'not_started', 'skipped'] as const;
export type Outcome = (typeof OUTCOMES)[number];

export const BLOCK_TYPES = ['image', 'compare', 'video', 'pdf', 'link', 'command', 'note'] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

// Proof and notes come only from these (the fixed vocabulary). Paths are relative to the night's
// folder and must lie inside its evidence/ folder.
export type Block =
  | { type: 'image'; path: string; caption?: string }
  | { type: 'compare'; before: string; after: string; caption?: string }
  | { type: 'video'; path: string; caption?: string }
  | { type: 'pdf'; path: string; caption?: string }
  | { type: 'link'; url: string; label?: string }
  | { type: 'command'; command: string; exit_code: number; excerpt: string }
  | { type: 'note'; text: string };

export interface PlanTask {
  id: string;
  title: string;
  source: string;
  done_when: string[];
  // "<follow-up id>/<item id>" when the task carries a follow-up item forward.
  follow_up?: string;
}

export interface SkippedFollowUp {
  follow_up: string;
  reason: string;
}

// What the agent hands to `night-shift start`.
export interface PlanInput {
  schema: 'night-shift/plan@1';
  tasks: PlanTask[];
  skipped_follow_ups?: SkippedFollowUp[];
}

// The stored plan: the input plus what the tool adds.
export interface Plan extends PlanInput {
  night: string;
  started_at: string;
}

export interface Check {
  done_when: string;
  met: boolean;
  note?: string;
}

export interface Task {
  id: string;
  title: string;
  source?: string;
  follow_up?: string;
  unplanned?: true;
  done_when: string[];
  outcome: Outcome | null;
  checks: Check[];
  evidence: Block[];
  blocked_by?: string;
  why?: string;
  reason?: string;
  recorded_at?: string;
}

export interface Option {
  id: string;
  label: string;
  detail?: string;
  image?: string;
}

export interface Question {
  id: string;
  task: string | null;
  ask: string;
  why?: string;
  options: Option[];
  recommended: string;
  // Written by the Viewer only.
  answer: string | null;
  note: string | null;
  answered_at?: string;
}

export interface FeedbackSent {
  at: string;
  via: 'gh' | 'link';
  url?: string;
}

export interface Feedback {
  id: string;
  kind: string;
  title: string;
  tags: string[];
  body: string;
  // Written by the Viewer only.
  sent: FeedbackSent | null;
}

export interface ModelUsage {
  tokens: { input: number | null; output: number | null; reasoning: number | null; cache_read: number | null; cache_write: number | null };
  cost_usd: number | null;
}

// Measured from the harness, never claimed by the agent. Anything the harness did not provide is null
// and shows as "unknown".
export interface Metrics {
  source: 'claude-code';
  harness_version: string | null;
  session_id: string | null;
  measured_at: string;
  duration_min: { total: number | null; model: number | null; tools: number | null };
  models: Record<string, ModelUsage>;
  cost_usd: number | null;
  sub_agents: { type: string | null; model: string | null; purpose: string | null }[];
  lines: { added: number | null; removed: number | null };
}

export interface Session {
  harness: 'claude-code';
  id: string;
  pid: number | null;
  transcript: string | null;
}

export type NightStatus = 'open' | 'complete' | 'interrupted';

export interface Night {
  schema: 'night-shift/night@1';
  night: string;
  status: NightStatus;
  started_at: string;
  ended_at: string | null;
  summary: string | null;
  session: Session | null;
  tasks: Task[];
  skipped_follow_ups: SkippedFollowUp[];
  questions: Question[];
  feedback: Feedback[];
  metrics: Metrics | null;
}

// carried: a night took the item on as a task; that task's outcome is the item's fate now.
export type ItemStatus = 'open' | 'done' | 'skipped' | 'carried';
export type ItemKind = 'decision' | 'unfinished' | 'waiting';

export interface FollowUpItem {
  id: string;
  status: ItemStatus;
  kind: ItemKind;
  task: string | null;
  title: string;
  question?: string;
  decision?: string;
  decision_label?: string;
  owner_note?: string;
  left?: string[];
  done_when: string[];
  resolved?: { at: string; by: string; reason?: string };
}

export interface FollowUp {
  schema: 'night-shift/follow-up@1';
  id: string;
  from_night: string;
  created_at: string;
  items: FollowUpItem[];
}

// ------------------------------------------------------------------ the Viewer's API

export interface RepoRef {
  id: string;
  name: string;
  path: string;
  missing: boolean;
}

export interface NightSummary {
  repo: string;
  id: string;
  status: NightStatus;
  started_at: string;
  ended_at: string | null;
  summary: string | null;
  counts: Record<Outcome, number>;
  tasks: number;
  questions_open: number;
  feedback_unsent: number;
  duration_min: number | null;
  cost_usd: number | null;
  read: boolean;
  follow_up: boolean;
  running: boolean;
  problems: string[];
}

export interface Overview {
  version: string;
  repos: RepoRef[];
  nights: NightSummary[];
  loadedAt: string;
}

export interface NightDetail {
  repo: RepoRef;
  night: Night;
  hash: string;
  running: boolean;
  follow_up: FollowUp | null;
  problems: string[];
}

export function emptyCounts(): Record<Outcome, number> {
  return { done: 0, partial: 0, blocked: 0, failed: 0, not_started: 0, skipped: 0 };
}

export function countOutcomes(tasks: Task[]): Record<Outcome, number> {
  const counts = emptyCounts();
  for (const t of tasks) if (t.outcome) counts[t.outcome]++;
  return counts;
}

// A question still waits for the owner while it has no answer.
export const isOpenQuestion = (q: Question) => q.answer === null;

// The follow-up item a question was handed over as, if any.
export const handedItem = (f: FollowUp | null | undefined, q: Question): FollowUpItem | undefined =>
  f ? (f.items.find((i) => i.question === q.ask && i.task === q.task) ?? f.items.find((i) => i.question === q.ask)) : undefined;

// Waiting for the developer: unanswered, and not handed over unanswered and settled since (asked
// again by a later night, or worked on by day). An answer there would reach no agent.
export const isOpenQuestionIn = (q: Question, f: FollowUp | null | undefined) => {
  if (q.answer !== null) return false;
  const h = handedItem(f, q);
  return !h || h.status === 'open';
};
